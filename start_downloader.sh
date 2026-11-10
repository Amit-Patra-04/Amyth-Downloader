#!/usr/bin/env bash
echo "========================================================"
echo "       Starting Amyth Downloader (Local Studio)         "
echo "========================================================"
echo ""

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not found in PATH."
    echo "Please install Node.js 18+ from: https://nodejs.org/"
    exit 1
fi

# 2. Check Python
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python is not found in PATH."
    echo "Please install Python 3.8+ from: https://www.python.org/"
    exit 1
fi

# 3. Install NPM dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "[*] First-time setup: Installing Node dependencies..."
    npm install
fi

# 4. Ensure yt-dlp is installed
echo "[*] Checking yt-dlp python engine..."
$PYTHON_CMD -m pip install -U yt-dlp --quiet 2>/dev/null || true

echo ""
echo "[*] Starting Amyth Downloader Studio (Backend + UI)..."
echo "[*] Open http://localhost:5173 in your browser."

# Try opening the browser automatically
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173 &
elif command -v open &> /dev/null; then
    open http://localhost:5173 &
fi

npm run dev

