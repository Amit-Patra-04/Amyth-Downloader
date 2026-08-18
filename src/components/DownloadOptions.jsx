import React, { useState, useEffect } from 'react';
import { Film, Music, Download, CheckCircle2, Lock, AlertTriangle, Loader2, Sparkles, Scissors, HardDrive, ListVideo } from 'lucide-react';
import VideoTrimmer from './VideoTrimmer';
import PlaylistSelector from './PlaylistSelector';
import { getApiBaseUrl } from '../config';

const VIDEO_QUALITIES = [
  { id: '2160p', label: '4K Ultra HD', resolution: '3840x2160', height: 2160, badge: '4K', fallbackKbps: 18000 },
  { id: '1440p', label: '2K Quad HD', resolution: '2560x1440', height: 1440, badge: '2K', fallbackKbps: 8000 },
  { id: '1080p', label: '1080p Full HD', resolution: '1920x1080', height: 1080, badge: 'FHD', fallbackKbps: 3500 },
  { id: '720p', label: '720p HD', resolution: '1280x720', height: 720, badge: 'HD', fallbackKbps: 1800 },
  { id: '480p', label: '480p SD', resolution: '854x480', height: 480, badge: 'SD', fallbackKbps: 900 },
  { id: '360p', label: '360p SD', resolution: '640x360', height: 360, badge: 'SD', fallbackKbps: 500 },
];

const AUDIO_QUALITIES = [
  { id: '320kbps', label: '320 kbps', desc: 'Ultra High Quality MP3', badge: '320k', fallbackKbps: 320 },
  { id: '256kbps', label: '256 kbps', desc: 'High Quality Audio', badge: '256k', fallbackKbps: 256 },
  { id: '192kbps', label: '192 kbps', desc: 'Standard Quality Audio', badge: '192k', fallbackKbps: 192 },
  { id: '128kbps', label: '128 kbps', desc: 'Compressed / Small Size', badge: '128k', fallbackKbps: 128 },
];

