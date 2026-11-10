import express from 'express';
import cors from 'cors';
import { exec, execSync, execFile, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Temp directory for downloads
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Cross-platform Python binary resolution (Windows: python, Linux/Render: python3/python)
const getPythonCmd = () => {
  if (process.platform === 'win32') return 'python';
  try {
    execSync('python3 --version', { stdio: 'ignore' });
    return 'python3';
  } catch (e) {
    return 'python';
  }
};
const PYTHON_CMD = getPythonCmd();

// Dynamically locate FFmpeg binary executable (prioritize self-contained @ffmpeg-installer binary)
let ffmpegPath = ffmpegInstaller.path || '';
const getFfmpegPath = () => {
  if (ffmpegPath && fs.existsSync(ffmpegPath)) return ffmpegPath;
  try {
    const stdout = execSync(`${PYTHON_CMD} -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"`, { encoding: 'utf8' });
    const detected = stdout.trim();
    if (detected && fs.existsSync(detected)) {
      ffmpegPath = detected;
    }
  } catch (err) {
    console.warn('Could not auto-locate FFmpeg via imageio_ffmpeg:', err.message);
  }
  return ffmpegPath;
};

// Utility: Clean old files in temp directory
const cleanTempFolder = () => {
  try {
    const files = fs.readdirSync(TEMP_DIR);
    const now = Date.now();
    files.forEach(file => {
      const filePath = path.join(TEMP_DIR, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > 30 * 60 * 1000) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (err) {
    console.error('Error cleaning temp folder:', err.message);
  }
};

setInterval(cleanTempFolder, 10 * 60 * 1000);

// Validate YouTube URL (supports youtube.com, youtu.be, m.youtube.com, music.youtube.com, shorts)
const isValidYoutubeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const ytRegex = /^(https?:\/\/)?((www|m|music)\.)?(youtube\.com|youtu\.be)\/.+$/i;
  return ytRegex.test(url.trim());
};

// Format seconds into mm:ss or hh:mm:ss
const formatDuration = (secs) => {
  if (!secs || isNaN(secs)) return 'N/A';
  const s = Math.max(0, Math.floor(secs));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const remainderSecs = s % 60;
  const pad = (num) => (num < 10 ? `0${num}` : num);
  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(remainderSecs)}`;
  }
  return `${pad(mins)}:${pad(remainderSecs)}`;
};

// Helper function to execute yt-dlp with robust multi-stage cloud fallback
const executeYtDlpArgsWithFallback = (tier1Args, tier2Args, tier3Args, callback) => {
  execFile(PYTHON_CMD, tier1Args, { maxBuffer: 40 * 1024 * 1024 }, (error1, stdout1, stderr1) => {
    if (!error1 && stdout1 && stdout1.trim() !== '') {
      return callback(null, stdout1, stderr1);
    }
    console.warn('Tier 1 yt-dlp attempt failed, trying Tier 2 (mweb, android_vr)...', stderr1 || error1?.message);
    
    execFile(PYTHON_CMD, tier2Args, { maxBuffer: 40 * 1024 * 1024 }, (error2, stdout2, stderr2) => {
      if (!error2 && stdout2 && stdout2.trim() !== '') {
        return callback(null, stdout2, stderr2);
      }
      console.warn('Tier 2 yt-dlp attempt failed, trying Tier 3 (clean android, web)...', stderr2 || error2?.message);

      execFile(PYTHON_CMD, tier3Args, { maxBuffer: 40 * 1024 * 1024 }, (error3, stdout3, stderr3) => {
        if (!error3 && stdout3 && stdout3.trim() !== '') {
          return callback(null, stdout3, stderr3);
        }
        callback(error3 || error2 || error1, stdout3 || stdout2 || stdout1, stderr3 || stderr2 || stderr1);
      });
    });
  });
};

// Parse user-friendly error message from yt-dlp stderr
const parseYtDlpError = (stderr, error) => {
  const msg = (stderr || error?.message || '').toLowerCase();
  if (msg.includes('private video')) return 'This video is private and cannot be downloaded.';
  if (msg.includes('confirm your age') || msg.includes('age-restricted')) return 'This video is age-restricted and requires YouTube sign-in.';
  if (msg.includes('video unavailable') || msg.includes('not available')) return 'This video is unavailable or has been removed from YouTube.';
  if (msg.includes('members-only')) return 'This video is available to channel members only.';
  if (msg.includes('live event') || msg.includes('live stream')) return 'Live streams cannot be downloaded until the stream ends.';
  return 'Failed to fetch video information. Please verify the URL or try again later.';
};

// Serve static client assets if built
const DIST_DIR = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}

// Health check routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'YouTube Video & Playlist Downloader Backend',
    version: '1.0.0',
    python: PYTHON_CMD,
    ffmpeg: getFfmpegPath() ? 'available' : 'missing',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  if (fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    return res.sendFile(path.join(DIST_DIR, 'index.html'));
  }
  res.json({
    status: 'online',
    service: 'YouTube Video & Playlist Downloader Backend',
    version: '1.0.0',
    python: PYTHON_CMD,
    ffmpeg: getFfmpegPath() ? 'available' : 'missing',
    message: `Backend running on port ${PORT}. Use "npm run dev" to launch the full studio.`
  });
});

// GET /api/info - Fetch video or playlist metadata
app.get('/api/info', (req, res) => {
  const { url } = req.query;

  if (!url || !isValidYoutubeUrl(url)) {
    return res.status(400).json({ error: 'Please provide a valid YouTube video, shorts, or playlist URL.' });
  }

  const cleanUrl = url.trim();
  const isPlaylist = cleanUrl.includes('list=') || cleanUrl.includes('/playlist');

  if (isPlaylist) {
    const tier1Args = [
      '-m', 'yt_dlp',
      '-j',
      '--flat-playlist',
      '--js-runtimes', 'node',
      '--legacy-server-connect',
      '--no-check-certificates',
      '--extractor-args', 'youtube:player_client=android_creator,tv_embedded,web_embedded,android;player_skip=webpage',
      cleanUrl
    ];

    const tier2Args = [
      '-m', 'yt_dlp',
      '-j',
      '--flat-playlist',
      '--js-runtimes', 'node',
      '--legacy-server-connect',
      '--no-check-certificates',
      '--extractor-args', 'youtube:player_client=mweb,android_vr,ios',
      cleanUrl
    ];

    const tier3Args = [
      '-m', 'yt_dlp',
      '-j',
      '--flat-playlist',
      '--js-runtimes', 'node',
      '--legacy-server-connect',
      '--no-check-certificates',
      '--extractor-args', 'youtube:player_client=android,web',
      cleanUrl
    ];

    executeYtDlpArgsWithFallback(tier1Args, tier2Args, tier3Args, (error, stdout, stderr) => {
      if (error && (!stdout || stdout.trim() === '')) {
        console.error('yt-dlp playlist error:', stderr || error.message);
        return res.status(500).json({ error: parseYtDlpError(stderr, error) });
      }

      try {
        const lines = stdout.trim().split('\n').filter(Boolean);
        const entries = lines.map(line => {
          try { return JSON.parse(line); } catch (e) { return null; }
        }).filter(Boolean);

        if (entries.length === 0) {
          return res.status(500).json({ error: 'No items found in playlist.' });
        }

        const playlistVideos = entries.map((entry, idx) => ({
          id: entry.id,
          index: idx + 1,
          title: entry.title || `Video #${idx + 1}`,
          duration: entry.duration || 0,
          durationFormatted: formatDuration(entry.duration),
          thumbnail: entry.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`,
          uploader: entry.uploader || entry.channel || 'YouTube'
        }));

        const totalDurationSecs = playlistVideos.reduce((acc, v) => acc + (v.duration || 0), 0);

        res.json({
          id: entries[0].id,
          isPlaylist: true,
          title: `Playlist: ${entries[0].playlist_title || entries[0].title || 'YouTube Playlist'}`,
          thumbnail: playlistVideos[0].thumbnail,
          uploader: entries[0].uploader || entries[0].channel || 'YouTube Playlist',
          duration: formatDuration(totalDurationSecs),
          durationSeconds: totalDurationSecs,
          viewCount: playlistVideos.length,
          maxVideoHeight: 2160,
          maxAudioBitrate: 320,
          availableResolutions: [2160, 1440, 1080, 720, 480, 360],
          estimatedSizes: { 2160: 0, 1440: 0, 1080: 0, 720: 0, 480: 0, 360: 0, audio: 0 },
          playlistVideos,
          webpage_url: cleanUrl
        });
      } catch (parseErr) {
        console.error('Playlist parse error:', parseErr);
        res.status(500).json({ error: 'Error parsing playlist metadata.' });
      }
    });
  } else {
    // Single Video Extraction
    const tier1Args = [
      '-m', 'yt_dlp',
      '--dump-json',
      '--no-playlist',
      '--js-runtimes', 'node',
      '--legacy-server-connect',
      '--no-check-certificates',
      '--extractor-args', 'youtube:player_client=android_creator,tv_embedded,web_embedded,android;player_skip=webpage',
      cleanUrl
    ];

    const tier2Args = [
      '-m', 'yt_dlp',
      '--dump-json',
      '--no-playlist',
      '--js-runtimes', 'node',
      '--legacy-server-connect',
      '--no-check-certificates',
      '--extractor-args', 'youtube:player_client=mweb,android_vr,ios',
      cleanUrl
    ];

    const tier3Args = [
      '-m', 'yt_dlp',
      '--dump-json',
      '--no-playlist',
      '--js-runtimes', 'node',
      '--legacy-server-connect',
      '--no-check-certificates',
      '--extractor-args', 'youtube:player_client=android,web',
      cleanUrl
    ];

    executeYtDlpArgsWithFallback(tier1Args, tier2Args, tier3Args, (error, stdout, stderr) => {
      if (error || !stdout || stdout.trim() === '') {
        console.error('yt-dlp error:', stderr || error?.message);
        return res.status(500).json({
          error: parseYtDlpError(stderr, error)
        });
      }

      try {
        const info = JSON.parse(stdout);

        const formats = info.formats || [];
        const durationSec = info.duration || 0;

        const videoHeights = formats
          .filter(f => f.vcodec !== 'none' && typeof f.height === 'number' && f.height > 0)
          .map(f => f.height);

        const maxVideoHeight = videoHeights.length > 0 ? Math.max(...videoHeights) : 720;

        const audioBitrates = formats
          .filter(f => f.acodec !== 'none' && typeof f.abr === 'number' && f.abr > 0)
          .map(f => f.abr);

        const maxAudioBitrate = audioBitrates.length > 0 ? Math.max(...audioBitrates) : 160;

        // Calculate REAL stream byte sizes from formats array
        const audioFormats = formats.filter(f => f.acodec !== 'none' && f.vcodec === 'none');
        const bestAudioSize = audioFormats.length > 0
          ? Math.max(...audioFormats.map(f => (f.filesize || f.filesize_approx || (f.abr ? (f.abr * durationSec * 1000 / 8) : 0))))
          : 0;

        const getExactSizeForHeight = (h) => {
          const vFormats = formats.filter(f => f.vcodec !== 'none' && f.height === h);
          if (vFormats.length === 0) return 0;
          const maxVSize = Math.max(...vFormats.map(f => (f.filesize || f.filesize_approx || (f.tbr ? (f.tbr * durationSec * 1000 / 8) : 0))));
          return maxVSize > 0 ? Math.round(maxVSize + bestAudioSize) : 0;
        };

        const estimatedSizes = {
          2160: getExactSizeForHeight(2160),
          1440: getExactSizeForHeight(1440),
          1080: getExactSizeForHeight(1080),
          720: getExactSizeForHeight(720),
          480: getExactSizeForHeight(480),
          360: getExactSizeForHeight(360),
          audio: Math.round(bestAudioSize || (160 * durationSec * 1000 / 8))
        };

        const thumbnail = info.thumbnail || 
          (info.thumbnails && info.thumbnails.length > 0 
            ? info.thumbnails[info.thumbnails.length - 1].url 
            : '');

        res.json({
          id: info.id,
          isPlaylist: false,
          title: info.title,
          thumbnail,
          uploader: info.uploader || info.channel || 'Unknown Uploader',
          duration: formatDuration(durationSec),
          durationSeconds: durationSec,
          viewCount: info.like_count || info.view_count || 0,
          maxVideoHeight,
          maxAudioBitrate,
          availableResolutions: Array.from(new Set(videoHeights)).sort((a, b) => b - a),
          estimatedSizes,
          webpage_url: info.webpage_url || cleanUrl
        });
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr);
        res.status(500).json({ error: 'Error parsing video metadata from YouTube.' });
      }
    });
  }
});

// GET /api/download - Download video, audio, trimmed clip, or playlist selection
app.get('/api/download', (req, res) => {
  const { url, type, quality, startTime, endTime, playlistIndices } = req.query;

  if (!url || !isValidYoutubeUrl(url)) {
    return res.status(400).json({ error: 'Valid YouTube URL required.' });
  }

  const cleanUrl = url.trim();
  const isAudio = type === 'mp3';
  const isPlaylist = cleanUrl.includes('list=') || cleanUrl.includes('/playlist');
  const fileId = Date.now();

  const ffmpegBin = getFfmpegPath();

  const args = [
    '-m', 'yt_dlp',
    '--force-overwrites',
    '--js-runtimes', 'node',
    '--legacy-server-connect',
    '--no-check-certificates',
    '--extractor-args', 'youtube:player_client=android_creator,tv_embedded,web_embedded,android;player_skip=webpage'
  ];

  if (ffmpegBin) {
    args.push('--ffmpeg-location', ffmpegBin);
  }

  // Playlist handling
  if (playlistIndices) {
    args.push('--playlist-items', playlistIndices);
    const outPath = path.join(TEMP_DIR, `yt_playlist_${fileId}_%(playlist_index)s.%(ext)s`);
    args.push('-o', outPath);
  } else if (isPlaylist) {
    const outPath = path.join(TEMP_DIR, `yt_playlist_${fileId}_%(playlist_index)s.%(ext)s`);
    args.push('-o', outPath);
  } else {
    args.push('--no-playlist');
    const outPath = path.join(TEMP_DIR, `yt_${fileId}.%(ext)s`);
    args.push('-o', outPath);
  }

  // Section trimming support
  if (!isPlaylist && startTime !== undefined && endTime !== undefined && startTime !== '' && endTime !== '') {
    args.push('--download-sections', `*${startTime}-${endTime}`);
    args.push('--force-keyframes-at-cuts');
  }

  if (isAudio) {
    args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
  } else {
    const targetHeight = parseInt(quality, 10) || 720;
    const formatSpec = `bestvideo[height=${targetHeight}]+bestaudio/bestvideo[height<=${targetHeight}]+bestaudio/best[height<=${targetHeight}]/best`;
    args.push('-f', formatSpec);
    args.push('--merge-output-format', 'mp4');
    args.push('--postprocessor-args', 'Merger:-c:a aac -c:v copy');
  }

  args.push(cleanUrl);

  console.log(`Executing download: ${PYTHON_CMD} ${args.join(' ')}`);

  const pyProcess = spawn(PYTHON_CMD, args);

  pyProcess.stderr.on('data', (data) => {
    console.log(`yt-dlp: ${data.toString()}`);
  });

  pyProcess.on('close', (code) => {
    // Find finished merged files in TEMP_DIR
    const allFiles = fs.readdirSync(TEMP_DIR);
    const finishedFiles = allFiles.filter(f => {
      return f.includes(`_${fileId}`) && 
             !f.includes('.part') && 
             !f.includes('.ytdl') && 
             !/\.f\d+\./.test(f);
    });

    if (finishedFiles.length > 0) {
      const targetFile = path.join(TEMP_DIR, finishedFiles[0]);
      console.log(`Download completed, serving file: ${targetFile}`);

      res.download(targetFile, finishedFiles[0], (err) => {
        if (err && !res.headersSent) {
          console.error('File download send error:', err);
        }
        // Cleanup generated files after client stream completes
        setTimeout(() => {
          allFiles.filter(f => f.includes(`_${fileId}`)).forEach(f => {
            try { fs.unlinkSync(path.join(TEMP_DIR, f)); } catch (e) {}
          });
        }, 10000);
      });
    } else {
      console.error(`Download process finished with exit code ${code}, but no output file was created.`);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed or output file was not generated.' });
      }
    }
  });
});

// Fallback SPA routing for built frontend
if (fs.existsSync(DIST_DIR)) {
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(DIST_DIR, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`🚀 YouTube Downloader Backend Server running on http://localhost:${PORT}`);
});
