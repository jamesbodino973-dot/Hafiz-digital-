import React from 'react';
import { Box, Twitter, Globe, Cpu, Heart, Download } from 'lucide-react';

interface FooterProps {
  setView: (view: string) => void;
}

export default function Footer({ setView }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="app-footer" className="border-t bg-zinc-950 border-zinc-900 py-12 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setView('home')}>
              <div className="flex items-center justify-center w-8 h-8 rounded bg-zinc-100 text-black font-serif font-bold text-lg">
                H
              </div>
              <span className="font-serif font-semibold text-lg leading-tight tracking-tight text-white">
                Hafiz <span className="font-sans text-xs uppercase tracking-widest text-zinc-400 font-normal ml-1">Digital</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              An elegant curated platform for premium digital assets. Crafted for developers, creators, entrepreneurs, and designers who challenge limitations.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">
              Explore Products
            </h4>
            <div className="flex flex-wrap gap-2 md:flex-col md:gap-1.5">
              <button
                onClick={() => setView('shop')}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer text-left"
              >
                Lightroom Presets
              </button>
              <button
                onClick={() => setView('shop')}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer text-left"
              >
                Notion Systems
              </button>
              <button
                onClick={() => setView('shop')}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer text-left"
              >
                React/Vite Templates
              </button>
              <button
                onClick={() => setView('shop')}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer text-left"
              >
                SVG Vector Icon Packs
              </button>
            </div>
          </div>

          {/* Security & Features info */}
          <div className="space-y-4 text-left">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">
              Why Hafiz Digital?
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Download className="w-3.5 h-3.5 text-zinc-100 shrink-0" />
                <span>Instant download link access</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Cpu className="w-3.5 h-3.5 text-zinc-100 shrink-0" />
                <span>Verified malware-safe links</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Globe className="w-3.5 h-3.5 text-zinc-100 shrink-0" />
                <span>100% lifetime cloud updates</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-zinc-500">
            &copy; {currentYear} Hafiz Digital Products. Powered by secure Firebase cloud databases.
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 fill-current animate-pulse" /> by Hafiz Team
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
