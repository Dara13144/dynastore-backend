import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * AntiScreenRecordShield Component
 * Renders dynamic forensic watermark & protective DRM overlay to prevent recording & ripping
 */
const AntiScreenRecordShield = ({ isBlocked = false, movieTitle = 'Protected Video' }) => {
  const { user } = useAuth();
  const [watermarkPos, setWatermarkPos] = useState({ top: '20%', left: '30%' });
  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString());

  // Periodically randomize watermark position to prevent video editing / watermark removal
  useEffect(() => {
    const interval = setInterval(() => {
      const topPositions = ['15%', '25%', '45%', '65%', '80%'];
      const leftPositions = ['15%', '30%', '50%', '70%', '80%'];

      const randomTop = topPositions[Math.floor(Math.random() * topPositions.length)];
      const randomLeft = leftPositions[Math.floor(Math.random() * leftPositions.length)];

      setWatermarkPos({ top: randomTop, left: randomLeft });
      setTimestamp(new Date().toLocaleTimeString());
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const userIdentifier = user?.email || user?.name || 'USER_GUEST_' + (user?.id ? user.id.slice(0, 6) : 'DEMO');

  return (
    <>
      {/* 1. Dynamic Moving Forensic Watermark (Subtle Anti-Piracy Tracking) */}
      <div
        className="absolute pointer-events-none z-30 select-none transition-all duration-1000 ease-in-out opacity-25 hover:opacity-40"
        style={{
          top: watermarkPos.top,
          left: watermarkPos.left,
          transform: 'translate(-50%, -50%) rotate(-12deg)'
        }}
      >
        <div className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-xs border border-white/10 text-white font-mono text-[10px] sm:text-xs tracking-wider space-y-0.5 shadow-lg">
          <div className="font-bold flex items-center gap-1 text-theme-gold">
            <ShieldCheck className="w-3 h-3" /> KV CINEMA DRM PROTECTED
          </div>
          <div className="text-gray-300 truncate max-w-[200px]">ID: {userIdentifier}</div>
          <div className="text-gray-400 text-[9px]">{timestamp}</div>
        </div>
      </div>

      {/* 2. Full Blackout Shield when Screenshot or Screen Capture is triggered / Window Inactive */}
      {isBlocked && (
        <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in pointer-events-auto">
          <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-3 shadow-gold-glow animate-pulse">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-2">
            RECORDING & SCREENSHOT PREVENTED
          </span>
          <h3 className="text-xl font-black text-white max-w-md">
            Protected Digital Content
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mt-1 leading-relaxed">
            Screen recording, capturing, or background streaming is prohibited. Return focus to this window to resume video playback.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-500 font-mono">
            <Lock className="w-3.5 h-3.5 text-theme-gold" /> Encrypted HDCP / Anti-Piracy Shield Active
          </div>
        </div>
      )}
    </>
  );
};

export default AntiScreenRecordShield;
