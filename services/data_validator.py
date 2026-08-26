"""
Data Validator & Normalization Engine
Handles schema validation, robust column mapping, fuzzy matching, fallback text extraction,
threshold/criteria exclusion rules, composite key identification, and conflict detection.
"""
import re
import uuid
import datetime
from typing import Dict, Any, List, Optional, Tuple, Set

PALETTE = ['#3FA796', '#E0A458', '#8B7FD1', '#E0705C', '#5B8DEF', '#C77DD0', '#6DBE8C', '#D68BB0', '#FF9F1C', '#2EC4B6']

DEFAULT_STATUSES = ['Blocked', 'Delayed', 'On Hold', 'WIP', 'To Start', 'Planned', 'To Plan', 'Future', 'Done']

DEFAULT_EXCLUDED_STATUSES = {'archived', 'cancelled', 'canceled', 'deleted', 'trash', 'discarded', 'inactive', 'deprecated'}

STATUS_BUCKET_MAP = {
    'Blocked': 'attention',
    'Delayed': 'attention',
    'Needs Attention': 'attention',
    'Critical': 'attention',
    'Urgent': 'attention',
    'On Hold': 'hold',
    'Hold': 'hold',
    'Paused': 'hold',
    'Waiting': 'hold',
    'WIP': 'progress',
    'In Progress': 'progress',
    'To Start': 'progress',
    'Planned': 'progress',
    'To Plan': 'progress',
    'In Review': 'progress',
    'Active': 'progress',
    'Done': 'done',
    'Completed': 'done',
    'Finished': 'done',
    'Closed': 'done',
    'Resolved': 'done',
    'Future': 'future',
    'Backlog': 'future',
    'Idea': 'future'
}

def parse_date_safely(date_val: Any) -> Optional[datetime.date]:
    """Parses various date formats safely into a datetime.date object."""
    if not date_val:
        return None
    if isinstance(date_val, (datetime.date, datetime.datetime)):
        return date_val.date() if isinstance(date_val, datetime.datetime) else date_val
    if isinstance(date_val, (int, float)):
        return None
    s = str(date_val).strip()
    if not s or s.lower() in ('nan', 'none', 'null', 'nat', '<na>', '—', '-'):
        return None
    
    # Try ISO and standard formats
    formats = [
        '%Y-%m-%d', '%Y/%m/%d', '%d-%m-%Y', '%d/%m/%Y',
        '%m-%d-%Y', '%m/%d/%Y', '%Y-%m-%d %H:%M:%S',
        '%b %d, %Y', '%B %d, %Y', '%d %b %Y', '%d %B %Y'
    ]
    for fmt in formats:
        try:
            return datetime.datetime.strptime(s, fmt).date()
        except Exception:
            continue
    # Try regex extraction for YYYY-MM-DD or DD-MM-YYYY
    m = re.search(r'(\d{4})[-/](\d{1,2})[-/](\d{1,2})', s)
    if m:
        try:
            return datetime.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        except Exception:
            pass
    return None

