import React, { useState, useEffect } from 'react';
import { Scissors, Clock, RotateCcw, Play, Wifi, Info, CheckCircle2, Check } from 'lucide-react';

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

  // Parse any typed timestamp string (e.g. "120", "2:30", "01:20:15") into total seconds
  const parseAnyTimestampToSeconds = (rawStr) => {
    if (!rawStr || typeof rawStr !== 'string') return 0;
    const clean = rawStr.trim();
    if (!clean) return 0;

    const parts = clean.split(':').map(p => parseInt(p.trim(), 10) || 0);

    if (parts.length === 3) {
      // hh:mm:ss
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // mm:ss
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
      // raw seconds
      return parts[0];
    }
    return 0;
  };

  // Sync initial inputs when component mounts or total video duration changes
  useEffect(() => {
    setStartTime(0);
    setEndTime(totalDuration);
    setStartInput(formatTime(0));
    setEndInput(formatTime(totalDuration));
    setEnabled(false);
  }, [totalDuration]);

  // Notify parent whenever trim values change
  useEffect(() => {
    onTrimChange({
      enabled,
      startTime: Math.min(startTime, endTime),
      endTime: Math.max(startTime, endTime),
    });
  }, [enabled, startTime, endTime]);

  // Slider Drag Handlers
  const handleStartChange = (val) => {
    const num = Math.max(0, Math.min(Number(val), endTime - 1));
    setStartTime(num);
    setStartInput(formatTime(num));
  };

  const handleEndChange = (val) => {
    const num = Math.min(totalDuration, Math.max(Number(val), startTime + 1));
    setEndTime(num);
    setEndInput(formatTime(num));
  };

  // Typing Input Change Handlers (Live validation without interrupting typing)
  const handleStartInputChange = (val) => {
    setStartInput(val);
    const secs = parseAnyTimestampToSeconds(val);
    if (!isNaN(secs) && secs >= 0) {
      const validSecs = Math.min(secs, endTime - 1);
      setStartTime(validSecs);
    }
  };

  const handleEndInputChange = (val) => {
    setEndInput(val);
    const secs = parseAnyTimestampToSeconds(val);
    if (!isNaN(secs) && secs > 0) {
      const validSecs = Math.min(totalDuration, Math.max(secs, startTime + 1));
      setEndTime(validSecs);
    }
  };

  // Commit text input for Start Time on Blur or Enter key
  const handleCommitStartInput = () => {
    const secs = parseAnyTimestampToSeconds(startInput);
    const validSecs = Math.max(0, Math.min(secs, endTime - 1));
    setStartTime(validSecs);
    setStartInput(formatTime(validSecs));
  };

  // Commit text input for End Time on Blur or Enter key
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
    setTimeout(() => setAppliedToast(false), 2500);
  };

  const handleReset = () => {
    setStartTime(0);
    setEndTime(totalDuration);
    setStartInput(formatTime(0));
    setEndInput(formatTime(totalDuration));
  };

  const clipDuration = Math.max(0, endTime - startTime);

  // Percentages for single track dual slider representation
  const startPercent = totalDuration > 0 ? Math.min(100, Math.max(0, (startTime / totalDuration) * 100)) : 0;
  const endPercent = totalDuration > 0 ? Math.min(100, Math.max(0, (endTime / totalDuration) * 100)) : 100;
  const rangeWidth = Math.max(0, endPercent - startPercent);

  // Mobile-compatible & tablet-compatible inline YouTube embed URL with playsinline=1 & enablejsapi=1
  const embedUrl = videoId 
    ? `https://www.youtube-nocookie.com/embed/${videoId}?start=${startTime}&end=${endTime}&playsinline=1&enablejsapi=1&autoplay=0&rel=0&controls=1&modestbranding=1&fs=1`
    : '';

  return (
    <div className="w-full glass-panel rounded-3xl p-5 mb-8 border border-white/10 transition-all">
      {/* Toggle Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl transition-all ${enabled ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-500/10' : 'bg-white/5 text-slate-400'}`}>
            <Scissors className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-slate-100 flex items-center gap-2 text-sm sm:text-base">
              <span>Trim Specific Section</span>
              {enabled && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono font-medium">
                  Active
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-400">Download only a specific clip instead of full video</p>
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
          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
        </label>
      </div>

      {/* Trimmer Controls Body (Visible when enabled) */}
      {enabled && (
        <div className="mt-6 pt-6 border-t border-white/10 space-y-6 text-left">
          
          {/* Interactive Clean Preview Video Player */}
          {videoId && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <Play className="w-3.5 h-3.5 text-rose-400" />
                  <span>Minimal Trim Preview ({formatTime(startTime)} - {formatTime(endTime)})</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  <span>Data Saver Preview</span>
                </span>
              </div>

              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/80 border border-white/10 shadow-xl">
                <iframe
                  key={videoId}
                  src={embedUrl}
                  title="Trim Section Preview"
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Data Saver Notice */}
              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2 leading-relaxed">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> The playing video is stream-optimized for lower internet usage. This preview playback quality has <strong>no impact</strong> on your final high-definition download quality.
                </span>
              </div>
            </div>
          )}

          {/* Clip Info Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>
                Selected Range: <strong className="text-white font-mono">{formatTime(startTime)}</strong> to <strong className="text-white font-mono">{formatTime(endTime)}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                Clip Duration: <strong className="text-emerald-400 font-mono text-sm">{formatTime(clipDuration)}</strong>
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 cursor-pointer"
                title="Reset to Full Duration"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Single Track Dual-Thumb Slider */}
          <div className="space-y-2 px-2 py-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono mb-2">
              <span>Start: <strong className="text-rose-400">{formatTime(startTime)}</strong></span>
              <span className="text-slate-500 font-sans text-[11px]">Drag handles or type timestamp below</span>
              <span>End: <strong className="text-rose-400">{formatTime(endTime)}</strong></span>
            </div>

            {/* Single Slide Track Container */}
            <div className="relative w-full h-8 flex items-center select-none touch-none">
              {/* Background Track Bar with 6px left/right inset matching 12px vertical bar thumb radius */}
              <div className="absolute left-[6px] right-[6px] h-3 bg-slate-800/80 rounded-full border border-white/10 overflow-hidden">
                {/* Active Highlighted Range Bar mathematically matching vertical bar thumb centers */}
                <div
                  className="absolute h-full bg-gradient-to-r from-red-600 via-rose-500 to-rose-400 shadow-lg shadow-rose-500/30"
                  style={{
                    left: `${startPercent}%`,
                    width: `${rangeWidth}%`,
                  }}
                />
              </div>

              {/* Start Range Input (Left Vertical Bar Thumb) */}
              <input
                type="range"
                min={0}
                max={totalDuration}
                value={startTime}
                onChange={(e) => handleStartChange(e.target.value)}
                className="absolute w-full h-3 appearance-none bg-transparent pointer-events-none z-20 dual-slider-thumb outline-none"
              />

              {/* End Range Input (Right Vertical Bar Thumb) */}
              <input
                type="range"
                min={0}
                max={totalDuration}
                value={endTime}
                onChange={(e) => handleEndChange(e.target.value)}
                className="absolute w-full h-3 appearance-none bg-transparent pointer-events-none z-30 dual-slider-thumb outline-none"
              />
            </div>
          </div>

          {/* Manual Precise Timestamp Inputs (hh:mm:ss format e.g. 02:05:41 or 120) */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium flex items-center justify-between">
                  <span>Start Cut (mm:ss or hh:mm:ss)</span>
                  <span className="text-[10px] text-slate-500 font-mono">e.g. 01:20 or 90</span>
                </label>
                <input
                  type="text"
                  value={startInput}
                  onChange={(e) => handleStartInputChange(e.target.value)}
                  onBlur={handleCommitStartInput}
                  onKeyDown={(e) => handleInputKeyDown(e, handleCommitStartInput)}
                  placeholder="00:00"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium flex items-center justify-between">
                  <span>End Cut (mm:ss or hh:mm:ss)</span>
                  <span className="text-[10px] text-slate-500 font-mono">e.g. 05:40 or 340</span>
                </label>
                <input
                  type="text"
                  value={endInput}
                  onChange={(e) => handleEndInputChange(e.target.value)}
                  onBlur={handleCommitEndInput}
                  onKeyDown={(e) => handleInputKeyDown(e, handleCommitEndInput)}
                  placeholder="00:00"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            {/* Apply Trim Button (Optimized for Mobile/Phone view) */}
            <button
              type="button"
              onClick={handleApplyClick}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-500 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Apply Trim Timestamps</span>
            </button>

            {appliedToast && (
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono text-center flex items-center justify-center gap-1.5 animate-pulse">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Trim Range Applied: {formatTime(startTime)} to {formatTime(endTime)}</span>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
