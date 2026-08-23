import React from 'react';

/**
 * Bakong / KHQR Official Wordmark Header Component
 */
export function BakongWordmark({ className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-white select-none ${className}`}>
      <span className="font-black tracking-widest text-lg uppercase font-sans">
        KHQR
      </span>
      <span className="text-[11px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 uppercase">
        BAKONG
      </span>
    </div>
  );
}

export default BakongWordmark;
