@echo off
echo ========================================================
echo Starting CEO Portfolio Command Center Backend
echo ========================================================
set GOOGLE_SHEET_ID=1fpSVA3Agdu1IinkUEbwBmPNLHRV3KLrCQckeUUEXAsI
set GOOGLE_CREDENTIALS_FILE=credentials.json
python -m pip install -r requirements.txt
python app.py
pause
