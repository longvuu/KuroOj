# KuroOJ - Start All Services (PowerShell)
# For Windows PowerShell

Write-Host "`n========================================"
Write-Host "  Starting KuroOJ Platform" -ForegroundColor Green
Write-Host "========================================`n"

# Check if Node.js is installed
try {
    $null = Get-Command node -ErrorAction Stop
} catch {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/"
    pause
    exit 1
}

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Function to start a service in new window
function Start-Service {
    param(
        [string]$Title,
        [string]$Path,
        [string]$Command
    )
    
    $fullPath = Join-Path $scriptPath $Path
    Write-Host "[$Title] Starting at $fullPath..." -ForegroundColor Cyan
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$fullPath'; $Command" -WindowStyle Normal
    Start-Sleep -Seconds 2
}

# Start services
Write-Host "[1/3] Starting Backend Server..." -ForegroundColor Yellow
Start-Service -Title "Backend" -Path "backend" -Command "node src/server.js"

Write-Host "[2/3] Starting Judge Service..." -ForegroundColor Yellow
Start-Service -Title "Judge" -Path "judge" -Command "node src/server.js"

Write-Host "[3/3] Starting Frontend..." -ForegroundColor Yellow
Start-Service -Title "Frontend" -Path "frontend" -Command "npm start"

Write-Host "`n========================================"
Write-Host "  All Services Started!" -ForegroundColor Green
Write-Host "========================================`n"

Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Judge:    http://localhost:5001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan

Write-Host "`nPress Ctrl+C in each window to stop" -ForegroundColor Yellow
Write-Host "`nOpening browser in 10 seconds..."

Start-Sleep -Seconds 10
Start-Process "http://localhost:3000"

Write-Host "`n========================================"
Write-Host "  KuroOJ is running!" -ForegroundColor Green
Write-Host "========================================`n"

Write-Host "Press any key to exit this window"
Write-Host "(Services will continue running)" -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
