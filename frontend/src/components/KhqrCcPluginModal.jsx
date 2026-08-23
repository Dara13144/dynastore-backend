import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../api/endpoints';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, ExternalLink, X, CheckCircle2, Loader2, AlertCircle, Zap } from 'lucide-react';
import { createSocket } from '../utils/socket';
import { toast } from 'react-toastify';

const KhqrCcPluginModal = ({ isOpen, onClose, checkoutData, orderId }) => {
  const navigate = useNavigate();
  const { fetchWallet } = useWallet();
  const { user } = useAuth();

  const [status, setStatus] = useState('PENDING');
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins for plugin checkout

  useEffect(() => {
    if (!isOpen || !checkoutData?.transactionId) return;

    setStatus('PENDING');
    setTimeLeft(900);

    const handlePaymentComplete = (currentOrderId) => {
      onClose();
      if (currentOrderId || orderId) {
        navigate(`/payment/success?tran_id=${checkoutData.transactionId}&order_id=${currentOrderId || orderId || ''}`);
      } else {
        navigate(`/wallet/topup/success?tran_id=${checkoutData.transactionId}`);
      }
    };

    // Auto-trigger KhqrPayway plugin if window.KhqrPayway is available
    if (window.KhqrPayway && checkoutData.checkout_url) {
      try {
        window.KhqrPayway.openCheckout({
          checkout_url: checkoutData.checkout_url,
          onSuccess: (res) => {
            console.log('KHQR CC Plugin payment successful!', res);
            setStatus('PAID');
            fetchWallet();
            toast.success('Payment completed successfully!');
            setTimeout(() => {
              handlePaymentComplete(orderId);
            }, 1000);
          },
          onError: (err) => {
            console.warn('KHQR CC Plugin error or modal closed:', err);
          }
        });
      } catch (err) {
        console.error('Error invoking KhqrPayway plugin:', err);
      }
    }

    // 1. Session expiration countdown
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

    // 2. Active status polling (every 3 seconds)
    const pollInterval = setInterval(async () => {
      try {
        const res = await paymentAPI.checkABAStatus(checkoutData.transactionId, false);
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
        console.warn('KHQR CC status polling notice:', err.message);
      }
    }, 3000);

    // 3. Socket.io Listener
    let socket;
    if (user?.id) {
      socket = createSocket();
      socket.emit('join_user_room', user.id);
      socket.on('payment_success', (data) => {
        if (data.transactionId === checkoutData.transactionId) {
          setStatus('PAID');
          clearInterval(pollInterval);
          clearInterval(timer);
          fetchWallet();
          setTimeout(() => {
            handlePaymentComplete(data.orderId);
          }, 1500);
        }
      });
    }

    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
      if (socket) socket.disconnect();
    };
  }, [isOpen, checkoutData?.transactionId, checkoutData?.checkout_url, user?.id, navigate, fetchWallet, onClose, orderId]);

  if (!isOpen || !checkoutData) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleManualOpen = () => {
    if (window.KhqrPayway && checkoutData.checkout_url) {
      window.KhqrPayway.openCheckout({
        checkout_url: checkoutData.checkout_url,
        onSuccess: (res) => {
          setStatus('PAID');
          fetchWallet();
          toast.success('Payment completed!');
        },
        onError: (err) => console.log('Plugin modal closed:', err)
      });
    } else if (checkoutData.checkout_url) {
      window.open(checkoutData.checkout_url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-theme-card border border-red-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase bg-red-600/20 text-red-400 border border-red-500/30 mb-2">
            KHQR CC CHECKOUT PLUGIN
          </span>
          <h3 className="text-xl font-black text-white">KHQR PayWay Modal</h3>
          <p className="text-xs text-gray-400 mt-1">
            Amount: <span className="text-theme-gold font-bold">${checkoutData.amount} USD</span>
          </p>
        </div>

        {/* Status Content */}
        {status === 'PAID' ? (
          <div className="py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
            </div>
            <h4 className="text-lg font-bold text-emerald-400">Payment Successful</h4>
            <p className="text-xs text-gray-300">Transaction completed successfully.</p>
          </div>
        ) : status === 'FAILED' ? (
          <div className="py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
            <h4 className="text-lg font-bold text-rose-400">Payment Failed</h4>
            <p className="text-xs text-gray-400">Payment could not be completed.</p>
          </div>
        ) : status === 'EXPIRED' ? (
          <div className="py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto">
              <X className="w-8 h-8 text-amber-400" />
            </div>
            <h4 className="text-lg font-bold text-amber-400">Payment Expired</h4>
            <p className="text-xs text-gray-400">Session expired. Please initiate a new payment.</p>
          </div>
        ) : (
          <div className="p-6 bg-slate-900/80 rounded-2xl border border-gray-800 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center mx-auto">
              <CreditCard className="w-7 h-7 text-red-400" />
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 py-1.5 px-3 rounded-full border border-red-500/20 w-fit mx-auto">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Waiting for KHQR payment completion...</span>
            </div>

            <button
              onClick={handleManualOpen}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              Open KHQR PayWay Modal <ExternalLink className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-gray-400 pt-1">
              Session expires in:{' '}
              <span className="font-mono font-bold text-red-400">
                {minutes < 10 ? '0' : ''}{minutes}:{seconds < 10 ? '0' : ''}{seconds}
              </span>
            </div>
          </div>
        )}

        <div className="text-[11px] text-gray-400 space-y-1 bg-slate-900/50 p-3 rounded-xl border border-gray-800 text-left">
          <p>Amount: <span className="font-bold text-theme-gold">${checkoutData.amount} USD</span></p>
          <p>Transaction ID: <span className="font-mono text-gray-300">{checkoutData.transactionId}</span></p>
          <p>Status: <span className="font-bold uppercase text-red-400">{status}</span></p>
        </div>

      </div>
    </div>
  );
};

export default KhqrCcPluginModal;