def calculate_quality_score(record: Dict[str, Any], record_type: str = 'actions') -> float:
    """
    Calculates a quality / completeness score between 0.0 and 1.0 for a record.
    Evaluates:
    - Presence and length of primary content (item/decision/focusArea)
    - Presence of key metadata (owner, status, company/group)
    - Absence of dummy placeholder values
    """
    if not record or not isinstance(record, dict):
        return 0.0

    score = 0.0
    total_weights = 0.0

    if record_type == 'actions':
        # Primary item (weight 5.0)
        item = str(record.get('item', '')).strip()
        total_weights += 5.0
        item_score = 0.0
        if item and item.lower() not in ('none', 'n/a', 'na', 'test', 'untitled', 'empty', '—', '-', 'null', 'undefined'):
            if len(item) >= 8:
                item_score = 5.0
            elif len(item) >= 3:
                item_score = 3.0
            else:
                item_score = 1.0
        score += item_score
        if item_score == 0.0:
            return 0.1  # Dummy or missing item invalidates record quality

        # Company (weight 2.0)
        comp = str(record.get('company', '')).strip()
        total_weights += 2.0
        if comp and comp.lower() not in ('none', 'n/a', 'na', '—', 'general'):
            score += 2.0
        elif comp:
            score += 1.0

        # Status (weight 1.5)
        st = str(record.get('status', '')).strip()
        total_weights += 1.5
        if st and st.lower() not in ('none', 'n/a', 'na', '—'):
            score += 1.5

        # Owner (weight 1.5)
        owner = str(record.get('owner', '')).strip()
        total_weights += 1.5
        if owner and owner.lower() not in ('none', 'n/a', 'na', '—'):
            score += 1.5

    elif record_type == 'decisions':
        decision = str(record.get('decision', '')).strip()
        total_weights += 5.0
        dec_score = 0.0
        if decision and decision.lower() not in ('none', 'n/a', 'na', 'test', 'untitled', 'empty', '—', '-', 'null', 'undefined'):
            if len(decision) >= 8:
                dec_score = 5.0
            elif len(decision) >= 3:
                dec_score = 3.0
            else:
                dec_score = 1.0
        score += dec_score
        if dec_score == 0.0:
            return 0.1

        owner = str(record.get('owner', '')).strip()
        total_weights += 2.0
        if owner and owner.lower() not in ('none', 'n/a', 'na', '—'):
            score += 2.0

        status = str(record.get('status', '')).strip()
        total_weights += 1.5
        if status and status.lower() not in ('none', 'n/a', 'na', '—'):
            score += 1.5

        impact = str(record.get('impact', '')).strip()
        total_weights += 1.5
        if impact and impact.lower() not in ('none', 'n/a', 'na', '—'):
            score += 1.5

    else:  # priorities
        focus = str(record.get('focusArea', '')).strip()
        total_weights += 5.0
        focus_score = 0.0
        if focus and focus.lower() not in ('none', 'n/a', 'na', 'test', 'untitled', 'empty', '—', '-', 'null', 'undefined'):
            if len(focus) >= 8:
                focus_score = 5.0
            elif len(focus) >= 3:
                focus_score = 3.0
            else:
                focus_score = 1.0
        score += focus_score
        if focus_score == 0.0:
            return 0.1

        group = str(record.get('group', '')).strip()
        total_weights += 2.0
        if group and group.lower() not in ('none', 'n/a', 'na', '—'):
            score += 2.0

        priority = str(record.get('priority', '')).strip()
        total_weights += 1.5
        if priority and priority.lower() not in ('none', 'n/a', 'na', '—'):
            score += 1.5

        why = str(record.get('why', '')).strip()
        total_weights += 1.5
        if why and why.lower() not in ('none', 'n/a', 'na', '—'):
            score += 1.5

    return round(score / total_weights, 2) if total_weights > 0 else 0.0

def evaluate_row_exclusion(
    record: Dict[str, Any],
    record_type: str = 'actions',
    min_quality_score: float = 0.0,
    excluded_statuses: Optional[Set[str]] = None,
    date_start: Optional[str] = None,
    date_end: Optional[str] = None
) -> Tuple[bool, Optional[str]]:
    """
    Evaluates whether a normalized record should be excluded based on configurable threshold rules:
    - Quality score threshold (completeness/validity)
    - Excluded status criteria (e.g. archived, deleted, cancelled)
    - Date range threshold (date before start date or after end date)
    Returns: (is_excluded, reason_code_or_message)
    """
    if not record:
        return True, "empty_record"

    # 1. Check primary text content
    primary_text = ""
    if record_type == 'actions':
        primary_text = str(record.get('item', '')).strip()
    elif record_type == 'decisions':
        primary_text = str(record.get('decision', '')).strip()
    elif record_type == 'priorities':
        primary_text = str(record.get('focusArea', '')).strip()

    if not primary_text:
        return True, "missing_primary_content"

    # 2. Excluded Status Check
    status_val = str(record.get('status', '')).strip().lower()
    active_excluded_statuses = excluded_statuses if excluded_statuses is not None else DEFAULT_EXCLUDED_STATUSES
    if status_val in active_excluded_statuses:
        return True, f"status_excluded:{status_val}"

    # 3. Quality Score Threshold Check
    if min_quality_score > 0.0:
        q_score = calculate_quality_score(record, record_type)
        if q_score < min_quality_score:
            return True, f"quality_score_below_threshold:{q_score}<{min_quality_score}"

    # 4. Date Range Threshold Check
    if date_start or date_end:
        rec_date_str = record.get('due') or record.get('deadline') or record.get('horizon') or record.get('date')
        rec_date = parse_date_safely(rec_date_str)
        if rec_date:
            if date_start:
                start_d = parse_date_safely(date_start)
                if start_d and rec_date < start_d:
                    return True, f"date_before_range:{rec_date}<{start_d}"
            if date_end:
                end_d = parse_date_safely(date_end)
                if end_d and rec_date > end_d:
                    return True, f"date_after_range:{rec_date}>{end_d}"

    return False, None

