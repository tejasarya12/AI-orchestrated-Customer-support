@echo off
REM ============================================
REM AI Support Assistant - Project Initialization Script (Windows)
REM For DeepSeek OCR + Local Models Setup
REM ============================================

echo ==========================================
echo AI Support Assistant Setup
echo    Local Models Edition (Windows)
echo ==========================================
echo.

REM Check Python version
echo Checking Python version...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Python not found! Please install Python 3.8+
    echo    Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo [+] Python %PYTHON_VERSION% detected

REM Create project structure
echo.
echo Creating project structure...
if not exist "utils" mkdir utils
if not exist "models" mkdir models
if not exist "uploads" mkdir uploads
if not exist "vector_db" mkdir vector_db
if not exist "static\audio" mkdir static\audio
if not exist "docs" mkdir docs
if not exist "langgraph_flow" mkdir langgraph_flow

echo [+] Project directories created

REM Create __init__.py files
echo.
echo Creating Python package files...
type nul > utils\__init__.py
type nul > langgraph_flow\__init__.py
echo [+] Package files created

REM Check if virtual environment exists
echo.
echo Setting up virtual environment...
if not exist "venv" (
    echo [!] Creating virtual environment...
    python -m venv venv
    echo [+] Virtual environment created
) else (
    echo [+] Virtual environment already exists
)

REM Activate virtual environment
echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo [+] Virtual environment activated

REM Upgrade pip
echo.
echo Upgrading pip...
python -m pip install --upgrade pip setuptools wheel >nul 2>&1
echo [+] Pip upgraded

REM Install requirements
echo.
echo Installing Python dependencies...
if exist "requirements.txt" (
    echo [!] This may take several minutes...
    pip install -r requirements.txt
    echo [+] Dependencies installed
) else (
    echo [X] requirements.txt not found!
    pause
    exit /b 1
)

REM Create .env from .env.example
echo.
if exist ".env.example" (
    if not exist ".env" (
        echo Creating .env file...
        copy .env.example .env >nul
        echo [+] .env file created from template
        echo [!] Please edit .env file with your settings
    ) else (
        echo [+] .env file already exists
    )
) else (
    echo [!] .env.example not found - skipping .env creation
)

REM Create .gitignore
echo.
if not exist ".gitignore" (
    echo Creating .gitignore...
    (
        echo # Environment
        echo .env
        echo venv/
        echo __pycache__/
        echo *.pyc
        echo *.pyo
        echo *.egg-info/
        echo.
        echo # Models ^(too large^)
        echo models/
        echo.
        echo # Generated files
        echo uploads/
        echo vector_db/
        echo static/audio/
        echo.
        echo # Logs
        echo *.log
        echo *.sqlite3
        echo.
        echo # IDE
        echo .vscode/
        echo .idea/
        echo *.swp
        echo *.swo
        echo.
        echo # OS
        echo .DS_Store
        echo Thumbs.db
    ) > .gitignore
    echo [+] .gitignore created
) else (
    echo [+] .gitignore already exists
)

REM Check for models
echo.
echo Checking for downloaded models...
set MODEL_COUNT=0
if exist "models\deepseek-llm-7b-chat" (
    set /a MODEL_COUNT+=1
    echo [+] Found: DeepSeek LLM
)
if exist "models\all-MiniLM-L6-v2" (
    set /a MODEL_COUNT+=1
    echo [+] Found: Embeddings model
)
if exist "models\GOT-OCR2_0" (
    set /a MODEL_COUNT+=1
    echo [+] Found: OCR model
)

if %MODEL_COUNT%==0 (
    echo.
    echo [!] No models found!
    echo Would you like to download models now? ^(requires ~16GB^)
    set /p DOWNLOAD_CHOICE="Download models? (y/n): "
    if /i "%DOWNLOAD_CHOICE%"=="y" (
        if exist "download_models.py" (
            python download_models.py
        ) else (
            echo [X] download_models.py not found!
        )
    ) else (
        echo [!] Models not downloaded. Run 'python download_models.py' later.
    )
) else if %MODEL_COUNT%==3 (
    echo [+] All models found!
) else (
    echo [!] %MODEL_COUNT% of 3 models found
    echo [!] Run 'python download_models.py' to download missing models
)

REM Check CUDA
echo.
echo Checking GPU/CUDA availability...
python -c "import torch; print('[+] CUDA available:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'No'); print('[!] Will use CPU (slower)' if not torch.cuda.is_available() else '')"

REM Run tests
echo.
set /p TEST_CHOICE="Would you like to run model tests now? (y/n): "
if /i "%TEST_CHOICE%"=="y" (
    if exist "test_models.py" (
        python test_models.py
    ) else (
        echo [!] test_models.py not found - skipping tests
    )
)

REM Summary
echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next Steps:
echo.
echo 1. Configure environment:
echo    notepad .env
echo.
echo 2. Download models (if not done):
echo    python download_models.py
echo.
echo 3. Test models:
echo    python test_models.py
echo.
echo 4. Start the application:
echo    python app.py
echo.
echo 5. Visit in browser:
echo    http://localhost:5000
echo.
echo ==========================================
echo Documentation:
echo    - Setup: docs\SETUP_LOCAL_MODELS.md
echo    - Changes: docs\CHANGES_FOR_LOCAL_MODELS.md
echo    - Structure: docs\FILE_STRUCTURE.md
echo ==========================================
echo.
echo Tips:
echo    - Activate venv: venv\Scripts\activate.bat
echo    - Check config: type config.py
echo    - Install CUDA (for GPU): https://developer.nvidia.com/cuda-downloads
echo.
echo [+] Happy coding! 
echo.
pause