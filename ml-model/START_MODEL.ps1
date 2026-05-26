# Quick Start Script to Run ML Model (PowerShell Version)

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  RITUCHARYA ML MODEL - QUICK START" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[✓] Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] ERROR: Python not found! Please install Python 3.8+" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# Check dependencies
Write-Host "[1/5] Checking dependencies..." -ForegroundColor Yellow
try {
    python -c "import flask, sklearn, pandas, joblib" 2>&1 | Out-Null
    Write-Host "[✓] All dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "[!] Installing missing dependencies..." -ForegroundColor Yellow
    python -m pip install flask flask-cors scikit-learn pandas joblib numpy -q
    Write-Host "[✓] Dependencies installed" -ForegroundColor Green
}

# Navigate to ml-model folder
Write-Host "[2/5] Navigating to ml-model folder..." -ForegroundColor Yellow
Set-Location -Path "d:\Ritucharya\ml-model" -ErrorAction SilentlyContinue
if (-not (Test-Path (Get-Location))) {
    Write-Host "[✗] ERROR: Could not find ml-model folder" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}
Write-Host "[✓] In ml-model folder" -ForegroundColor Green

# Check required files
Write-Host "[3/5] Checking required files..." -ForegroundColor Yellow
$filesOK = $true

if (-not (Test-Path "model.pkl")) {
    Write-Host "[!] model.pkl not found! Training model..." -ForegroundColor Yellow
    python train_model.py
}
if (Test-Path "model.pkl") { Write-Host "[✓] model.pkl found" -ForegroundColor Green } else { $filesOK = $false }

if (Test-Path "encoder.pkl") { Write-Host "[✓] encoder.pkl found" -ForegroundColor Green } else { 
    Write-Host "[✗] encoder.pkl not found!" -ForegroundColor Red
    $filesOK = $false 
}

if (Test-Path "Dataset.csv") { Write-Host "[✓] Dataset.csv found" -ForegroundColor Green } else { 
    Write-Host "[✗] Dataset.csv not found!" -ForegroundColor Red
    $filesOK = $false 
}

if (Test-Path "prakriti_predictor.py") { Write-Host "[✓] prakriti_predictor.py found" -ForegroundColor Green } else { 
    Write-Host "[✗] prakriti_predictor.py not found!" -ForegroundColor Red
    $filesOK = $false 
}

if (-not $filesOK) {
    Write-Host "[✗] Some required files are missing!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# Check if port 5001 is in use
Write-Host "[4/5] Checking port 5001..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "[!] Port 5001 is already in use. Killing existing process..." -ForegroundColor Yellow
    Get-Process python | Where-Object { $_.CommandLine -like "*prakriti*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Write-Host "[✓] Port 5001 is now free" -ForegroundColor Green
} else {
    Write-Host "[✓] Port 5001 is available" -ForegroundColor Green
}

# Start the model
Write-Host "[5/5] Starting Flask ML Model Server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "Model will run on: http://127.0.0.1:5001" -ForegroundColor Green
Write-Host "Press CTRL+C to stop the server" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

python prakriti_predictor.py
