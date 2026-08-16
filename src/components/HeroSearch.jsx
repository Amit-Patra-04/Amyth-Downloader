import React, { useState } from 'react';
import { 
  Youtube, 
  Clipboard, 
  ArrowRight, 
  Loader2, 
  Check,
  Link as LinkIcon
} from 'lucide-react';

const SAMPLE_LINKS = [
  {
    title: '4K Sample Video',
    url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    badge: '4K Ultra HD',
  },
  {
    title: 'Music Video',
    url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
    badge: '1080p / MP3',
  },
  {
    title: 'Sample Playlist',
    url: 'https://www.youtube.com/playlist?list=PLrEnWoR732-DES0s-10A1u_qV_l6i1k4u',
    badge: 'Playlist Batch',
  },
];

export default function HeroSearch({ onSearch, isLoading, error }) {
  const [urlInput, setUrlInput] = useState('');
  const [isPasted, setIsPasted] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!urlInput.trim() || isLoading) return;
    onSearch(urlInput.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text);
        setIsPasted(true);
        setTimeout(() => setIsPasted(false), 2000);
        onSearch(text.trim());
      }
    } catch (err) {
      console.warn('Clipboard access denied', err);
    }
  };

  const handleSelectSample = (sampleUrl) => {
    setUrlInput(sampleUrl);
    onSearch(sampleUrl);
  };

  return (
    <section className="relative pt-12 pb-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center">
      
      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-white tracking-tight mb-3">
        Download YouTube Videos & Audio
      </h1>

      <p className="max-w-lg mx-auto text-sm sm:text-base text-zinc-400 font-sans mb-8">
        Download videos in <span className="text-zinc-200 font-medium">4K, 1080p (MP4)</span> or <span className="text-zinc-200 font-medium">320kbps (MP3)</span>, trim custom clips, or batch download full playlists.
      </p>

      {/* Clean Search Bar */}
      <form 
        onSubmit={handleSubmit}
        className="relative max-w-2xl mx-auto mb-4"
      >
        <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 focus-within:border-blue-500/70 shadow-lg transition-all">
          
          {/* Input */}
          <div className="flex-1 flex items-center w-full pl-3 pr-2 py-1">
            <Youtube className="w-5 h-5 text-red-500 shrink-0 mr-3" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste YouTube video or playlist link here..."
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 font-sans focus:outline-none"
              disabled={isLoading}
            />
            {urlInput && (
              <button
                type="button"
                onClick={() => setUrlInput('')}
                className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
            
            {/* Paste Button */}
            <button
              type="button"
              onClick={handlePaste}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-all"
            >
              {isPasted ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{isPasted ? 'Pasted!' : 'Paste'}</span>
            </button>

            {/* Fetch Button */}
            <button
              type="submit"
              disabled={isLoading || !urlInput.trim()}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                isLoading || !urlInput.trim()
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:shadow active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Download</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      </form>

      {/* Error display */}
      {error && (
        <div className="max-w-xl mx-auto mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs font-medium text-center">
          {error}
        </div>
      )}

      {/* Clean Quick Presets */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-400">
        <span className="text-zinc-500">Try sample:</span>
        {SAMPLE_LINKS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSample(sample.url)}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all text-[11px]"
          >
            {sample.title} <span className="text-zinc-500 font-normal">({sample.badge})</span>
          </button>
        ))}
      </div>

    </section>
  );
}
