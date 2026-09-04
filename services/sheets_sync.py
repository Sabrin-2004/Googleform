"""
Google Sheets Sync Service
Supports Service Account (credentials.json), Public Sheet CSV Export,
and intelligent multi-sheet (3+ tabs) auto-detection.
"""
import os
import io
import re
import csv
import logging
import datetime
import urllib.request
from typing import Dict, Any, List, Optional, Tuple, Set
import pandas as pd

from services.data_validator import (
    normalize_action_item,
    normalize_decision_item,
    normalize_priority_item,
    sync_companies_and_statuses,
    detect_sheet_type
)
from services.importer import parse_csv_file, detect_excel_header_row, process_dataset_import

logger = logging.getLogger(__name__)

def parse_sheet_input(input_str: str) -> Tuple[str, Optional[str], bool]:
    """
    Parses Google Sheet input string (URL, published link, or raw ID).
    Returns (clean_id, gid, is_published).
    """
    if not input_str:
        return "", None, False
    s = str(input_str).strip()
    
    gid_match = re.search(r'[#?&]gid=([0-9]+)', s)
    gid = gid_match.group(1) if gid_match else None
    
    pub_match = re.search(r'/spreadsheets/d/e/([a-zA-Z0-9-_]+)', s)
    if pub_match:
        return pub_match.group(1), gid, True
        
    std_match = re.search(r'/spreadsheets/d/([a-zA-Z0-9-_]+)', s)
    if std_match:
        return std_match.group(1), gid, False
        
    return s, gid, False

def extract_sheet_id(input_str: str) -> str:
    """Extracts the clean spreadsheet ID or published key from a URL or raw ID string."""
    clean_id, _, _ = parse_sheet_input(input_str)
    return clean_id

# In-memory dynamic credentials override
_in_memory_creds_info: Optional[Dict[str, Any]] = None

def set_in_memory_credentials(creds_dict: Dict[str, Any]):
    """Sets dynamic in-memory credentials without requiring server restart."""
    global _in_memory_creds_info
    _in_memory_creds_info = creds_dict