export default function DownloadOptions({ videoInfo, url }) {
  if (!videoInfo) return null;

  const maxVideoHeight = videoInfo.maxVideoHeight || 720;
  const isPlaylist = !!videoInfo.isPlaylist;

  // State
  const [format, setFormat] = useState('mp4'); // 'mp4' | 'mp3'
  const [selectedQuality, setSelectedQuality] = useState('720p');
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');
  
  // Trimmer state for single video
  const [trimState, setTrimState] = useState({ enabled: false, startTime: 0, endTime: 0 });

  // Playlist selection state for playlist links (Default toggle is OFF)
  const [playlistState, setPlaylistState] = useState({
    enabled: false,
    selectedIndices: [],
    selectedCount: 0,
    totalCount: 0,
  });

  // Calculate duration to estimate sizes
  let activeDurationSeconds = videoInfo.durationSeconds || 0;

  if (isPlaylist && playlistState.enabled && videoInfo.playlistVideos) {
    const selectedVideos = videoInfo.playlistVideos.filter((v) =>
      playlistState.selectedIndices.includes(v.index)
    );
    activeDurationSeconds = selectedVideos.reduce((acc, v) => acc + (v.duration || 0), 0);
  } else if (!isPlaylist && trimState.enabled && trimState.endTime > trimState.startTime) {
    activeDurationSeconds = trimState.endTime - trimState.startTime;
  }

  // Get REAL exact estimated size string directly from YouTube format stream sizes
  const getEstimatedSize = (targetHeight, isAudio = false, fallbackKbps = 1000) => {
    let sizeInBytes = 0;
    const totalSecs = videoInfo.durationSeconds || 1;

    if (videoInfo.estimatedSizes) {
      if (isAudio) {
        sizeInBytes = videoInfo.estimatedSizes.audio || 0;
      } else {
        sizeInBytes = videoInfo.estimatedSizes[targetHeight] || 0;
      }
    }

    // Fallback calculation if estimatedSizes is missing
    if (!sizeInBytes || sizeInBytes <= 0) {
      if (totalSecs > 0) {
        sizeInBytes = (fallbackKbps * totalSecs * 1000) / 8;
      }
    }

    if (!sizeInBytes || sizeInBytes <= 0) return 'N/A';

    // Scale size proportionally if clip is trimmed or playlist selection is active
    if (activeDurationSeconds > 0 && totalSecs > 0 && (trimState.enabled || playlistState.enabled)) {
      sizeInBytes = (sizeInBytes * activeDurationSeconds) / totalSecs;
    }

    const sizeInMB = sizeInBytes / (1024 * 1024);
    if (sizeInMB >= 1024) {
      return `~${(sizeInMB / 1024).toFixed(2)} GB`;
    }
    if (sizeInMB < 0.1) {
      return '< 0.1 MB';
    }
    return `~${sizeInMB.toFixed(1)} MB`;
  };

  // Auto-select highest available valid resolution on load
  useEffect(() => {
    if (format === 'mp4') {
      const validQuality = VIDEO_QUALITIES.find(q => q.height <= maxVideoHeight);
      if (validQuality) {
        setSelectedQuality(validQuality.id);
      } else {
        setSelectedQuality('720p');
      }
    } else {
      setSelectedQuality('320kbps');
    }
  }, [format, maxVideoHeight]);

  const handleDownload = () => {
    if (!url || downloading) return;

    if (isPlaylist && playlistState.enabled && playlistState.selectedIndices.length === 0) {
      alert('Please select at least one video from the playlist to download.');
      return;
    }

    setDownloading(true);
    setDownloadStatus('');

    const baseUrl = getApiBaseUrl();
    const cleanUrl = url.trim();

    const params = new URLSearchParams();
    params.append('url', cleanUrl);
    params.append('type', format);

    if (format === 'mp4') {
      const qObj = VIDEO_QUALITIES.find((q) => q.id === selectedQuality);
      params.append('quality', qObj ? String(qObj.height) : '720');
    } else {
      params.append('quality', selectedQuality);
    }

    // Playlist custom selection parameters
    if (isPlaylist && playlistState.enabled && playlistState.selectedIndices.length > 0) {
      params.append('playlistIndices', playlistState.selectedIndices.join(','));
    }

    // Custom timestamps trimming parameters (only for single videos)
    if (!isPlaylist && trimState.enabled && trimState.endTime > trimState.startTime) {
      params.append('startTime', String(trimState.startTime));
      params.append('endTime', String(trimState.endTime));
    }

    const downloadUrl = `${baseUrl}/api/download?${params.toString()}`;

    // Direct Browser Download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show friendly success confirmation toast after starting
    setTimeout(() => {
      setDownloading(false);
      setDownloadStatus('Download initiated! Your browser is downloading the file.');
      setTimeout(() => setDownloadStatus(''), 8000);
    }, 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/10 text-left">
      
      {/* Format Selector Pill Switch */}
      <div className="flex items-center justify-center mb-6 sm:mb-8">
        <div className="flex p-1.5 rounded-2xl bg-[#0c0d15] border border-white/10 w-full max-w-md shadow-inner">
          <button
            type="button"
            onClick={() => setFormat('mp4')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
              format === 'mp4'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Video (MP4)</span>
          </button>

          <button
            type="button"
            onClick={() => setFormat('mp3')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
              format === 'mp3'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Audio (MP3)</span>
          </button>
        </div>
      </div>

      {/* Conditional Sub-Feature: Playlist Multi-Selector OR Video Trimmer */}
      {isPlaylist ? (
        <PlaylistSelector
          videoInfo={videoInfo}
          onPlaylistSelectionChange={setPlaylistState}
        />
      ) : (
        <VideoTrimmer
          videoInfo={videoInfo}
          onTrimChange={setTrimState}
        />
      )}

      {/* Quality Selection Grid */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>{format === 'mp4' ? 'Select Video Resolution & Size' : 'Select Audio Quality & Bitrate'}</span>
          </h4>
          {format === 'mp4' && !isPlaylist && (
            <span className="text-[11px] sm:text-xs text-slate-400 font-mono">
              Max Quality: <strong className="text-rose-400 font-bold">{maxVideoHeight}p</strong>
            </span>
          )}
        </div>

        {format === 'mp4' ? (
          /* VIDEO QUALITIES GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {VIDEO_QUALITIES.map((q) => {
              const isBlocked = !isPlaylist && q.height > maxVideoHeight;
              const isSelected = selectedQuality === q.id && !isBlocked;
              const estSize = getEstimatedSize(q.height, false, q.fallbackKbps);

              return (
                <div
                  key={q.id}
                  onClick={() => {
                    if (!isBlocked) {
                      setSelectedQuality(q.id);
                    }
                  }}
                  className={`relative p-4 rounded-2xl border transition-all duration-200 ${
                    isBlocked
                      ? 'bg-red-950/20 border-red-500/20 cursor-not-allowed opacity-75'
                      : isSelected
                      ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/50 shadow-lg shadow-rose-500/10 cursor-pointer'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm sm:text-base ${isBlocked ? 'text-slate-400' : 'text-slate-100'}`}>
                          {q.label}
                        </span>
                        <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                          isBlocked ? 'bg-slate-800 text-slate-500' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {q.badge}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-mono">{q.resolution}</p>
                    </div>

                    <div>
                      {isBlocked ? (
                        <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400" title="Blocked quality option">
                          <Lock className="w-4 h-4" />
                        </div>
                      ) : isSelected ? (
                        <div className="p-1 rounded-full bg-rose-500 text-white">
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Estimated Size Badge */}
                  {!isBlocked && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] sm:text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                        <HardDrive className="w-3 h-3 text-emerald-400" />
                        <span>Est. Size: {estSize}</span>
                      </span>
                    </div>
                  )}

                  {/* Blocked Notification text */}
                  {isBlocked && (
                    <div className="mt-3 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] sm:text-[11px] text-red-300 flex items-start gap-1.5 leading-tight">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <span>Original upload does not exceed {maxVideoHeight}p.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* AUDIO QUALITIES GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {AUDIO_QUALITIES.map((q) => {
              const isSelected = selectedQuality === q.id;
              const estSize = getEstimatedSize(0, true, q.fallbackKbps);

              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuality(q.id)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/10'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-slate-100">{q.label}</span>
                        <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded font-mono font-semibold bg-purple-500/20 text-purple-300">
                          {q.badge}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-400 mt-1">{q.desc}</p>
                    </div>

                    {isSelected && (
                      <div className="p-1 rounded-full bg-purple-500 text-white">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    )}
                  </div>

                  {/* Estimated Audio Size Badge */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                      <HardDrive className="w-3 h-3 text-emerald-400" />
                      <span>Est. Size: {estSize}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Processing Banner (Visible during downloading) */}
      {downloading && (
        <div className="mb-4 sm:mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-center justify-center gap-2.5 animate-pulse">
          <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
          <span>Processing & merging high-quality streams... Download will start automatically in your browser.</span>
        </div>
      )}

      {/* Download Success Banner (Visible AFTER processing completes) */}
      {!downloading && downloadStatus && (
        <div className="mb-4 sm:mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center justify-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadStatus}</span>
        </div>
      )}

      {/* Download Action Trigger Button */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className={`w-full py-4 px-6 sm:px-8 rounded-2xl font-black text-sm sm:text-base md:text-lg text-white transition-all shadow-xl flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99] ${
          format === 'mp4'
            ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-400 shadow-rose-600/35 hover:shadow-rose-600/50'
            : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-400 shadow-purple-600/35 hover:shadow-purple-600/50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {downloading ? (
          <>
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            <span>Processing Media Streams...</span>
          </>
        ) : (
          <>
            {isPlaylist ? <ListVideo className="w-5 h-5 shrink-0" /> : trimState.enabled ? <Scissors className="w-5 h-5 shrink-0" /> : <Download className="w-5 h-5 shrink-0" />}
            <span className="leading-tight">
              {isPlaylist
                ? playlistState.enabled
                  ? `Download Selected from Playlist (${playlistState.selectedCount} Videos) • ${format.toUpperCase()} (${selectedQuality})`
                  : `Download Full Playlist • ${format.toUpperCase()} (${selectedQuality})`
                : trimState.enabled
                ? `Download Trimmed Clip • ${format.toUpperCase()} (${selectedQuality})`
                : `Download ${format.toUpperCase()} (${selectedQuality})`}
            </span>
          </>
        )}
      </button>
    </div>
  );
}
