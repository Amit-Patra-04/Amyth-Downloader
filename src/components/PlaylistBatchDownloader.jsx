import React, { useState } from 'react';
import { 
  ListMusic, 
  CheckSquare, 
  Square, 
  Download, 
  Film, 
  Music, 
  Loader2, 
  Check, 
  Clock,
  Layers
} from 'lucide-react';
import { triggerBrowserDownload } from '../services/youtubeService';
import confetti from 'canvas-confetti';

export default function PlaylistBatchDownloader({ 
  playlistData, 
  onShowToast 
}) {
  // Toggle OFF by default
  const [isBatchEnabled, setIsBatchEnabled] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => 
    new Set(playlistData.videos.map((v) => v.id))
  );
  const [format, setFormat] = useState('mp4');
  const [isDownloadingBatch, setIsDownloadingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, currentTitle: '' });

  const totalVideos = playlistData.videos.length;
  const selectedCount = selectedIds.size;

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(playlistData.videos.map((v) => v.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  // Download all videos at highest allowed quality
  const handleDownloadAll = async () => {
    const allVideos = playlistData.videos;
    await executeBatchDownload(allVideos);
  };

  // Download selected videos at highest allowed quality
  const handleDownloadSelected = async () => {
    if (selectedCount === 0 || isDownloadingBatch) return;
    const selectedVideos = playlistData.videos.filter((v) => selectedIds.has(v.id));
    await executeBatchDownload(selectedVideos);
  };

  const executeBatchDownload = async (videosToDownload) => {
    if (!videosToDownload.length || isDownloadingBatch) return;

    setIsDownloadingBatch(true);
    setBatchProgress({ 
      current: 0, 
      total: videosToDownload.length, 
      currentTitle: 'Initializing download queue...' 
    });

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.8 },
      });
    } catch (e) {}

    onShowToast?.(`Starting download for ${videosToDownload.length} videos at highest allowed quality...`, 'info');

    for (let i = 0; i < videosToDownload.length; i++) {
      const video = videosToDownload[i];
      setBatchProgress({
        current: i + 1,
        total: videosToDownload.length,
        currentTitle: video.title,
      });

      try {
        const API_BASE = import.meta.env.VITE_API_URL || (window.location.port === '3000' ? 'http://127.0.0.1:5000' : '');
        // quality=highest guarantees every video downloads at its highest allowed original quality
        const directUrl = `${API_BASE}/api/download?videoId=${video.videoId}&format=${format}&quality=highest&trim=0`;
        const filename = `Amyth_Playlist_${video.index}_${video.videoId}.${format}`;

        triggerBrowserDownload(directUrl, filename);
      } catch (err) {
        console.error(`Error downloading video ${video.videoId}:`, err);
      }

      // Small delay between downloads so the browser can queue them smoothly
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    setIsDownloadingBatch(false);
    onShowToast?.(`Successfully queued all ${videosToDownload.length} items for download!`, 'success');
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      
      {/* Main Container */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6 shadow-sm text-left">
        
        {/* Header with Switch */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <ListMusic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm sm:text-base text-white">
                  Download Selected Videos from Playlist
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {totalVideos} Videos
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {playlistData.title} &bull; {playlistData.author}
              </p>
            </div>
          </div>

          {/* Toggle Switch (OFF by default) */}
          <div className="flex items-center gap-2.5">
            <span className={`text-xs font-medium ${isBatchEnabled ? 'text-blue-400' : 'text-zinc-500'}`}>
              {isBatchEnabled ? 'On' : 'Off'}
            </span>

            <button
              type="button"
              onClick={() => setIsBatchEnabled(!isBatchEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isBatchEnabled ? 'bg-blue-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isBatchEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

        </div>

        {/* --- STATE 1: Toggle is OFF (Default Mode) -> Clean Card with Download All Button BELOW --- */}
        {!isBatchEnabled && (
          <div className="pt-5 space-y-4">
            
            {/* Playlist Summary & Format Bar */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">
                    Full Playlist Batch Download
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Download all {totalVideos} videos in sequence
                  </p>
                </div>
              </div>

              {/* Format Selector Pills */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setFormat('mp4')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                      format === 'mp4' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Video (MP4)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('mp3')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                      format === 'mp3' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>Audio (MP3)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Batch Progress Bar (if active) */}
            {isDownloadingBatch && (
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-left space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span className="truncate max-w-md font-medium">Downloading: {batchProgress.currentTitle}</span>
                  <span className="font-mono font-bold text-blue-400">{batchProgress.current} / {batchProgress.total}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-200"
                    style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Master Download All Button Placed BELOW */}
            <div>
              <button
                type="button"
                onClick={handleDownloadAll}
                disabled={isDownloadingBatch}
                className={`w-full min-h-[48px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-[0.99] ${
                  isDownloadingBatch
                    ? 'bg-zinc-800 text-zinc-400 cursor-wait'
                    : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/20'
                }`}
              >
                {isDownloadingBatch ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Downloading ({batchProgress.current} of {batchProgress.total})...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download All ({totalVideos}) Videos</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* --- STATE 2: Toggle is ON -> Custom Selection with Download Button BELOW the list --- */}
        {isBatchEnabled && (
          <div className="pt-5 space-y-4">
            
            {/* Top Selection & Format Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              
              {/* Select / Deselect All Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700 transition-all"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>Select All</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700 transition-all"
                >
                  <Square className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Deselect All</span>
                </button>

                <span className="text-xs text-zinc-400 ml-1 font-mono">
                  {selectedCount} of {totalVideos} selected
                </span>
              </div>

              {/* Format Toggle */}
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setFormat('mp4')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                      format === 'mp4' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Video (MP4)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('mp3')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                      format === 'mp3' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>Audio (MP3)</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Progress Bar (if downloading) */}
            {isDownloadingBatch && (
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-left space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span className="truncate max-w-md font-medium">Downloading: {batchProgress.currentTitle}</span>
                  <span className="font-mono font-bold text-blue-400">{batchProgress.current} / {batchProgress.total}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-200"
                    style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Videos List */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {playlistData.videos.map((item) => {
                const isChecked = selectedIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleSelect(item.id)}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 select-none cursor-pointer ${
                      isChecked
                        ? 'bg-blue-950/20 border-blue-500/40'
                        : 'bg-zinc-950/50 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      
                      {/* Checkbox */}
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-blue-600 border-blue-500 text-white' : 'border-zinc-600 bg-zinc-900'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      {/* Thumbnail & Index */}
                      <div className="relative w-14 h-9 rounded overflow-hidden shrink-0 border border-zinc-800 bg-zinc-900">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono px-0.5 rounded bg-black/80 text-zinc-300">
                          #{item.index}
                        </span>
                      </div>

                      {/* Title & Duration */}
                      <div className="text-left min-w-0">
                        <h4 className="text-xs sm:text-sm font-medium text-white truncate max-w-md">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 flex items-center gap-2">
                          <span>{item.author}</span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1 text-zinc-400 font-mono">
                            <Clock className="w-3 h-3" />
                            {item.durationFormatted}
                          </span>
                        </p>
                      </div>

                    </div>

                    {/* Single Track Download Trigger */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const API_BASE = import.meta.env.VITE_API_URL || (window.location.port === '3000' ? 'http://127.0.0.1:5000' : '');
                        const directUrl = `${API_BASE}/api/download?videoId=${item.videoId}&format=${format}&quality=highest&trim=0`;
                        triggerBrowserDownload(directUrl, `Amyth_${item.videoId}.${format}`);
                        onShowToast?.(`Downloading track #${item.index}...`, 'info');
                      }}
                      className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shrink-0"
                      title="Download single track directly at highest quality"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                  </div>
                );
              })}
            </div>

            {/* --- The Download Selected Button BELOW the Playlist List --- */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDownloadSelected}
                disabled={isDownloadingBatch || selectedCount === 0}
                className={`w-full min-h-[48px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-[0.99] ${
                  selectedCount === 0 || isDownloadingBatch
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/20'
                }`}
              >
                {isDownloadingBatch ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Downloading Selected ({batchProgress.current}/{batchProgress.total})...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Selected ({selectedCount} of {totalVideos}) Videos</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
