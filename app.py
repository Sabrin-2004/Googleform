"""
CEO Dashboard Backend Application (FastAPI)
Provides RESTful APIs, Google Sheets (3+ tabs) auto-sync, Multi-CSV & Excel uploads, and persistent storage.
"""
import os
import io
import datetime
import logging
from typing import Optional, List, Dict

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import uvicorn

# Load environment variables from .env if present
load_dotenv()

from services.storage import (
    get_state,
    save_state,
    init_storage,
    get_default_settings
)
from services.sheets_sync import (
    perform_google_sheets_sync,
    extract_sheet_id,
    get_credentials_path,
    get_credentials_info,
    set_in_memory_credentials,
    validate_and_test_credentials,
    process_multi_sheet_data
)
from services.importer import (
    parse_csv_file,
    parse_excel_file,
    export_state_to_excel,
    export_state_to_csv_zip
)
from services.data_validator import (
    normalize_action_item,
    normalize_decision_item,
    normalize_priority_item,
    sync_companies_and_statuses
)
from services.auth_service import (
    authenticate_user,
    verify_session_token,
    revoke_session,
    change_password,
    admin_create_user,
    admin_list_users,
    admin_delete_user,
    admin_update_user_role
)
from services.webhook_service import (
    process_inbound_webhook,
    log_webhook_event,
    clear_webhook_logs,
    _get_webhook_logs,
    generate_google_apps_script
)

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="CEO Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directory for CSS, JS, and static assets
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Ensure storage is ready on startup
init_storage()

# ==========================================
# Frontend Route
# ==========================================

@app.get("/")
def serve_dashboard():
    """Serves the CEO Dashboard frontend."""
    static_index = os.path.join(os.path.dirname(__file__), "static", "index.html")
    if os.path.exists(static_index):
        return FileResponse(static_index, media_type="text/html")
    html_path = os.path.join(os.path.dirname(__file__), "CEO_Dashboard.html")
    if os.path.exists(html_path):
        return FileResponse(html_path, media_type="text/html")
    raise HTTPException(status_code=404, detail="Dashboard frontend HTML not found")


@app.get("/login")
def serve_login():
    """Serves the login page."""
    login_path = os.path.join(os.path.dirname(__file__), "static", "login.html")
    if os.path.exists(login_path):
        return FileResponse(login_path, media_type="text/html")
    raise HTTPException(status_code=404, detail="Login page not found")


@app.get("/admin")
def serve_admin_panel():
    """Serves the Admin Panel page (protected in frontend by role check)."""
    admin_path = os.path.join(os.path.dirname(__file__), "static", "admin-panel.html")
    if os.path.exists(admin_path):
        return FileResponse(admin_path, media_type="text/html")
    raise HTTPException(status_code=404, detail="Admin panel not found")

# ==========================================
# Health & Status API
# ==========================================

@app.get("/api/health")
def health_check():
    """Public health ping — returns minimal status only. No sensitive data exposed."""
    return {"status": "healthy"}

@app.get("/api/status")
def detailed_status(request: Request):
    """Returns detailed backend status including credentials and data counts. Requires authentication."""
    _require_auth(request)
    state = get_state()
    creds_info = get_credentials_info()
    configured_sheet_id = (
        os.getenv("GOOGLE_SHEET_ID")
        or state.get("settings", {}).get("googleSheets", {}).get("sheetId", "")
    )

    return {
        "status": "healthy",
        "timestamp": state.get("lastUpdated"),
        "hasCredentials": creds_info.get("hasCredentials", False),
        "credentialsSource": creds_info.get("source", "none"),
        "serviceAccountEmail": creds_info.get("clientEmail"),
        "configuredSheetId": configured_sheet_id,
        "totalActions": len(state.get("actions", [])),
        "totalDecisions": len(state.get("decisions", [])),
        "totalPriorities": len(state.get("priorities", [])),
    }

# ==========================================
# Credentials Management API
# ==========================================

@app.get("/api/credentials/status")
def credentials_status(request: Request):
    """Returns metadata about the currently loaded Google Service Account credentials. Requires authentication."""
    _require_auth(request)
    info = get_credentials_info()
    state = get_state()
    sheet_id = (
        os.getenv("GOOGLE_SHEET_ID")
        or state.get("settings", {}).get("googleSheets", {}).get("sheetId", "")
    )
    return {
        **info,
        "configuredSheetId": sheet_id,
        "shareInstruction": (
            f"Share your Google Sheet with: {info['clientEmail']} (Viewer)"
            if info.get("clientEmail") else "No credentials loaded."
        )
    }

