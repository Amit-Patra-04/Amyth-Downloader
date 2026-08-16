import React, { useState } from 'react';
import { X, Rocket, Check, Copy, ExternalLink, Sparkles } from 'lucide-react';

export default function NetlifyDeployGuide({ isOpen, onClose }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl z-10 overflow-hidden text-left my-8">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Netlify Deployment Guide
              </h3>
              <p className="text-xs text-zinc-400">
                Deploy Amyth Downloader for free in 2 minutes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto text-sm text-zinc-300">
          
          {/* Method 1: Git Push to Netlify */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                1
              </span>
              <h4 className="font-semibold text-white">
                Option A: Connect GitHub Repository (Recommended)
              </h4>
            </div>

            <div className="pl-7 space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Commit and push your code:</span>
                  <button
                    onClick={() => copyToClipboard('git add .\ngit commit -m "Deploy Amyth Downloader"\ngit push', 1)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                  >
                    {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 1 ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-zinc-200 font-mono select-all">
                  git add .{'\n'}
                  git commit -m "Deploy Amyth Downloader"{'\n'}
                  git push
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <p className="text-zinc-400">On Netlify Dashboard (<a href="https://app.netlify.com" target="_blank" rel="noreferrer" className="text-blue-400 underline inline-flex items-center gap-0.5">app.netlify.com <ExternalLink className="w-3 h-3"/></a>):</p>
                <ul className="list-disc list-inside space-y-0.5 text-zinc-300">
                  <li>Click <strong>"Add new site"</strong> &rarr; <strong>"Import an existing project"</strong> &rarr; Select <strong>GitHub</strong></li>
                  <li>Choose your <strong>Amyth-Downloader</strong> repo</li>
                  <li>Build settings are automatic:
                    <span className="block pl-4 text-emerald-400 font-mono text-[11px] mt-0.5">Build command: npm run build | Publish directory: dist</span>
                  </li>
                  <li>Click <strong>"Deploy site"</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Method 2: Drag & Drop */}
          <div className="space-y-2.5 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-semibold">
                2
              </span>
              <h4 className="font-semibold text-white">
                Option B: Drag & Drop Build (No Git needed)
              </h4>
            </div>

            <div className="pl-7 space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Build the project:</span>
                  <button
                    onClick={() => copyToClipboard('npm run build', 2)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                  >
                    {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 2 ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-zinc-200 font-mono select-all">npm run build</pre>
              </div>

              <p className="text-zinc-400">
                Go to <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-blue-400 underline inline-flex items-center gap-0.5">app.netlify.com/drop <ExternalLink className="w-3 h-3"/></a> and drag the generated <code className="text-blue-300">dist/</code> folder into the dropzone.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
