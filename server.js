import express from 'express';
import cors from 'cors';
import ytDlp from 'yt-dlp-exec';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'Amyth Downloader Master yt-dlp Engine' });
});

// Video Info Endpoint (100% accurate metadata and view count)
app.get('/api/info', async (req, res) => {
  try {
    const { videoId } = req.query;
    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytDlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      preferFreeFormats: true,
    });

    const viewCount = info.view_count || 0;
    const duration = info.duration || 180;

    res.json({
      videoId,
      title: info.title || 'YouTube Video',
      author: info.uploader || info.channel || 'YouTube Creator',
      durationSeconds: duration,
      viewCount: viewCount.toLocaleString(),
      rawViewCount: viewCount,
      thumbnail: info.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    });
  } catch (err) {
    console.error('Info Error:', err);
    res.status(500).json({ error: 'Could not fetch video info', details: err.message });
  }
});

// Master Direct Download Endpoint (Streams directly to local storage / Downloads folder)
app.get('/api/download', async (req, res) => {
  try {
    const { 
      videoId, 
      format = 'mp4', 
      quality = '1080p', 
      trim = '0', 
      start = '0', 
      end = '0' 
    } = req.query;

    if (!videoId) {
      return res.status(400).send('videoId parameter is required');
    }

    const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Fetch clean title
    let cleanTitle = 'Amyth_Video';
    try {
      const basicInfo = await ytDlp(ytUrl, {
        dumpSingleJson: true,
        noWarnings: true,
        skipDownload: true,
      });
      if (basicInfo.title) {
        cleanTitle = basicInfo.title.replace(/[^a-zA-Z0-9_\- ]/g, '').trim() || 'Amyth_Video';
      }
    } catch (e) {
      cleanTitle = `Amyth_${videoId}`;
    }

    const targetHeight = parseInt(quality.replace('p', ''), 10) || 1080;
    const isTrimmed = trim === '1' && parseFloat(end) > parseFloat(start);
    const startTime = parseFloat(start) || 0;
    const endTime = parseFloat(end) || 0;

    const fileExt = format === 'mp3' ? 'mp3' : 'mp4';
    const filename = `${cleanTitle}_${quality}${isTrimmed ? '_trimmed' : ''}.${fileExt}`;

    // Set download headers so the browser directly saves file locally without error
    res.header('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

    let ytDlpOptions = {
      output: '-',
      noWarnings: true,
    };

    if (format === 'mp3') {
      res.header('Content-Type', 'audio/mpeg');
      const audioBitrate = quality.replace('kbps', '') || '320';

      ytDlpOptions = {
        ...ytDlpOptions,
        extractAudio: true,
        audioFormat: 'mp3',
        audioQuality: audioBitrate === '320' ? 0 : audioBitrate === '256' ? 2 : audioBitrate === '192' ? 4 : 6,
      };

      if (isTrimmed) {
        ytDlpOptions.downloadSections = `*${startTime}-${endTime}`;
      }
    } else {
      res.header('Content-Type', 'video/mp4');

      // Best video up to selected height + best audio
      ytDlpOptions = {
        ...ytDlpOptions,
        format: `bestvideo[height<=${targetHeight}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${targetHeight}]+bestaudio/best[height<=${targetHeight}]/best`,
        mergeOutputFormat: 'mp4',
      };

      if (isTrimmed) {
        ytDlpOptions.downloadSections = `*${startTime}-${endTime}`;
      }
    }

    // Execute streaming subprocess directly to response pipe
    const subprocess = ytDlp.exec(ytUrl, ytDlpOptions, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    subprocess.stdout.pipe(res);

    subprocess.stderr.on('data', (data) => {
      // Log progress / debug info
      const msg = data.toString();
      if (!msg.includes('Downloading') && !msg.includes('Destination')) {
        console.log('[yt-dlp]', msg.trim());
      }
    });

    subprocess.on('error', (err) => {
      console.error('yt-dlp subprocess error:', err);
      if (!res.headersSent) {
        res.status(500).send('Streaming error');
      }
    });

    req.on('close', () => {
      try {
        subprocess.kill();
      } catch (e) {}
    });

  } catch (err) {
    console.error('Download Route Error:', err);
    if (!res.headersSent) {
      res.status(500).send(`Download failed: ${err.message}`);
    }
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Amyth Downloader Master yt-dlp Engine running on http://localhost:${PORT}`);
});