@app.post("/api/credentials/test")
async def test_credentials(request: Request):
    """
    Live-tests the currently loaded credentials. Requires authentication.
    Optionally validates access to a specific Google Sheet if sheetId is provided.
    """
    _require_auth(request)
    body: dict = {}
    try:
        body = await request.json()
    except Exception:
        body = {}

    creds_dict = body.get("credentials") or None
    sheet_id = body.get("sheetId") or body.get("sheet_id") or None

    success, msg, details = validate_and_test_credentials(creds_dict=creds_dict, sheet_id=sheet_id)
    if success:
        return {"success": True, "message": msg, "details": details}
    else:
        raise HTTPException(status_code=400, detail=msg)

@app.post("/api/credentials/upload")
async def upload_credentials(
    request: Request,
    file: Optional[UploadFile] = File(default=None)
):
    """
    Accepts a new Service Account JSON key. Requires admin authentication.
    Validates the key with Google OAuth before applying it.
    Hot-reloads credentials in memory and optionally saves to credentials.json on disk.
    No server restart required.
    """
    _require_admin(request)
    import json

    creds_dict = None
    save_to_disk = True

    # 1. Try file upload
    if file and file.filename:
        try:
            raw = await file.read()
            creds_dict = json.loads(raw.decode("utf-8"))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not parse uploaded file as JSON: {e}")
    else:
        # 2. Try JSON body
        try:
            body = await request.json()
            if isinstance(body, dict) and body.get("type") == "service_account":
                creds_dict = body
            elif isinstance(body, dict) and body.get("credentials"):
                creds_dict = body["credentials"]
                save_to_disk = body.get("saveToDisk", True)
            elif isinstance(body, dict) and body.get("credentialsJson"):
                raw_str = body["credentialsJson"]
                creds_dict = json.loads(raw_str) if isinstance(raw_str, str) else raw_str
                save_to_disk = body.get("saveToDisk", True)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not parse request body as credentials JSON: {e}")

    if not creds_dict:
        raise HTTPException(status_code=400, detail="No credentials provided. Upload a credentials.json file or send raw JSON body.")

    # 3. Validate with Google before applying
    valid, msg, details = validate_and_test_credentials(creds_dict=creds_dict)
    if not valid:
        raise HTTPException(status_code=400, detail=f"Invalid or rejected credentials: {msg}")

    # 4. Hot-reload in memory immediately (no restart needed)
    set_in_memory_credentials(creds_dict)
    logger.info(f"Credentials hot-reloaded in memory for: {creds_dict.get('client_email')}")

    # 5. Optionally persist to disk
    if save_to_disk:
        try:
            workspace_root = os.path.dirname(__file__)
            creds_file_path = os.path.join(workspace_root, "credentials.json")
            with open(creds_file_path, "w", encoding="utf-8") as f:
                json.dump(creds_dict, f, indent=2)
            logger.info(f"Credentials saved to disk: {creds_file_path}")
        except Exception as e:
            logger.warning(f"Could not save credentials to disk (still active in memory): {e}")

    return {
        "success": True,
        "message": f"Credentials for '{creds_dict.get('client_email')}' are now active. Hot-reloaded without server restart.",
        "clientEmail": creds_dict.get("client_email"),
        "projectId": creds_dict.get("project_id"),
        "privateKeyId": creds_dict.get("private_key_id"),
        "savedToDisk": save_to_disk,
        "shareInstruction": f"Ensure your Google Sheet is shared with: {creds_dict.get('client_email')} (Viewer)"
    }

@app.post("/api/companies/cleanup-fallback")
async def cleanup_fallback_companies(request: Request):
    """
    Removes actions/decisions/priorities assigned to the fallback 'Google Sheet' company
    and removes 'Google Sheet' from the companies list.
    Requires authentication.
    """
    _require_auth(request)
    state = get_state()
    fallback_name = "Google Sheet"

    before_actions = len(state.get("actions", []))
    before_decisions = len(state.get("decisions", []))
    before_priorities = len(state.get("priorities", []))

    state["actions"] = [a for a in state.get("actions", []) if a.get("company", "") != fallback_name]
    state["decisions"] = [d for d in state.get("decisions", []) if d.get("company", "") != fallback_name]
    state["priorities"] = [p for p in state.get("priorities", []) if p.get("group", "") != fallback_name]

    companies = state.get("settings", {}).get("companies", [])
    state["settings"]["companies"] = [c for c in companies if c.get("id") != fallback_name and c.get("name") != fallback_name]
    company_colors = state.get("settings", {}).get("companyColors", {})
    company_colors.pop(fallback_name, None)
    state["settings"]["companyColors"] = company_colors

    save_state(state)

    return {
        "success": True,
        "message": f"Removed fallback '{fallback_name}' data.",
        "removedActions": before_actions - len(state["actions"]),
        "removedDecisions": before_decisions - len(state["decisions"]),
        "removedPriorities": before_priorities - len(state["priorities"]),
    }

