@echo off
title Amyth Downloader - 1-Click Launch
echo ========================================================
echo        Starting Amyth Downloader (Local Studio)
echo ========================================================
echo.

:: 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH.
    echo Please install Node.js 18+ from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    where python3 >nul 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] Python is not found in PATH.
        echo Please install Python 3.8+ from: https://www.python.org/
        echo.
        pause
        exit /b 1
    )
)

:: 3. Install NPM dependencies if node_modules is missing
if not exist "node_modules\" (
    echo [*] First-time setup: Installing Node dependencies...
    call npm install
    echo.
)

:: 4. Ensure yt-dlp is installed
echo [*] Checking yt-dlp python engine...
python -m pip install -U yt-dlp --quiet 2>nul || python3 -m pip install -U yt-dlp --quiet 2>nul

echo.
echo [*] Starting Amyth Downloader Studio (Backend + UI)...
echo [*] Launching http://localhost:5173 in your default browser...
start http://localhost:5173

:: 5. Start dev server (Express backend on 5000 + Vite frontend on 5173)
npm run dev
