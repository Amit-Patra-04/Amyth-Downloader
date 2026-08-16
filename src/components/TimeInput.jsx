import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

export default function TimeInput({
  value = 0,
  onChange,
  maxDurationSeconds = 180,
  label = 'Time',
  iconColor = 'text-zinc-500',
}) {
  const is3DigitHour = maxDurationSeconds >= 360000;
  const hourDigits = is3DigitHour ? 3 : 2;

  // Split seconds into HH, MM, SS
  const getHMS = (totalSec) => {
    const sec = Math.max(0, Math.floor(totalSec || 0));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return {
      h: h.toString().padStart(hourDigits, '0'),
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0'),
    };
  };

  const [hours, setHours] = useState(() => getHMS(value).h);
  const [minutes, setMinutes] = useState(() => getHMS(value).m);
  const [seconds, setSeconds] = useState(() => getHMS(value).s);

  const hoursRef = useRef(null);
  const minutesRef = useRef(null);
  const secondsRef = useRef(null);

  // Synchronize when value changes externally
  useEffect(() => {
    const hms = getHMS(value);
    setHours(hms.h);
    setMinutes(hms.m);
    setSeconds(hms.s);
  }, [value, maxDurationSeconds]);

  // Notify parent of total seconds
  const emitChange = (hStr, mStr, sStr) => {
    const hNum = parseInt(hStr, 10) || 0;
    let mNum = parseInt(mStr, 10) || 0;
    let sNum = parseInt(sStr, 10) || 0;

    // Cap minutes and seconds > 59 to 59
    if (mNum > 59) mNum = 59;
    if (sNum > 59) sNum = 59;

    let total = hNum * 3600 + mNum * 60 + sNum;
    if (total > maxDurationSeconds) total = maxDurationSeconds;
    if (total < 0) total = 0;

    onChange?.(total);
  };

  // Hour input handler
  const handleHoursChange = (e) => {
    const clean = e.target.value.replace(/[^0-9]/g, '').slice(0, hourDigits);
    setHours(clean);
    emitChange(clean, minutes, seconds);

    // When hour digits reach required length (2 or 3), automatically jump to minutes
    if (clean.length >= hourDigits) {
      minutesRef.current?.focus();
      minutesRef.current?.select();
    }
  };

  // Minute input handler
  const handleMinutesChange = (e) => {
    let clean = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
    
    // Auto-cap values > 59 to 59
    const num = parseInt(clean, 10);
    if (!isNaN(num) && num > 59) {
      clean = '59';
    }

    setMinutes(clean);
    emitChange(hours, clean, seconds);

    // When 2 digits entered, automatically jump to seconds
    if (clean.length >= 2) {
      secondsRef.current?.focus();
      secondsRef.current?.select();
    }
  };

  // Second input handler
  const handleSecondsChange = (e) => {
    let clean = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);

    // Auto-cap values > 59 to 59
    const num = parseInt(clean, 10);
    if (!isNaN(num) && num > 59) {
      clean = '59';
    }

    setSeconds(clean);
    emitChange(hours, minutes, clean);
  };

  // Key navigation & backspace behavior
  const handleKeyDown = (e, field) => {
    if (e.key === 'Backspace') {
      if (field === 'minutes' && (minutes === '' || minutes === '00' || minutes === '0')) {
        e.preventDefault();
        hoursRef.current?.focus();
        hoursRef.current?.select();
      } else if (field === 'seconds' && (seconds === '' || seconds === '00' || seconds === '0')) {
        e.preventDefault();
        minutesRef.current?.focus();
        minutesRef.current?.select();
      }
    } else if (e.key === 'ArrowRight') {
      if (field === 'hours' && e.target.selectionStart === hours.length) {
        minutesRef.current?.focus();
      } else if (field === 'minutes' && e.target.selectionStart === minutes.length) {
        secondsRef.current?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      if (field === 'seconds' && e.target.selectionStart === 0) {
        minutesRef.current?.focus();
      } else if (field === 'minutes' && e.target.selectionStart === 0) {
        hoursRef.current?.focus();
      }
    }
  };

  // On blur: pad values cleanly
  const handleBlur = (field) => {
    if (field === 'hours') {
      const padded = (parseInt(hours, 10) || 0).toString().padStart(hourDigits, '0');
      setHours(padded);
      emitChange(padded, minutes, seconds);
    } else if (field === 'minutes') {
      let num = parseInt(minutes, 10) || 0;
      if (num > 59) num = 59;
      const padded = num.toString().padStart(2, '0');
      setMinutes(padded);
      emitChange(hours, padded, seconds);
    } else if (field === 'seconds') {
      let num = parseInt(seconds, 10) || 0;
      if (num > 59) num = 59;
      const padded = num.toString().padStart(2, '0');
      setSeconds(padded);
      emitChange(hours, minutes, padded);
    }
  };

  return (
    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 focus-within:border-blue-500/70 transition-colors text-left">
      <label className="block text-xs text-zinc-400 mb-1.5 font-medium flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[11px] text-zinc-500 font-mono">
          {is3DigitHour ? 'HHH:MM:SS' : 'HH:MM:SS'}
        </span>
      </label>

      <div className="flex items-center gap-1 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
        <Clock className={`w-4 h-4 ${iconColor} shrink-0 mr-1 pointer-events-none`} />

        {/* Hours Segment */}
        <input
          ref={hoursRef}
          type="text"
          inputMode="numeric"
          value={hours}
          onChange={handleHoursChange}
          onKeyDown={(e) => handleKeyDown(e, 'hours')}
          onBlur={() => handleBlur('hours')}
          onFocus={(e) => e.target.select()}
          placeholder={is3DigitHour ? '000' : '00'}
          className={`${is3DigitHour ? 'w-8' : 'w-6'} bg-transparent text-white font-mono text-sm text-center focus:outline-none focus:text-blue-400 font-semibold`}
        />

        {/* Permanent Colon Divider */}
        <span className="text-zinc-500 font-bold select-none">:</span>

        {/* Minutes Segment */}
        <input
          ref={minutesRef}
          type="text"
          inputMode="numeric"
          value={minutes}
          onChange={handleMinutesChange}
          onKeyDown={(e) => handleKeyDown(e, 'minutes')}
          onBlur={() => handleBlur('minutes')}
          onFocus={(e) => e.target.select()}
          placeholder="00"
          className="w-6 bg-transparent text-white font-mono text-sm text-center focus:outline-none focus:text-blue-400 font-semibold"
        />

        {/* Permanent Colon Divider */}
        <span className="text-zinc-500 font-bold select-none">:</span>

        {/* Seconds Segment */}
        <input
          ref={secondsRef}
          type="text"
          inputMode="numeric"
          value={seconds}
          onChange={handleSecondsChange}
          onKeyDown={(e) => handleKeyDown(e, 'seconds')}
          onBlur={() => handleBlur('seconds')}
          onFocus={(e) => e.target.select()}
          placeholder="00"
          className="w-6 bg-transparent text-white font-mono text-sm text-center focus:outline-none focus:text-blue-400 font-semibold"
        />
      </div>
    </div>
  );
}
