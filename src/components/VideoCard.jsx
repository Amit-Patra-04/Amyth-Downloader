import React from 'react';
import { User, Clock, Eye, ExternalLink, Play } from 'lucide-react';

export default function VideoCard({ videoInfo }) {
  if (!videoInfo) return null;

  const { title, thumbnail, uploader, duration, viewCount, maxVideoHeight, webpage_url } = videoInfo;

  const formatViews = (num) => {
    if (!num) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M views`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K views`;
    return `${num} views`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl p-4 sm:p-5 mb-6 border border-zinc-200 bg-white shadow-xs text-left">
      <div className="flex flex-col md:flex-row gap-4 sm:gap-5 items-start">
        
        {/* Thumbnail Preview Container */}
        <div className="relative group w-full md:w-72 shrink-0 aspect-video rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
          
          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-md">
              <Play className="w-4 h-4 fill-zinc-900 ml-0.5" />
            </div>
          </div>

          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] px-2 py-0.5 rounded font-mono">
              {duration}
            </div>
          )}

          <div className="absolute top-2 left-2 bg-white/95 text-zinc-900 text-[11px] px-2 py-0.5 rounded font-mono border border-zinc-200 shadow-xs font-medium">
            {maxVideoHeight}p
          </div>
        </div>

        {/* Video Metadata Content */}
        <div className="flex-1 space-y-2.5 w-full min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-zinc-900 line-clamp-2 leading-snug">
            {title}
          </h2>

          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200">
              <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="text-zinc-800 font-medium truncate max-w-[180px] sm:max-w-[260px]">{uploader}</span>
            </div>

            {viewCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200">
                <Eye className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>{formatViews(viewCount)}</span>
              </div>
            )}
          </div>

          {/* Quality Capability Info */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-zinc-100">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-zinc-500">Available up to</span>
              <span className="font-semibold text-zinc-900">
                {maxVideoHeight}p {maxVideoHeight >= 2160 ? '(4K Ultra HD)' : maxVideoHeight >= 1440 ? '(2K Quad HD)' : maxVideoHeight >= 1080 ? '(1080p Full HD)' : ''}
              </span>
            </div>

            {webpage_url && (
              <a
                href={webpage_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors font-medium"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
