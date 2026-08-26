Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting CEO Portfolio Command Center Backend (PowerShell)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

$env:GOOGLE_SHEET_ID = "1fpSVA3Agdu1IinkUEbwBmPNLHRV3KLrCQckeUUEXAsI"
$env:GOOGLE_CREDENTIALS_FILE = "credentials.json"

python -m pip install -r requirements.txt
python app.py
