import React, { useState, useRef } from 'react';
import Header from './components/Header';
import UrlInput from './components/UrlInput';
import VideoCard from './components/VideoCard';
import DownloadOptions from './components/DownloadOptions';
import { getApiBaseUrl } from './config';
import { 
  AlertCircle, Video, ListVideo, Scissors, 
  ChevronDown
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
    placeholder: 'Paste YouTube video, Shorts, or playlist URL...',
    icon: Video,
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
          'Could not reach backend extraction server. Please ensure the backend is running.'
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video metadata.');
      }

      setVideoInfo(data);

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
      q: 'How are 4K and 1080p resolutions preserved?',
      a: 'The downloader queries YouTube’s highest-bitrate video and audio streams, then merges them losslessly into an MP4 container using embedded FFmpeg.'
    },
    {
      q: 'Can I download entire playlists?',
      a: 'Yes. Paste any playlist URL (containing list=). You can download all videos or cherry-pick specific videos with interactive selection.'
    },
    {
      q: 'How does the trimmer work?',
      a: 'Toggle the Precision Trimmer, enter your start and end cut points or use the slider, and the server will download and slice only that specific segment.'
    },
    {
      q: 'Is there any download limit?',
      a: 'No. The software runs entirely on your local machine with zero third-party cloud limits or subscriptions.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fafafa] text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <div>
        {/* Navigation Bar */}
        <Header />

        {/* Hero & Input Section */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
          <div className="text-center mb-8">
            
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-900 mb-3">
              YouTube Video & Audio Downloader
            </h1>

            <p className="text-zinc-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-6">
              Download media in original quality up to 4K Ultra HD or extract clean 320kbps MP3 audio with no compression.
            </p>

            {/* Subtle Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-600 font-mono">
              <span className="px-2.5 py-1 rounded-md bg-white border border-zinc-200 shadow-xs">4K • 1080p • 720p</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-zinc-200 shadow-xs">320kbps MP3</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-zinc-200 shadow-xs">Full Playlists</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-zinc-200 shadow-xs">Precision Trimmer</span>
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

          {/* Error Message */}
          {error && (
            <div className="max-w-3xl mx-auto mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-left text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-red-900">Unable to fetch video</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Fetched Details Section */}
          {videoInfo && (
            <div ref={detailsSectionRef} className="mt-8 transition-all">
              <VideoCard videoInfo={videoInfo} />
              <DownloadOptions videoInfo={videoInfo} url={url} />
            </div>
          )}

          {/* How It Works - 3 Steps */}
          <div className="mt-16 sm:mt-20 text-center border-t border-zinc-200 pt-12">
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 mb-1">
              How it works
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mb-8">
              Three simple steps to save your media locally
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="rounded-xl p-4 sm:p-5 border border-zinc-200 bg-white shadow-xs">
                <span className="inline-block text-xs font-mono font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200/60 mb-3">
                  01
                </span>
                <h3 className="text-sm font-semibold text-zinc-900 mb-1">Paste Link</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Paste any YouTube video, Shorts, or playlist URL into the input field.
                </p>
              </div>

              <div className="rounded-xl p-4 sm:p-5 border border-zinc-200 bg-white shadow-xs">
                <span className="inline-block text-xs font-mono font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200/60 mb-3">
                  02
                </span>
                <h3 className="text-sm font-semibold text-zinc-900 mb-1">Select Format</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Choose MP4 video up to 4K or 320kbps MP3 audio, with optional trimming.
                </p>
              </div>

              <div className="rounded-xl p-4 sm:p-5 border border-zinc-200 bg-white shadow-xs">
                <span className="inline-block text-xs font-mono font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200/60 mb-3">
                  03
                </span>
                <h3 className="text-sm font-semibold text-zinc-900 mb-1">Download</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Stream is remuxed and downloaded straight into your browser's download folder.
                </p>
              </div>
            </div>
          </div>

          {/* Capabilities Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="rounded-xl p-4 sm:p-5 border border-zinc-200 bg-white shadow-xs">
              <Video className="w-5 h-5 text-zinc-600 mb-2.5" />
              <h3 className="text-sm font-semibold text-zinc-900 mb-1">4K Ultra HD</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Downloads true 2160p and 1080p DASH streams with video and audio intact.
              </p>
            </div>

            <div className="rounded-xl p-4 sm:p-5 border border-zinc-200 bg-white shadow-xs">
              <ListVideo className="w-5 h-5 text-zinc-600 mb-2.5" />
              <h3 className="text-sm font-semibold text-zinc-900 mb-1">Playlist Support</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Parse playlists and choose individual videos or download in batch.
              </p>
            </div>

            <div className="rounded-xl p-4 sm:p-5 border border-zinc-200 bg-white shadow-xs">
              <Scissors className="w-5 h-5 text-zinc-600 mb-2.5" />
              <h3 className="text-sm font-semibold text-zinc-900 mb-1">Clip Trimmer</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Download only specific timestamps without needing to process the entire video.
              </p>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="mt-14 max-w-2xl mx-auto text-left">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900 text-center mb-6">
              Frequently asked questions
            </h2>

            <div className="space-y-2">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-3.5 text-left flex items-center justify-between gap-4 font-medium text-xs sm:text-sm text-zinc-800 hover:text-zinc-950 cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-400 transition-transform duration-150 shrink-0 ${
                          isOpen ? 'rotate-180 text-zinc-700' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 pt-2.5">
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

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>StreamGrab • Local Media Studio</span>
          <span>
            Created by{' '}
            <a
              href="https://amit-developer-portfolio.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-700 hover:text-zinc-900 transition-colors font-medium underline underline-offset-2"
            >
              K Amit Patra
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
