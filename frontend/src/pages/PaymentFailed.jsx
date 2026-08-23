import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AlertCircle, RotateCcw, ShoppingBag } from 'lucide-react';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const tranId = searchParams.get('tran_id') || searchParams.get('transactionId') || 'TX' + Date.now();
  const reason = searchParams.get('reason') || 'Transaction failed or was cancelled.';

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-8 min-h-[75vh] flex flex-col items-center justify-center">
      
      <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center mx-auto shadow-xl">
        <AlertCircle className="w-10 h-10 text-rose-400" />
      </div>

      <div className="space-y-2">
        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
          TRANSACTION FAILED
        </span>
        <h1 className="text-3xl font-black text-white">Payment Unsuccessful</h1>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          {reason} No products were delivered and no charges were made.
        </p>
      </div>

      {/* Task 14 Failed Transaction Info */}
      <div className="w-full bg-theme-card border border-gray-800 rounded-3xl p-5 text-left space-y-2 text-xs">
        <div className="flex justify-between py-1 border-b border-gray-800/50">
          <span className="text-gray-400">Transaction ID</span>
          <span className="font-mono text-gray-300">{tranId}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-400">Status</span>
          <span className="font-bold text-rose-400 uppercase">FAILED / CANCELLED</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
        <Link
          to="/checkout"
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold text-xs flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Try Again
        </Link>
        <Link
          to="/products"
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-gray-800 text-white font-bold text-xs"
        >
          Return to Catalog
        </Link>
      </div>

    </div>
  );
};

export default PaymentFailed;
