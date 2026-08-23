import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { XCircle, RefreshCw, Wallet, ArrowLeft } from 'lucide-react';

const TopupCancel = () => {
  const [searchParams] = useSearchParams();
  const tranId = searchParams.get('tran_id') || searchParams.get('tranId');
  const reason = searchParams.get('reason') || 'Transaction was cancelled by user or payment timed out.';

  return (
    <div className="max-w-xl mx-auto px-4 py-16 min-h-[80vh] flex items-center justify-center">
      <div className="w-full bg-theme-card border border-rose-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        
        <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto border border-rose-500/40">
          <XCircle className="w-10 h-10 text-rose-400" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
            ABA PAYWAY CANCELLED
          </span>
          <h1 className="text-2xl font-black text-white">Payment Cancelled</h1>
          <p className="text-xs text-gray-400">Your ABA PayWay transaction was not completed.</p>
        </div>

        <div className="p-4 bg-slate-900/80 rounded-2xl border border-gray-800 text-left text-xs space-y-2">
          {tranId && (
            <div className="flex justify-between">
              <span className="text-gray-400">Transaction ID</span>
              <span className="font-mono font-bold text-gray-300">{tranId}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">Status</span>
            <span className="font-bold text-rose-400 uppercase">CANCELLED</span>
          </div>
          <div className="border-t border-gray-800 pt-2 text-gray-400 text-[11px]">
            {reason}
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            to="/topup"
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-gold-glow"
          >
            <RefreshCw className="w-4 h-4" /> Try Payment Again
          </Link>
          <Link
            to="/dashboard"
            className="py-3 px-6 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold text-xs flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
};

export default TopupCancel;
