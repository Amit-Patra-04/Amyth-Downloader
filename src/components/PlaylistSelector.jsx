import React, { useState, useEffect } from 'react';
import { ListVideo, CheckSquare, Square, Search, Check, Clock } from 'lucide-react';

export default function PlaylistSelector({ videoInfo, onPlaylistSelectionChange }) {
  if (!videoInfo || !videoInfo.isPlaylist || !videoInfo.playlistVideos) return null;

  const playlistVideos = videoInfo.playlistVideos || [];
  const totalCount = playlistVideos.length;

  // States (by default toggle is OFF)
  const [enabled, setEnabled] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState(
    playlistVideos.map((v) => v.index)
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Notify parent whenever selection changes
  useEffect(() => {
    onPlaylistSelectionChange({
      enabled,
      selectedIndices,
      selectedCount: selectedIndices.length,
      totalCount,
    });
  }, [enabled, selectedIndices, totalCount]);

  const handleSelectAll = () => {
    setSelectedIndices(playlistVideos.map((v) => v.index));
  };

  const handleDeselectAll = () => {
    setSelectedIndices([]);
  };

  const toggleVideoSelection = (index) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index].sort((a, b) => a - b));
    }
  };

  // Filter videos by search term
  const filteredVideos = playlistVideos.filter((v) =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full glass-panel rounded-3xl p-4 sm:p-5 mb-6 sm:mb-8 border border-white/10 transition-all">
      {/* Header Toggle Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-2 rounded-xl transition-all shrink-0 ${enabled ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-500/10' : 'bg-white/5 text-slate-400'}`}>
            <ListVideo className="w-5 h-5" />
          </div>
          <div className="text-left min-w-0">
            <h4 className="font-bold text-slate-100 flex flex-wrap items-center gap-1.5 text-xs sm:text-base leading-tight">
              <span>Download the Selected from Playlist</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono font-medium shrink-0">
                Playlist ({totalCount})
              </span>
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Choose specific videos from this playlist to download</p>
          </div>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
        </label>
      </div>

      {/* Playlist Content (Visible when enabled) */}
      {enabled && (
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10 space-y-3.5 text-left">
          {/* Action Bar: Select All / Deselect All & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Select All ({totalCount})</span>
              </button>

              <button
                type="button"
                onClick={handleDeselectAll}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 text-slate-400" />
                <span>Deselect All</span>
              </button>
            </div>

            {/* Selection Counter Badge */}
            <div className="text-xs font-mono font-medium px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-center">
              Selected: <strong className="text-emerald-400 font-bold">{selectedIndices.length}</strong> / {totalCount} Videos
            </div>
          </div>

          {/* Search Box inside playlist */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search video titles in playlist..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Playlist Video Items List Container */}
          <div className="max-h-72 sm:max-h-80 overflow-y-auto pr-1 space-y-2 rounded-2xl bg-black/30 border border-white/5 p-2 custom-scrollbar">
            {filteredVideos.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No videos found matching "{searchTerm}"</p>
            ) : (
              filteredVideos.map((video) => {
                const isSelected = selectedIndices.includes(video.index);

                return (
                  <div
                    key={video.id || video.index}
                    onClick={() => toggleVideoSelection(video.index)}
                    className={`flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-rose-500/10 border-rose-500/40 text-slate-100 shadow-sm'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                        isSelected
                          ? 'bg-rose-600 border-rose-500 text-white shadow-md'
                          : 'border-white/20 bg-black/40'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    {/* Video Index */}
                    <span className="text-xs font-mono font-bold text-slate-400 w-5 shrink-0 text-center">
                      #{video.index}
                    </span>

                    {/* Thumbnail */}
                    <div className="relative w-14 sm:w-16 h-9 sm:h-10 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-white/10">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Title & Duration */}
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-semibold line-clamp-1 leading-snug">
                        {video.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-500 mt-0.5 font-mono">
                        {video.durationFormatted && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-rose-400 shrink-0" />
                            <span>{video.durationFormatted}</span>
                          </span>
                        )}
                        <span className="truncate">{video.uploader}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
