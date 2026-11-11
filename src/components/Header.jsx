import React, { useState, useEffect, useRef } from 'react';
import { Video, ArrowUpRight } from 'lucide-react';

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 15);

      if (currentScrollY <= 60) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY - lastScrollY.current > 5) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current && lastScrollY.current - currentScrollY > 5) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-200 border-b ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      } ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md border-zinc-200 shadow-xs py-3'
          : 'bg-white/70 backdrop-blur-sm border-zinc-200/60 py-3.5'
      } px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 select-none">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-600 text-white shadow-xs">
            <Video className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight text-zinc-900">StreamGrab</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 font-mono">
              Local Studio
            </span>
          </div>
        </div>

        {/* Right Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-600 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="hidden sm:inline">Engine Active</span>
          </div>

          <a
            href="https://github.com/Amit-Patra-04/Amyth-Downloader"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-zinc-700 hover:text-zinc-900 transition-colors px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100"
          >
            <span>GitHub</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-400" />
          </a>
        </div>
      </div>
    </header>
  );
}
