import React from 'react';
import { User, Clock, Eye, ShieldCheck, Sparkles, ExternalLink, Play } from 'lucide-react';

export default function VideoCard({ videoInfo }) {
  if (!videoInfo) return null;

  const { title, thumbnail, uploader, duration, viewCount, maxVideoHeight, webpage_url } = videoInfo;

  // Format view count nicely (e.g. 1.2M, 450K)
  const formatViews = (num) => {
    if (!num) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M Views`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K Views`;
    return `${num} Views`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 transition-all shadow-2xl border border-white/10 hover:border-white/20">
      <div className="flex flex-col md:flex-row gap-5 sm:gap-6 items-center md:items-start">
        
        {/* Thumbnail Preview Container */}
        <div className="relative group w-full md:w-80 shrink-0 aspect-video rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-black/60">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Subtle Play Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg backdrop-blur-sm">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>

          {duration && (
            <div className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur-md text-white text-[11px] sm:text-xs px-2.5 py-1 rounded-xl flex items-center gap-1.5 font-mono border border-white/15 shadow">
              <Clock className="w-3 h-3 text-rose-400" />
              <span>{duration}</span>
            </div>
          )}

          <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[11px] sm:text-xs px-2.5 py-1 rounded-xl flex items-center gap-1.5 font-bold shadow-lg shadow-red-600/40">
            <Sparkles className="w-3 h-3" />
            <span>Max {maxVideoHeight}p</span>
          </div>
        </div>

        {/* Video Metadata Content */}
        <div className="flex-1 space-y-3 text-left w-full min-w-0">
          <h2 className="text-base sm:text-xl font-extrabold text-slate-100 line-clamp-2 leading-snug break-words">
            {title}
          </h2>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 truncate max-w-full">
              <User className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="font-semibold text-slate-200 truncate">{uploader}</span>
            </div>

            {viewCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                <Eye className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{formatViews(viewCount)}</span>
              </div>
            )}
          </div>

          {/* Quality Capability Banner */}
          <div className="mt-2 p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/30 via-purple-950/30 to-indigo-950/30 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Original Stream Quality:</p>
                <p className="text-xs sm:text-sm font-bold text-emerald-400">
                  {maxVideoHeight}p {maxVideoHeight >= 2160 ? '(4K Ultra HD)' : maxVideoHeight >= 1440 ? '(2K Quad HD)' : maxVideoHeight >= 1080 ? '(Full HD 1080p)' : '(Standard 720p)'}
                </p>
              </div>
            </div>

            {webpage_url && (
              <a
                href={webpage_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors font-medium shrink-0"
              >
                <span>View on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
