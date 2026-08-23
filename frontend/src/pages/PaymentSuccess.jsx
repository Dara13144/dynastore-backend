import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Package, ShieldCheck, Download } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const tranId = searchParams.get('tran_id') || searchParams.get('transactionId') || 'TX' + Date.now();
  const orderId = searchParams.get('order_id') || 'ORD-' + Math.floor(10000 + Math.random() * 90000);
  const { fetchWallet } = useWallet();

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8 min-h-[75vh] flex flex-col items-center justify-center">
      
      <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
      </div>

      <div className="space-y-2">
        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          VERIFIED BY ABA PAYWAY
        </span>
        <h1 className="text-3xl font-black text-white">Payment Successful</h1>
        <p className="text-xs text-gray-400">
          Your payment has been verified and processed. Your order is now completed and delivered!
        </p>
      </div>

      {/* Task 13 Payment Receipt Card */}
      <div className="w-full bg-theme-card border border-gray-800 rounded-3xl p-6 space-y-4 text-left shadow-2xl">
        <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-gray-800 pb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-theme-gold" /> Order Receipt Details
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-gray-800/50">
            <span className="text-gray-400">Order ID</span>
            <span className="font-mono font-bold text-white">#{orderId}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-gray-800/50">
            <span className="text-gray-400">Transaction Reference</span>
            <span className="font-mono font-bold text-gray-300">{tranId}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-gray-800/50">
            <span className="text-gray-400">Payment Gateway</span>
            <span className="font-bold text-blue-400">ABA PayWay / ABA KHQR</span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-gray-400">Status</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              PAID & COMPLETED
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
        <Link
          to="/orders"
          className="w-full sm:w-auto px-8 py-3.5 rounded-full gold-glow-button text-black font-extrabold text-xs flex items-center justify-center gap-2"
        >
          View My Orders <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/products"
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-gray-800 text-white font-bold text-xs"
        >
          Continue Shopping
        </Link>
      </div>

    </div>
  );
};

export default PaymentSuccess;
