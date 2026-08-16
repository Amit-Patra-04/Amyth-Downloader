import React, { useState } from 'react';
import { 
  Play, 
  User, 
  Clock, 
  Eye, 
  ExternalLink
} from 'lucide-react';

export default function VideoMetaCard({ videoData }) {
  const [imgSrc, setImgSrc] = useState(videoData.thumbnail);

  if (!videoData) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mb-6 rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-sm text-left">
      
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
        
        {/* Video Thumbnail */}
        <div className="sm:col-span-5 relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-video shadow-sm">
          <img
            src={imgSrc}
            alt={videoData.title}
            onError={() => setImgSrc(videoData.fallbackThumbnail)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-white font-mono text-[11px] font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>{videoData.durationFormatted}</span>
          </div>

          {/* Play Overlay */}
          <a
            href={videoData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            title="Open on YouTube"
          >
            <div className="w-10 h-10 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-md">
              <Play className="w-4 h-4 ml-0.5 fill-zinc-900" />
            </div>
          </a>
        </div>

        {/* Video Metadata */}
        <div className="sm:col-span-7 flex flex-col justify-between space-y-3">
          
          <div>
            {/* Video Title */}
            <h2 className="text-base sm:text-lg font-bold font-display text-white line-clamp-2 leading-snug">
              {videoData.title}
            </h2>
          </div>

          {/* Author & Stats */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-zinc-300 font-medium bg-zinc-800/80 px-2.5 py-1 rounded-lg">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>{videoData.author}</span>
            </div>

            <div className="flex items-center gap-1 text-zinc-400">
              <Eye className="w-3.5 h-3.5" />
              <span>{videoData.viewCount.includes('views') ? videoData.viewCount : `${videoData.viewCount} views`}</span>
            </div>

            <a
              href={videoData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors ml-auto text-xs"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}