# ==========================================
# Core State API
# ==========================================

@app.get("/api/data")
def get_dashboard_data(request: Request):
    """Returns complete state for the dashboard. Requires authentication."""
    _require_auth(request)
    return get_state()

@app.post("/api/save")
async def save_dashboard_data(request: Request):
    """Saves the entire state payload. Requires authentication."""
    _require_auth(request)
    try:
        new_state = await request.json()
        if not isinstance(new_state, dict):
            raise HTTPException(status_code=400, detail="Invalid state payload, expected JSON object")

        # Ensure schema structure
        new_state = sync_companies_and_statuses(new_state)
        save_state(new_state)
        return {"success": True, "lastUpdated": new_state.get("lastUpdated")}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving state: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# Action Items API
# ==========================================

@app.post("/api/actions")
async def add_action(request: Request):
    """Adds a new action item. Requires authentication."""
    _require_auth(request)
    data = await request.json()
    state = get_state()
    norm = normalize_action_item(data)
    if not norm:
        raise HTTPException(status_code=400, detail="Item text is required")

    state.setdefault("actions", []).append(norm)
    state = sync_companies_and_statuses(state)
    save_state(state)
    return {"success": True, "action": norm}

@app.put("/api/actions/{action_id}")
async def update_action(action_id: str, request: Request):
    """Updates an existing action item. Requires authentication."""
    _require_auth(request)
    updates = await request.json()
    state = get_state()
    actions = state.get("actions", [])
    found = False
    for a in actions:
        if str(a.get("id")) == str(action_id):
            a.update(updates)
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail=f"Action with ID '{action_id}' not found")

    state = sync_companies_and_statuses(state)
    save_state(state)
    return {"success": True, "action_id": action_id}

@app.delete("/api/actions/{action_id}")
def delete_action(action_id: str, request: Request):
    """Deletes an action item. Requires authentication."""
    _require_auth(request)
    state = get_state()
    orig_len = len(state.get("actions", []))
    state["actions"] = [a for a in state.get("actions", []) if str(a.get("id")) != str(action_id)]
    if len(state["actions"]) == orig_len:
        raise HTTPException(status_code=404, detail=f"Action with ID '{action_id}' not found")

    save_state(state)
    return {"success": True, "deleted": action_id}

# ==========================================
# Decisions API
# ==========================================

@app.post("/api/decisions")
async def add_decision(request: Request):
    """Adds a new decision. Requires authentication."""
    _require_auth(request)
    data = await request.json()
    state = get_state()
    norm = normalize_decision_item(data)
    if not norm:
        raise HTTPException(status_code=400, detail="Decision title is required")

    state.setdefault("decisions", []).append(norm)
    save_state(state)
    return {"success": True, "decision": norm}

@app.put("/api/decisions/{decision_id}")
async def update_decision(decision_id: str, request: Request):
    """Updates an existing decision. Requires authentication."""
    _require_auth(request)
    updates = await request.json()
    state = get_state()
    decisions = state.get("decisions", [])
    found = False
    for d in decisions:
        if str(d.get("id")) == str(decision_id):
            d.update(updates)
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail=f"Decision with ID '{decision_id}' not found")

    save_state(state)
    return {"success": True, "decision_id": decision_id}

@app.delete("/api/decisions/{decision_id}")
def delete_decision(decision_id: str, request: Request):
    """Deletes a decision. Requires authentication."""
    _require_auth(request)
    state = get_state()
    orig_len = len(state.get("decisions", []))
    state["decisions"] = [d for d in state.get("decisions", []) if str(d.get("id")) != str(decision_id)]
    if len(state["decisions"]) == orig_len:
        raise HTTPException(status_code=404, detail=f"Decision with ID '{decision_id}' not found")

    save_state(state)
    return {"success": True, "deleted": decision_id}

# ==========================================
# Priorities API
# ==========================================

@app.post("/api/priorities")
async def add_priority(request: Request):
    """Adds a strategic priority. Requires authentication."""
    _require_auth(request)
    data = await request.json()
    state = get_state()
    norm = normalize_priority_item(data)
    if not norm:
        raise HTTPException(status_code=400, detail="Focus Area is required")

    state.setdefault("priorities", []).append(norm)
    save_state(state)
    return {"success": True, "priority": norm}

