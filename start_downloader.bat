@echo off
title Amyth Downloader - 1-Click Launch
echo ========================================================
echo        Starting Amyth Downloader (Python + React)
echo ========================================================
echo.

:: Start Python Backend Server on Port 5000 in background
start "Amyth Python Engine" /min python app.py

:: Start Vite Frontend on Port 3000
echo [*] Starting Frontend UI on http://localhost:3000 ...
start http://localhost:3000
npm run client
