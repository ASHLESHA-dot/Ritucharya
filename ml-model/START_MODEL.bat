@echo off
REM Quick Start Script to Run ML Model

echo.
echo ===============================================
echo   RITUCHARYA ML MODEL - QUICK START
echo ===============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found! Please install Python 3.8+
    pause
    exit /b 1
)

echo [1/4] Checking dependencies...
python -c "import flask, sklearn, pandas, joblib" >nul 2>&1
if errorlevel 1 (
    echo Missing dependencies. Installing...
    pip install flask flask-cors scikit-learn pandas joblib numpy -q
    echo Dependencies installed.
)

echo [2/4] Navigating to ml-model folder...
cd /d d:\Ritucharya\ml-model
if errorlevel 1 (
    echo ERROR: Could not find ml-model folder
    pause
    exit /b 1
)

echo [3/4] Checking required files...
if not exist "model.pkl" (
    echo ERROR: model.pkl not found! Training model...
    python train_model.py
)
if not exist "encoder.pkl" (
    echo ERROR: encoder.pkl not found! Please run training first
    pause
    exit /b 1
)
if not exist "Dataset.csv" (
    echo ERROR: Dataset.csv not found!
    pause
    exit /b 1
)

echo [4/4] Starting Flask ML Model Server...
echo.
echo ===============================================
echo   Model will run on: http://127.0.0.1:5001
echo   Press CTRL+C to stop the server
echo ===============================================
echo.

python prakriti_predictor.py

pause