@app.put("/api/priorities/{priority_id}")
async def update_priority(priority_id: str, request: Request):
    """Updates a strategic priority. Requires authentication."""
    _require_auth(request)
    updates = await request.json()
    state = get_state()
    priorities = state.get("priorities", [])
    found = False
    for p in priorities:
        if str(p.get("id")) == str(priority_id):
            p.update(updates)
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail=f"Priority with ID '{priority_id}' not found")

    save_state(state)
    return {"success": True, "priority_id": priority_id}

@app.delete("/api/priorities/{priority_id}")
def delete_priority(priority_id: str, request: Request):
    """Deletes a strategic priority. Requires authentication."""
    _require_auth(request)
    state = get_state()
    orig_len = len(state.get("priorities", []))
    state["priorities"] = [p for p in state.get("priorities", []) if str(p.get("id")) != str(priority_id)]
    if len(state["priorities"]) == orig_len:
        raise HTTPException(status_code=404, detail=f"Priority with ID '{priority_id}' not found")

    save_state(state)
    return {"success": True, "deleted": priority_id}

# ==========================================
# Settings API
# ==========================================

@app.post("/api/settings")
async def update_settings(request: Request):
    """Updates settings object. Requires authentication."""
    _require_auth(request)
    updates = await request.json()
    state = get_state()
    settings = state.setdefault("settings", {})
    settings.update(updates)
    save_state(state)
    return {"success": True, "settings": settings}

# ==========================================
# Google Sheets Sync API
# ==========================================

@app.post("/api/sync/google-sheets")
async def sync_google_sheets(request: Request):
    """Triggers live synchronization with Google Sheets. Requires authentication."""
    _require_auth(request)
    body: dict = {}
    try:
        body = await request.json()
    except Exception:
        body = {}

    sheet_id = body.get("sheetId")
    if sheet_id is None:
        sheet_id = body.get("sheet_id")
    if sheet_id is not None:
        sheet_id = str(sheet_id).strip()

    mode = body.get("mode", "merge")
    target = body.get("target") or body.get("destination", "all")
    conflict_strategy = body.get("conflict_strategy") or body.get("conflictStrategy", "incoming_wins")
    min_quality_score = float(body.get("min_quality_score") or body.get("minQualityScore") or 0.0)
    
    excl_statuses_raw = body.get("excluded_statuses") or body.get("excludedStatuses")
    excluded_statuses = None
    if excl_statuses_raw:
        if isinstance(excl_statuses_raw, str):
            excluded_statuses = {s.strip().lower() for s in excl_statuses_raw.split(',') if s.strip()}
        elif isinstance(excl_statuses_raw, (list, set)):
            excluded_statuses = {str(s).strip().lower() for s in excl_statuses_raw if str(s).strip()}

    date_start = body.get("date_start") or body.get("dateStart")
    date_end = body.get("date_end") or body.get("dateEnd")

    state = get_state()
    success, msg, updated_state, counts = perform_google_sheets_sync(
        sheet_id=sheet_id,
        current_state=state,
        mode=mode,
        target=target,
        conflict_strategy=conflict_strategy,
        min_quality_score=min_quality_score,
        excluded_statuses=excluded_statuses,
        date_start=date_start,
        date_end=date_end
    )

    if success:
        save_state(updated_state)
        return {
            "success": True,
            "message": msg,
            "counts": counts,
            "target": target,
            "destination": target,
            "mode": mode,
            "conflict_strategy": conflict_strategy,
            "lastUpdated": updated_state.get("lastUpdated"),
            "syncStatus": "success",
        }
    else:
        raise HTTPException(status_code=400, detail=msg)

# ==========================================
# Multi-Sheet Upload API (CSV & Excel)
# ==========================================

