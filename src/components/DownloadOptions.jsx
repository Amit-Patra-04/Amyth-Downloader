import React, { useState, useEffect } from 'react';
import { Film, Music, Download, Check, Lock, Loader2, HardDrive, ListVideo, Scissors } from 'lucide-react';
import VideoTrimmer from './VideoTrimmer';
import PlaylistSelector from './PlaylistSelector';
import { getApiBaseUrl } from '../config';

const VIDEO_QUALITIES = [
  { id: '2160p', label: '4K Ultra HD', resolution: '3840x2160', height: 2160, badge: '4K', fallbackKbps: 18000 },
  { id: '1440p', label: '2K Quad HD', resolution: '2560x1440', height: 1440, badge: '2K', fallbackKbps: 8000 },
  { id: '1080p', label: '1080p Full HD', resolution: '1920x1080', height: 1080, badge: '1080p', fallbackKbps: 3500 },
  { id: '720p', label: '720p HD', resolution: '1280x720', height: 720, badge: '720p', fallbackKbps: 1800 },
  { id: '480p', label: '480p SD', resolution: '854x480', height: 480, badge: '480p', fallbackKbps: 900 },
  { id: '360p', label: '360p SD', resolution: '640x360', height: 360, badge: '360p', fallbackKbps: 500 },
];

const AUDIO_QUALITIES = [
  { id: '320kbps', label: '320 kbps', desc: 'Original Studio Quality', badge: '320k', fallbackKbps: 320 },
  { id: '256kbps', label: '256 kbps', desc: 'High Quality MP3', badge: '256k', fallbackKbps: 256 },
  { id: '192kbps', label: '192 kbps', desc: 'Standard MP3', badge: '192k', fallbackKbps: 192 },
  { id: '128kbps', label: '128 kbps', desc: 'Compact / Small File', badge: '128k', fallbackKbps: 128 },
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

  // Playlist selection state
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

  // Get estimated size
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

    if (!sizeInBytes || sizeInBytes <= 0) {
      if (totalSecs > 0) {
        sizeInBytes = (fallbackKbps * totalSecs * 1000) / 8;
      }
    }

    if (!sizeInBytes || sizeInBytes <= 0) return 'N/A';

    if (activeDurationSeconds > 0 && totalSecs > 0 && (trimState.enabled || playlistState.enabled)) {
      sizeInBytes = (sizeInBytes * activeDurationSeconds) / totalSecs;
    }

    const sizeInMB = sizeInBytes / (1024 * 1024);
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(1)} GB`;
    }
    if (sizeInMB < 0.1) {
      return '< 0.1 MB';
    }
    return `${sizeInMB.toFixed(1)} MB`;
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

    // Playlist custom selection
    if (isPlaylist && playlistState.enabled && playlistState.selectedIndices.length > 0) {
      params.append('playlistIndices', playlistState.selectedIndices.join(','));
    }

    // Custom timestamps
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

    setTimeout(() => {
      setDownloading(false);
      setDownloadStatus(
        trimState.enabled
          ? 'Fast stream trimming applied! Your clip will begin saving shortly.'
          : 'Download initiated in your browser.'
      );
      setTimeout(() => setDownloadStatus(''), 7000);
    }, 2500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl p-4 sm:p-6 mb-8 border border-zinc-200 bg-white shadow-xs text-left">
      
      {/* Format Selector Segmented Switch */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex p-1 rounded-xl bg-zinc-100 border border-zinc-200/80 w-full max-w-xs shadow-inner">
          <button
            type="button"
            onClick={() => setFormat('mp4')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              format === 'mp4'
                ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Video (MP4)</span>
          </button>

          <button
            type="button"
            onClick={() => setFormat('mp3')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              format === 'mp3'
                ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-semibold text-zinc-800">
            {format === 'mp4' ? 'Available Resolutions' : 'Audio Bitrate'}
          </span>
          {format === 'mp4' && !isPlaylist && (
            <span className="text-zinc-500 font-mono">
              Original limit: <span className="text-zinc-900 font-semibold">{maxVideoHeight}p</span>
            </span>
          )}
        </div>

        {format === 'mp4' ? (
          /* VIDEO QUALITIES GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
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
                  className={`relative p-3.5 rounded-xl border transition-all ${
                    isBlocked
                      ? 'bg-zinc-50 border-zinc-200/60 text-zinc-400 opacity-45 cursor-not-allowed'
                      : isSelected
                      ? 'bg-red-50/40 border-red-500 ring-1 ring-red-500/20 shadow-xs cursor-pointer'
                      : 'bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 shadow-xs cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${isBlocked ? 'text-zinc-400' : isSelected ? 'text-zinc-950 font-bold' : 'text-zinc-800'}`}>
                          {q.label}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          isBlocked ? 'bg-zinc-100 text-zinc-400' : isSelected ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {q.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">{q.resolution}</p>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Estimated Size */}
                  {!isBlocked && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                      <HardDrive className="w-3 h-3 text-zinc-400" />
                      <span>{estSize}</span>
                    </div>
                  )}

                  {/* Blocked message */}
                  {isBlocked && (
                    <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-zinc-400" />
                      <span>Not available for this video</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* AUDIO QUALITIES GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {AUDIO_QUALITIES.map((q) => {
              const isSelected = selectedQuality === q.id;
              const estSize = getEstimatedSize(0, true, q.fallbackKbps);

              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuality(q.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-50/40 border-red-500 ring-1 ring-red-500/20 shadow-xs'
                      : 'bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${isSelected ? 'text-zinc-950 font-bold' : 'text-zinc-800'}`}>{q.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          isSelected ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {q.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{q.desc}</p>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                    <HardDrive className="w-3 h-3 text-zinc-400" />
                    <span>{estSize}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Processing State */}
      {downloading && (
        <div className="mb-4 p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 text-zinc-600 animate-spin shrink-0" />
          <span>Processing video stream... Download will begin shortly.</span>
        </div>
      )}

      {/* Success State */}
      {!downloading && downloadStatus && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadStatus}</span>
        </div>
      )}

      {/* Download Action Trigger Button */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="w-full py-3.5 px-6 rounded-xl font-medium text-sm text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {downloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {isPlaylist ? <ListVideo className="w-4 h-4 shrink-0" /> : trimState.enabled ? <Scissors className="w-4 h-4 shrink-0" /> : <Download className="w-4 h-4 shrink-0" />}
            <span>
              {isPlaylist
                ? playlistState.enabled
                  ? `Download Selected (${playlistState.selectedCount} Videos) • ${format.toUpperCase()} (${selectedQuality})`
                  : `Download Playlist • ${format.toUpperCase()} (${selectedQuality})`
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
