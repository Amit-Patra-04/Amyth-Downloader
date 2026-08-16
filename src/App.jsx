import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CyberBackground from './components/CyberBackground';
import HeroSearch from './components/HeroSearch';
import VideoMetaCard from './components/VideoMetaCard';
import VideoTrimmer from './components/VideoTrimmer';
import FormatQualitySelector from './components/FormatQualitySelector';
import PlaylistBatchDownloader from './components/PlaylistBatchDownloader';
import DownloadHistory from './components/DownloadHistory';
import NetlifyDeployGuide from './components/NetlifyDeployGuide';
import FeaturesFAQ from './components/FeaturesFAQ';
import { 
  extractVideoId, 
  extractPlaylistId,
  fetchVideoMetadata, 
  fetchPlaylistMetadata,
  generateDownloadStream, 
  triggerBrowserDownload,
  formatTimeHMS
} from './services/youtubeService';

const STORAGE_KEY = 'amyth_downloader_history_v1';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data states
  const [videoData, setVideoData] = useState(null);
  const [playlistData, setPlaylistData] = useState(null);
  
  // Video Trim Settings
  const [trimSettings, setTrimSettings] = useState({
    enabled: false,
    start: 0,
    end: 0,
    duration: 0,
  });

  // Download State
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [activeDownloadQuality, setActiveDownloadQuality] = useState(null);

  // Modals & History
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [history]);

  // Handle URL Extraction
  const handleSearch = async (url) => {
    setError(null);
    setVideoData(null);
    setPlaylistData(null);

    const playlistId = extractPlaylistId(url);
    const videoId = extractVideoId(url);

    if (!playlistId && !videoId) {
      setError('Please enter a valid YouTube video or playlist link.');
      return;
    }

    setIsLoading(true);

    try {
      if (playlistId && (!videoId || url.includes('playlist?list='))) {
        const pData = await fetchPlaylistMetadata(playlistId);
        setPlaylistData(pData);
        showToast(`Loaded playlist: ${pData.title.substring(0, 30)}... (${pData.videoCount} videos)`, 'success');
      } else if (videoId) {
        const data = await fetchVideoMetadata(videoId);
        setVideoData(data);
        setTrimSettings({
          enabled: false,
          start: 0,
          end: data.durationSeconds || 240,
          duration: data.durationSeconds || 240,
        });
        showToast(`Loaded: ${data.title.substring(0, 35)}...`, 'success');
      }
    } catch (err) {
      console.error(err);
      setError('Could not fetch media details. Please verify the URL.');
    } finally {
      setIsLoading(false);
    }
  };

  // When YouTube player detects exact duration from player
  const handleDurationDetected = useCallback((realDuration) => {
    setVideoData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        durationSeconds: realDuration,
        durationFormatted: formatTimeHMS(realDuration, realDuration),
      };
    });
  }, []);

  // Handle Video Download
  const handleStartDownload = async ({ format, quality, trim }) => {
    if (!videoData) return;

    setIsDownloading(true);
    setActiveDownloadQuality(quality);

    const API_BASE = import.meta.env.VITE_API_URL || (window.location.port === '3000' ? 'http://127.0.0.1:5000' : '');
    const isTrimmed = trim?.enabled && trim.end > trim.start ? 1 : 0;
    const directDownloadUrl = `${API_BASE}/api/download?videoId=${videoData.videoId}&format=${format}&quality=${quality}&trim=${isTrimmed}&start=${trim?.start || 0}&end=${trim?.end || 0}`;
    const filename = `Amyth_${videoData.videoId}_${quality}${isTrimmed ? '_trimmed' : ''}.${format}`;

    triggerBrowserDownload(directDownloadUrl, filename);
    showToast(`Downloading: ${quality} (${format.toUpperCase()}) directly to your device...`, 'success');

    const newHistoryItem = {
      id: Date.now(),
      videoId: videoData.videoId,
      title: videoData.title,
      thumbnail: videoData.thumbnail,
      format,
      quality,
      isTrimmed: trim.enabled,
      trimDuration: trim.enabled ? trim.duration : videoData.durationSeconds,
      timestamp: new Date().toISOString(),
      downloadUrl: directDownloadUrl,
    };

    setHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]);

    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    showToast('Download history cleared', 'info');
  };

  const handleReDownload = (item) => {
    triggerBrowserDownload(item.downloadUrl, `Amyth_${item.videoId}_${item.quality}.${item.format}`);
    showToast(`Re-downloading ${item.title.substring(0, 25)}...`, 'info');
  };

  const handleTrimChange = useCallback((newTrim) => {
    setTrimSettings(newTrim);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative font-sans">
      
      {/* Subtle Background */}
      <CyberBackground />

      {/* Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        
        {/* Search Hero */}
        <HeroSearch
          onSearch={handleSearch}
          isLoading={isLoading}
          error={error}
        />

        {/* Playlist Batch Downloader */}
        {playlistData && (
          <div className="px-4 sm:px-6 lg:px-8">
            <PlaylistBatchDownloader 
              playlistData={playlistData} 
              onShowToast={showToast} 
            />
          </div>
        )}

        {/* Single Video Suite */}
        {videoData && (
          <div className="px-4 sm:px-6 lg:px-8 space-y-4">
            
            {/* Metadata Card */}
            <VideoMetaCard videoData={videoData} />

            {/* Video Trimmer */}
            <VideoTrimmer
              videoId={videoData.videoId}
              durationSeconds={videoData.durationSeconds}
              onTrimChange={handleTrimChange}
              onDurationDetected={handleDurationDetected}
            />

            {/* Quality & Format Selector */}
            <FormatQualitySelector
              videoData={videoData}
              onStartDownload={handleStartDownload}
              isDownloading={isDownloading}
              downloadProgress={downloadProgress}
              activeDownloadQuality={activeDownloadQuality}
              trimSettings={trimSettings}
            />

          </div>
        )}

        {/* Features & FAQ */}
        <FeaturesFAQ />

      </main>

      {/* History Drawer */}
      <DownloadHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onReDownload={handleReDownload}
      />

      {/* Netlify Deploy Guide */}
      <NetlifyDeployGuide
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade">
          <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-lg text-xs font-medium ${
            toast.type === 'success'
              ? 'bg-zinc-900 border-zinc-700 text-white'
              : toast.type === 'error'
              ? 'bg-red-950 border-red-800 text-red-200'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300'
          }`}>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