def get_action_composite_key(record: Dict[str, Any]) -> str:
    """Generates a composite lookup key for action items (Company + Normalized Item)."""
    comp = str(record.get('company', '')).strip().lower()
    item = _simplify(record.get('item', ''))
    return f"{comp}::{item}"

def get_decision_composite_key(record: Dict[str, Any]) -> str:
    """Generates a composite lookup key for decisions (Normalized Decision Title)."""
    dec = _simplify(record.get('decision', ''))
    return f"decision::{dec}"

def get_priority_composite_key(record: Dict[str, Any]) -> str:
    """Generates a composite lookup key for priorities (Group + Normalized Focus Area)."""
    group = str(record.get('group', '')).strip().lower()
    focus = _simplify(record.get('focusArea', ''))
    return f"{group}::{focus}"

def detect_record_diff(existing: Dict[str, Any], incoming: Dict[str, Any], fields: List[str]) -> Dict[str, Tuple[Any, Any]]:
    """
    Detects differing fields between an existing record and incoming record.
    Returns a dict: {field_name: (existing_val, incoming_val)} for fields that differ.
    """
    diffs = {}
    for f in fields:
        e_val = str(existing.get(f, '')).strip()
        i_val = str(incoming.get(f, '')).strip()
        if i_val and e_val != i_val:
            diffs[f] = (e_val, i_val)
    return diffs

def guess_status_bucket(status_name: str) -> str:
    """Guess the category bucket for a given status string."""
    if not status_name:
        return 'future'
    st_clean = str(status_name).strip().lower()
    for known_st, bucket in STATUS_BUCKET_MAP.items():
        if st_clean == known_st.lower():
            return bucket
    if any(k in st_clean for k in ['block', 'delay', 'stuck', 'crit', 'urg', 'attn', 'alert', 'error', 'risk', 'fail', 'issue']):
        return 'attention'
    if any(k in st_clean for k in ['hold', 'pause', 'wait', 'defer', 'postpone']):
        return 'hold'
    if any(k in st_clean for k in ['done', 'comp', 'finish', 'close', 'resolv', 'pass', 'success', 'shipped', 'merged']):
        return 'done'
    if any(k in st_clean for k in ['wip', 'prog', 'start', 'plan', 'activ', 'dev', 'run', 'work', 'build', 'review', 'test', 'open']):
        return 'progress'
    if any(k in st_clean for k in ['fut', 'later', 'backlog', 'idea', 'q3', 'q4', 'next', 'someday']):
        return 'future'
    return 'progress'

def _simplify(s: Any) -> str:
    """Normalizes string to lowercase alphanumeric characters only."""
    return re.sub(r'[^a-z0-9]', '', str(s).lower())

def find_best_column(columns: List[str], candidate_names: List[str]) -> Optional[str]:
    """
    Finds the best matching column name from a list of candidate names with multi-stage matching:
    1. Exact case-insensitive match.
    2. Simplified alphanumeric match (ignores spaces, hyphens, underscores, punctuation).
    3. Whole-word / token containment (e.g. 'Action Item' matches 'What is the action item?').
    4. Substring matching (with minimum length protection to prevent false positives).
    """
    valid_cols = [c for c in columns if c is not None and str(c).strip() != '']
    if not valid_cols:
        return None

    clean_cols_map = {str(col).strip().lower(): col for col in valid_cols}
    simplified_cols_map = {_simplify(col): col for col in valid_cols if _simplify(col)}

    # Stage 1: Exact match
    for cand in candidate_names:
        cand_clean = cand.strip().lower()
        if cand_clean in clean_cols_map:
            return clean_cols_map[cand_clean]

    # Stage 2: Cleaned alphanumeric match
    for cand in candidate_names:
        cand_simp = _simplify(cand)
        if cand_simp and cand_simp in simplified_cols_map:
            return simplified_cols_map[cand_simp]

    # Stage 3: Token / Word Containment
    # If candidate is a multi-word or single strong word, check if it appears in column header
    for cand in candidate_names:
        cand_clean = cand.strip().lower()
        cand_tokens = [t for t in re.split(r'[^a-z0-9]+', cand_clean) if len(t) >= 2]
        if not cand_tokens:
            continue
        for col_clean, original in clean_cols_map.items():
            col_tokens = set(re.split(r'[^a-z0-9]+', col_clean))
            # If all candidate tokens are present in column tokens
            if all(t in col_tokens for t in cand_tokens):
                return original

    # Stage 4: Candidate substring in column name (e.g. 'action item' in 'what is the action item?')
    for cand in candidate_names:
        cand_clean = cand.strip().lower()
        if len(cand_clean) < 3:
            continue
        for col_clean, original in clean_cols_map.items():
            if len(col_clean) < 3:
                continue
            if cand_clean in col_clean:
                return original

    return None

