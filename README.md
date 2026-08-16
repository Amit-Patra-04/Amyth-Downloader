# ⚡ Amyth Downloader

> **Next-Generation YouTube Video & Audio Studio** built with React JS + Tailwind CSS. 100% Free, High-Tech Futuristic Cyberpunk Aesthetics, Dynamic Resolution Locking, and Interactive Video Trimmer.

---

## 🌟 Key Features

- **Dynamic Resolution Guard**: Automatically inspects the uploaded native video quality. If a video maxes out at 1080p, the 4K and 2K options are locked with the notice:
  > *"Original quality of video is not falling within this"*
- **MP4 Video & MP3 Audio Formats**:
  - **Video Qualities**: 4K Ultra HD (2160p), 2K Quad HD (1440p), 1080p Full HD, 720p HD, 480p SD, 360p Mobile.
  - **Audio Bitrates**: 320 kbps (Ultra Studio), 256 kbps (Hi-Fi), 192 kbps (Standard), 128 kbps (Eco).
- **Interactive Video Trimmer (Studio Mode)**:
  - Futuristic toggle switch.
  - Interactive dual range slider with Start Time and End Time inputs (`HH:MM:SS`).
  - Synchronized in-browser video preview playing the exact trimmed segment.
- **Futuristic Holographic HUD UI**:
  - Cosmic dark canvas with glowing neural particles and dynamic grid lines.
  - Laser scanline animations, glassmorphic cards, neon cyan/purple/pink glowing borders, and celebration effects.
  - One-click clipboard paste and quick-test sample presets.
- **Local Download Vault**:
  - Keeps track of downloaded videos and clips in browser storage for instant re-download.
- **100% Free & Open**:
  - Zero API keys needed, zero subscriptions, zero ads.

---

## 🚀 Running Locally

To run the development server locally:

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start Vite development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Netlify (100% Free)

All required configuration files (`netlify.toml` and `public/_redirects`) are already included in this repository.

### Option 1: Automatic Deployment via GitHub (Recommended)

1. Push your project to GitHub:
   ```bash
   git add .
   git commit -m "Deploy Amyth Downloader"
   git push origin main
   ```
2. Go to [app.netlify.com](https://app.netlify.com) and log in.
3. Click **"Add new site"** &rarr; **"Import an existing project"** &rarr; Select **GitHub**.
4. Select your **Amyth-Downloader** repository.
5. Netlify will automatically fill in:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
6. Click **"Deploy site"**. Your site is now live with free SSL!

---

### Option 2: Instant Drag-and-Drop (No Git Required)

1. Build the production bundle on your computer:
   ```bash
   npm run build
   ```
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop the generated `dist` folder directly onto the page.
4. Your website is instantly deployed!