@app.post("/api/upload")
async def upload_files(
    request: Request,
    files: List[UploadFile] = File(default=[]),
    file: Optional[UploadFile] = File(default=None),
    mode: str = Form(default="merge"),
    target: str = Form(default="all"),
    destination: Optional[str] = Form(default=None),
    conflict_strategy: str = Form(default="incoming_wins"),
    min_quality_score: float = Form(default=0.0),
    excluded_statuses: Optional[str] = Form(default=None),
    date_start: Optional[str] = Form(default=None),
    date_end: Optional[str] = Form(default=None),
    new_company_name: Optional[str] = Form(default=None),
):
    """
    Handles multi-file uploads. Requires authentication.
    - Multiple CSV files (3+ CSVs simultaneously)
    - Multi-tab Excel workbooks (.xlsx, .xls)
    - Mixed uploads
    - Supports Destination routing, Threshold exclusions, Overlap resolution strategies.
    """
    _require_auth(request)
    uploaded_files: List[UploadFile] = []
    
    # 1. Collect from files parameter
    if isinstance(files, list):
        uploaded_files.extend([f for f in files if f and f.filename])
    elif files and getattr(files, 'filename', None):
        uploaded_files.append(files)
        
    # 2. Collect from single file parameter
    if file and file.filename and file not in uploaded_files:
        uploaded_files.append(file)

    # 3. Fallback to parse multipart form directly
    try:
        form_data = await request.form()
        for key, val in form_data.items():
            if isinstance(val, UploadFile) and val.filename and val not in uploaded_files:
                uploaded_files.append(val)
            elif hasattr(val, 'filename') and getattr(val, 'filename', None) and val not in uploaded_files:
                uploaded_files.append(val)
        if 'mode' in form_data and isinstance(form_data['mode'], str):
            mode = form_data['mode']
        if 'target' in form_data and isinstance(form_data['target'], str):
            target = form_data['target']
        if 'destination' in form_data and isinstance(form_data['destination'], str):
            destination = form_data['destination']
        if 'conflict_strategy' in form_data and isinstance(form_data['conflict_strategy'], str):
            conflict_strategy = form_data['conflict_strategy']
        if 'conflictStrategy' in form_data and isinstance(form_data['conflictStrategy'], str):
            conflict_strategy = form_data['conflictStrategy']
        if 'min_quality_score' in form_data:
            try: min_quality_score = float(form_data['min_quality_score'])
            except Exception: pass
        if 'excluded_statuses' in form_data and isinstance(form_data['excluded_statuses'], str):
            excluded_statuses = form_data['excluded_statuses']
        if 'date_start' in form_data and isinstance(form_data['date_start'], str):
            date_start = form_data['date_start']
        if 'date_end' in form_data and isinstance(form_data['date_end'], str):
            date_end = form_data['date_end']
        if 'new_company_name' in form_data and isinstance(form_data['new_company_name'], str):
            new_company_name = form_data['new_company_name']
    except Exception as e:
        logger.warning(f"Error inspecting form data fallback: {e}")

    if not uploaded_files:
        raise HTTPException(status_code=400, detail="No files provided. Please select at least one .xlsx, .xls, or .csv file.")

    effective_destination = destination or target or "all"
    
    parsed_excluded_statuses = None
    if excluded_statuses:
        parsed_excluded_statuses = {s.strip().lower() for s in excluded_statuses.split(',') if s.strip()}

    state = get_state()
    sheets_data: dict = {}

    for f in uploaded_files:
        fname = f.filename or "upload"
        fname_lower = fname.lower()
        try:
            content = await f.read()
            if not content:
                continue
            stream = io.BytesIO(content)

            if fname_lower.endswith(".csv"):
                sheet_name, records = parse_csv_file(stream, fname)
                if records:
                    sheets_data[sheet_name] = records
            elif fname_lower.endswith((".xlsx", ".xls")):
                excel_sheets = parse_excel_file(stream)
                sheets_data.update(excel_sheets)
            else:
                # Try CSV parsing for plain text or generic files
                sheet_name, records = parse_csv_file(stream, fname)
                if records:
                    sheets_data[sheet_name] = records
        except Exception as e:
            logger.error(f"Error parsing uploaded file '{fname}': {e}", exc_info=True)
            raise HTTPException(status_code=400, detail=f"Failed to parse '{fname}': {str(e)}")

    if not sheets_data:
        raise HTTPException(
            status_code=400,
            detail="No valid data rows found in uploaded file(s). Please verify file headers (e.g. Item, Action Item, Decision, Priority, Focus Area)."
        )

    try:
        from services.importer import process_dataset_import
        updated_state, metrics = process_dataset_import(
            sheets_data=sheets_data,
            current_state=state,
            destination=effective_destination,
            mode=mode,
            conflict_strategy=conflict_strategy,
            min_quality_score=min_quality_score,
            excluded_statuses=parsed_excluded_statuses,
            date_start=date_start,
            date_end=date_end,
            new_company_name=new_company_name
        )
        save_state(updated_state)
    except Exception as e:
        logger.error(f"Error processing sheet data: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error saving imported data: {str(e)}")

    # Formulate clear user feedback message
    parts = []
    if metrics["appended"]:
        parts.append(f"{metrics['appended']} new record(s) added")
    if metrics["updated"]:
        parts.append(f"{metrics['updated']} record(s) updated")
    if metrics["merged"] and not metrics["updated"]:
        parts.append(f"{metrics['merged']} identical record(s) matched")
    if metrics.get("deleted"):
        parts.append(f"{metrics['deleted']} record(s) removed (not in CSV)")
    if metrics["skipped"]:
        parts.append(f"{metrics['skipped']} record(s) skipped below threshold")
    if metrics["flagged"]:
        parts.append(f"{metrics['flagged']} conflict(s) flagged for review")

    feedback_summary = ", ".join(parts) if parts else "0 items modified"
    upload_msg = f"Processed {metrics['sheets_processed']} sheet(s): {feedback_summary}."

    return {
        "success": True,
        "message": upload_msg,
        "counts": metrics,
        "metrics": metrics,
        "target": effective_destination,
        "destination": effective_destination,
        "mode": mode,
        "conflict_strategy": conflict_strategy,
        "conflicts": metrics.get("conflicts", []),
        "lastUpdated": updated_state.get("lastUpdated"),
    }

