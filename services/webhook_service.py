"""
Webhook Integration Engine for Portfolio Command Center
Handles inbound webhooks from Google Forms, Zapier, Make, and Custom HTTP POST requests.
Provides auto-mapping of form fields, validation, persistence, and audit logging.
"""
import os
import hmac
import json
import uuid
import datetime
import logging
from typing import Dict, Any, List, Optional, Tuple

from services.storage import DATA_DIR, get_state, save_state
from services.data_validator import (
    normalize_action_item,
    normalize_decision_item,
    normalize_priority_item,
    sync_companies_and_statuses
)

logger = logging.getLogger(__name__)
LOGS_FILE = os.path.join(DATA_DIR, "webhook_logs.json")
MAX_LOG_ENTRIES = 100

def _get_webhook_logs() -> List[Dict[str, Any]]:
    """Returns stored webhook activity logs."""
    if not os.path.exists(LOGS_FILE):
        return []
    try:
        with open(LOGS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def _save_webhook_logs(logs: List[Dict[str, Any]]):
    """Saves webhook activity logs."""
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(LOGS_FILE, "w", encoding="utf-8") as f:
            json.dump(logs[:MAX_LOG_ENTRIES], f, indent=2)
    except Exception as e:
        logger.error(f"Error saving webhook logs: {e}")

def log_webhook_event(
    source: str,
    payload: Any,
    status: str,
    message: str,
    target_type: str = "",
    created_item: Optional[Dict[str, Any]] = None,
    client_ip: str = ""
):
    """Appends an event to the webhook audit log."""
    logs = _get_webhook_logs()
    event = {
        "id": "wh_" + uuid.uuid4().hex[:10],
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "source": source,
        "status": status,
        "message": message,
        "target_type": target_type,
        "client_ip": client_ip,
        "created_item": created_item,
        "payload_preview": payload if isinstance(payload, (dict, list, str, int, float, bool)) else str(payload)
    }
    logs.insert(0, event)
    _save_webhook_logs(logs)
    return event

def clear_webhook_logs():
    """Clears all stored webhook activity logs."""
    _save_webhook_logs([])

def flatten_form_responses(payload: Any) -> Dict[str, Any]:
    """
    Extracts key-value pairs from various webhook payload structures:
    - Direct JSON dict: { "Company": "Aarna", "Item": "Deploy app" }
    - Google Forms via Apps Script response object:
      { "responses": { "Company": "Aarna", "Item": "..." } } or { "namedValues": { "Company": ["Aarna"] } }
    - Array of objects / question-answers: [ { "question": "Item", "answer": "Deploy" } ]
    """
    if not isinstance(payload, dict):
        return {}

    # Check for Google Forms namedValues from Spreadsheet onSubmit trigger
    if "namedValues" in payload and isinstance(payload["namedValues"], dict):
        flattened = {}
        for k, v in payload["namedValues"].items():
            if isinstance(v, list) and len(v) > 0:
                flattened[k] = str(v[0]).strip()
            else:
                flattened[k] = str(v).strip()
        return flattened

    # Check for responses wrapper
    if "responses" in payload and isinstance(payload["responses"], dict):
        return {str(k): v for k, v in payload["responses"].items()}

    # Check for data or body wrapper
    if "data" in payload and isinstance(payload["data"], dict):
        return {str(k): v for k, v in payload["data"].items()}

    if "body" in payload and isinstance(payload["body"], dict):
        return {str(k): v for k, v in payload["body"].items()}

    return payload

def detect_item_type(data: Dict[str, Any], explicit_target: Optional[str] = None) -> str:
    """
    Determines if incoming payload is an 'action', 'decision', or 'priority'.
    """
    if explicit_target and explicit_target.lower() in ("action", "actions", "register"):
        return "action"
    if explicit_target and explicit_target.lower() in ("decision", "decisions"):
        return "decision"
    if explicit_target and explicit_target.lower() in ("priority", "priorities"):
        return "priority"

    keys_lower = {str(k).lower().strip(): v for k, v in data.items()}

    # Check for explicit type field
    for k in ("type", "target", "category", "form_type", "destination"):
        if k in keys_lower:
            val = str(keys_lower[k]).lower()
            if "decision" in val: return "decision"
            if "priorit" in val: return "priority"
            if "action" in val or "register" in val or "task" in val: return "action"

    # Decision indicators
    if any(k in keys_lower for k in ("decision", "decision title", "decision_title", "impact", "impact if delayed", "next review", "nextreview")):
        return "decision"

    # Priority indicators
    if any(k in keys_lower for k in ("focus area", "focusarea", "why", "horizon", "strategic priority")):
        return "priority"

    # Default is action item
    return "action"

def map_and_normalize_webhook_data(data: Dict[str, Any], target_type: str) -> Optional[Dict[str, Any]]:
    """
    Intelligently maps various question phrasing to canonical dashboard keys and normalizes.
    """
    keys_map = {}
    for k, v in data.items():
        k_clean = str(k).lower().strip().replace("_", " ").replace("-", " ")
        keys_map[k_clean] = v

    def find_val(*aliases: str) -> str:
        for alias in aliases:
            a_clean = alias.lower().strip()
            # Exact match
            if a_clean in keys_map and keys_map[a_clean] is not None:
                val = str(keys_map[a_clean]).strip()
                if val: return val
            # Substring match
            for k, v in keys_map.items():
                if a_clean in k and v is not None:
                    val = str(v).strip()
                    if val: return val
        return ""

    if target_type == "action":
        item_text = find_val("item", "action item", "action", "task", "task name", "title", "description", "summary", "activity")
        if not item_text:
            return None
        company = find_val("company", "company name", "project", "organization", "client", "business")
        function_name = find_val("function", "department", "team", "dept", "vertical")
        owner = find_val("owner", "assignee", "lead", "assigned to", "person", "responsible")
        status = find_val("status", "progress", "state")
        founder_dep = find_val("founder dependency", "dependency", "founder review", "founder", "dependency status")
        due = find_val("due", "due date", "deadline", "target date", "eta")
        comments = find_val("comments", "comment", "notes", "remarks", "details")

        raw_item = {
            "item": item_text,
            "company": company or "General",
            "function": function_name or "General",
            "owner": owner or "Unassigned",
            "status": status or "To Start",
            "founderDependency": founder_dep or "None",
            "due": due,
            "comments": comments
        }
        return normalize_action_item(raw_item)

    elif target_type == "decision":
        decision_title = find_val("decision", "decision title", "title", "item", "topic", "subject")
        if not decision_title:
            return None
        owner = find_val("owner", "assignee", "lead", "responsible", "decider")
        status = find_val("status", "state", "decision status")
        founder_dep = find_val("founder dependency", "dependency", "founder review")
        impact = find_val("impact", "impact if delayed", "consequence", "risk", "business impact")
        deadline = find_val("deadline", "due date", "due", "target date")
        next_review = find_val("next review", "nextreview", "review date")

        raw_item = {
            "decision": decision_title,
            "owner": owner or "Unassigned",
            "status": status or "To Start",
            "founderDependency": founder_dep or "To Review",
            "impact": impact or "",
            "deadline": deadline or "",
            "nextReview": next_review or ""
        }
        return normalize_decision_item(raw_item)

    elif target_type == "priority":
        focus_area = find_val("focus area", "focusarea", "priority", "strategic priority", "title", "item", "goal")
        if not focus_area:
            return None
        priority_num = find_val("priority", "level", "rank", "priority level", "order") or "1.0"
        group = find_val("group", "company", "team", "business unit", "division") or "General"
        why = find_val("why", "rationale", "justification", "strategic reason", "purpose")
        horizon = find_val("horizon", "timeframe", "timeline", "target horizon", "period") or "Next 30 days"

        raw_item = {
            "priority": priority_num,
            "group": group,
            "focusArea": focus_area,
            "why": why,
            "horizon": horizon
        }
        return normalize_priority_item(raw_item)

    return None

def process_inbound_webhook(
    payload: Any,
    client_ip: str = "",
    secret: Optional[str] = None,
    explicit_target: Optional[str] = None
) -> Tuple[bool, str, Optional[Dict[str, Any]], str]:
    """
    Main webhook handler:
    1. Validates secret if configured.
    2. Flattens payload.
    3. Detects target type (Action / Decision / Priority).
    4. Normalizes and appends to dashboard state.
    5. Logs the event.
    Returns: (success: bool, message: str, created_item: Optional[Dict], target_type: str)
    """
    state = get_state()
    webhook_settings = state.get("settings", {}).get("webhookSettings", {})

    # Validate secret if required
    configured_secret = os.getenv("WEBHOOK_SECRET", "").strip()
    if not configured_secret or not secret or not hmac.compare_digest(secret, configured_secret):
            msg = "Webhook rejected: Invalid or missing secret token."
            log_webhook_event(
                source="Inbound Webhook",
                payload=payload,
                status="unauthorized",
                message=msg,
                client_ip=client_ip
            )
            return False, msg, None, ""

    flat_data = flatten_form_responses(payload)
    if not flat_data:
        msg = "Webhook payload was empty or not recognized as JSON object."
        log_webhook_event(
            source="Inbound Webhook",
            payload=payload,
            status="error",
            message=msg,
            client_ip=client_ip
        )
        return False, msg, None, ""

    target_type = detect_item_type(flat_data, explicit_target)
    normalized_item = map_and_normalize_webhook_data(flat_data, target_type)

    if not normalized_item:
        msg = f"Could not extract required fields for {target_type}. Ensure at least 'Item', 'Decision', or 'Focus Area' is provided."
        log_webhook_event(
            source="Inbound Webhook",
            payload=flat_data,
            status="error",
            message=msg,
            target_type=target_type,
            client_ip=client_ip
        )
        return False, msg, None, target_type

    # Append to state
    if target_type == "action":
        state.setdefault("actions", []).append(normalized_item)
    elif target_type == "decision":
        state.setdefault("decisions", []).append(normalized_item)
    elif target_type == "priority":
        state.setdefault("priorities", []).append(normalized_item)

    state = sync_companies_and_statuses(state)
    save_state(state)

    msg = f"Successfully added {target_type} item: '{normalized_item.get('item') or normalized_item.get('decision') or normalized_item.get('focusArea')}'"
    log_webhook_event(
        source="Google Form / Webhook",
        payload=flat_data,
        status="success",
        message=msg,
        target_type=target_type,
        created_item=normalized_item,
        client_ip=client_ip
    )

    return True, msg, normalized_item, target_type

def generate_google_apps_script(webhook_url: str, secret_key: str = "") -> str:
    """Generates ready-to-use Google Apps Script code for Google Forms."""
    return f"""/**
 * Google Apps Script for Google Forms -> Portfolio Command Center Webhook
 * 
 * SETUP INSTRUCTIONS:
 * 1. In your Google Form, click the three vertical dots (⋮) -> 'Script editor'.
 * 2. Paste this entire code into the script editor.
 * 3. Click the Clock icon (Triggers) on the left sidebar.
 * 4. Click '+ Add Trigger' (bottom right):
 *    - Choose which function to run: 'onFormSubmit'
 *    - Select event source: 'From form'
 *    - Select event type: 'On form submit'
 * 5. Click 'Save' and grant permissions.
 */

const WEBHOOK_URL = "{webhook_url}";
const WEBHOOK_SECRET = "{secret_key}";

function onFormSubmit(e) {{
  if (!e || !e.response) {{
    Logger.log("No response object found.");
    return;
  }}
  
  const formResponse = e.response;
  const itemResponses = formResponse.getItemResponses();
  const payload = {{
    formTitle: e.source ? e.source.getTitle() : "Google Form Submission",
    respondentEmail: formResponse.getRespondentEmail ? formResponse.getRespondentEmail() : "",
    submittedAt: formResponse.getTimestamp ? formResponse.getTimestamp().toISOString() : new Date().toISOString(),
    responses: {{}}
  }};
  
  // Extract all questions and answers
  for (let i = 0; i < itemResponses.length; i++) {{
    const itemResponse = itemResponses[i];
    const question = itemResponse.getItem().getTitle().trim();
    const answer = itemResponse.getResponse();
    payload.responses[question] = Array.isArray(answer) ? answer.join(", ") : answer;
  }}
  
  // Send to Command Center Webhook
  const options = {{
    method: "post",
    contentType: "application/json",
    headers: {{
      "X-Webhook-Secret": WEBHOOK_SECRET,
      "X-Idempotency-Key": formResponse.getId()
    }},
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  }};
  
  try {{
    const res = UrlFetchApp.fetch(WEBHOOK_URL, options);
    Logger.log("Webhook response (" + res.getResponseCode() + "): " + res.getContentText());
  }} catch (err) {{
    Logger.log("Webhook error: " + err.toString());
  }}
}}
"""
