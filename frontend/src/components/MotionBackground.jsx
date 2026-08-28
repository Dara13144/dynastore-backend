import React, { useState, useRef } from 'react';
import { Play, Pause, Eye, EyeOff } from 'lucide-react';

const SPIDERMAN_SUNSET_VIDEO = "https://motionbgs.com/media/9917/spider-man-at-sunset.960x540.mp4";

const MotionBackground = ({ opacity = 0.55 }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Spider-Man at Sunset Motion Video */}
      {isVisible && (
        <video
          ref={videoRef}
          src={SPIDERMAN_SUNSET_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center scale-105 transition-opacity duration-1000"
          style={{ opacity }}
        />
      )}

      {/* Atmospheric Dark Cinema Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/65 to-slate-950/95" />
      <div className="absolute inset-0 bg-radial-vignette opacity-70" />

      {/* Discreet Live Wallpaper Floating Control */}
      <div className="fixed bottom-4 left-4 z-40 pointer-events-auto flex items-center gap-1.5 bg-black/70 hover:bg-black/90 backdrop-blur-md border border-gray-800/80 px-2.5 py-1.5 rounded-full shadow-2xl text-[11px] font-bold text-gray-300 transition-all">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1" />
        <span className="hidden sm:inline text-gray-400 font-mono">Live BG</span>
        <button
          onClick={togglePlay}
          className="p-1 hover:text-amber-400 transition-colors"
          title={isPlaying ? 'Pause Motion Background' : 'Play Motion Background'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={toggleVisibility}
          className="p-1 hover:text-amber-400 transition-colors"
          title={isVisible ? 'Hide Background' : 'Show Background'}
        >
          {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

export default MotionBackground;