# ==========================================
# Conflict Resolution API
# ==========================================

@app.post("/api/conflicts/resolve")
async def resolve_conflicts(request: Request):
    """
    Applies manual conflict resolutions. Requires authentication.
    Expects payload: { "resolutions": [ { "id": str, "type": "action"|"decision"|"priority", "resolution": "use_incoming"|"keep_existing"|"custom", "incoming": dict, "custom_values": dict } ] }
    """
    _require_auth(request)
    try:
        payload = await request.json()
        resolutions = payload.get("resolutions", [])
        if not resolutions or not isinstance(resolutions, list):
            raise HTTPException(status_code=400, detail="Expected list of resolutions in payload")

        state = get_state()
        resolved_count = 0

        for r in resolutions:
            item_id = str(r.get("id"))
            item_type = r.get("type", "action")
            res_action = r.get("resolution", "use_incoming")
            incoming_data = r.get("incoming", {})
            custom_values = r.get("custom_values", {})

            if item_type == "action":
                target_item = next((a for a in state.get("actions", []) if str(a.get("id")) == item_id), None)
                if target_item:
                    if res_action == "use_incoming":
                        for k, v in incoming_data.items():
                            if k != "id" and v:
                                target_item[k] = v
                        resolved_count += 1
                    elif res_action == "custom":
                        for k, v in custom_values.items():
                            if k != "id":
                                target_item[k] = v
                        resolved_count += 1
                    elif res_action == "keep_existing":
                        resolved_count += 1

            elif item_type == "decision":
                target_item = next((d for d in state.get("decisions", []) if str(d.get("id")) == item_id), None)
                if target_item:
                    if res_action == "use_incoming":
                        for k, v in incoming_data.items():
                            if k != "id" and v:
                                target_item[k] = v
                        resolved_count += 1
                    elif res_action == "custom":
                        for k, v in custom_values.items():
                            if k != "id":
                                target_item[k] = v
                        resolved_count += 1
                    elif res_action == "keep_existing":
                        resolved_count += 1

            elif item_type == "priority":
                target_item = next((p for p in state.get("priorities", []) if str(p.get("id")) == item_id), None)
                if target_item:
                    if res_action == "use_incoming":
                        for k, v in incoming_data.items():
                            if k != "id" and v:
                                target_item[k] = v
                        resolved_count += 1
                    elif res_action == "custom":
                        for k, v in custom_values.items():
                            if k != "id":
                                target_item[k] = v
                        resolved_count += 1
                    elif res_action == "keep_existing":
                        resolved_count += 1

        state = sync_companies_and_statuses(state)
        save_state(state)
        return {
            "success": True,
            "message": f"Successfully resolved {resolved_count} conflict(s).",
            "resolvedCount": resolved_count,
            "lastUpdated": state.get("lastUpdated")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resolving conflicts: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# Export APIs
# ==========================================

@app.get("/api/export/excel")
def export_excel(request: Request):
    """Exports state as a multi-tab Excel file. Requires authentication."""
    _require_auth(request)
    state = get_state()
    excel_stream = export_state_to_excel(state)
    return StreamingResponse(
        excel_stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=portfolio_dashboard_export.xlsx"},
    )

@app.get("/api/export/csv")
def export_csv_zip(request: Request):
    """Exports state as a zip file with CSVs for all tables. Requires authentication."""
    _require_auth(request)
    state = get_state()
    zip_stream = export_state_to_csv_zip(state)
    return StreamingResponse(
        zip_stream,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=portfolio_dashboard_csvs.zip"},
    )

# ==========================================
# Authentication APIs
# ==========================================

@app.post("/api/auth/login")
async def login_api(request: Request):
    """Authenticates user credentials via Supabase and returns a JWT session token."""
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # Accept both 'email' and legacy 'username' field
    email = (data.get("email") or data.get("username", "")).strip()
    password = data.get("password", "").strip()

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    try:
        user = authenticate_user(email, password)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {
        "success": True,
        "token": user["token"],
        "refresh_token": user.get("refresh_token", ""),
        "user": {
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "user_id": user.get("user_id", "")
        }
    }

@app.get("/api/auth/me")
def get_current_user_api(request: Request):
    """Verifies existing Supabase JWT and returns active user profile."""
    auth_header = request.headers.get("Authorization", "")
    token = ""
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
    elif "X-Auth-Token" in request.headers:
        token = request.headers["X-Auth-Token"].strip()
    elif "token" in request.query_params:
        token = request.query_params["token"].strip()

    try:
        user = verify_session_token(token)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid.")

    return {
        "success": True,
        "authenticated": True,
        "user": user
    }


# ==========================================
# Admin User Management APIs
# ==========================================

def _extract_token(request: Request) -> str:
    """Extracts Bearer token from Authorization header or X-Auth-Token header."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:].strip()
    if "X-Auth-Token" in request.headers:
        return request.headers["X-Auth-Token"].strip()
    return ""


def _require_auth(request: Request) -> Dict:
    """Helper: extracts and verifies token, raises 401 if not authenticated."""
    token = _extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required. Please log in.")
    try:
        user = verify_session_token(token)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid. Please log in again.")
    return user


def _require_admin(request: Request) -> Dict:
    """Helper: extracts and verifies token, raises 403 if not admin."""
    user = _require_auth(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return user


@app.get("/api/admin/users")
def list_users_api(request: Request):
    """Returns all registered users. Admin only."""
    _require_admin(request)
    result = admin_list_users()
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to list users"))
    return result


@app.post("/api/admin/users")
async def create_user_api(request: Request):
    """Creates a new user with email, password, and role. Admin only."""
    _require_admin(request)
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    email = data.get("email", "").strip()
    password = data.get("password", "").strip()
    role = data.get("role", "viewer").strip()
    name = data.get("name", "").strip()

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required.")
    if role not in ("admin", "viewer"):
        raise HTTPException(status_code=400, detail="Role must be 'admin' or 'viewer'.")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    result = admin_create_user(email, password, role, name)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to create user"))
    return result


@app.delete("/api/admin/users/{user_id}")
def delete_user_api(user_id: str, request: Request):
    """Deletes a user by their Supabase UUID. Admin only."""
    current = _require_admin(request)
    if current.get("user_id") == user_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")
    result = admin_delete_user(user_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to delete user"))
    return result


@app.patch("/api/admin/users/{user_id}/role")
async def update_user_role_api(user_id: str, request: Request):
    """Updates the role of an existing user. Admin only."""
    current = _require_admin(request)
    if current.get("user_id") == user_id:
        raise HTTPException(status_code=400, detail="You cannot change your own role.")
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    role = data.get("role", "").strip()
    if role not in ("admin", "viewer"):
        raise HTTPException(status_code=400, detail="Role must be 'admin' or 'viewer'.")
    result = admin_update_user_role(user_id, role)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to update role"))
    return result

@app.post("/api/auth/logout")
async def logout_api(request: Request):
    """Revokes session token."""
    auth_header = request.headers.get("Authorization", "")
    token = ""
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
    elif "X-Auth-Token" in request.headers:
        token = request.headers["X-Auth-Token"].strip()

    revoke_session(token)
    return {"success": True, "message": "Logged out successfully."}

@app.post("/api/auth/change-password")
async def change_password_api(request: Request):
    """Changes admin password."""
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid payload")

    curr_pwd = data.get("currentPassword", "")
    new_pwd = data.get("newPassword", "")

    success, msg = change_password(curr_pwd, new_pwd)
    if not success:
        raise HTTPException(status_code=400, detail=msg)

    return {"success": True, "message": msg}

# ==========================================
# Webhooks Integration APIs
# ==========================================

@app.post("/api/webhook")
@app.post("/api/webhooks/inbound")
async def handle_inbound_webhook(request: Request):
    """
    Receives inbound webhooks from Google Forms, Zapier, Make, and custom HTTP POSTs.
    Auto-detects payload format, maps fields to Action Items, Decisions, or Priorities,
    and updates dashboard state in real time.
    """
    client_ip = request.client.host if request.client else "unknown"
    secret = (
        request.headers.get("X-Webhook-Secret")
        or request.query_params.get("secret")
    )
    explicit_target = request.query_params.get("target")

    try:
        payload = await request.json()
    except Exception as e:
        logger.warning(f"Webhook received invalid JSON from {client_ip}: {e}")
        log_webhook_event(
            source="Inbound Webhook",
            payload="<Invalid JSON>",
            status="error",
            message="Invalid JSON payload received.",
            client_ip=client_ip
        )
        raise HTTPException(status_code=400, detail="Invalid JSON payload.")

    # Fallback to check body for secret or target
    if isinstance(payload, dict):
        if not secret:
            secret = payload.get("secret") or payload.get("secretKey")
        if not explicit_target:
            explicit_target = payload.get("target") or payload.get("destination")

    success, msg, created_item, target_type = process_inbound_webhook(
        payload=payload,
        client_ip=client_ip,
        secret=secret,
        explicit_target=explicit_target
    )

    if not success:
        if "Invalid or missing secret" in msg:
            raise HTTPException(status_code=401, detail=msg)
        raise HTTPException(status_code=400, detail=msg)

    return {
        "success": True,
        "message": msg,
        "target": target_type,
        "item": created_item,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

@app.get("/api/webhooks/logs")
def get_webhook_logs_api(request: Request):
    """Returns recent webhook activity logs. Requires authentication."""
    _require_auth(request)
    return {
        "success": True,
        "logs": _get_webhook_logs()
    }

@app.post("/api/webhooks/clear-logs")
def clear_webhook_logs_api(request: Request):
    """Clears webhook activity logs. Requires authentication."""
    _require_auth(request)
    clear_webhook_logs()
    return {"success": True, "message": "Webhook activity logs cleared."}

@app.post("/api/webhooks/test")
async def trigger_test_webhook(request: Request):
    """
    Simulates a Google Form or third-party webhook submission for testing. Requires authentication.
    """
    _require_auth(request)
    body = {}
    try:
        body = await request.json()
    except Exception:
        body = {}

    target = body.get("target", "action")
    client_ip = request.client.host if request.client else "127.0.0.1"

    if target == "decision":
        sample_payload = {
            "formTitle": "Executive Decision Request Form",
            "responses": {
                "Decision": body.get("item") or "Approve Q3 Strategic Partnership Expansion",
                "Owner": body.get("owner") or "Kiran",
                "Status": body.get("status") or "To Start",
                "Founder Dependency": "To Review",
                "Impact if delayed": "Delayed enterprise rollout across secondary markets",
                "Deadline": "Next Month"
            }
        }
    elif target == "priority":
        sample_payload = {
            "formTitle": "Strategic Priorities Intake Form",
            "responses": {
                "Priority Level": "1.5",
                "Group": body.get("company") or "Pranik Products",
                "Focus Area": body.get("item") or "Automated Doctor-Patient Scribe Pipeline",
                "Why": "Accelerate clinical onboarding and reduce consultation documentation time",
                "Horizon": "Next 15 days"
            }
        }
    else:
        sample_payload = {
            "formTitle": "Weekly Operations Task Intake",
            "responses": {
                "Action Item": body.get("item") or "Deploy automated webhook receiver for executive forms",
                "Company": body.get("company") or "Aarna",
                "Department": "Product",
                "Owner": body.get("owner") or "Saurav",
                "Status": body.get("status") or "WIP",
                "Founder Dependency": "None",
                "Comments": "Simulated webhook ingestion test"
            }
        }

    success, msg, created_item, target_type = process_inbound_webhook(
        payload=sample_payload,
        client_ip=client_ip,
        explicit_target=target
    )

    if not success:
        raise HTTPException(status_code=400, detail=msg)

    return {
        "success": True,
        "message": f"Test webhook simulated successfully: {msg}",
        "item": created_item,
        "target": target_type,
        "samplePayload": sample_payload
    }

@app.get("/api/webhooks/script")
def get_google_apps_script_api(request: Request):
    """Returns copy-paste ready Google Apps Script tailored to current host. Requires authentication."""
    _require_auth(request)
    host = request.headers.get("host") or "localhost:5000"
    scheme = "https" if "https" in request.headers.get("x-forwarded-proto", "") else "http"
    base_url = f"{scheme}://{host}"
    webhook_url = f"{base_url}/api/webhook"

    state = get_state()
    secret = state.get("settings", {}).get("webhookSettings", {}).get("secretKey", "")

    script_code = generate_google_apps_script(webhook_url, secret)
    return {
        "success": True,
        "webhookUrl": webhook_url,
        "secretKey": secret,
        "script": script_code
    }

# ==========================================
# Main Runner
# ==========================================

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info(f"Starting CEO Dashboard server on http://localhost:{port}")
    uvicorn.run("app:app", host=host, port=port, reload=True)
