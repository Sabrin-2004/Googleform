# CEO Portfolio Command Center — Backend & Multi-Sheet Pipeline

A production-ready executive dashboard and backend architecture designed for multi-company portfolio tracking, strategic decisions, priorities, and real-time synchronization with **Google Sheets (including 3+ sheets/tabs)** and **Multi-File CSV / Excel workbooks**.

---

## 🌟 Key Capabilities

1. **Multi-Sheet Google Sheets Sync (3+ Sheets/Tabs)**:
   - Synchronizes directly via Google Cloud Service Account (`credentials.json`) or Public/Published sheet link.
   - Automatically parses multiple tabs/sheets:
     - **Domain-based Tabs**: `Actions`, `Decisions`, `Priorities`.
     - **Company-based Tabs**: `Aarna`, `Abhee`, `Pranik`, `Miraee`, `RedT`, `Casa Monde`.
2. **Multi-File CSV & Excel Uploader**:
   - Drag-and-drop 3+ `.csv` files simultaneously or upload a multi-tab `.xlsx` workbook.
   - Automatic column fuzzy matching (matches `Item`, `Task`, `Action Item`, `Status`, `Owner`, `Founder Dependency`, `Comments`, `Decision`, `Impact`, `Horizon`, `Why`, etc.).
3. **Robust Backend API (`app.py`)**:
   - High-speed REST API for complete CRUD operations on actions, decisions, priorities, and settings.
   - Atomic disk writes to `data/dashboard_data.json` with automated timestamped backup rotation.
4. **Universal Frontend (`CEO_Dashboard.html`)**:
   - Works seamlessly when connected to the backend server at `http://localhost:5000`.
   - Automatically falls back to browser `localStorage` when opened as a static local file without a server.
   - Live status indicator (🟢 Backend Live / 🟡 Standalone, ☁️ Google Sheets Sync badge).
   - Instant export to multi-tab Excel (`.xlsx`), CSV archive (`.zip`), or JSON.

---

## 📁 Project Structure

```
gfd/
├── app.py                      # FastAPI REST API server & router
├── CEO_Dashboard.html          # Executive frontend command center
├── requirements.txt            # Python dependencies (FastAPI, uvicorn, pandas, openpyxl, etc.)
├── .env.example                # Environment variable template
├── .env                        # Local environment configuration
├── run.bat                     # 1-click startup script for Windows Command Prompt
├── run.ps1                     # 1-click startup script for Windows PowerShell
├── services/
│   ├── __init__.py
│   ├── storage.py              # Persistent storage & backup engine (JSON database)
│   ├── sheets_sync.py          # Google Sheets API client & 3+ tab parser
│   ├── data_validator.py       # Column normalizer & schema validator
│   └── importer.py             # Multi-CSV and Excel parser & exporter
├── data/
│   ├── dashboard_data.json     # Primary active database
│   └── backups/                # Automated historical backups
├── sample_data/
│   ├── actions.csv             # Sample Action items CSV
│   ├── decisions.csv           # Sample Decisions CSV
│   ├── priorities.csv          # Sample Strategic Priorities CSV
│   ├── portfolio_multi_sheet.xlsx # Sample 4-tab Excel workbook
│   └── generate_portfolio_excel.py # Multi-tab Excel generator script
└── tests/
    └── test_backend.py         # Full backend test suite
```

---

## 🚀 Quick Start (Running Locally)

### Option A: 1-Click Launch on Windows
Double-click `run.bat` or run in PowerShell:
```powershell
.\run.ps1
```

### Option B: Manual Command Line
```powershell
# 1. Install dependencies
python -m pip install -r requirements.txt

# 2. Start the server
python app.py
```
Open your browser to: **`http://localhost:5000`**

---

## 📊 Google Sheets Setup Guide (Step-by-Step)

### Step 12: Create your Google Sheet
1. Open [sheets.google.com](https://sheets.google.com) and click **"+" (Blank Spreadsheet)**.
2. Name your spreadsheet (e.g. `Portfolio Master Tracker`).

### Step 13: Share with Service Account
1. From Google Cloud Console, create a **Service Account** and download its JSON key file as `credentials.json`.
2. Place `credentials.json` in the root folder of this project (`c:\Users\Ssabrin\Desktop\gfd\credentials.json`).
3. Open `credentials.json` and copy the `client_email` address (e.g. `robot-portfolio@your-project.iam.gserviceaccount.com`).
4. In your Google Sheet, click the top-right **Share** button, paste the `client_email`, give it **Viewer** or **Editor** permissions, and click **Share**.

### Step 14: Get your Spreadsheet ID
1. Look at the URL in your browser:
   ```
   https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/edit#gid=0
   ```
2. The ID is the long string between `/d/` and `/edit` (e.g. `1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`).

### Step 17: Configure Environment Variables
You can either enter the ID directly in the Dashboard UI (under the **Data** tab) or set it in your `.env` / terminal:

**Windows PowerShell:**
```powershell
$env:GOOGLE_SHEET_ID="1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"
$env:GOOGLE_CREDENTIALS_FILE="credentials.json"
```

**Windows Command Prompt (cmd):**
```cmd
set GOOGLE_SHEET_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
set GOOGLE_CREDENTIALS_FILE=credentials.json
```

Or simply add it to `.env`:
```ini
GOOGLE_SHEET_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
GOOGLE_CREDENTIALS_FILE=credentials.json
```

---

## 📑 Multi-Sheet Formats Supported (3+ Sheets/Tabs)

The backend auto-detects both multi-sheet architectures:

### Model 1: Domain Tabs (Recommended for Master Review)
Create 3+ tabs in your Google Sheet or Excel workbook:
- **Tab 1 (`Actions`)**: Columns: `Company`, `Function`, `Action Item`, `Status`, `Owner`, `Founder Dependency`, `Comments`
- **Tab 2 (`Decisions`)**: Columns: `Decision`, `Owner`, `Status`, `Impact if delayed`, `Deadline`
- **Tab 3 (`Priorities`)**: Columns: `Priority`, `Group`, `Focus Area`, `Why`, `Horizon`

### Model 2: Company Tabs (Recommended for Multi-Venture Groups)
Create separate tabs for each company:
- **Tab 1 (`Aarna`)**: Action items for Aarna.
- **Tab 2 (`Pranik`)**: Action items for Pranik.
- **Tab 3 (`Abhee`)**: Action items for Abhee.
- **Tab 4 (`Decisions`)**: Group decisions queue.

---

## 🧪 Testing Backend & Uploads

Run the automated test suite anytime:
```powershell
python -m unittest discover -s tests
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves dashboard frontend |
| `GET` | `/api/health` | Backend status & credentials check |
| `GET` | `/api/data` | Returns complete dashboard state |
| `POST`| `/api/save` | Saves entire state |
| `POST`| `/api/actions` | Create a new action item |
| `PUT` | `/api/actions/<id>` | Update action item |
| `DELETE`| `/api/actions/<id>` | Delete action item |
| `POST`| `/api/decisions` | Create decision |
| `PUT` | `/api/decisions/<id>` | Update decision |
| `DELETE`| `/api/decisions/<id>` | Delete decision |
| `POST`| `/api/priorities` | Create priority |
| `PUT` | `/api/priorities/<id>` | Update priority |
| `DELETE`| `/api/priorities/<id>` | Delete priority |
| `POST`| `/api/sync/google-sheets` | Trigger Google Sheets sync |
| `POST`| `/api/upload` | Multi-file CSV / Excel upload |
| `GET` | `/api/export/excel` | Download multi-tab `.xlsx` |
| `GET` | `/api/export/csv` | Download `.zip` of CSVs |
