import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ExternalLink, X, CheckCircle2, Loader2, Zap, ShieldCheck, AlertCircle } from 'lucide-react';
import { paymentAPI } from '../api/endpoints';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { createSocket } from '../utils/socket';
import { toast } from 'react-toastify';
import AbaPaywayLogo from './AbaPaywayLogo';

const PayWayModal = ({ isOpen, onClose, paywayData, orderId }) => {
  const navigate = useNavigate();
  const { fetchWallet } = useWallet();
  const { user } = useAuth();
  
  const [status, setStatus] = useState('PENDING'); // 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED'
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins countdown

  useEffect(() => {
    if (!isOpen || !paywayData?.transactionId) return;

    setStatus('PENDING');
    setTimeLeft(paywayData?.expiresInSeconds || 300);

    const handlePaymentComplete = (currentOrderId) => {
      onClose();
      if (currentOrderId || orderId) {
        navigate(`/orders`);
      } else {
        navigate(`/dashboard`);
      }
    };

    // 1. Expiration Timer Countdown (5 mins)
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 2. Active Polling to Backend Status API (every 3 seconds)
    const pollInterval = setInterval(async () => {
      try {
        const res = await paymentAPI.checkABAStatus(paywayData.transactionId, false);
        const fetchedStatus = res.data?.status || res.data?.data?.status;

        if (fetchedStatus === 'PAID') {
          setStatus('PAID');
          clearInterval(pollInterval);
          clearInterval(timer);
          await fetchWallet();
          handlePaymentComplete(res.data?.orderId || res.data?.data?.orderId);
        } else if (fetchedStatus === 'FAILED' || fetchedStatus === 'CANCELLED') {
          setStatus('FAILED');
          clearInterval(pollInterval);
          clearInterval(timer);
        }
      } catch (err) {
        console.warn('ABA status polling notice:', err.message);
      }
    }, 3000);

    // 3. Socket.io Real-Time Listener
    let socket;
    if (user?.id) {
      socket = createSocket();
      socket.emit('join_user_room', user.id);
      socket.on('payment_success', (data) => {
        if (data.transactionId === paywayData.transactionId) {
          setStatus('PAID');
          clearInterval(pollInterval);
          clearInterval(timer);
          fetchWallet();
          handlePaymentComplete(data.orderId);
        }
      });
    }

    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
      if (socket) socket.disconnect();
    };
  }, [isOpen, paywayData?.transactionId, user?.id, navigate, fetchWallet, onClose, orderId]);

  if (!isOpen || !paywayData) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-theme-card border border-[#005e7a]/40 rounded-3xl p-6 shadow-2xl text-center space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <AbaPaywayLogo className="w-14 h-15 shadow-xl" />
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#005e7a]/20 text-cyan-300 border border-[#005e7a]/40">
            OFFICIAL ABA PAYWAY CHECKOUT
          </span>
          <h3 className="text-xl font-black text-white">ABA PayWay Gateway</h3>
          <p className="text-xs text-gray-400">
            Amount: <span className="text-theme-gold font-bold">${paywayData.amount} USD</span>
          </p>
        </div>

        {/* Status Content */}
        {status === 'PAID' ? (
          <div className="py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
            </div>
            <h4 className="text-lg font-bold text-emerald-400">Approved by Admin</h4>
            <p className="text-xs text-gray-300">Your balance has been credited to your account.</p>
          </div>
        ) : status === 'FAILED' ? (
          <div className="py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
            <h4 className="text-lg font-bold text-rose-400">Payment Request Cancelled</h4>
            <p className="text-xs text-gray-400">Please initiate a new top-up request.</p>
          </div>
        ) : (
          <div className="p-6 bg-slate-900/80 rounded-2xl border border-gray-800 space-y-4">
            
            {/* Status indicator */}
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 py-2 px-4 rounded-full border border-amber-500/20 w-fit mx-auto">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Awaiting Admin Verification & Approval</span>
            </div>

            {/* Instruction Banner */}
            <div className="p-3.5 bg-[#005e7a]/15 border border-[#005e7a]/40 rounded-xl text-left text-xs space-y-1 text-gray-300">
              <p className="font-bold text-cyan-300">📋 Payment Instructions:</p>
              <p className="text-[11px] text-gray-400">
                1. Click the button below to transfer via official ABA PayWay link.
              </p>
              <p className="text-[11px] text-gray-400">
                2. Once paid, the administrator will review your Transaction Reference and credit your account balance.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-1">
              <a
                href={paywayData.directPayLink || 'https://link.payway.com.kh/ABAPAY3z4941814'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#005e7a] via-[#057194] to-[#005e7a] hover:from-[#004e66] hover:to-[#004e66] text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all transform hover:scale-[1.01]"
              >
                <AbaPaywayLogo className="w-6 h-7 !rounded-md" />
                <span>Open ABA PayWay Link (${paywayData.amount} USD)</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white font-bold text-xs transition-colors"
              >
                Done / Close Window
              </button>
            </div>

          </div>
        )}

        {/* Transaction Details */}
        <div className="text-[11px] text-gray-400 space-y-1 bg-slate-900/50 p-3 rounded-xl border border-gray-800 text-left">
          <p>Amount: <span className="font-bold text-theme-gold">${paywayData.amount} USD</span></p>
          <p>Transaction ID: <span className="font-mono text-gray-300">{paywayData.transactionId}</span></p>
          <p>Status: <span className="font-bold uppercase text-amber-400">{status}</span></p>
        </div>

      </div>
    </div>
  );
};

export default PayWayModal;
