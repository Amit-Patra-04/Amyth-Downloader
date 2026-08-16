import React, { useState } from 'react';
import { 
  Film, 
  Music, 
  Download, 
  CheckCircle2, 
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FormatQualitySelector({
  videoData,
  onStartDownload,
  isDownloading,
  activeDownloadQuality,
  trimSettings,
}) {
  const [selectedFormat, setSelectedFormat] = useState('mp4'); // 'mp4' | 'mp3'
  const [selectedQuality, setSelectedQuality] = useState('1080p');

  const handleFormatChange = (format) => {
    setSelectedFormat(format);
    if (format === 'mp4') {
      setSelectedQuality('1080p');
    } else {
      setSelectedQuality('320kbps');
    }
  };

  const handleSelectQuality = (qualityItem) => {
    setSelectedQuality(qualityItem.id);
  };

  const handleDownloadClick = () => {
    if (isDownloading) return;

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {}

    onStartDownload({
      format: selectedFormat,
      quality: selectedQuality,
      trim: trimSettings,
    });
  };

  const currentItems = selectedFormat === 'mp4' ? videoData.videoQualities : videoData.audioQualities;
  const activeQualityObj = currentItems.find((item) => item.id === selectedQuality);

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      
      {/* Format Switcher Tabs */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <button
          onClick={() => handleFormatChange('mp4')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            selectedFormat === 'mp4'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Video (MP4)</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded bg-black/20 text-blue-100">
            Up to 4K
          </span>
        </button>

        <button
          onClick={() => handleFormatChange('mp3')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            selectedFormat === 'mp3'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Audio (MP3)</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded bg-black/20 text-blue-100">
            320 kbps
          </span>
        </button>
      </div>

      {/* Main Options Panel */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-6 shadow-sm text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
          <h3 className="font-semibold text-sm sm:text-base text-white flex items-center gap-2">
            <span>{selectedFormat === 'mp4' ? 'Select Video Resolution' : 'Select Audio Bitrate'}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/40 font-mono">
              Direct Local Download
            </span>
          </h3>
          <span className="text-xs text-zinc-400">
            {selectedFormat === 'mp4' ? 'Direct MP4 Stream' : 'High Fidelity MP3'}
          </span>
        </div>

        {/* Quality Cards Grid (Clean layout without file sizes) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          {currentItems.map((item) => {
            const isSelected = selectedQuality === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectQuality(item)}
                className={`relative rounded-xl p-3.5 sm:p-4 transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/10 border-2 border-blue-500 shadow-sm'
                    : 'bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">
                      {item.id}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${item.badgeClass}`}>
                      {item.tag}
                    </span>
                  </div>

                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-700" />
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* The Single Master Direct Download Action Box */}
        <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              {selectedFormat === 'mp4' ? (
                <Film className="w-5 h-5 text-blue-400" />
              ) : (
                <Music className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">
                  {selectedQuality} &bull; {selectedFormat.toUpperCase()}
                </span>
                {trimSettings?.enabled && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50">
                    Trimmed
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                1-Click download directly to your computer
              </p>
            </div>
          </div>

          {/* Single Download Button */}
          <button
            onClick={handleDownloadClick}
            disabled={isDownloading || !activeQualityObj}
            className={`w-full sm:w-auto min-w-[220px] min-h-[46px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              isDownloading
                ? 'bg-zinc-800 text-zinc-400 cursor-wait'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md hover:shadow-blue-500/20 active:scale-[0.98]'
            }`}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Starting Download...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {selectedQuality} {selectedFormat.toUpperCase()}</span>
              </>
            )}
          </button>

        </div>

      </div>

    </div>
  );
}
