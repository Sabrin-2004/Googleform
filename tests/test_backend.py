"""
Unit & Integration Test Suite for CEO Dashboard Backend (FastAPI)
"""
import os
import io
import json
import unittest
import tempfile
import shutil
from unittest.mock import patch

# Set this before importing the app/storage modules so tests never use dashboard data.
TEST_DATA_DIR = tempfile.mkdtemp(prefix="dashboard-tests-")
os.environ["DASHBOARD_DATA_DIR"] = TEST_DATA_DIR

from fastapi.testclient import TestClient
from app import app
from services.storage import get_state, save_state, get_initial_seed_data
from services.importer import parse_csv_file, parse_excel_file, export_state_to_excel, export_state_to_csv_zip
from services.sheets_sync import process_multi_sheet_data, extract_sheet_id
from services.data_validator import detect_sheet_type

class TestCEODashboardBackend(unittest.TestCase):
    def setUp(self):
        self.require_auth = patch("app._require_auth", return_value={"role": "admin", "user_id": "test-admin"})
        self.require_admin = patch("app._require_admin", return_value={"role": "admin", "user_id": "test-admin"})
        self.require_auth.start()
        self.require_admin.start()
        self.client = TestClient(app)
        save_state(get_initial_seed_data())

    def tearDown(self):
        self.require_admin.stop()
        self.require_auth.stop()

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(TEST_DATA_DIR, ignore_errors=True)

    def test_serve_frontend(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('text/html', response.headers.get('content-type', ''))
        self.assertIn('Portfolio Command Center', response.text)

    def test_static_assets(self):
        # Test CSS static asset
        res_css = self.client.get('/static/css/styles.css')
        self.assertEqual(res_css.status_code, 200)
        self.assertIn('text/css', res_css.headers.get('content-type', ''))
        self.assertIn('--bg', res_css.text)

        # Test JS static asset
        res_js = self.client.get('/static/js/app.js')
        self.assertEqual(res_js.status_code, 200)
        self.assertIn('loadState', res_js.text)

    def test_health_endpoint(self):
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get('status'), 'healthy')

        # Detailed status with counts is on /api/status
        res_status = self.client.get('/api/status')
        self.assertEqual(res_status.status_code, 200)
        status_data = res_status.json()
        self.assertEqual(status_data.get('status'), 'healthy')
        self.assertIn('totalActions', status_data)
        self.assertIn('totalDecisions', status_data)
        self.assertIn('totalPriorities', status_data)

    def test_get_data_endpoint(self):
        response = self.client.get('/api/data')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('actions', data)
        self.assertIn('decisions', data)
        self.assertIn('priorities', data)
        self.assertIn('settings', data)

    def test_action_crud(self):
        # 1. Create action
        new_act = {
            "company": "Pranik",
            "function": "AI Research",
            "item": "Test Automated CI Action Item",
            "status": "WIP",
            "owner": "UnitTester"
        }
        res_post = self.client.post('/api/actions', json=new_act)
        self.assertEqual(res_post.status_code, 200)
        created = res_post.json().get('action')
        act_id = created['id']
        self.assertEqual(created['item'], "Test Automated CI Action Item")

        # 2. Update action
        res_put = self.client.put(f'/api/actions/{act_id}', json={"status": "Done", "comments": "Completed successfully"})
        self.assertEqual(res_put.status_code, 200)

        # Verify update
        state = get_state()
        act = next((a for a in state['actions'] if str(a['id']) == str(act_id)), None)
        self.assertIsNotNone(act)
        self.assertEqual(act['status'], "Done")

        # 3. Delete action
        res_del = self.client.delete(f'/api/actions/{act_id}')
        self.assertEqual(res_del.status_code, 200)
        state_after = get_state()
        self.assertFalse(any(str(a['id']) == str(act_id) for a in state_after['actions']))

    def test_decision_crud(self):
        # 1. Create decision
        new_dec = {
            "decision": "Test Decision for Strategic Roadmap",
            "owner": "CEO",
            "status": "WIP",
            "impact": "High test impact"
        }
        res_post = self.client.post('/api/decisions', json=new_dec)
        self.assertEqual(res_post.status_code, 200)
        created = res_post.json().get('decision')
        dec_id = created['id']

        # 2. Update decision
        res_put = self.client.put(f'/api/decisions/{dec_id}', json={"status": "Done"})
        self.assertEqual(res_put.status_code, 200)

        # 3. Delete decision
        res_del = self.client.delete(f'/api/decisions/{dec_id}')
        self.assertEqual(res_del.status_code, 200)
        state_after = get_state()
        self.assertFalse(any(str(d['id']) == str(dec_id) for d in state_after.get('decisions', [])))

    def test_priority_crud(self):
        # 1. Create priority
        new_prio = {
            "priority": "1.0",
            "group": "Aarna GTM",
            "focusArea": "Test Priority Area",
            "why": "Testing priority engine",
            "horizon": "Next 15 days"
        }
        res_post = self.client.post('/api/priorities', json=new_prio)
        self.assertEqual(res_post.status_code, 200)
        created = res_post.json().get('priority')
        prio_id = created['id']

        # 2. Update priority
        res_put = self.client.put(f'/api/priorities/{prio_id}', json={"horizon": "Next 30 days"})
        self.assertEqual(res_put.status_code, 200)

        # 3. Delete priority
        res_del = self.client.delete(f'/api/priorities/{prio_id}')
        self.assertEqual(res_del.status_code, 200)
        state_after = get_state()
        self.assertFalse(any(str(p['id']) == str(prio_id) for p in state_after.get('priorities', [])))

    def test_settings_update(self):
        res = self.client.post('/api/settings', json={"pin": "1234"})
        self.assertEqual(res.status_code, 200)
        state = get_state()
        self.assertEqual(state.get('settings', {}).get('pin'), "1234")
        # Reset pin
        self.client.post('/api/settings', json={"pin": ""})

    def test_detect_sheet_type(self):
        # Decisions by name
        self.assertEqual(detect_sheet_type('Decisions', []), 'decisions')
        self.assertEqual(detect_sheet_type('DQ', []), 'decisions')
        # Priorities by name
        self.assertEqual(detect_sheet_type('Strategic Priorities', []), 'priorities')
        # Decisions by column content on generic sheet name
        sample_dec_rows = [{"Decision": "Expand EMEA", "Impact if delayed": "High"}]
        self.assertEqual(detect_sheet_type('Sheet1', sample_dec_rows), 'decisions')
        # Priorities by column content on generic sheet name
        sample_prio_rows = [{"Focus Area": "Scale SLM", "Horizon": "30 days", "Why": "Growth"}]
        self.assertEqual(detect_sheet_type('data', sample_prio_rows), 'priorities')
        # Actions by default
        sample_act_rows = [{"Item": "Task Alpha", "Owner": "Alice", "Status": "WIP"}]
        self.assertEqual(detect_sheet_type('Sheet1', sample_act_rows), 'actions')

    def test_extract_sheet_id(self):
        url1 = "https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/edit#gid=0"
        self.assertEqual(extract_sheet_id(url1), "1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890")
        raw_id = "1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"
        self.assertEqual(extract_sheet_id(raw_id), "1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890")

    def test_multi_sheet_excel_upload(self):
        excel_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'sample_data', 'portfolio_multi_sheet.xlsx')
        if os.path.exists(excel_path):
            with open(excel_path, 'rb') as f:
                files = [('files', ('portfolio_multi_sheet.xlsx', f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))]
                res = self.client.post('/api/upload', files=files, data={'mode': 'merge', 'target': 'all'})
                self.assertEqual(res.status_code, 200)
                json_res = res.json()
                self.assertTrue(json_res.get('success'))
                self.assertGreaterEqual(json_res['counts']['sheets_processed'], 3)
                self.assertGreaterEqual(json_res['counts']['actions'], 3)
                self.assertGreaterEqual(json_res['counts']['decisions'], 2)
                self.assertGreaterEqual(json_res['counts']['priorities'], 2)

    def test_simultaneous_three_csv_uploads(self):
        f1 = io.BytesIO(b"Item,Company,Status,Owner\nTask Alpha,Pranik,WIP,Alice\nTask Beta,Aarna,Done,Bob\n")
        f2 = io.BytesIO(b"Decision,Owner,Status,Impact\nExpand to EMEA,CEO,To Start,High market share\n")
        f3 = io.BytesIO(b"Priority,Group,Focus Area,Why,Horizon\n1.0,Pranik,P4P Platform,GTM scale,30 days\n")
        
        files = [
            ('files', ('actions.csv', f1, 'text/csv')),
            ('files', ('decisions.csv', f2, 'text/csv')),
            ('files', ('priorities.csv', f3, 'text/csv')),
        ]
        res = self.client.post('/api/upload', files=files, data={'mode': 'merge', 'target': 'all'})
        self.assertEqual(res.status_code, 200)
        json_res = res.json()
        self.assertTrue(json_res.get('success'))
        self.assertEqual(json_res['counts']['sheets_processed'], 3)
        self.assertGreaterEqual(json_res['counts']['actions'], 2)
        self.assertGreaterEqual(json_res['counts']['decisions'], 1)
        self.assertGreaterEqual(json_res['counts']['priorities'], 1)

    def test_upload_targeted_decisions(self):
        csv_content = b"Decision,Owner,Status,Impact\nTest New Decision Via Upload,Alice,WIP,Risk if delayed\n"
        files = [('files', ('general_sheet.csv', io.BytesIO(csv_content), 'text/csv'))]
        res = self.client.post('/api/upload', files=files, data={'mode': 'merge', 'target': 'decisions'})
        self.assertEqual(res.status_code, 200)
        json_res = res.json()
        self.assertEqual(json_res['counts']['decisions'], 1)
        self.assertEqual(json_res['target'], 'decisions')

    def test_targeted_sync_register(self):
        state = get_state()
        mock_sheets = {
            "Sheet1": [
                {"Item": "Register Task 1", "Company": "Aarna", "Status": "WIP", "Owner": "Alice"},
                {"Item": "Register Task 2", "Company": "Pranik", "Status": "Done", "Owner": "Bob"}
            ]
        }
        updated_state, counts = process_multi_sheet_data(mock_sheets, state, mode="merge", target="register")
        self.assertEqual(counts["actions"], 2)
        self.assertEqual(counts["decisions"], 0)
        self.assertEqual(counts["priorities"], 0)
        task_items = [a["item"] for a in updated_state["actions"]]
        self.assertIn("Register Task 1", task_items)
        self.assertIn("Register Task 2", task_items)

    def test_targeted_sync_decisions(self):
        state = get_state()
        mock_sheets = {
            "CustomTab": [
                {"Decision": "Custom Decision 1", "Owner": "CEO", "Status": "To Start", "Impact": "High Opportunity"},
                {"Decision": "Custom Decision 2", "Owner": "CTO", "Status": "Done", "Impact": "Architecture lock"}
            ]
        }
        updated_state, counts = process_multi_sheet_data(mock_sheets, state, mode="merge", target="decisions")
        self.assertEqual(counts["actions"], 0)
        self.assertEqual(counts["decisions"], 2)
        self.assertEqual(counts["priorities"], 0)
        dec_titles = [d["decision"] for d in updated_state["decisions"]]
        self.assertIn("Custom Decision 1", dec_titles)
        self.assertIn("Custom Decision 2", dec_titles)

    def test_targeted_sync_priorities(self):
        state = get_state()
        mock_sheets = {
            "FocusTab": [
                {"Focus Area": "Scale SLM Engine", "Group": "AI Core", "Priority": "1.0", "Why": "Market Leadership", "Horizon": "Next 30 days"}
            ]
        }
        updated_state, counts = process_multi_sheet_data(mock_sheets, state, mode="merge", target="priorities")
        self.assertEqual(counts["actions"], 0)
        self.assertEqual(counts["decisions"], 0)
        self.assertEqual(counts["priorities"], 1)
        prio_focuses = [p["focusArea"] for p in updated_state["priorities"]]
        self.assertIn("Scale SLM Engine", prio_focuses)

    def test_targeted_replace_mode(self):
        state = get_state()
        orig_dec_count = len(state.get("decisions", []))
        orig_act_count = len(state.get("actions", []))
        
        # Replace only priorities
        mock_sheets = {
            "PrioritiesSheet": [
                {"Focus Area": "Brand New Solo Priority", "Group": "Aarna", "Priority": "1.0"}
            ]
        }
        updated_state, counts = process_multi_sheet_data(mock_sheets, state, mode="replace", target="priorities")
        self.assertEqual(len(updated_state["priorities"]), 1)
        self.assertEqual(updated_state["priorities"][0]["focusArea"], "Brand New Solo Priority")
        # Ensure decisions and actions were preserved
        self.assertEqual(len(updated_state["decisions"]), orig_dec_count)
        self.assertEqual(len(updated_state["actions"]), orig_act_count)

    def test_sync_google_sheets_endpoint_validation(self):
        # Empty sheet ID test
        res = self.client.post('/api/sync/google-sheets', json={"sheetId": "", "target": "register"})
        self.assertEqual(res.status_code, 400)
        self.assertIn("No Google Sheet ID provided", res.json()["detail"])

    def test_threshold_exclusion_quality_score(self):
        # Test low-quality row rejection
        csv_content = (
            "Item,Company,Status,Owner\n"
            "Valid Comprehensive Task Description,Aarna,WIP,Alice\n"
            "na,Aarna,WIP,Bob\n"  # quality below threshold
            "test,,,\n"           # empty/invalid
        ).encode('utf-8')
        files = [('files', ('tasks.csv', io.BytesIO(csv_content), 'text/csv'))]
        res = self.client.post('/api/upload', files=files, data={'mode': 'append', 'target': 'register', 'min_quality_score': '0.5'})
        self.assertEqual(res.status_code, 200)
        metrics = res.json().get('counts', {})
        self.assertEqual(metrics.get('appended'), 1)
        self.assertGreaterEqual(metrics.get('skipped'), 2)

    def test_threshold_exclusion_status(self):
        # Test status exclusion (e.g. Archived, Deleted)
        csv_content = (
            "Item,Company,Status,Owner\n"
            "Active Marketing Initiative,Pranik,WIP,Karthik\n"
            "Old Deprecated Feature Work,Pranik,Archived,Karthik\n"
            "Cancelled Partnership Discussion,Pranik,Cancelled,Saurav\n"
        ).encode('utf-8')
        files = [('files', ('tasks_status.csv', io.BytesIO(csv_content), 'text/csv'))]
        res = self.client.post('/api/upload', files=files, data={
            'mode': 'append',
            'target': 'register',
            'excluded_statuses': 'archived,cancelled,deleted'
        })
        self.assertEqual(res.status_code, 200)
        metrics = res.json().get('counts', {})
        self.assertEqual(metrics.get('appended'), 1)
        self.assertEqual(metrics.get('skipped'), 2)

    def test_threshold_exclusion_date_range(self):
        # Test date range threshold
        csv_content = (
            "Item,Company,Status,Owner,Due\n"
            "Current Q3 Target Item,Aarna,WIP,Alice,2026-08-15\n"
            "Past Out-of-Range Task,Aarna,Done,Bob,2025-01-10\n"
            "Far Future Out-of-Range Task,Aarna,Future,Charlie,2028-12-31\n"
        ).encode('utf-8')
        files = [('files', ('tasks_date.csv', io.BytesIO(csv_content), 'text/csv'))]
        res = self.client.post('/api/upload', files=files, data={
            'mode': 'append',
            'target': 'register',
            'date_start': '2026-01-01',
            'date_end': '2026-12-31'
        })
        self.assertEqual(res.status_code, 200)
        metrics = res.json().get('counts', {})
        self.assertEqual(metrics.get('appended'), 1)
        self.assertEqual(metrics.get('skipped'), 2)

    def test_composite_key_merge_incoming_wins(self):
        # Set up an initial state with a known action item
        init_act = {
            "company": "TestVentures",
            "function": "Engineering",
            "item": "Architecture Baseline Lock",
            "status": "WIP",
            "owner": "Developer Alpha"
        }
        self.client.post('/api/actions', json=init_act)

        # Upload an update with matching (company, item) composite key
        update_csv = (
            "Company,Function,Item,Status,Owner\n"
            "TestVentures,Engineering,Architecture Baseline Lock,Done,Developer Beta\n"
        ).encode('utf-8')
        files = [('files', ('update.csv', io.BytesIO(update_csv), 'text/csv'))]
        res = self.client.post('/api/upload', files=files, data={'mode': 'merge', 'target': 'register', 'conflict_strategy': 'incoming_wins'})
        self.assertEqual(res.status_code, 200)
        metrics = res.json().get('counts', {})
        self.assertEqual(metrics.get('updated'), 1)

        # Verify updated in state
        state = get_state()
        act = next((a for a in state['actions'] if a.get('company') == 'TestVentures' and a.get('item') == 'Architecture Baseline Lock'), None)
        self.assertIsNotNone(act)
        self.assertEqual(act['status'], 'Done')
        self.assertEqual(act['owner'], 'Developer Beta')

    def test_composite_key_merge_existing_wins(self):
        init_act = {
            "company": "LockVentures",
            "function": "Operations",
            "item": "Compliance Audit Signoff",
            "status": "In Review",
            "owner": "Legal Lead"
        }
        self.client.post('/api/actions', json=init_act)

        # Incoming update with conflicting status and owner
        update_csv = (
            "Company,Function,Item,Status,Owner,Comments\n"
            "LockVentures,Operations,Compliance Audit Signoff,Done,New Owner,Added Remarks\n"
        ).encode('utf-8')
        files = [('files', ('update_existing_wins.csv', io.BytesIO(update_csv), 'text/csv'))]
        res = self.client.post('/api/upload', files=files, data={'mode': 'merge', 'target': 'register', 'conflict_strategy': 'existing_wins'})
        self.assertEqual(res.status_code, 200)

        # Existing values should be preserved, empty comments should be filled
        state = get_state()
        act = next((a for a in state['actions'] if a.get('company') == 'LockVentures' and a.get('item') == 'Compliance Audit Signoff'), None)
        self.assertIsNotNone(act)
        self.assertEqual(act['status'], 'In Review')
        self.assertEqual(act['owner'], 'Legal Lead')
        self.assertEqual(act['comments'], 'Added Remarks')

    def test_conflict_flagging_manual_review_and_resolution(self):
        init_dec = {
            "decision": "Global Pricing Matrix Lock",
            "owner": "CFO",
            "status": "To Start",
            "impact": "Low"
        }
        res_dec = self.client.post('/api/decisions', json=init_dec)
        dec_id = res_dec.json()['decision']['id']

        # Import conflicting update with conflict_strategy='manual_review'
        update_csv = (
            "Decision,Owner,Status,Impact\n"
            "Global Pricing Matrix Lock,CEO,Done,Critical Market Impact\n"
        ).encode('utf-8')
        files = [('files', ('decisions_conflict.csv', io.BytesIO(update_csv), 'text/csv'))]
        res = self.client.post('/api/upload', files=files, data={'mode': 'merge', 'target': 'decisions', 'conflict_strategy': 'manual_review'})
        self.assertEqual(res.status_code, 200)
        res_json = res.json()
        self.assertEqual(res_json['counts']['flagged'], 1)
        self.assertEqual(len(res_json['conflicts']), 1)
        self.assertEqual(res_json['conflicts'][0]['id'], dec_id)

        # Now resolve the conflict via /api/conflicts/resolve
        resolve_payload = {
            "resolutions": [
                {
                    "id": dec_id,
                    "type": "decision",
                    "resolution": "use_incoming",
                    "incoming": {
                        "owner": "CEO",
                        "status": "Done",
                        "impact": "Critical Market Impact"
                    }
                }
            ]
        }
        res_res = self.client.post('/api/conflicts/resolve', json=resolve_payload)
        self.assertEqual(res_res.status_code, 200)
        self.assertEqual(res_res.json()['resolvedCount'], 1)

        # Verify state reflects resolution
        state = get_state()
        dec = next((d for d in state['decisions'] if d['id'] == dec_id), None)
        self.assertIsNotNone(dec)
        self.assertEqual(dec['owner'], 'CEO')
        self.assertEqual(dec['status'], 'Done')

    def test_destination_create_new_company(self):
        csv_content = (
            "Item,Function,Status,Owner\n"
            "Initial Launch Strategy,Marketing,WIP,Kiran\n"
            "Build V1 Prototype,Product,Done,Bhuvan\n"
        ).encode('utf-8')
        files = [('files', ('new_venture.csv', io.BytesIO(csv_content), 'text/csv'))]
        res = self.client.post('/api/upload', files=files, data={
            'mode': 'merge',
            'destination': 'create_new',
            'new_company_name': 'QuantumX'
        })
        self.assertEqual(res.status_code, 200)
        state = get_state()
        # Verify company registered in settings
        companies = [c['name'] for c in state.get('settings', {}).get('companies', [])]
        self.assertIn('QuantumX', companies)
        # Verify actions associated with new company
        qx_actions = [a for a in state['actions'] if a.get('company') == 'QuantumX']
        self.assertEqual(len(qx_actions), 2)

    def test_malformed_and_alternative_encoding_csvs(self):
        # CSV with semicolon delimiter and Latin-1 accented characters
        content_latin1 = "Item;Company;Status;Owner\nProjet Éxécutif;Aarna;WIP;André\n".encode('latin-1')
        files = [('files', ('latin1_semi.csv', io.BytesIO(content_latin1), 'text/csv'))]
        res = self.client.post('/api/upload', files=files, data={'mode': 'append', 'target': 'register'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['counts']['appended'], 1)

    def test_export_endpoints(self):
        res_excel = self.client.get('/api/export/excel')
        self.assertEqual(res_excel.status_code, 200)
        self.assertIn('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', res_excel.headers.get('content-type', ''))

        res_csv = self.client.get('/api/export/csv')
        self.assertEqual(res_csv.status_code, 200)
        self.assertIn('application/zip', res_csv.headers.get('content-type', ''))

if __name__ == '__main__':
    unittest.main()
