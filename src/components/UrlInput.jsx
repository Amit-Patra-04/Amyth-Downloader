import React, { useState } from 'react';
import { Link2, Clipboard, X, Search, Loader2, Check } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-8 text-left">
      <div className="relative rounded-2xl border border-zinc-200 bg-white focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-900/5 transition-all p-1.5 sm:p-2 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          
          <div className="flex items-center flex-1 min-w-0 px-2">
            <Link2 className="w-4 h-4 text-zinc-400 shrink-0 mr-2.5" />

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={platformDetails?.placeholder || "Paste YouTube video, Shorts, or playlist URL..."}
              className="w-full bg-transparent border-none outline-none text-zinc-900 placeholder-zinc-400 text-xs sm:text-sm py-2 px-1 min-w-0"
              disabled={loading}
            />

            {url && (
              <button
                type="button"
                onClick={onClear}
                className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors rounded-md hover:bg-zinc-100 shrink-0 mr-1"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Paste from clipboard"
            >
              {copiedToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Pasted</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="hidden sm:inline">Paste</span>
                </>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs sm:text-sm rounded-xl transition-all shadow-xs active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Fetching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Fetch Video</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
