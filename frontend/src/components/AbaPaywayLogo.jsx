import React from 'react';

/**
 * Official ABA Bank & PayWay Brand Logo Component
 * Matches the official National Bank of Canada Group logo badge
 */
const AbaPaywayLogo = ({ className = "w-11 h-12" }) => {
  return (
    <div className={`relative overflow-hidden rounded-xl shadow-lg border border-slate-700/60 shrink-0 flex flex-col items-center justify-between select-none bg-white ${className}`}>
      {/* Top Teal Block with ABA BANK */}
      <div className="w-full h-[70%] bg-[#005e7a] flex flex-col items-center justify-center relative p-0.5">
        {/* Top-Right Flag Tab (Navy & Red) */}
        <div className="absolute top-0 right-1.5 flex h-2.5 w-2 shadow-xs">
          <div className="w-1/2 h-full bg-[#0a1b33]" />
          <div className="w-1/2 h-full bg-[#e11937]" />
        </div>
        <span className="text-white font-black tracking-tight text-[13px] leading-none font-sans mt-0.5">
          ABA
        </span>
        <span className="text-white/90 font-bold tracking-[0.22em] text-[7px] leading-none uppercase mt-0.5 font-sans">
          BANK
        </span>
      </div>

      {/* Bottom White Section: National Bank of Canada Group */}
      <div className="w-full h-[30%] bg-white flex items-center justify-between px-1 border-t border-gray-200">
        <div className="w-2.5 h-2 bg-[#e11937] rounded-xs shrink-0 flex items-center justify-center">
          <div className="w-1 h-0.5 bg-white" />
        </div>
        <div className="flex flex-col text-[4.5px] leading-[4.5px] text-[#00344b] font-black uppercase tracking-tighter text-right">
          <span>NATIONAL BANK</span>
          <span>OF CANADA GROUP</span>
        </div>
      </div>
    </div>
  );
};

export default AbaPaywayLogo;
