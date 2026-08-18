import React, { useState } from 'react';
import { Link2, Clipboard, X, Search, Loader2, Sparkles, Check } from 'lucide-react';

export default function UrlInput({ url, setUrl, onFetch, loading, onClear, platformDetails }) {
  const [copiedToast, setCopiedToast] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 1500);
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !loading) {
      onFetch();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-8 sm:mb-10 px-2 sm:px-0">
      <div className="relative p-[1.5px] rounded-3xl input-glow-wrapper transition-all duration-300 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-[#10111d] rounded-3xl p-2 sm:p-2.5 gap-2 backdrop-blur-xl">
          
          <div className="flex items-center flex-1 min-w-0 px-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0 mr-2 border border-rose-500/20">
              <Link2 className="w-5 h-5 text-rose-500" />
            </div>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={platformDetails?.placeholder || "Paste YouTube Video, Shorts, or Playlist link here..."}
              className="w-full bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-xs sm:text-base py-2 px-1 min-w-0 font-medium"
              disabled={loading}
            />

            {url && (
              <button
                type="button"
                onClick={onClear}
                className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/10 shrink-0 cursor-pointer mr-1"
                title="Clear input"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all shrink-0 cursor-pointer active:scale-95"
              title="Paste from clipboard"
            >
              {copiedToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">Pasted!</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden sm:inline">Paste Link</span>
                </>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span>Extracting 4K Info...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Fetch Details</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
