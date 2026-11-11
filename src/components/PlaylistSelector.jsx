import React, { useState, useEffect } from 'react';
import { ListVideo, CheckSquare, Square, Search, Check } from 'lucide-react';

export default function PlaylistSelector({ videoInfo, onPlaylistSelectionChange }) {
  if (!videoInfo || !videoInfo.isPlaylist || !videoInfo.playlistVideos) return null;

  const playlistVideos = videoInfo.playlistVideos || [];
  const totalCount = playlistVideos.length;

  const [enabled, setEnabled] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState(
    playlistVideos.map((v) => v.index)
  );
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredVideos = playlistVideos.filter((v) =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full rounded-2xl p-4 sm:p-5 mb-6 border border-zinc-200 bg-zinc-50/50 text-left">
      {/* Header Toggle Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-lg transition-colors shrink-0 ${enabled ? 'bg-zinc-200 text-zinc-900' : 'bg-zinc-100 text-zinc-500'}`}>
            <ListVideo className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-zinc-900 flex items-center gap-2 text-sm">
              <span>Select Playlist Videos</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200/80 text-zinc-700 font-mono">
                {totalCount} videos
              </span>
            </h4>
            <p className="text-xs text-zinc-500">Choose specific videos to download from this playlist</p>
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
          <div className="w-10 h-5.5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all after:shadow-xs peer-checked:bg-red-600"></div>
        </label>
      </div>

      {/* Playlist Content */}
      {enabled && (
        <div className="mt-4 pt-4 border-t border-zinc-200 space-y-3">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-50 text-xs text-zinc-700 transition-colors cursor-pointer border border-zinc-200 shadow-xs"
              >
                <CheckSquare className="w-3.5 h-3.5 text-zinc-600" />
                <span>Select All ({totalCount})</span>
              </button>

              <button
                type="button"
                onClick={handleDeselectAll}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-50 text-xs text-zinc-700 transition-colors cursor-pointer border border-zinc-200 shadow-xs"
              >
                <Square className="w-3.5 h-3.5 text-zinc-400" />
                <span>Deselect All</span>
              </button>
            </div>

            <div className="text-xs font-mono text-zinc-600">
              Selected: <span className="text-zinc-900 font-semibold">{selectedIndices.length}</span> / {totalCount}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter playlist videos..."
              className="w-full bg-white border border-zinc-200 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-colors"
            />
          </div>

          {/* Video List */}
          <div className="max-h-72 overflow-y-auto space-y-1.5 rounded-xl bg-white border border-zinc-200 p-2 shadow-xs">
            {filteredVideos.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">No matching videos</p>
            ) : (
              filteredVideos.map((video) => {
                const isSelected = selectedIndices.includes(video.index);

                return (
                  <div
                    key={video.id || video.index}
                    onClick={() => toggleVideoSelection(video.index)}
                    className={`flex items-center gap-3 p-2 rounded-lg border transition-colors cursor-pointer select-none ${
                      isSelected
                        ? 'bg-red-50/50 border-red-200 text-zinc-900'
                        : 'bg-zinc-50/40 border-zinc-150 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/60'
                    }`}
                  >
                    <div
                      className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'border-zinc-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <span className="text-[11px] font-mono text-zinc-400 shrink-0 w-5">
                      #{video.index}
                    </span>

                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-12 aspect-video object-cover rounded bg-zinc-100 shrink-0 border border-zinc-200"
                    />

                    <span className="text-xs font-medium truncate flex-1 leading-snug">
                      {video.title}
                    </span>

                    {video.durationFormatted && (
                      <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                        {video.durationFormatted}
                      </span>
                    )}
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