def find_primary_text_column(raw_dict: Dict[str, Any], exclude_cols: List[str]) -> Optional[str]:
    """
    Intelligent fallback: When no known column header matched,
    finds the best textual content column from the row.
    """
    excluded_set = {str(c).strip().lower() for c in exclude_cols if c}
    candidates = []

    for k, v in raw_dict.items():
        if not k:
            continue
        k_clean = str(k).strip().lower()
        if k_clean in excluded_set or str(k).startswith('Unnamed:'):
            continue
        # Skip obvious non-content headers
        if any(skip in k_clean for skip in ['timestamp', 'date', 'time', 'id', 's.no', 'serial', 'index', 'email', 'status', 'state']):
            continue
        v_str = str(v).strip() if v is not None else ''
        if v_str and v_str.lower() not in ('nan', 'none', 'null', 'nat', '<na>'):
            candidates.append((k, len(v_str)))

    if candidates:
        # Sort by text length (descending) to get the most descriptive column
        candidates.sort(key=lambda x: x[1], reverse=True)
        return candidates[0][0]

    # Fallback to any non-empty column
    for k, v in raw_dict.items():
        if k and not str(k).startswith('Unnamed:'):
            v_str = str(v).strip() if v is not None else ''
            if v_str and v_str.lower() not in ('nan', 'none', 'null', 'nat', '<na>'):
                return k

    return None

def _clean_str(val: Any, default: str = '') -> str:
    if val is None:
        return default
    s = str(val).strip()
    if not s or s.lower() in ('nan', 'none', 'null', 'nat', '<na>'):
        return default
    return s

# Expanded Candidate Dictionaries for Real-World Spreadsheets & Google Forms
ACTION_ITEM_CANDIDATES = [
    'Action Item', 'Action Items', 'Item', 'Items', 'Task', 'Tasks', 'Task Name', 'Task Description',
    'Action', 'Actions', 'Title', 'Description', 'Work Item', 'Work Items', 'Name', 'Register',
    'Activity', 'Activities', 'Summary', 'Deliverable', 'Deliverables', 'Key Deliverables',
    'Milestone', 'Milestones', 'Goal', 'Goals', 'Initiative', 'Initiatives', 'Objective', 'Objectives',
    'Subject', 'Topic', 'Ticket', 'Tickets', 'Issue', 'Issues', 'Problem Statement', 'Scope',
    'Scope of Work', 'Requirement', 'Requirements', 'Feature', 'Features', 'Story', 'Card',
    'Todo', 'To Do', 'To-Do', 'Point', 'Points', 'Points to discuss', 'Discussion', 'Agenda',
    'Followup', 'Follow Up', 'Next Step', 'Next Steps', 'Work', 'Particulars', 'Content',
    'Details', 'What', 'Describe', 'Response', 'Input', 'Work to do'
]

COMPANY_CANDIDATES = [
    'Company', 'Company Name', 'Organization', 'Org', 'Entity', 'Business', 'Business Name',
    'Client', 'Customer', 'Project', 'Project Name', 'Stream', 'Track', 'Workstream', 'Pillar',
    'Portfolio', 'Account', 'Group', 'Division', 'Brand', 'Unit', 'Team', 'Dept', 'Department'
]

FUNCTION_CANDIDATES = [
    'Function', 'Functional Area', 'Category', 'Domain', 'Department', 'Dept', 'Team',
    'Area', 'Module', 'Pillar', 'Track', 'Stream', 'Discipline'
]

