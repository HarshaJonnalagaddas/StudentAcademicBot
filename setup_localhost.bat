@echo off
echo Setting up AcademicBot for localhost development...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://python.org
    pause
    exit /b 1
)

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements_localhost.txt

REM Copy environment file
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env file and add your GEMINI_API_KEY
    echo Get your key from: https://aistudio.google.com/
    echo.
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file and add your GEMINI_API_KEY
echo 2. Run: python run_localhost.py
echo 3. Open http://localhost:5000 in your browser
echo.
pause