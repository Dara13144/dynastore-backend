import React from 'react';

/**
 * Authentic Official ABA KHQR Brand Logo Icon
 * Teal top section (#085a73) with white ABA lettering & red indicator dot
 * Red bottom section (#d61b36) with bold KHQR lettering
 */
const AbaKhqrLogo = ({ className = "w-11 h-11" }) => {
  return (
    <div className={`relative overflow-hidden rounded-xl shadow-lg border border-slate-700/60 shrink-0 flex flex-col items-center justify-between select-none ${className}`}>
      {/* Top Teal Area: ABA with top-right red registration badge */}
      <div className="w-full h-[64%] bg-[#005e7a] flex items-center justify-center relative">
        <span className="text-white font-black tracking-tight text-[13px] leading-none font-sans antialiased">
          ABA
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-[#e11937] absolute top-1.5 right-2 shadow-xs ring-1 ring-white/30" />
      </div>
      {/* Bottom Red Banner: KHQR */}
      <div className="w-full h-[36%] bg-[#e11937] flex items-center justify-center">
        <span className="text-white font-black tracking-widest text-[8px] uppercase leading-none font-sans antialiased">
          KHQR
        </span>
      </div>
    </div>
  );
};

export default AbaKhqrLogo;
