import React, { useState, useRef } from 'react';
import Header from './components/Header';
import UrlInput from './components/UrlInput';
import VideoCard from './components/VideoCard';
import DownloadOptions from './components/DownloadOptions';
import { getApiBaseUrl } from './config';
import { 
  AlertCircle, Zap, Download, Sparkles, Video, ListVideo, Scissors, 
  HardDrive, Music, ShieldCheck, CheckCircle2, ChevronDown, Heart, ArrowRight
} from 'lucide-react';

function App() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const detailsSectionRef = useRef(null);

  const currentPlatform = {
    title: 'YouTube Video & Playlist Downloader',
    placeholder: 'Paste YouTube Video, Shorts, or Playlist link (e.g. https://www.youtube.com/watch?v=...)',
    icon: Video,
    badge: 'YouTube 4K & Playlist Supported',
    badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10'
  };

  const fetchVideoDetails = async (targetUrl = url) => {
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError('');
    setVideoInfo(null);

    const baseUrl = getApiBaseUrl();

    try {
      const endpoint = `${baseUrl}/api/info?url=${encodeURIComponent(targetUrl.trim())}`;
      const response = await fetch(endpoint);

      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        throw new Error(
          'Failed to connect to video extraction server. Please check the backend connection or try again later.'
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video/playlist metadata.');
      }

      setVideoInfo(data);

      // Smooth scroll down to the starting section of fetched details
      setTimeout(() => {
        if (detailsSectionRef.current) {
          detailsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);

    } catch (err) {
      console.error('Fetch video error:', err);
      setError(err.message || 'An error occurred while fetching video details.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setVideoInfo(null);
    setError('');
  };

  const faqs = [
    {
      q: 'How do I download videos in 4K or 1080p resolution?',
      a: 'Simply paste the YouTube video link in the box above and click "Fetch Details". If the original video is uploaded in 4K, 2K, or 1080p, our system will automatically make those high-resolution options available for 1-click download.'
    },
    {
      q: 'Can I download full YouTube playlists?',
      a: 'Yes! Paste any playlist URL (containing list=) to load all videos. You can download the entire playlist at once or choose specific videos using interactive multi-select checkboxes.'
    },
    {
      q: 'How does the video trimmer work?',
      a: 'When you paste a video, toggle the "Precision Video Trimmer" option. Use the visual dual-slider or enter exact start/end timestamps to download just the specific clip you need.'
    },
    {
      q: 'Is this service free to use?',
      a: 'Yes, StreamGrab Pro is 100% free with unlimited downloads, no registration required, and zero hidden limits.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* Background Decorative Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation Bar Header */}
        <Header />

        {/* Hero & Input Section */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
          <div className="text-center mb-8 sm:mb-12">
            
            {/* Pulsing Capability Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-500/25 bg-rose-500/10 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-md shadow-lg shadow-rose-500/10">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-rose-300">Fast 4K & High-Res Audio Downloader</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 sm:mb-6 leading-tight">
              Download Media in <br className="hidden sm:inline" />
              <span className="gradient-text">Original 4K Quality</span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Fast, free & direct video downloader. Convert YouTube videos, Shorts & full playlists to 4K MP4 or 320kbps MP3 instantly.
            </p>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 text-xs text-slate-300">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>4K / 1080p Ultra HD</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-purple-400" />
                <span>320kbps MP3 Audio</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
                <ListVideo className="w-3.5 h-3.5 text-emerald-400" />
                <span>Playlist Multi-Download</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-amber-400" />
                <span>Precision Video Trimmer</span>
              </span>
            </div>
          </div>

          {/* Main URL Input Box */}
          <UrlInput
            url={url}
            setUrl={setUrl}
            onFetch={fetchVideoDetails}
            onClear={handleClear}
            loading={loading}
            platformDetails={currentPlatform}
          />

          {/* Error Message Toast */}
          {error && (
            <div className="max-w-3xl mx-auto mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-start gap-3 shadow-xl backdrop-blur-md animate-shake text-left">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong className="font-bold block text-red-200 mb-0.5">Error Occurred</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Fetched Details Section */}
          {videoInfo && (
            <div ref={detailsSectionRef} className="mt-8 transition-all animate-fade-in">
              <VideoCard videoInfo={videoInfo} />
              <DownloadOptions videoInfo={videoInfo} url={url} />
            </div>
          )}

          {/* How It Works - 3 Simple Steps */}
          <div className="mt-16 sm:mt-24 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 mb-2">
              How It Works in 3 Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-8 sm:mb-12">
              Fastest way to get your media saved directly to your device
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* Step 1 */}
              <div className="glass-card rounded-3xl p-6 relative border border-white/10 hover:border-rose-500/30 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400 font-black text-sm mb-4">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-100 mb-1.5">Paste Video URL</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Copy any YouTube video, Shorts, or playlist link and paste it into the input box above.
                </p>
              </div>

              {/* Step 2 */}
              <div className="glass-card rounded-3xl p-6 relative border border-white/10 hover:border-purple-500/30 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400 font-black text-sm mb-4">
                  2
                </div>
                <h3 className="text-base font-bold text-slate-100 mb-1.5">Choose Quality</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select your desired resolution (4K, 1080p, 720p) or choose 320kbps MP3 audio format.
                </p>
              </div>

              {/* Step 3 */}
              <div className="glass-card rounded-3xl p-6 relative border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-black text-sm mb-4">
                  3
                </div>
                <h3 className="text-base font-bold text-slate-100 mb-1.5">Instant Download</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click download and your file will be processed and saved directly with no watermarks.
                </p>
              </div>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
            <div className="glass-card rounded-3xl p-6 border border-white/10 hover:border-rose-500/30 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-100 mb-2">4K Ultra HD Quality</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Preserve original high-bitrate video in 2160p 4K, 1440p 2K, and 1080p Full HD with crisp audio.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-white/10 hover:border-purple-500/30 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <ListVideo className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-100 mb-2">Playlist Selection</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Download entire playlists at once or cherry-pick specific videos with one click.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-white/10 hover:border-indigo-500/30 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-100 mb-2">Precision Trimmer</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Set custom start & end cut points to download only the exact segment of the video you want.
              </p>
            </div>
          </div>

          {/* Minimalist FAQ Accordion */}
          <div className="mt-16 sm:mt-24 max-w-3xl mx-auto text-left">
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 text-center mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 text-center mb-8">
              Everything you need to know about our downloader
            </p>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-200 hover:text-white cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-rose-400' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </main>
      </div>

      {/* Footer Section */}
      <footer className="relative z-10 border-t border-white/10 py-6 sm:py-8 bg-black/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm text-slate-400 flex items-center justify-center gap-1.5 flex-wrap">
            <span>© 2026 StreamGrab Pro • Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
            <a
              href="https://amit-developer-portfolio.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-rose-400 transition-colors no-underline font-semibold"
            >
              K Amit Patra
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