STATUS_CANDIDATES = [
    'Status', 'Current Status', 'State', 'Progress', 'Stage', 'Phase', 'Condition',
    'Workflow Status', 'Execution Status'
]

OWNER_CANDIDATES = [
    'Owner', 'Assignee', 'Lead', 'Assigned To', 'PIC', 'Responsible', 'Person',
    'Person Responsible', 'DRI', 'Who', 'Point of Contact', 'POC', 'Member', 'User',
    'Owner / Assignee', 'Assigned'
]

FOUNDER_DEP_CANDIDATES = [
    'Founder Dependency', 'Founder Dep', 'FounderDependency', 'Dependency', 'Dependencies',
    'Blocker', 'Blockers', 'Blocked By', 'Founder Review', 'Founder Status', 'Need CEO Input',
    'CEO Input', 'Urgency', 'Priority', 'Severity', 'Review'
]

COMMENTS_CANDIDATES = [
    'Comments', 'Comment', 'Notes', 'Note', 'Remarks', 'Remark', 'Details', 'Update',
    'Updates', 'Description', 'Context', 'Discussion', 'Feedback', 'Rationale', 'Reason'
]

DUE_DATE_CANDIDATES = [
    'Due', 'Due Date', 'Deadline', 'Target Date', 'ETA', 'Target', 'Timeline',
    'End Date', 'Finish Date', 'Completion Date', 'Date', 'Horizon'
]

DECISION_CANDIDATES = [
    'Decision', 'Decision Required', 'Decision Title', 'Title', 'Topic', 'Item',
    'Question', 'Questions', 'Task', 'Action', 'Name', 'Description', 'Subject',
    'Issue', 'Deliverable', 'Milestone', 'Summary', 'Problem', 'Query',
    'Discussion Point', 'Point', 'Need CEO Input', 'CEO Input', 'What'
]

PRIORITY_CANDIDATES = [
    'Focus Area', 'Focus', 'Item', 'Priority Item', 'Initiative', 'Objective',
    'Goal', 'Title', 'Task', 'Description', 'Action', 'Area', 'Pillar', 'Theme',
    'Strategic Focus', 'Key Result', 'Summary', 'Project', 'Milestone', 'Deliverable',
    'Work Item', 'Scope', 'Target'
]

def detect_sheet_type(sheet_name: str, rows: List[Dict[str, Any]]) -> str:
    """
    Intelligently determines whether a worksheet represents Decisions, Priorities, or Action Items.
    Checks sheet name first, then inspects header columns if the sheet name is generic.
    """
    name_lower = str(sheet_name).lower().strip()
    
    # 1. Sheet name keyword matching
    if any(k in name_lower for k in ['decision', 'decisions', 'dq', 'decision queue', 'approval', 'approvals', 'verdict', 'questions']):
        return 'decisions'
    if any(k in name_lower for k in ['priority', 'priorities', 'focus', 'strategic priorities', 'okr', 'okrs', 'roadmap', 'strategic']):
        return 'priorities'
    if any(k in name_lower for k in ['actions', 'action items', 'tasks', 'register', 'action', 'task', 'todo', 'work']):
        return 'actions'

    # 2. Column inspection fallback (for generic sheet names like Sheet1, data, export, etc.)
    if rows and isinstance(rows, list) and len(rows) > 0 and isinstance(rows[0], dict):
        cols = list(rows[0].keys())
        
        decision_col = find_best_column(cols, ['Decision', 'Decision Required', 'Decision Title', 'Topic', 'Question', 'Questions'])
        impact_col = find_best_column(cols, ['Impact', 'Impact if delayed', 'Risk'])
        focus_col = find_best_column(cols, ['Focus Area', 'Strategic Focus', 'Initiative', 'Objective', 'OKR', 'Why', 'Horizon'])
        item_col = find_best_column(cols, ['Action Item', 'Item', 'Task', 'Tasks', 'Action', 'Work Item', 'Activity', 'Deliverable'])

        if decision_col and (impact_col or not item_col):
            return 'decisions'
        if focus_col and not item_col:
            return 'priorities'

    # Default to action items (or company tab)
    return 'actions'

