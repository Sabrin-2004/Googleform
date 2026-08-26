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

def get_credentials_path() -> Optional[str]:
    """Finds the credentials.json path from environment or workspace."""
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

def sync_via_service_account(sheet_id: str, creds_path: str) -> Tuple[bool, str, Dict[str, List[Dict[str, Any]]]]:
    """Fetches all worksheets from a Google Sheet using a Service Account with smart header detection."""
    try:
        import json
        import gspread
        from google.oauth2.service_account import Credentials

        scopes = [
            'https://www.googleapis.com/auth/spreadsheets.readonly',
            'https://www.googleapis.com/auth/drive.readonly'
        ]
        
        env_json = os.getenv('GOOGLE_CREDENTIALS_JSON') or os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')
        if env_json:
            creds_info = json.loads(env_json) if isinstance(env_json, str) else env_json
            creds = Credentials.from_service_account_info(creds_info, scopes=scopes)
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
        error_msg = str(e)
        if "PERMISSION_DENIED" in error_msg or "403" in error_msg:
            return False, "Google Sheet Access Denied (403). Make sure you shared your Google Sheet with the robot client_email in your credentials.json.", {}
        return False, f"Service Account error: {error_msg}", {}

def sync_via_public_csv(sheet_id: str, gid: Optional[str] = None, is_published: bool = False) -> Tuple[bool, str, Dict[str, List[Dict[str, Any]]]]:
    """
    Attempts to fetch Google Sheet data via public export / CSV endpoints.
    Tries multiple standard Google endpoints with smart header detection and encoding fallbacks.
    """
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
                    s_name, records = parse_csv_file(stream, "GoogleSheet_Export.csv")
                    if records:
                        return True, "Fetched public sheet data successfully.", {"Google Sheet": records}
        except urllib.error.HTTPError as e:
            last_status = e.code
            last_error = e.reason
            if e.code in [401, 403]:
                # Stop on unauthorized/forbidden - sheet is private
                break
        except urllib.error.URLError as e:
            last_error = str(e.reason)
        except Exception as e:
            last_error = str(e)

    if last_status in [401, 403]:
        return False, "Google Sheet Access Denied (Private / Restricted). To fix: In your Google Sheet, click the top-right 'Share' button, and change General Access to 'Anyone with the link' (Viewer), or configure a Service Account credentials.json.", {}
    elif last_status == 404:
        return False, "Google Sheet not found (404). Please verify that the Sheet ID or URL is correct.", {}
    else:
        return False, f"Could not fetch Google Sheet data ({last_error or 'HTTP Error'}). Ensure Sheet is shared as 'Anyone with the link' (Viewer).", {}

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
        "merged": metrics.get("merged", 0)
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
            final_msg = message if (message and "PERMISSION_DENIED" in message) else pub_message
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
    skipped_str = f" ({counts['skipped']} skipped below threshold)" if counts.get('skipped') else ""
    flagged_str = f" ({counts['flagged']} flagged for review)" if counts.get('flagged') else ""
    
    msg = f"Synced {total_processed} record(s) ({counts.get('appended',0)} new, {counts.get('updated',0)} updated) across {counts['sheets_processed']} sheet(s){skipped_str}{flagged_str}."

    gs_settings['syncMessage'] = msg
    return True, msg, updated_state, counts
