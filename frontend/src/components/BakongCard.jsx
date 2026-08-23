import React, { useMemo } from 'react';
import { renderSVG } from 'uqr';
import { CheckCircle2, Clock, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import BakongWordmark from './BakongWordmark';
import RielMedallion from './RielMedallion';

/**
 * State Panel Component for Terminal and Progress States
 */
function Panel({ icon, title, hint, className = "" }) {
  return (
    <div className={`p-8 text-center flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 shadow-inner">
        {icon}
      </div>
      <h4 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">{hint}</p>
    </div>
  );
}

/**
 * Official BakongCard Component
 * Features CutLuy KHQR SVG Rendering, Level-H ECC, Riel Medallion, and Auto Status Checking
 */
export function BakongCard({
  qrString,
  qrImage,
  amount,
  currency = 'USD',
  merchantName = 'DYNA STORE',
  logoUrl = '/logo.png',
  checkoutUrl = null,
  transactionId = null,
  status = 'pending',
  timeLeft = 300,
  onCheckStatus = null,
  isChecking = false
}) {
  // Render high-ecc SVG string via uqr
  const qrSvg = useMemo(() => {
    if (!qrString) return null;
    try {
      return renderSVG(qrString, { ecc: 'H' });
    } catch (e) {
      console.warn('uqr rendering fallback:', e);
      return null;
    }
  }, [qrString]);

  const done = status === 'paid' || status === 'PAID';
  const scanned = status === 'scanned' || status === 'DETECTED';
  const isExpired = status === 'expired' || status === 'EXPIRED';
  const isFailed = status === 'failed' || status === 'FAILED';
  const showQr = !done && !scanned && !isExpired && !isFailed;

  const minutes = Math.floor(Math.max(0, timeLeft) / 60);
  const seconds = Math.max(0, timeLeft) % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="mx-auto w-full max-w-sm select-none">
      <div className="overflow-hidden rounded-3xl bg-white text-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 transition-all">
        
        {/* 1. Red KHQR Header with Bakong Wordmark */}
        <div className="flex items-center justify-center bg-red-600 px-4 py-3.5 shadow-md">
          <BakongWordmark />
        </div>

        {/* 2. Merchant + Amount with Folded Corner & Dashed Tear Line */}
        <div className="relative border-b border-dashed border-gray-300 bg-slate-50/50 px-6 py-4 pb-3">
          {/* Top-Right Red Corner Triangle */}
          <div className="absolute -top-px right-0 h-0 w-0 border-t-[24px] border-l-[24px] border-t-red-600 border-l-transparent" />
          
          <div className="flex items-center gap-2 mb-1">
            {logoUrl && (
              <img src={logoUrl} alt="Merchant Logo" className="size-5 rounded-md object-contain border border-gray-200" />
            )}
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide truncate max-w-[220px]">
              {merchantName}
            </h3>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-gray-900 tracking-tight">
                ${parseFloat(amount || 0).toFixed(2)}
              </span>
              <span className="text-xs font-extrabold text-slate-500 uppercase">{currency}</span>
            </div>

            {/* Countdown Badge */}
            {showQr && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <Clock className="size-3 animate-spin text-amber-500" />
                <span>{formattedTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. QR Display or Terminal State Panels */}
        <div className="relative flex items-center justify-center p-6 bg-white min-h-[290px]">
          {done ? (
            <Panel
              icon={<CheckCircle2 className="size-10 text-emerald-500 animate-bounce" />}
              title="Payment Received"
              hint="Your transaction is verified. You will be redirected shortly."
              className="text-emerald-950"
            />
          ) : isExpired ? (
            <Panel
              icon={<Clock className="size-10 text-amber-500" />}
              title="Payment Expired"
              hint="This KHQR session is no longer valid. Please generate a new payment."
            />
          ) : isFailed ? (
            <Panel
              icon={<AlertCircle className="size-10 text-rose-500" />}
              title="Payment Failed"
              hint="The transaction could not be completed. Please try again."
            />
          ) : scanned ? (
            <Panel
              icon={<CheckCircle2 className="size-10 text-emerald-500 animate-pulse" />}
              title="QR Scanned"
              hint="Confirm the payment in your banking app."
            />
          ) : (
            <>
              <div className="aspect-square w-full max-w-[240px] flex items-center justify-center">
                {qrSvg ? (
                  <div
                    className="size-full [&_svg]:h-full [&_svg]:w-full transition-transform"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                ) : qrImage ? (
                  <img src={qrImage} alt="KHQR Code" className="size-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="size-8 animate-spin text-red-500" />
                    <span className="text-xs">Generating KHQR...</span>
                  </div>
                )}
              </div>

              {/* Centered Riel Medallion (Only rendered while QR is active) */}
              {showQr && (qrSvg || qrImage) && (
                <RielMedallion className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              )}
            </>
          )}
        </div>

        {/* 4. Footer & Action Controls */}
        <div className="bg-slate-50 border-t border-gray-100 p-4 space-y-2.5">
          {showQr && (
            <div className="flex items-center justify-center text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="size-3.5 text-emerald-500" /> Auto-checking every 5s
              </span>
            </div>
          )}


          {/* Manual Status Check Button */}
          {showQr && onCheckStatus && (
            <button
              type="button"
              onClick={onCheckStatus}
              disabled={isChecking}
              className="w-full py-2 px-4 rounded-xl bg-white hover:bg-slate-100 border border-gray-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isChecking ? (
                <>
                  <Loader2 className="size-3.5 animate-spin text-red-600" />
                  <span>Checking network...</span>
                </>
              ) : (
                <span>I have completed payment</span>
              )}
            </button>
          )}
        </div>

      </div>

      <p className="mt-3 text-center text-xs font-semibold text-gray-400 flex items-center justify-center gap-1">
        <span>Scan with ABA Mobile or any KHQR-enabled banking app</span>
      </p>
    </div>
  );
}

export default BakongCard;
