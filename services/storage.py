"""
Persistent Storage Engine for Portfolio Command Center
Stores and manages state in data/dashboard_data.json with atomic writes and backup rotation.
"""
import os
import json
import shutil
import threading
import datetime
from typing import Dict, Any, Optional

DATA_DIR = os.getenv('DASHBOARD_DATA_DIR', os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data'))
DATA_FILE = os.path.join(DATA_DIR, 'dashboard_data.json')
BACKUP_DIR = os.path.join(DATA_DIR, 'backups')

_lock = threading.Lock()

def get_default_settings() -> Dict[str, Any]:
    return {
        "colors": {
            "attention": "#E5484D",
            "progress": "#4C9AFF",
            "done": "#3DD68C",
            "hold": "#5A5F6B",
            "future": "#5A5F6B",
            "text": "#EDEFF3",
            "muted": "#8B909C",
            "tableText": "#EDEFF3",
            "labelText": "#5E636F",
            "tableHeaderText": "#5E636F"
        },
        "companyColors": {
            "Pranik": "#3FA796",
            "Aarna": "#E0A458",
            "Miraee": "#8B7FD1",
            "Abhee": "#E0705C",
            "RedT": "#5B8DEF",
            "Casa Monde": "#C77DD0"
        },
        "companies": [
            {"id": "Pranik", "name": "Pranik"},
            {"id": "Aarna", "name": "Aarna"},
            {"id": "Miraee", "name": "Miraee"},
            {"id": "Abhee", "name": "Abhee"},
            {"id": "RedT", "name": "RedT"},
            {"id": "Casa Monde", "name": "Casa Monde"}
        ],
        "statuses": [
            "Blocked", "Delayed", "On Hold", "WIP", "To Start", "Planned", "To Plan", "Future", "Done"
        ],
        "statusBuckets": {
            "Blocked": "attention",
            "Delayed": "attention",
            "On Hold": "hold",
            "WIP": "progress",
            "To Start": "progress",
            "Planned": "progress",
            "To Plan": "progress",
            "Future": "future",
            "Done": "done"
        },
        "columns": [
            {"key": "company", "label": "Company", "visible": True},
            {"key": "function", "label": "Function", "visible": True},
            {"key": "item", "label": "Item", "visible": True},
            {"key": "owner", "label": "Owner", "visible": True},
            {"key": "founderDependency", "label": "Founder Dependency", "visible": True},
            {"key": "status", "label": "Status", "visible": True},
            {"key": "comments", "label": "Comments", "visible": False}
        ],
        "decisionColumns": [
            {"key": "decision", "label": "Decision", "visible": True},
            {"key": "owner", "label": "Owner", "visible": True},
            {"key": "status", "label": "Status", "visible": True},
            {"key": "founderDependency", "label": "Founder Dependency", "visible": False},
            {"key": "impact", "label": "Impact if delayed", "visible": True},
            {"key": "deadline", "label": "Deadline", "visible": False},
            {"key": "nextReview", "label": "Next Review", "visible": False}
        ],
        "kpis": [
            {"id": "bucket:attention", "label": "Needs attention", "visible": True},
            {"id": "bucket:hold", "label": "On hold", "visible": True},
            {"id": "bucket:progress", "label": "In progress", "visible": True},
            {"id": "bucket:done", "label": "Done", "visible": True}
        ],
        "emphasis": {},
        "pin": "",
        "tabs": [
            {"key": "overview", "label": "Overview", "visible": True},
            {"key": "register", "label": "Register", "visible": True},
            {"key": "decisions", "label": "Decisions", "visible": True},
            {"key": "priorities", "label": "Priorities", "visible": True},
            {"key": "data", "label": "Data", "visible": True},
            {"key": "webhooks", "label": "Webhooks", "visible": True},
            {"key": "settings", "label": "Settings", "visible": True}
        ],
        "overviewSections": {
            "companyHealth": True,
            "needsAttention": True,
            "founderReview": True,
            "decisionQueue": True
        },
        "spotlightStatuses": ["Blocked", "Delayed", "On Hold"],
        "googleSheets": {
            "sheetId": "",
            "autoSyncIntervalMinutes": 0,
            "lastSyncTime": None,
            "syncStatus": "idle",
            "syncMessage": ""
        },
        "webhookSettings": {
            "enabled": True,
            "secretKey": "",
            "defaultTarget": "all",
            "autoApprove": True
        }
    }

def get_initial_seed_data() -> Dict[str, Any]:
    """Returns baseline data with initial actions, decisions, and priorities."""
    return {
        "lastUpdated": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "settings": get_default_settings(),
        "actions": [
            {"id": "a1", "company": "Aarna", "function": "Content", "item": "Creatorpreneur Content Studio (CCS) Plan", "status": "Done", "owner": "Saurav", "founderDependency": "None", "due": "", "comments": ""},
            {"id": "a2", "company": "Aarna", "function": "Content", "item": "Medical Tourism Database", "status": "Done", "owner": "Lakshmi", "founderDependency": "None", "due": "", "comments": ""},
            {"id": "a3", "company": "Aarna", "function": "Content", "item": "MICE Database", "status": "Done", "owner": "Jalpa", "founderDependency": "None", "due": "", "comments": ""},
            {"id": "a4", "company": "Aarna", "function": "Content", "item": "Experiences database", "status": "Done", "owner": "Raghava", "founderDependency": "None", "due": "", "comments": ""},
            {"id": "a5", "company": "Aarna", "function": "ONDC", "item": "Direction on what we will share (Videos, Images) as a seller app.", "status": "Done", "owner": "Kiran", "founderDependency": "None", "due": "", "comments": ""},
            {"id": "a6", "company": "Aarna", "function": "ONDC", "item": "ONDC (Experiences) Team formation", "status": "Done", "owner": "Prasad", "founderDependency": "None", "due": "", "comments": ""},
            {"id": "a7", "company": "Aarna", "function": "Product", "item": "AI-driven personalized recommendation system", "status": "Done", "owner": "Kiran", "founderDependency": "None", "due": "", "comments": "in vibe"},
            {"id": "a8", "company": "Aarna", "function": "Product", "item": "Q&A capability for real-time product enquiries", "status": "Done", "owner": "Kiran", "founderDependency": "None", "due": "", "comments": ""},
            {"id": "a9", "company": "Aarna", "function": "Product", "item": "Quantitative metrics dashboard (products, transactions)", "status": "Done", "owner": "Kiran", "founderDependency": "None", "due": "", "comments": ""},
            {"id": "a10", "company": "Aarna", "function": "Product", "item": "Resolve Phase-1 Gemini integration issues and retrain agents with new input format requirements", "status": "Done", "owner": "Kiran", "founderDependency": "None", "due": "", "comments": ""},
            {"id": "a11", "company": "Aarna", "function": "GTM", "item": "Develop detailed demand-side GTM strategy", "status": "Done", "owner": "Nikhil", "founderDependency": "None", "due": "", "comments": "Integrate transit tourism opportunities into strategy"},
            {"id": "a12", "company": "Aarna", "function": "GTM", "item": "B2B distribution Plan", "status": "Done", "owner": "Nikhil", "founderDependency": "None", "due": "", "comments": ""},
            {"id": "a13", "company": "Aarna", "function": "GTM", "item": "Detailed execution plan at vision level", "status": "Done", "owner": "Nikhil", "founderDependency": "None", "due": "", "comments": ""},
            {"id": "a14", "company": "Aarna", "function": "GTM", "item": "Plan for Workshops to be conducted- DS & ES (Telangana & Andhra)- All 15 categories??", "status": "Done", "owner": "Kiran", "founderDependency": "None", "due": "", "comments": ""},
            {"id": "a15", "company": "Aarna", "function": "Product", "item": "Aarna ES Demo (Vibe)- Incorporate feedback", "status": "Done", "owner": "Bhuvan", "founderDependency": "None", "due": "", "comments": "1. Agentic Layer\\n2. Voice\\n3. Assigning tasks to Creatorprenuer"},
            {"id": "a54", "company": "Aarna", "function": "GTM", "item": "Digital Stores Onboarding Plan- Creatorpreneur Digital Store Owner (C. DSO)", "status": "On Hold", "owner": "Kiran", "founderDependency": "Delayed", "due": "", "comments": ""},
            {"id": "a55", "company": "Aarna", "function": "GTM", "item": "Creatorpreneur Onboarding Plan- Social Commerce", "status": "On Hold", "owner": "Kiran", "founderDependency": "Delayed", "due": "", "comments": ""},
            {"id": "a73", "company": "Aarna", "function": "GTM", "item": "Going to market with Aarna OS (ES incl)- Vibe Feature Review", "status": "To Start", "owner": "Kiran", "founderDependency": "To Review", "due": "", "comments": ""},
            {"id": "a80", "company": "Aarna", "function": "Product", "item": "finalize screens showing business/catalog/pricing/inventory with examples for all 5 verticals", "status": "WIP", "owner": "Bhuvan", "founderDependency": "None", "due": "", "comments": ""},
            {"id": "a87", "company": "Abhee", "function": "GTM", "item": "UAE: Execution Plan & P&L", "status": "Done", "owner": "Nikhil", "founderDependency": "None", "due": "", "comments": ""},
            {"id": "a96", "company": "Abhee", "function": "Product", "item": "Feedback: Explore Section Logic & Trips Section Design Screens", "status": "To Start", "owner": "Vishwa", "founderDependency": "To Review", "due": "", "comments": ""},
            {"id": "a108", "company": "Abhee", "function": "Product", "item": "Trip Flows: Booking history in the trip section & Pre-trip recommendations", "status": "WIP", "owner": "Vishwa", "founderDependency": "Ongoing", "due": "", "comments": ""},
            {"id": "a121", "company": "Pranik", "function": "GTM", "item": "Identify Sick Units- Hyd, Chennai, Mumbai", "status": "On Hold", "owner": "Kiran", "founderDependency": "Decision", "due": "", "comments": "Is this a Priority in Phase-1?"},
            {"id": "a122", "company": "Pranik", "function": "Product", "item": "Constant Care- Cancer Integration", "status": "Future", "owner": "Natesh", "founderDependency": "Decision", "due": "", "comments": ""},
            {"id": "a143", "company": "Pranik", "function": "Product", "item": "Auto assignment of doctors with CDSS & Scribe", "status": "Done", "owner": "Praveen", "founderDependency": "None", "due": "", "comments": "Deployed CDSS & Scribe"}
        ],
        "decisions": [
            {"id": "d1", "decision": "Avaitor's Project Assignment", "owner": "Prasad", "status": "To Start", "founderDependency": "Delayed", "impact": "Unused resources", "deadline": "", "nextReview": ""},
            {"id": "d2", "decision": "UAE GTM- Execution Plan", "owner": "Nikhil", "status": "WIP", "founderDependency": "To Review", "impact": "Loss of opportunity", "deadline": "", "nextReview": ""},
            {"id": "d3", "decision": "Exp. Creation Plan", "owner": "Saurav", "status": "Done", "founderDependency": "To Review", "impact": "1st mover advantage lost", "deadline": "", "nextReview": ""},
            {"id": "d4", "decision": "Pranik-0 Product Demo", "owner": "Kiran", "status": "Done", "founderDependency": "To Review", "impact": "Loss of market penetration", "deadline": "", "nextReview": ""},
            {"id": "d5", "decision": "Legal Agreements", "owner": "Anagha", "status": "To Start", "founderDependency": "Delayed", "impact": "Loss of opportunity", "deadline": "", "nextReview": ""},
            {"id": "d6", "decision": "Qwipo-CP Plan", "owner": "Siva, Vamshi", "status": "To Start", "founderDependency": "Delayed", "impact": "Loss of market penetration", "deadline": "", "nextReview": ""}
        ],
        "priorities": [
            {"id": "p1", "priority": "1.0", "group": "Pranik Products", "focusArea": "P4P / P4D / P4H", "why": "Product readiness for GTM", "horizon": "Next 15 days"},
            {"id": "p2", "priority": "2.0", "group": "Pranik GTM", "focusArea": "Indian Army", "why": "Market recognition", "horizon": "Next 30 days"},
            {"id": "p3", "priority": "2.0", "group": "Pranik GTM", "focusArea": "SPV", "why": "Data source for SLMs, market leader", "horizon": "Next 15 days"},
            {"id": "p4", "priority": "2.0", "group": "Pranik GTM", "focusArea": "Pranik Centres", "why": "POC with Smart Clinics, need operating model", "horizon": "Next 60 days"},
            {"id": "p5", "priority": "3.0", "group": "Aarna Product", "focusArea": "Digital Stores / Whitelight", "why": "Product readiness for GTM", "horizon": "Next 30 days"},
            {"id": "p6", "priority": "4.0", "group": "Aarna GTM", "focusArea": "Digital Stores / Creatorpreneurs", "why": "", "horizon": "Next 60 days"},
            {"id": "p7", "priority": "5.0", "group": "Miraee", "focusArea": "Miraee Product", "why": "First source of revenue generation", "horizon": "Next 15 days"}
        ]
    }

def _write_json_file(state: Dict[str, Any]):
    """Internal helper to write state to disk with backup."""
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(BACKUP_DIR, exist_ok=True)
    state['lastUpdated'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    temp_file = f"{DATA_FILE}.tmp"
    try:
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(state, f, indent=2, ensure_ascii=False)
        if os.path.exists(DATA_FILE):
            backup_name = f"backup_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            shutil.copy2(DATA_FILE, os.path.join(BACKUP_DIR, backup_name))
            backups = sorted([os.path.join(BACKUP_DIR, b) for b in os.listdir(BACKUP_DIR) if b.endswith('.json')])
            while len(backups) > 10:
                try:
                    os.remove(backups.pop(0))
                except Exception:
                    pass
        shutil.move(temp_file, DATA_FILE)
    except Exception as e:
        if os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except Exception:
                pass
        raise e

def init_storage():
    """Initializes the data directory and default state file if not already present."""
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(BACKUP_DIR, exist_ok=True)
    with _lock:
        if not os.path.exists(DATA_FILE):
            seed = get_initial_seed_data()
            _write_json_file(seed)

def get_state() -> Dict[str, Any]:
    """Reads and returns the current dashboard state."""
    init_storage()
    with _lock:
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                state = json.load(f)
            # Ensure settings schema completeness
            default_set = get_default_settings()
            current_set = state.setdefault('settings', {})
            for k, v in default_set.items():
                if k not in current_set:
                    current_set[k] = v
            return state
        except Exception as e:
            seed = get_initial_seed_data()
            return seed

def save_state(state: Dict[str, Any]) -> bool:
    """Atomically saves the dashboard state and creates a timestamped backup."""
    init_storage()
    with _lock:
        _write_json_file(state)
        return True
