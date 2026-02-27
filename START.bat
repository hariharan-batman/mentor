@echo off
echo ========================================
echo   FounderDock AI - Starting Servers
echo ========================================
echo.

echo [1/2] Starting Backend Server (Port 5001)...
start "FounderDock Backend" cmd /k "cd /d %~dp0server && node index.js"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server (Port 3000)...
start "FounderDock Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================
echo   Servers Starting!
echo ========================================
echo.
echo Backend:  http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo Wait a few seconds, then open:
echo http://localhost:3000 in your browser
echo.
echo Press any key to exit this window...
pause >nul
