import React from 'react';

/**
 * Cambodian Riel Medallion Badge centered on KHQR Codes
 */
export function RielMedallion({ className = "" }) {
  return (
    <div
      className={`size-11 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xl shadow-lg border-2 border-white select-none ${className}`}
      title="NBC Bakong KHQR"
    >
      <span className="leading-none select-none font-bold">៛</span>
    </div>
  );
}

export default RielMedallion;
