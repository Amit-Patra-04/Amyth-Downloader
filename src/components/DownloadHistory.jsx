import React from 'react';
import { X, Trash2, Download, Clock, HardDrive } from 'lucide-react';
import { formatTimeHMS } from '../services/youtubeService';

export default function DownloadHistory({
  isOpen,
  onClose,
  history = [],
  onClearHistory,
  onReDownload,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl z-10 flex flex-col h-full overflow-hidden text-left">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">
                Download History
              </h3>
              <p className="text-[11px] text-zinc-400">
                {history.length} {history.length === 1 ? 'item' : 'items'} saved locally
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <HardDrive className="w-10 h-10 text-zinc-600 mb-2" />
              <p className="font-medium text-zinc-300 text-sm mb-0.5">
                No recent downloads
              </p>
              <p className="text-xs text-zinc-500 max-w-xs">
                Downloaded videos and audio will appear here for quick access.
              </p>
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col gap-2"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-14 h-10 object-cover rounded-lg shrink-0 border border-zinc-800"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-white truncate leading-tight mb-1">
                      {item.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="px-1.5 py-0.2 rounded font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {item.quality} • {item.format.toUpperCase()}
                      </span>
                      {item.isTrimmed && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800/40">
                          Trimmed ({formatTimeHMS(item.trimDuration, item.trimDuration)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  
                  <button
                    onClick={() => onReDownload(item)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-xs font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Again</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {history.length > 0 && (
          <div className="p-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors px-2.5 py-1.5 rounded-lg bg-red-950/30 border border-red-900/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
