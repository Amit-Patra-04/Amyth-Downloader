import React, { useState, useEffect, useRef } from 'react';
import { 
  Scissors, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Check,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import TimeInput from './TimeInput';
import { formatTimeHMS } from '../services/youtubeService';

export default function VideoTrimmer({ 
  videoId, 
  durationSeconds = 180, 
  onTrimChange,
  onDurationDetected 
}) {
  const [isTrimEnabled, setIsTrimEnabled] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(Math.min(durationSeconds, 60));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayhead, setCurrentPlayhead] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [applyFeedback, setApplyFeedback] = useState(false);

  const playerRef = useRef(null);
  const timeWatcherRef = useRef(null);
  const startTimeRef = useRef(startTime);
  const endTimeRef = useRef(endTime);
  const playerIdRef = useRef(`yt_player_${Math.random().toString(36).substr(2, 9)}`);

  // Keep refs synchronized with state at all times
  useEffect(() => {
    startTimeRef.current = startTime;
  }, [startTime]);

  useEffect(() => {
    endTimeRef.current = endTime;
  }, [endTime]);

  // Reset when video or duration changes
  useEffect(() => {
    setStartTime(0);
    const initialEnd = Math.min(durationSeconds, 60);
    setEndTime(initialEnd > 0 ? initialEnd : 60);
    setCurrentPlayhead(0);
  }, [videoId, durationSeconds]);

  // Propagate trim changes to parent
  useEffect(() => {
    onTrimChange({
      enabled: isTrimEnabled,
      start: startTime,
      end: endTime,
      duration: Math.max(0, endTime - startTime),
    });
  }, [isTrimEnabled, startTime, endTime, onTrimChange]);

  // Load and initialize YouTube IFrame Player API
  useEffect(() => {
    if (!isTrimEnabled) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
      setPlayerReady(false);
      setIsPlaying(false);
      if (timeWatcherRef.current) clearInterval(timeWatcherRef.current);
      return;
    }

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      const playerContainer = document.getElementById(playerIdRef.current);
      if (!playerContainer) return;

      try {
        playerRef.current = new window.YT.Player(playerIdRef.current, {
          videoId: videoId,
          playerVars: {
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            controls: 1,
            start: Math.floor(startTimeRef.current),
            end: Math.ceil(endTimeRef.current),
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              setPlayerReady(true);
              const realDuration = event.target.getDuration();
              if (realDuration && realDuration > 0 && Math.abs(realDuration - durationSeconds) > 2) {
                onDurationDetected?.(realDuration);
              }
            },
            onStateChange: (event) => {
              // 1 = PLAYING
              if (event.data === 1) {
                setIsPlaying(true);
                const current = event.target.getCurrentTime();
                // If user pressed play but position was outside trim range, immediately seek to trim start
                if (current < startTimeRef.current || current >= endTimeRef.current) {
                  event.target.seekTo(startTimeRef.current, true);
                }
                startTimeWatcher();
              } else {
                setIsPlaying(false);
                stopTimeWatcher();
              }
            },
          },
        });
      } catch (err) {
        console.warn('YouTube Player init error:', err);
      }
    };

    if (!window.YT || !window.YT.Player) {
      if (!document.getElementById('yt_api_script')) {
        const tag = document.createElement('script');
        tag.id = 'yt_api_script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      stopTimeWatcher();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
    };
  }, [isTrimEnabled, videoId]);

  // High-precision time watcher using REFS to guarantee checking current endTime & startTime
  const startTimeWatcher = () => {
    stopTimeWatcher();
    timeWatcherRef.current = setInterval(() => {
      if (!playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') return;

      const current = playerRef.current.getCurrentTime();
      setCurrentPlayhead(current);

      const targetEnd = endTimeRef.current;
      const targetStart = startTimeRef.current;

      // When playback reaches or passes the trim end time:
      if (current >= targetEnd - 0.08) {
        playerRef.current.pauseVideo();
        playerRef.current.seekTo(targetStart, true);
        setCurrentPlayhead(targetStart);
        setIsPlaying(false);
        stopTimeWatcher();
      }
    }, 50);
  };

  const stopTimeWatcher = () => {
    if (timeWatcherRef.current) {
      clearInterval(timeWatcherRef.current);
      timeWatcherRef.current = null;
    }
  };

  // Play / Pause Trim toggle
  const handlePlayPauseTrim = () => {
    if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      const current = playerRef.current.getCurrentTime();
      if (current < startTimeRef.current || current >= endTimeRef.current) {
        playerRef.current.seekTo(startTimeRef.current, true);
      }
      playerRef.current.playVideo();
      setIsPlaying(true);
      startTimeWatcher();
    }
  };

  // Replay Trim: ALWAYS seeks to trim start (NOT video 0:00)
  const handleReplayTrim = () => {
    if (!playerRef.current || typeof playerRef.current.seekTo !== 'function') return;
    playerRef.current.seekTo(startTimeRef.current, true);
    playerRef.current.playVideo();
    setIsPlaying(true);
    startTimeWatcher();
  };

  // Reset Trim to full video
  const handleResetFull = () => {
    setStartTime(0);
    setEndTime(durationSeconds);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(0, true);
    }
  };

  // Mobile / Tab / PC "Apply Trim" button handler
  const handleApplyTrim = () => {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }

    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(startTimeRef.current, true);
      setCurrentPlayhead(startTimeRef.current);
    }

    setApplyFeedback(true);
    setTimeout(() => setApplyFeedback(false), 2000);
  };

  const handleToggleTrim = () => {
    setIsTrimEnabled(!isTrimEnabled);
  };

  // Sliders
  const handleStartSlider = (e) => {
    const val = Math.min(Number(e.target.value), endTime - 1);
    const safeVal = Math.max(0, val);
    setStartTime(safeVal);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(safeVal, true);
      setCurrentPlayhead(safeVal);
    }
  };

  const handleEndSlider = (e) => {
    const val = Math.max(Number(e.target.value), startTime + 1);
    const safeVal = Math.min(durationSeconds, val);
    setEndTime(safeVal);
  };

  const startPercent = durationSeconds > 0 ? (startTime / durationSeconds) * 100 : 0;
  const endPercent = durationSeconds > 0 ? (endTime / durationSeconds) * 100 : 100;
  const playheadPercent = durationSeconds > 0 ? (currentPlayhead / durationSeconds) * 100 : 0;
  const trimmedDuration = Math.max(0, endTime - startTime);

  return (
    <div className="w-full max-w-3xl mx-auto mb-6">
      
      {/* Main Container */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-6 shadow-sm text-left">
        
        {/* Header with Switch */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
              isTrimEnabled 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}>
              <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm sm:text-base text-white">
                  Trim Video
                </h3>
                <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  Optional
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400">
                Cut and preview a specific segment before downloading
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${isTrimEnabled ? 'text-blue-400' : 'text-zinc-500'}`}>
              {isTrimEnabled ? 'On' : 'Off'}
            </span>

            <button
              type="button"
              onClick={handleToggleTrim}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isTrimEnabled ? 'bg-blue-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isTrimEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Trim Controls */}
        {isTrimEnabled && (
          <div className="pt-4 sm:pt-5 space-y-4 sm:space-y-5">
            
            {/* Interactive Player with Strictly Enforced Trim Boundaries */}
            <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-sm relative">
              <div className="aspect-video w-full max-h-[340px] flex items-center justify-center bg-black">
                <div id={playerIdRef.current} className="w-full h-full" />
              </div>

              {/* Player Control Bar */}
              <div className="p-2.5 sm:p-3 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Play/Pause Trim Button */}
                  <button
                    type="button"
                    onClick={handlePlayPauseTrim}
                    className="flex-1 sm:flex-none min-h-[38px] flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all shadow-sm active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                    <span>{isPlaying ? 'Pause' : `Play Trim (${formatTimeHMS(startTime, durationSeconds)})`}</span>
                  </button>

                  {/* Replay Segment (Always starts from trim start) */}
                  <button
                    type="button"
                    onClick={handleReplayTrim}
                    className="flex-1 sm:flex-none min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-all border border-zinc-700 active:scale-95"
                    title="Play from start of trimmed segment"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay Segment</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetFull}
                    className="min-h-[38px] px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs transition-all border border-zinc-700"
                  >
                    Reset Full
                  </button>
                </div>

                <div className="text-xs text-zinc-400 font-mono flex items-center justify-between sm:justify-end gap-1.5">
                  <span>Clip Duration:</span>
                  <span className="text-white font-bold bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                    {formatTimeHMS(trimmedDuration, durationSeconds)}
                  </span>
                </div>
              </div>
            </div>

            {/* Slider Track with Live Playhead */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>{formatTimeHMS(0, durationSeconds)}</span>
                <span className="text-blue-400 font-semibold">
                  Selected: {formatTimeHMS(trimmedDuration, durationSeconds)}
                </span>
                <span>{formatTimeHMS(durationSeconds, durationSeconds)}</span>
              </div>

              <div className="relative h-8 flex items-center">
                {/* Background Track */}
                <div className="absolute inset-x-0 h-2.5 bg-zinc-800 rounded-full" />

                {/* Highlighted Trim Segment */}
                <div
                  className="absolute h-2.5 bg-blue-600 rounded-full"
                  style={{
                    left: `${startPercent}%`,
                    width: `${Math.max(0, endPercent - startPercent)}%`,
                  }}
                />

                {/* Live Playhead Indicator */}
                {isPlaying && (
                  <div
                    className="absolute top-0.5 bottom-0.5 w-1.5 bg-white shadow-md z-10 rounded-full pointer-events-none transition-all duration-75"
                    style={{ left: `${playheadPercent}%` }}
                  />
                )}

                {/* Start Thumb Slider */}
                <input
                  type="range"
                  min={0}
                  max={durationSeconds}
                  value={startTime}
                  onChange={handleStartSlider}
                  className="clean-slider absolute inset-0 w-full h-full z-20"
                />

                {/* End Thumb Slider */}
                <input
                  type="range"
                  min={0}
                  max={durationSeconds}
                  value={endTime}
                  onChange={handleEndSlider}
                  className="clean-slider absolute inset-0 w-full h-full z-20"
                />
              </div>
            </div>

            {/* Masked Time Inputs (HH:MM:SS / HHH:MM:SS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TimeInput
                label="Start Time"
                value={startTime}
                onChange={(sec) => {
                  if (sec < endTime) {
                    setStartTime(sec);
                    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
                      playerRef.current.seekTo(sec, true);
                    }
                  }
                }}
                maxDurationSeconds={durationSeconds}
                iconColor="text-blue-400"
              />

              <TimeInput
                label="End Time"
                value={endTime}
                onChange={(sec) => {
                  if (sec > startTime && sec <= durationSeconds) {
                    setEndTime(sec);
                  }
                }}
                maxDurationSeconds={durationSeconds}
                iconColor="text-emerald-400"
              />
            </div>

            {/* Prominent "Set / Apply Trim" Button for Mobile, Tab, and PC */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleApplyTrim}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs sm:text-sm border border-zinc-700 transition-all active:scale-[0.99]"
              >
                {applyFeedback ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Trim Range Applied ({formatTimeHMS(startTime, durationSeconds)} &ndash; {formatTimeHMS(endTime, durationSeconds)})</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-blue-400" />
                    <span>Set & Apply Trim Timestamps</span>
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
