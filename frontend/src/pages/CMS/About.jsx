import React from 'react';
import { Film, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 min-h-screen text-gray-300">
      
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto shadow-gold-glow">
          <Film className="w-8 h-8 text-black" />
        </div>
        <h1 className="text-4xl font-black text-white">About DYNA STORE</h1>
        <p className="text-sm text-theme-gold font-semibold">The Next-Generation Cambodian Digital Store & Movie Streaming Platform</p>
      </div>

      <div className="p-8 bg-theme-card rounded-3xl border border-gray-800 space-y-6 leading-relaxed text-sm">
        <p>
          DYNA STORE is a premier digital store and entertainment streaming service delivering digital merchandise, blockbuster movies, TV shows, and exclusive cinema podcasts directly to desktop and mobile screens in crystal-clear 4K Ultra HD.
        </p>
        <p>
          Built with advanced Cambodian financial gateway integrations including <strong className="text-amber-400">Bakong KHQR</strong> and <strong className="text-blue-400">ABA PayWay</strong>, DYNA STORE empowers customers to top up wallet balances and checkout instantly with zero transaction delay.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-4 bg-slate-900 rounded-2xl border border-gray-800 space-y-2">
            <Zap className="w-6 h-6 text-theme-gold" />
            <h4 className="font-bold text-white">Lightning Fast Streaming</h4>
            <p className="text-xs text-gray-400">Ultra low latency playback with resolution switching up to 4K HDR.</p>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-gray-800 space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h4 className="font-bold text-white">Secure KHQR Wallet</h4>
            <p className="text-xs text-gray-400">NBC EMVCo compliance ensuring instant balance top up.</p>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-gray-800 space-y-2">
            <Globe className="w-6 h-6 text-blue-400" />
            <h4 className="font-bold text-white">Anywhere Access</h4>
            <p className="text-xs text-gray-400">Fully responsive across Mobile, Tablet, and Desktop.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;