def normalize_action_item(raw_dict: Dict[str, Any], default_company: str = 'General') -> Optional[Dict[str, Any]]:
    """Normalizes a dictionary into a standard action item object with fallback content extraction."""
    if not raw_dict or not isinstance(raw_dict, dict):
        return None

    cols = list(raw_dict.keys())
    
    # 1. Match item / title
    item_col = find_best_column(cols, ACTION_ITEM_CANDIDATES)
    item_text = _clean_str(raw_dict.get(item_col)) if item_col else ''

    # 2. Fallback: If no recognized column matched, find primary text content
    if not item_text:
        company_col_tmp = find_best_column(cols, COMPANY_CANDIDATES)
        status_col_tmp = find_best_column(cols, STATUS_CANDIDATES)
        owner_col_tmp = find_best_column(cols, OWNER_CANDIDATES)
        fallback_col = find_primary_text_column(raw_dict, [company_col_tmp, status_col_tmp, owner_col_tmp])
        if fallback_col:
            item_text = _clean_str(raw_dict.get(fallback_col))
            if item_text:
                item_col = fallback_col

    if not item_text:
        return None

    # Match company
    company_col = find_best_column(cols, COMPANY_CANDIDATES)
    company = _clean_str(raw_dict.get(company_col), default_company) if company_col else default_company
    if not company:
        company = default_company

    # Match function / category
    func_col = find_best_column(cols, FUNCTION_CANDIDATES)
    func = _clean_str(raw_dict.get(func_col), 'General') if func_col else 'General'

    # Match status
    status_col = find_best_column(cols, STATUS_CANDIDATES)
    status = _clean_str(raw_dict.get(status_col), 'WIP') if status_col else 'WIP'

    # Match owner
    owner_col = find_best_column(cols, OWNER_CANDIDATES)
    owner = _clean_str(raw_dict.get(owner_col), '') if owner_col else ''

    # Match founder dependency / blockers
    founder_col = find_best_column(cols, FOUNDER_DEP_CANDIDATES)
    founder = _clean_str(raw_dict.get(founder_col), 'None') if founder_col else 'None'

    # Match comments / notes
    comments_col = find_best_column(cols, COMMENTS_CANDIDATES)
    comments = _clean_str(raw_dict.get(comments_col), '') if comments_col else ''

    # Match due date
    due_col = find_best_column(cols, DUE_DATE_CANDIDATES)
    due = _clean_str(raw_dict.get(due_col), '') if due_col else ''

    # Match ID or generate
    id_col = find_best_column(cols, ['ID', 'Task ID', 'Action ID', 'Key', 'Item ID'])
    item_id = _clean_str(raw_dict.get(id_col), '') if id_col else ''
    if not item_id:
        item_id = f"a_{uuid.uuid4().hex[:8]}"

    return {
        "id": item_id,
        "company": company,
        "function": func,
        "item": item_text,
        "status": status,
        "owner": owner,
        "founderDependency": founder,
        "due": due,
        "comments": comments
    }

