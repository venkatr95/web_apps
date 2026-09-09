@echo off
echo ========================================
echo UUID Form Filler - Quick Start Script
echo ========================================
echo.

REM Check if backend .env exists
if not exist backend\.env (
    echo [!] Creating backend .env file...
    copy backend\.env.example backend\.env
    echo.
    echo [!] IMPORTANT: Edit backend\.env and add your OpenAI API key!
    echo     File location: backend\.env
    echo     Add: OPENAI_API_KEY=sk-your-actual-key-here
    echo.
    pause
)

echo [1/3] Starting Backend Server...
echo.
start cmd /k "cd backend && python -m venv venv && call venv\Scripts\activate && pip install -r requirements.txt && python main.py"

timeout /t 5 /nobreak >nul

echo [2/3] Starting Frontend Server...
echo.
start cmd /k "cd frontend && npm install && npm run dev"

echo.
echo [3/3] Setup Complete!
echo.
echo ========================================
echo Application Starting...
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost:5173

echo.
echo Application is running!
echo Close the terminal windows to stop the servers.