def get_loaded_credentials_dict() -> Optional[Dict[str, Any]]:
    """Returns the parsed credentials dictionary from memory, environment, or file."""
    global _in_memory_creds_info
    if _in_memory_creds_info:
        return _in_memory_creds_info
    
    import json
    env_json = os.getenv('GOOGLE_CREDENTIALS_JSON') or os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')
    if env_json:
        try:
            return json.loads(env_json) if isinstance(env_json, str) else env_json
        except Exception:
            pass

    creds_path = get_credentials_path()
    if creds_path and os.path.exists(creds_path) and creds_path not in ('__ENV_JSON__', '__MEMORY_JSON__'):
        try:
            with open(creds_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return None

def get_credentials_path() -> Optional[str]:
    """Finds the credentials.json path from environment, in-memory, or workspace."""
    global _in_memory_creds_info
    if _in_memory_creds_info:
        return '__MEMORY_JSON__'

    if os.getenv('GOOGLE_CREDENTIALS_JSON') or os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON'):
        return '__ENV_JSON__'
        
    env_path = os.getenv('GOOGLE_CREDENTIALS_FILE')
    if env_path and os.path.exists(env_path):
        return env_path
    
    workspace_root = os.path.dirname(os.path.dirname(__file__))
    candidates = [
        os.path.join(workspace_root, 'credentials.json'),
        os.path.join(workspace_root, 'service_account.json'),
        os.path.join(workspace_root, 'config', 'credentials.json')
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return None

def get_service_account_email() -> Optional[str]:
    """Extracts client_email from credentials file, memory, or environment variable."""
    creds_dict = get_loaded_credentials_dict()
    if creds_dict and isinstance(creds_dict, dict):
        return creds_dict.get('client_email')
    return None

def get_credentials_info() -> Dict[str, Any]:
    """Returns metadata about the active credentials."""
    global _in_memory_creds_info
    creds_dict = get_loaded_credentials_dict()
    if not creds_dict:
        return {
            "hasCredentials": False,
            "source": "none",
            "clientEmail": None,
            "projectId": None,
            "privateKeyId": None,
            "filePath": None
        }

    source = "memory" if _in_memory_creds_info else ("env_var" if (os.getenv('GOOGLE_CREDENTIALS_JSON') or os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')) else "file")
    creds_path = get_credentials_path()

    return {
        "hasCredentials": True,
        "source": source,
        "clientEmail": creds_dict.get("client_email"),
        "projectId": creds_dict.get("project_id"),
        "privateKeyId": creds_dict.get("private_key_id"),
        "filePath": os.path.basename(creds_path) if (creds_path and os.path.exists(creds_path)) else creds_path
    }

_clock_skew_adjusted = False

def sync_system_clock_skew():
    """
    Synchronizes local google.auth time with Google servers if local clock is skewed.
    Prevents 'invalid_grant: Invalid JWT Signature' errors caused by local machine clock drift.
    """
    global _clock_skew_adjusted
    try:
        import email.utils
        import google.auth._helpers
        import urllib.request

        req = urllib.request.Request("https://www.google.com", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=4) as resp:
            server_date = resp.headers.get("Date")
            if server_date:
                server_dt = email.utils.parsedate_to_datetime(server_date).astimezone(datetime.timezone.utc).replace(tzinfo=None)
                local_dt = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
                offset_seconds = (server_dt - local_dt).total_seconds()
                
                if abs(offset_seconds) > 15:
                    orig_utcnow = getattr(google.auth._helpers, '_orig_utcnow', None)
                    if orig_utcnow is None:
                        orig_utcnow = google.auth._helpers.utcnow
                        google.auth._helpers._orig_utcnow = orig_utcnow
                    
                    google.auth._helpers.utcnow = lambda: orig_utcnow() + datetime.timedelta(seconds=offset_seconds)
                    logger.info(f"Synchronized Google Auth clock skew by {offset_seconds:.1f}s")
                    _clock_skew_adjusted = True
    except Exception as e:
        logger.debug(f"Clock skew sync check skipped: {e}")

def validate_and_test_credentials(creds_dict: Optional[Dict[str, Any]] = None, sheet_id: Optional[str] = None) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Validates a Service Account credentials object or the currently loaded credentials.
    Performs OAuth token generation and optionally checks access to a Google Sheet.
    """
    if creds_dict is None:
        creds_dict = get_loaded_credentials_dict()

    if not creds_dict or not isinstance(creds_dict, dict):
        return False, "No Google Service Account credentials provided or configured.", {}

    required_fields = ['type', 'project_id', 'private_key', 'client_email']
    missing = [f for f in required_fields if not creds_dict.get(f)]
    if missing:
        return False, f"Invalid Service Account JSON. Missing required fields: {', '.join(missing)}.", {}

    if creds_dict.get('type') != 'service_account':
        return False, f"Invalid credential type '{creds_dict.get('type')}'. Expected 'service_account'.", {}

    # Sanitize private_key if newlines were escaped
    if isinstance(creds_dict.get('private_key'), str):
        if '\\n' in creds_dict['private_key'] and '\n' not in creds_dict['private_key']:
            creds_dict['private_key'] = creds_dict['private_key'].replace('\\n', '\n')

    # Automatically compensate for machine clock drift
    sync_system_clock_skew()

    try:
        from google.oauth2.service_account import Credentials
        import google.auth.transport.requests

        scopes = [
            'https://www.googleapis.com/auth/spreadsheets.readonly',
            'https://www.googleapis.com/auth/drive.readonly'
        ]
        creds = Credentials.from_service_account_info(creds_dict, scopes=scopes)
        auth_req = google.auth.transport.requests.Request()
        creds.refresh(auth_req)

        details: Dict[str, Any] = {
            "clientEmail": creds_dict.get("client_email"),
            "projectId": creds_dict.get("project_id"),
            "privateKeyId": creds_dict.get("private_key_id"),
            "tokenValid": True
        }

        # If sheet_id is provided, verify actual sheet access
        if sheet_id:
            clean_id, _, _ = parse_sheet_input(str(sheet_id).strip())
            if clean_id:
                import gspread
                gc = gspread.authorize(creds)
                spreadsheet = gc.open_by_key(clean_id)
                worksheets = [ws.title for ws in spreadsheet.worksheets()]
                details["sheetTitle"] = spreadsheet.title
                details["worksheets"] = worksheets
                return True, f"Successfully authenticated and verified access to '{spreadsheet.title}' with {len(worksheets)} worksheet(s): {', '.join(worksheets)}.", details

        return True, f"Google Service Account key is active and valid for {creds_dict.get('client_email')}.", details

    except Exception as e:
        cause = getattr(e, '__cause__', None)
        error_msg = str(cause) if (cause and str(cause).strip()) else str(e)
        client_email = creds_dict.get('client_email', 'service account email')
        project_id = creds_dict.get('project_id', 'GCP Project')

        if "invalid_grant" in error_msg or "Invalid JWT Signature" in error_msg:
            return False, f"Key Disabled or Expired ('Invalid JWT Signature'). In Google Cloud Console for project '{project_id}', create a new JSON key for '{client_email}'.", {"error": "invalid_jwt"}
        if "PERMISSION_DENIED" in error_msg or "403" in error_msg or "Access Denied" in error_msg:
            return False, f"Access Denied (403). In Google Sheets, click 'Share' and paste '{client_email}' into 'Add people, groups' (Viewer).", {"error": "permission_denied"}
        if "sheets.googleapis.com" in error_msg or "has not been used" in error_msg or "disabled" in error_msg:
            return False, f"Google Sheets API is not enabled in your Google Cloud Project ({project_id}). Please enable Google Sheets API & Google Drive API in Google Cloud Console.", {"error": "api_disabled"}
        
        return False, f"Authentication error: {error_msg}", {"error": error_msg}

def sync_via_service_account(sheet_id: str, creds_path: str) -> Tuple[bool, str, Dict[str, List[Dict[str, Any]]]]:
    """Fetches all worksheets from a Google Sheet using a Service Account with smart header detection."""
    try:
        import gspread
        from google.oauth2.service_account import Credentials

        sync_system_clock_skew()

        scopes = [
            'https://www.googleapis.com/auth/spreadsheets.readonly',
            'https://www.googleapis.com/auth/drive.readonly'
        ]
        
        creds_dict = get_loaded_credentials_dict()
        if creds_dict:
            creds = Credentials.from_service_account_info(creds_dict, scopes=scopes)
        else:
            creds = Credentials.from_service_account_file(creds_path, scopes=scopes)

        gc = gspread.authorize(creds)
        spreadsheet = gc.open_by_key(sheet_id)
        
        sheets_data = {}
        for ws in spreadsheet.worksheets():
            records = []
            try:
                records = ws.get_all_records()
            except Exception:
                records = []

            if records:
                sheets_data[ws.title] = records
            else:
                # Fallback to get all values and run smart header detection
                values = ws.get_all_values()
                if len(values) > 1:
                    df_raw = pd.DataFrame(values)
                    hdr_idx = detect_excel_header_row(df_raw)
                    headers = [str(h).strip() if str(h).strip() else f"Col_{i+1}" for i, h in enumerate(values[hdr_idx])]
                    parsed_records = []
                    for row in values[hdr_idx+1:]:
                        row_dict = {}
                        for idx, h in enumerate(headers):
                            row_dict[h] = row[idx] if idx < len(row) else ''
                        if any(str(v).strip() for v in row_dict.values()):
                            parsed_records.append(row_dict)
                    if parsed_records:
                        sheets_data[ws.title] = parsed_records
                    
        return True, f"Successfully fetched {len(sheets_data)} worksheet(s) via Service Account.", sheets_data
    except Exception as e:
        cause = getattr(e, '__cause__', None)
        error_msg = str(cause) if (cause and str(cause).strip()) else (str(e) if str(e).strip() else repr(e))
        client_email = get_service_account_email() or "your service account email"
        project_id = (get_loaded_credentials_dict() or {}).get('project_id', 'your Google Cloud Project')
        
        if "sheets.googleapis.com" in error_msg or "has not been used" in error_msg or "disabled" in error_msg:
            return False, f"Google Sheets API is not enabled in your Google Cloud Project ({project_id}). Enable Google Sheets API & Drive API in GCP Console.", {}
        if "PERMISSION_DENIED" in error_msg or "403" in error_msg or "Access Denied" in error_msg or isinstance(e, PermissionError):
            return False, f"Access Denied (403). In Google Sheets, click 'Share' (top-right) and paste '{client_email}' into 'Add people, groups' (Viewer).", {}
        return False, f"Service Account error: {error_msg}", {}

def sync_via_public_csv(sheet_id: str, gid: Optional[str] = None, is_published: bool = False) -> Tuple[bool, str, Dict[str, List[Dict[str, Any]]]]:
    """
    Intelligently fetches all tabs from a Google Sheet shared via public/link access.
    1. Scans the public spreadsheet structure to discover all individual tab names (e.g. pranik, abhi, arna, miraa, edT).
    2. Downloads and parses each worksheet individually by tab name.
    3. Falls back to single CSV endpoints if tab extraction is unavailable.
    """
    sheets_data: Dict[str, List[Dict[str, Any]]] = {}

    # Stage 1: Try Multi-Tab Auto-Discovery via htmlview
    if not is_published:
        try:
            import urllib.parse
            html_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/htmlview"
            req = urllib.request.Request(html_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    html_content = resp.read().decode('utf-8', errors='ignore')
                    # Discover tab names: items.push({name: "tabName", ...})
                    discovered_tabs = re.findall(r'items\.push\(\{\s*name:\s*[\'"]([^\'"]+)[\'"]', html_content)
                    if not discovered_tabs:
                        discovered_tabs = re.findall(r'<li id=[\'"]sheet-button-[^\'"]+[\'"][^>]*><a[^>]*>([^<]+)</a>', html_content)

                    if discovered_tabs:
                        for tab_name in discovered_tabs:
                            clean_tab = tab_name.strip()
                            if not clean_tab:
                                continue
                            encoded_tab = urllib.parse.quote(clean_tab)
                            tab_csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq?tqx=out:csv&sheet={encoded_tab}"
                            try:
                                tab_req = urllib.request.Request(tab_csv_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                                with urllib.request.urlopen(tab_req, timeout=10) as tab_resp:
                                    if tab_resp.status == 200:
                                        tab_bytes = tab_resp.read()
                                        stream = io.BytesIO(tab_bytes)
                                        _, records = parse_csv_file(stream, f"{clean_tab}.csv")
                                        if records:
                                            sheets_data[clean_tab] = records
                            except Exception as tab_err:
                                logger.warning(f"Failed to fetch public tab '{clean_tab}': {tab_err}")

                        if sheets_data:
                            return True, f"Successfully extracted {len(sheets_data)} worksheet(s) via Link Sharing: {', '.join(sheets_data.keys())}.", sheets_data
        except Exception as discover_err:
            logger.info(f"Public multi-tab discovery note: {discover_err}")

    # Stage 2: Fallback to single CSV endpoints if multi-tab was not available
    candidate_urls = []
    gid_param = f"&gid={gid}" if gid else ""
    if is_published:
        candidate_urls.append(f"https://docs.google.com/spreadsheets/d/e/{sheet_id}/pub?output=csv{gid_param}")
        candidate_urls.append(f"https://docs.google.com/spreadsheets/d/e/{sheet_id}/pub?format=csv{gid_param}")
    else:
        candidate_urls.append(f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv{gid_param}")
        candidate_urls.append(f"https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq?tqx=out:csv{gid_param}")
        candidate_urls.append(f"https://docs.google.com/spreadsheets/d/{sheet_id}/pub?output=csv{gid_param}")

    last_error = ""
    last_status = None

    for url in candidate_urls:
        try:
            req = urllib.request.Request(
                url,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                if response.status == 200:
                    raw_bytes = response.read()
                    stream = io.BytesIO(raw_bytes)
                    s_name, records = parse_csv_file(stream, "Sheet1.csv")
                    if records:
                        return True, "Fetched public sheet data successfully.", {"Sheet1": records}
        except urllib.error.HTTPError as e:
            last_status = e.code
            last_error = e.reason
            if e.code in [401, 403]:
                break
        except urllib.error.URLError as e:
            last_error = str(e.reason)
        except Exception as e:
            last_error = str(e)

    client_email = get_service_account_email() or "your service account email"
    if last_status in [401, 403]:
        return False, f"Access Denied (403). In Google Sheets, click 'Share' (top-right) and set 'General Access' to 'Anyone with the link (Viewer)', or add '{client_email}' to 'Add people, groups'.", {}
    elif last_status == 404:
        return False, "Google Sheet not found (404). Please verify that the Sheet ID or URL is correct.", {}
    else:
        return False, f"Could not fetch Google Sheet data ({last_error or 'HTTP Error'}). In Google Sheets, click 'Share' and set 'Anyone with the link' (Viewer).", {}

def normalize_target_key(target: Optional[str]) -> str:
    """Normalizes user target destination string."""
    if not target:
        return "all"
    t = str(target).strip().lower()
    if t in ["register", "actions", "action", "tasks", "task"]:
        return "register"
    if t in ["decisions", "decision", "dq"]:
        return "decisions"
    if t in ["priorities", "priority", "okr", "focus"]:
        return "priorities"
    if t in ["create_new", "new_table", "new_company"]:
        return "create_new"
    return "all"

def process_multi_sheet_data(
    sheets_data: Dict[str, List[Dict[str, Any]]],
    current_state: Dict[str, Any],
    mode: str = "merge",
    target: str = "all",
    conflict_strategy: str = "incoming_wins",
    min_quality_score: float = 0.0,
    excluded_statuses: Optional[Set[str]] = None,
    date_start: Optional[str] = None,
    date_end: Optional[str] = None,
    new_company_name: Optional[str] = None
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Processes sheets from Google Sheets, Excel workbooks, or multiple CSV files using the unified
    process_dataset_import engine. Returns (updated_state, metrics_dict).
    """
    target_key = normalize_target_key(target)
    updated_state, metrics = process_dataset_import(
        sheets_data=sheets_data,
        current_state=current_state,
        destination=target_key,
        mode=mode,
        conflict_strategy=conflict_strategy,
        min_quality_score=min_quality_score,
        excluded_statuses=excluded_statuses,
        date_start=date_start,
        date_end=date_end,
        new_company_name=new_company_name
    )
    # Ensure backwards compatibility for counts access
    counts = {
        "actions": metrics.get("appended", 0) + metrics.get("updated", 0),
        "decisions": metrics.get("appended", 0) + metrics.get("updated", 0),
        "priorities": metrics.get("appended", 0) + metrics.get("updated", 0),
        "sheets_processed": metrics.get("sheets_processed", 0),
        "appended": metrics.get("appended", 0),
        "updated": metrics.get("updated", 0),
        "skipped": metrics.get("skipped", 0),
        "flagged": metrics.get("flagged", 0),
        "merged": metrics.get("merged", 0),
        "deleted": metrics.get("deleted", 0)
    }
    # Update accurate domain counts
    if target_key == "register":
        counts["actions"] = metrics.get("appended", 0) + metrics.get("updated", 0)
        counts["decisions"] = 0
        counts["priorities"] = 0
    elif target_key == "decisions":
        counts["actions"] = 0
        counts["decisions"] = metrics.get("appended", 0) + metrics.get("updated", 0)
        counts["priorities"] = 0
    elif target_key == "priorities":
        counts["actions"] = 0
        counts["decisions"] = 0
        counts["priorities"] = metrics.get("appended", 0) + metrics.get("updated", 0)

    return updated_state, counts

def perform_google_sheets_sync(
    sheet_id: Optional[str] = None,
    current_state: Optional[Dict[str, Any]] = None,
    mode: str = "merge",
    target: str = "all",
    conflict_strategy: str = "incoming_wins",
    min_quality_score: float = 0.0,
    excluded_statuses: Optional[Set[str]] = None,
    date_start: Optional[str] = None,
    date_end: Optional[str] = None
) -> Tuple[bool, str, Dict[str, Any], Dict[str, Any]]:
    """
    Full pipeline to sync with Google Sheets targeting a chosen page.
    Tries Service Account first, falls back to Public CSV.
    """
    if current_state is None:
        from services.storage import get_state
        current_state = get_state()

    target_key = normalize_target_key(target or current_state.get('settings', {}).get('googleSheets', {}).get('target', 'all'))

    if sheet_id is None:
        sheet_id = os.getenv('GOOGLE_SHEET_ID') or current_state.get('settings', {}).get('googleSheets', {}).get('sheetId', '')
    
    clean_id, gid, is_published = parse_sheet_input(str(sheet_id).strip())
    if not clean_id:
        return False, "No Google Sheet ID provided. Please provide a valid Sheet ID or URL.", current_state, {}

    creds_path = get_credentials_path()
    success = False
    message = ""
    sheets_data = {}

    if creds_path and not is_published:
        success, message, sheets_data = sync_via_service_account(clean_id, creds_path)

    if not success or not sheets_data:
        # Try public export fallback
        pub_success, pub_message, pub_data = sync_via_public_csv(clean_id, gid=gid, is_published=is_published)
        if pub_success and pub_data:
            success = True
            message = pub_message
            sheets_data = pub_data
        elif not success:
            final_msg = message if message else pub_message
            return False, final_msg, current_state, {}

    # Process extracted multi-sheet data targeting the designated page
    updated_state, counts = process_multi_sheet_data(
        sheets_data, current_state, mode=mode, target=target_key,
        conflict_strategy=conflict_strategy, min_quality_score=min_quality_score,
        excluded_statuses=excluded_statuses, date_start=date_start, date_end=date_end
    )
    
    # Update sync metadata in state
    gs_settings = updated_state.setdefault('settings', {}).setdefault('googleSheets', {})
    gs_settings['sheetId'] = clean_id
    gs_settings['target'] = target_key
    gs_settings['lastSyncTime'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    gs_settings['syncStatus'] = 'success'

    # Formulate summary message
    total_processed = counts.get('appended', 0) + counts.get('updated', 0)
    deleted_str = f" ({counts['deleted']} removed, not in sheet)" if counts.get('deleted') else ""
    skipped_str = f" ({counts['skipped']} skipped below threshold)" if counts.get('skipped') else ""
    flagged_str = f" ({counts['flagged']} flagged for review)" if counts.get('flagged') else ""
    
    msg = f"Synced {total_processed} record(s) ({counts.get('appended',0)} new, {counts.get('updated',0)} updated) across {counts['sheets_processed']} sheet(s){deleted_str}{skipped_str}{flagged_str}."

    gs_settings['syncMessage'] = msg
    return True, msg, updated_state, counts
