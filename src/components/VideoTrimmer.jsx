import React, { useState, useEffect } from 'react';
import { Scissors, Clock, RotateCcw, Play, Check } from 'lucide-react';

export default function VideoTrimmer({ videoInfo, onTrimChange }) {
  if (!videoInfo || !videoInfo.durationSeconds) return null;

  const totalDuration = Math.floor(videoInfo.durationSeconds);
  const videoId = videoInfo.id;

  // Numeric states in seconds
  const [enabled, setEnabled] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(totalDuration);

  // String input states for hh:mm:ss format
  const [startInput, setStartInput] = useState('00:00');
  const [endInput, setEndInput] = useState('00:00');

  // Success feedback state
  const [appliedToast, setAppliedToast] = useState(false);

  // Format seconds into hh:mm:ss or mm:ss
  const formatTime = (secs) => {
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

  const parseAnyTimestampToSeconds = (rawStr) => {
    if (!rawStr || typeof rawStr !== 'string') return 0;
    const clean = rawStr.trim();
    if (!clean) return 0;

    const parts = clean.split(':').map(p => parseInt(p.trim(), 10) || 0);

    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
      return parts[0];
    }
    return 0;
  };

  useEffect(() => {
    setEndTime(totalDuration);
    setStartInput(formatTime(0));
    setEndInput(formatTime(totalDuration));
  }, [totalDuration]);

  useEffect(() => {
    onTrimChange({
      enabled,
      startTime,
      endTime,
    });
  }, [enabled, startTime, endTime]);

  const handleStartChange = (val) => {
    const num = Math.max(0, Math.min(parseInt(val, 10) || 0, endTime - 1));
    setStartTime(num);
    setStartInput(formatTime(num));
  };

  const handleEndChange = (val) => {
    const num = Math.min(totalDuration, Math.max(parseInt(val, 10) || 0, startTime + 1));
    setEndTime(num);
    setEndInput(formatTime(num));
  };

  const handleStartInputChange = (val) => {
    setStartInput(val);
  };

  const handleEndInputChange = (val) => {
    setEndInput(val);
  };

  const handleCommitStartInput = () => {
    const secs = parseAnyTimestampToSeconds(startInput);
    const validSecs = Math.max(0, Math.min(secs, endTime - 1));
    setStartTime(validSecs);
    setStartInput(formatTime(validSecs));
  };

  const handleCommitEndInput = () => {
    const secs = parseAnyTimestampToSeconds(endInput);
    const validSecs = Math.min(totalDuration, Math.max(secs, startTime + 1));
    setEndTime(validSecs);
    setEndInput(formatTime(validSecs));
  };

  const handleInputKeyDown = (e, onCommit) => {
    if (e.key === 'Enter') {
      onCommit();
    }
  };

  const handleApplyClick = () => {
    handleCommitStartInput();
    handleCommitEndInput();
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 2000);
  };

  const handleReset = () => {
    setStartTime(0);
    setEndTime(totalDuration);
    setStartInput(formatTime(0));
    setEndInput(formatTime(totalDuration));
  };

  const clipDuration = Math.max(0, endTime - startTime);
  const startPercent = totalDuration > 0 ? Math.min(100, Math.max(0, (startTime / totalDuration) * 100)) : 0;
  const endPercent = totalDuration > 0 ? Math.min(100, Math.max(0, (endTime / totalDuration) * 100)) : 100;
  const rangeWidth = Math.max(0, endPercent - startPercent);

  const embedUrl = videoId 
    ? `https://www.youtube-nocookie.com/embed/${videoId}?start=${startTime}&end=${endTime}&playsinline=1&enablejsapi=1&autoplay=0&rel=0&controls=1&modestbranding=1&fs=1`
    : '';

  return (
    <div className="w-full rounded-2xl p-4 sm:p-5 mb-6 border border-zinc-200 bg-zinc-50/50 text-left">
      {/* Toggle Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors ${enabled ? 'bg-zinc-200 text-zinc-900' : 'bg-zinc-100 text-zinc-500'}`}>
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-medium text-zinc-900 flex items-center gap-2 text-sm">
              <span>Precision Trimmer</span>
              {enabled && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-mono font-medium">
                  Active
                </span>
              )}
            </h4>
            <p className="text-xs text-zinc-500">Cut and download a specific segment</p>
          </div>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-5.5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all after:shadow-xs peer-checked:bg-red-600"></div>
        </label>
      </div>

      {/* Trimmer Controls Body */}
      {enabled && (
        <div className="mt-5 pt-5 border-t border-zinc-200 space-y-4">
          
          {/* Preview Video Player */}
          {videoId && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Play className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Preview ({formatTime(startTime)} – {formatTime(endTime)})</span>
                </span>
              </div>

              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-200 shadow-xs">
                <iframe
                  key={videoId}
                  src={embedUrl}
                  title="Trim Section Preview"
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {/* Clip Info Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border border-zinc-200 text-xs shadow-xs">
            <div className="flex items-center gap-2 text-zinc-600">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                Range: <strong className="text-zinc-900 font-mono">{formatTime(startTime)}</strong> to <strong className="text-zinc-900 font-mono">{formatTime(endTime)}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-zinc-500">
                Duration: <strong className="text-zinc-900 font-mono">{formatTime(clipDuration)}</strong>
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-zinc-600 hover:text-zinc-900 transition-colors bg-zinc-50 hover:bg-zinc-100 px-2 py-1 rounded-md border border-zinc-200 cursor-pointer text-xs"
                title="Reset to Full Duration"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-1.5 py-1">
            <div className="relative w-full h-7 flex items-center select-none touch-none">
              <div className="absolute left-[5px] right-[5px] h-2 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-red-600"
                  style={{
                    left: `${startPercent}%`,
                    width: `${rangeWidth}%`,
                  }}
                />
              </div>

              <input
                type="range"
                min={0}
                max={totalDuration}
                value={startTime}
                onChange={(e) => handleStartChange(e.target.value)}
                className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-20 dual-slider-thumb outline-none"
              />

              <input
                type="range"
                min={0}
                max={totalDuration}
                value={endTime}
                onChange={(e) => handleEndChange(e.target.value)}
                className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-30 dual-slider-thumb outline-none"
              />
            </div>
          </div>

          {/* Manual Precise Timestamp Inputs */}
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-600 mb-1 font-medium">
                  Start timestamp (mm:ss or seconds)
                </label>
                <input
                  type="text"
                  value={startInput}
                  onChange={(e) => handleStartInputChange(e.target.value)}
                  onBlur={handleCommitStartInput}
                  onKeyDown={(e) => handleInputKeyDown(e, handleCommitStartInput)}
                  placeholder="00:00"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-600 mb-1 font-medium">
                  End timestamp (mm:ss or seconds)
                </label>
                <input
                  type="text"
                  value={endInput}
                  onChange={(e) => handleEndInputChange(e.target.value)}
                  onBlur={handleCommitEndInput}
                  onKeyDown={(e) => handleInputKeyDown(e, handleCommitEndInput)}
                  placeholder="00:00"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyClick}
              className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Apply Timestamps</span>
            </button>

            {appliedToast && (
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono text-center flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Applied: {formatTime(startTime)} to {formatTime(endTime)}</span>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
