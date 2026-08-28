# Executive Portfolio Command Center

A secure, multi-tier executive dashboard with Supabase role-based access control (Admin vs. Viewer), Google Sheets synchronization, Excel/CSV ingestion pipeline, and real-time portfolio management.

---

## 🌟 Architecture & Access Control

| Role | Access Permissions | Navigation |
|---|---|---|
| **Admin** | Full read/write access, add/edit/delete tasks & decisions, Google Sheets sync, user management, and appearance settings | Overview, Register, Decisions, Priorities, Data, Webhooks, Settings, Admin Panel |
| **Viewer (User)** | Read-only access to dashboard data. Write/edit controls, sync buttons, and settings are hidden | Overview, Register, Decisions, Priorities (restricted tabs hidden) |

---

## 🚀 Quick Start (Local Development)

### 1. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```bash
cp .env.example .env
```
Inside `.env`:
```ini
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-secret-key
GOOGLE_SHEET_ID=1alUCBe5MRRZYp6hAcKuLsf0YAEhNx8h-s7UQOizgTfg
PORT=5000
HOST=0.0.0.0
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Start the Application
```bash
python app.py
```
Open **[http://localhost:5000/login](http://localhost:5000/login)** in your browser.

---

## 🐳 Docker Deployment

### Using Docker Compose
```bash
docker compose up -d --build
```

### Using Plain Docker
```bash
docker build -t command-center .
docker run -d -p 5000:5000 --env-file .env --name command-center command-center
```

---

## ☁️ Cloud Deployment Options

### Option 1: Render (Recommended)
1. Push your code to GitHub / GitLab.
2. Go to [render.com](https://render.com) and click **New > Web Service**.
3. Connect your repository. Render will automatically detect `render.yaml` or you can set:
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`
4. Under **Environment Variables**, add:
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
   - `GOOGLE_SHEET_ID`: (Optional) Your Google Sheet ID
   - `GOOGLE_CREDENTIALS_JSON`: (Optional) Paste raw JSON from service account key file

### Option 2: Railway
1. Go to [railway.app](https://railway.app) and select **New Project > Deploy from GitHub repo**.
2. Add your environment variables in the **Variables** tab (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
3. Railway automatically uses the `Procfile` / `Dockerfile` to deploy.

### Option 3: Heroku / Dokku / Cloud VM
1. The repository includes a production `Procfile`:
   ```
   web: uvicorn app:app --host 0.0.0.0 --port ${PORT:-5000}
   ```
2. Configure config vars via CLI:
   ```bash
   heroku config:set SUPABASE_URL=https://your-id.supabase.co SUPABASE_SERVICE_ROLE_KEY=your-key
   ```

---

## 🔑 Initial Admin Setup (Supabase)

To create the first Admin user:
1. Go to **Supabase Dashboard > Authentication > Users > Add user**.
2. In Supabase **SQL Editor**, run:
   ```sql
   UPDATE auth.users
   SET raw_user_meta_data = '{"role": "admin", "name": "Executive Admin"}'::jsonb
   WHERE email = 'your-admin-email@example.com';
   ```
3. Log in at `/login` and navigate to `/admin` to invite and create Viewer accounts directly from the UI.

---

## 📁 Repository Structure

```
├── app.py                  # FastAPI server & route handlers
├── requirements.txt        # Python dependencies
├── Dockerfile              # Container definition
├── docker-compose.yml      # Multi-container / local orchestration
├── Procfile                # Heroku / Railway / Render process runner
├── render.yaml             # Render infrastructure-as-code
├── .env.example            # Environment variables template
├── services/
│   ├── auth_service.py     # Supabase Auth integration & Admin API
│   ├── sheets_sync.py      # Google Sheets multi-tab sync
│   ├── storage.py          # State persistence & JSON storage
│   ├── importer.py         # CSV / Excel multi-file parser
│   └── webhook_service.py  # Inbound webhook ingestion
├── static/
│   ├── index.html          # Main executive dashboard
│   ├── login.html          # Glassmorphism authentication UI
│   ├── admin-panel.html    # User management & role assignment UI
│   ├── css/
│   │   ├── styles.css      # Dashboard styling
│   │   └── login.css       # Auth & admin panel design system
│   └── js/
│       └── app.js          # Core frontend application & role logic
└── data/                   # Persistent storage directory
```
