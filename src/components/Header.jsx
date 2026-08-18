import React, { useState, useEffect, useRef } from 'react';
import { Video, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Add background blur and shadow when scrolled
      setIsScrolled(currentScrollY > 20);

      // Always show navbar near the very top of page
      if (currentScrollY <= 60) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY - lastScrollY.current > 5) {
        // Scrolling DOWN -> hide navbar (slide up)
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current && lastScrollY.current - currentScrollY > 5) {
        // Scrolling UP -> show navbar (slide down)
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ease-in-out border-b border-white/10 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      } ${
        isScrolled
          ? 'glass-panel shadow-2xl py-3'
          : 'bg-[#0a0b10]/75 backdrop-blur-md py-3.5 sm:py-4'
      } px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 shrink-0 select-none">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white shadow-lg shadow-rose-600/30 ring-1 ring-white/20">
            <Video className="w-5 h-5 text-white drop-shadow" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0b10]"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight gradient-text">StreamGrab</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500/20 to-purple-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">YouTube Video & Playlist Downloader</p>
          </div>
        </div>

        {/* Right Feature Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 text-rose-300 text-xs font-semibold shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Ultra Fast Engine</span>
            <span className="sm:hidden">Fast</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>4K 60FPS & MP3</span>
          </div>
        </div>
      </div>
    </header>
  );
}