def normalize_decision_item(raw_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Normalizes a raw dictionary into a standard decision object with fallback text extraction."""
    if not raw_dict or not isinstance(raw_dict, dict):
        return None

    cols = list(raw_dict.keys())
    decision_col = find_best_column(cols, DECISION_CANDIDATES)
    decision_text = _clean_str(raw_dict.get(decision_col)) if decision_col else ''

    # Fallback to primary text column
    if not decision_text:
        owner_tmp = find_best_column(cols, OWNER_CANDIDATES)
        status_tmp = find_best_column(cols, STATUS_CANDIDATES)
        fallback_col = find_primary_text_column(raw_dict, [owner_tmp, status_tmp])
        if fallback_col:
            decision_text = _clean_str(raw_dict.get(fallback_col))

    if not decision_text:
        return None

    owner_col = find_best_column(cols, OWNER_CANDIDATES)
    owner = _clean_str(raw_dict.get(owner_col), '') if owner_col else ''

    status_col = find_best_column(cols, STATUS_CANDIDATES)
    status = _clean_str(raw_dict.get(status_col), 'To Start') if status_col else 'To Start'

    founder_col = find_best_column(cols, FOUNDER_DEP_CANDIDATES)
    founder = _clean_str(raw_dict.get(founder_col), 'To Review') if founder_col else 'To Review'

    impact_col = find_best_column(cols, ['Impact', 'Impact if delayed', 'Risk', 'Consequence', 'Severity', 'Notes', 'Comments', 'Why', 'Remarks'])
    impact = _clean_str(raw_dict.get(impact_col), '') if impact_col else ''

    deadline_col = find_best_column(cols, DUE_DATE_CANDIDATES)
    deadline = _clean_str(raw_dict.get(deadline_col), '') if deadline_col else ''

    review_col = find_best_column(cols, ['Next Review', 'Review Date', 'Next Followup', 'Follow-up', 'Horizon'])
    next_review = _clean_str(raw_dict.get(review_col), '') if review_col else ''

    id_col = find_best_column(cols, ['ID', 'Decision ID'])
    item_id = _clean_str(raw_dict.get(id_col), '') if id_col else ''
    if not item_id:
        item_id = f"d_{uuid.uuid4().hex[:8]}"

    return {
        "id": item_id,
        "decision": decision_text,
        "owner": owner,
        "status": status,
        "founderDependency": founder,
        "impact": impact,
        "deadline": deadline,
        "nextReview": next_review
    }

def normalize_priority_item(raw_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Normalizes a raw dictionary into a strategic priority object with fallback text extraction."""
    if not raw_dict or not isinstance(raw_dict, dict):
        return None

    cols = list(raw_dict.keys())
    
    focus_col = find_best_column(cols, PRIORITY_CANDIDATES)
    focus = _clean_str(raw_dict.get(focus_col)) if focus_col else ''

    # Fallback to primary text column
    if not focus:
        fallback_col = find_primary_text_column(raw_dict, [])
        if fallback_col:
            focus = _clean_str(raw_dict.get(fallback_col))

    if not focus:
        return None

    group_col = find_best_column(cols, COMPANY_CANDIDATES + FUNCTION_CANDIDATES + ['Group', 'Pillar', 'Theme'])
    group = _clean_str(raw_dict.get(group_col), 'Strategic Focus') if group_col else 'Strategic Focus'

    priority_col = find_best_column(cols, ['Priority', 'Rank', 'Level', 'P#', 'Tier', 'Prio', 'Number', '#', 'Order'])
    priority = _clean_str(raw_dict.get(priority_col), '1.0') if priority_col else '1.0'

    why_col = find_best_column(cols, ['Why', 'Rationale', 'Strategic Value', 'Reason', 'Expected Impact', 'Impact', 'Description', 'Comments', 'Notes'])
    why = _clean_str(raw_dict.get(why_col), '') if why_col else ''

    horizon_col = find_best_column(cols, ['Horizon', 'Timeline', 'Target', 'Timeframe', 'Window', 'Deadline', 'Due Date', 'Due'])
    horizon = _clean_str(raw_dict.get(horizon_col), 'Next 30 days') if horizon_col else 'Next 30 days'

    id_col = find_best_column(cols, ['ID', 'Priority ID'])
    item_id = _clean_str(raw_dict.get(id_col), '') if id_col else ''
    if not item_id:
        item_id = f"p_{uuid.uuid4().hex[:8]}"

    return {
        "id": item_id,
        "priority": priority,
        "group": group,
        "focusArea": focus,
        "why": why,
        "horizon": horizon
    }

def sync_companies_and_statuses(state: Dict[str, Any]) -> Dict[str, Any]:
    """Ensures state.settings contains all companies and statuses present in state.actions."""
    settings = state.setdefault('settings', {})
    companies = settings.setdefault('companies', [])
    company_colors = settings.setdefault('companyColors', {})
    statuses = settings.setdefault('statuses', DEFAULT_STATUSES.copy())
    status_buckets = settings.setdefault('statusBuckets', STATUS_BUCKET_MAP.copy())

    existing_company_ids = {str(c['id']).lower(): c for c in companies if isinstance(c, dict) and 'id' in c}
    existing_status_set = set(statuses)

    for action in state.get('actions', []):
        comp_name = str(action.get('company', '')).strip()
        if comp_name and comp_name.lower() not in existing_company_ids:
            new_comp = {'id': comp_name, 'name': comp_name}
            companies.append(new_comp)
            existing_company_ids[comp_name.lower()] = new_comp
            if comp_name not in company_colors:
                color_idx = len(companies) % len(PALETTE)
                company_colors[comp_name] = PALETTE[color_idx]

        st_name = str(action.get('status', '')).strip()
        if st_name and st_name not in existing_status_set:
            statuses.append(st_name)
            existing_status_set.add(st_name)
            if st_name not in status_buckets:
                status_buckets[st_name] = guess_status_bucket(st_name)

    return state
