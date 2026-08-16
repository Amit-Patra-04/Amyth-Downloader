import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Film, 
  Music, 
  Scissors, 
  ChevronDown, 
  ChevronUp, 
  Globe 
} from 'lucide-react';

const FEATURES = [
  {
    icon: Film,
    title: 'High Quality MP4 Video',
    description: 'Download videos up to 4K Ultra HD and 1080p Full HD at original frame rates.',
  },
  {
    icon: Music,
    title: 'High Quality MP3 Audio',
    description: 'Convert and download audio tracks in 320kbps high fidelity sound.',
  },
  {
    icon: Scissors,
    title: 'Integrated Video Trimmer',
    description: 'Easily cut and download custom clips with synchronized video preview.',
  },
  {
    icon: Zap,
    title: '100% Free & Unlimited',
    description: 'No subscriptions, no registration, and no download limits.',
  },
  {
    icon: ShieldCheck,
    title: 'Clean & Ad-Free Experience',
    description: 'Direct downloads with no popups or annoying redirects.',
  },
  {
    icon: Globe,
    title: 'Netlify Ready',
    description: 'Configured for instant free deployment on Netlify with global edge delivery.',
  },
];

const FAQS = [
  {
    q: 'How do I download a video in highest quality?',
    a: 'Paste your YouTube link into the search bar, select your desired resolution (4K, 1440p, 1080p, 720p), and click Download MP4.',
  },
  {
    q: 'How does the Video Trimmer work?',
    a: 'Turn on the "Trim Video" toggle, adjust the start and end sliders or type the exact timestamps (HH:MM:SS), preview the clip, and click Download.',
  },
  {
    q: 'How do I download entire YouTube Playlists?',
    a: 'Paste the link of any YouTube playlist. Turn on "Download Selected Videos from Playlist", select or deselect specific items using the checkboxes, and click "Download Selected".',
  },
  {
    q: 'Is Amyth Downloader free to use?',
    a: 'Yes, Amyth Downloader is completely free with no hidden paywalls or limitations.',
  },
  {
    q: 'How do I deploy this site to Netlify?',
    a: 'Click the "Deploy Guide" button in the header. You can connect your GitHub repository or drag and drop the "dist" build folder directly onto Netlify Drop.',
  },
];

export default function FeaturesFAQ() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-left">
      
      {/* Features Grid */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            Features & Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Everything you need for fast media downloading
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="rounded-xl p-4 bg-zinc-900 border border-zinc-800 text-left transition-all hover:border-zinc-700"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">
                  {feat.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="pt-6 border-t border-zinc-800">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-2.5 max-w-2xl mx-auto">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left font-medium text-xs sm:text-sm text-white hover:text-blue-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Clean Footer */}
      <footer className="pt-8 border-t border-zinc-800 text-center text-xs text-zinc-500 space-y-1">
        <p className="text-zinc-400 font-medium">
          Amyth Downloader &mdash; Free YouTube Video & MP3 Audio Downloader
        </p>
        <p className="text-[11px] text-zinc-500">
          For personal backups and offline media usage.
        </p>
      </footer>

    </section>
  );
}
