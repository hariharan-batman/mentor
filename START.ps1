# FounderDock AI - PowerShell Start Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FounderDock AI - Starting Servers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "[1/2] Starting Backend Server (Port 5001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\server'; node index.js"
Start-Sleep -Seconds 3

Write-Host "[2/2] Starting Frontend Server (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\client'; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Servers Starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  " -NoNewline; Write-Host "http://localhost:5001" -ForegroundColor Cyan
Write-Host "Frontend: " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait a few seconds, then open:" -ForegroundColor Yellow
Write-Host "http://localhost:3000" -ForegroundColor Green -BackgroundColor Black
Write-Host " in your browser" -ForegroundColor Yellow
Write-Host ""
