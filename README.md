# ⚡ Amyth Downloader (StreamGrab PRO)

> **Modern YouTube Video & Audio Studio** built with React + Vite + Tailwind CSS & Node.js Express. 
> 100% Free, unlimited, runs completely locally on your machine with zero cloud rate limits.

---

## 🌟 Features

- **🎬 Full HD, 2K & 4K Ultra HD Video Downloads**:
  - Automatically analyzes the original uploaded resolution (360p, 480p, 720p, 1080p, 1440p, 2160p).
  - Dynamically disables higher quality options with a clear warning if the original video does not offer that resolution.
  - Automatically remuxes video and audio streams into clean `.mp4` format.

- **🎵 Ultra-High Bitrate MP3 Audio Extraction**:
  - Downloads audio in 320 kbps (Studio), 256 kbps (Hi-Fi), 192 kbps (Standard), or 128 kbps (Compact).
  - Uses embedded static FFmpeg for lossless conversion into `.mp3`.

- **✂️ Precision Video & Audio Trimmer**:
  - Visual dual-slider timestamp picker.
  - Custom Start & End timestamp inputs (`HH:MM:SS` or seconds).
  - Cut and download only the exact segment you need without downloading the whole video.

- **📑 Full YouTube Playlist Multi-Download**:
  - Enter any playlist URL (`list=...`).
  - View all playlist items, titles, thumbnails, and durations.
  - Multi-select interactive checkboxes to download the whole playlist or select individual videos.

- **⚡ 1-Click Clipboard Paste**:
  - Paste directly from your clipboard with a single click.
  - Supports standard YouTube URLs, YouTube Shorts, Music links (`music.youtube.com`), and mobile share links (`youtu.be`).

- **🛠️ Self-Contained FFmpeg Included**:
  - Pre-packaged with `@ffmpeg-installer/ffmpeg` — no manual system FFmpeg installation required.

---

## 📋 Prerequisites

Before running the project locally, make sure you have:

1. **[Node.js](https://nodejs.org/)** (v18 or higher)
2. **[Python](https://www.python.org/)** (v3.8 or higher)
3. **[yt-dlp](https://github.com/yt-dlp/yt-dlp)**:
   ```bash
   pip install -U yt-dlp
   ```

---

## 🚀 Quick Start (1-Click Launch)

### On Windows:
Double-click **`start_downloader.bat`**.
> It checks your dependencies, installs any missing packages, launches the backend & frontend servers, and opens `http://localhost:5173` in your default browser.

### On macOS / Linux:
Make the script executable and run:
```bash
chmod +x start_downloader.sh
./start_downloader.sh
```

---

## 💻 Manual Developer Setup

If you prefer using your terminal:

```bash
# 1. Clone the repository
git clone https://github.com/Amit-Patra-04/Amyth-Downloader.git
cd Amyth-Downloader

# 2. Install Node dependencies
npm install

# 3. Ensure yt-dlp is installed
pip install -U yt-dlp

# 4. Start both backend and frontend together
npm run dev
```

Your browser will automatically connect to:
- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🏗️ Building for Production / Local Standalone Server

You can build the production frontend bundle and serve everything directly from Express on port `5000`:

```bash
# Build the React frontend
npm run build

# Start the standalone server
npm start
```

Then navigate to [http://localhost:5000](http://localhost:5000) in your browser.

---

## 📁 Project Structure

```
Amyth-Downloader/
├── public/                 # Static assets (favicons, icons)
├── server/
│   └── server.js           # Express API server (yt-dlp engine & FFmpeg remuxing)
├── src/
│   ├── components/         # React UI components (VideoCard, DownloadOptions, UrlInput, etc.)
│   ├── App.jsx             # Main application layout and state management
│   ├── config.js           # API configuration (local proxy)
│   ├── index.css           # Tailwind CSS styles and glassmorphism themes
│   └── main.jsx            # React root entry point
├── package.json            # Node.js dependencies and scripts
├── requirements.txt        # Python dependency (yt-dlp)
├── start_downloader.bat    # Windows 1-click launcher
├── start_downloader.sh     # macOS / Linux 1-click launcher
└── vite.config.js          # Vite configuration with local proxy to port 5000
```

---

## 🛡️ License

This project is open source and available under the [MIT License](LICENSE).
