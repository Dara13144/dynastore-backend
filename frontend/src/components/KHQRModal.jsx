import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../api/endpoints';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { QrCode, CheckCircle2, RefreshCw, X, Loader2, Zap } from 'lucide-react';
import { createSocket } from '../utils/socket';
import { toast } from 'react-toastify';

const KHQRModal = ({ isOpen, onClose, qrData, orderId }) => {
  const navigate = useNavigate();
  const { fetchWallet } = useWallet();
  const { user } = useAuth();

  const [timeLeft, setTimeLeft] = useState(90); // 1:30
  const [status, setStatus] = useState('WAITING'); // WAITING | PAID | EXPIRED

  useEffect(() => {
    if (!isOpen || !qrData?.transactionId) return;

    setTimeLeft(90);
    setStatus('WAITING');

    const handlePaymentComplete = (currentOrderId) => {
      onClose();
      if (currentOrderId || orderId) {
        navigate(`/payment/success?tran_id=${qrData.transactionId}&order_id=${currentOrderId || orderId || ''}`);
      } else {
        navigate(`/wallet/topup/success?tran_id=${qrData.transactionId}`);
      }
    };

    // Countdown Timer
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

    // Polling Backend status every 3 seconds (max 100 attempts / 5 mins)
    let pollCount = 0;
    const pollInterval = setInterval(async () => {
      pollCount += 1;
      if (pollCount > 100) {
        clearInterval(pollInterval);
        clearInterval(timer);
        setStatus('EXPIRED');
        return;
      }

      try {
        const res = await paymentAPI.checkBakongStatus(qrData.transactionId);
        const fetchedStatus = res.data?.status || res.data?.data?.status;
        if (fetchedStatus === 'PAID') {
          setStatus('PAID');
          await fetchWallet();
          clearInterval(pollInterval);
          clearInterval(timer);
          toast.success('KHQR Payment Verified!');
          setTimeout(() => {
            handlePaymentComplete(res.data?.orderId || res.data?.data?.orderId);
          }, 1200);
        } else if (fetchedStatus === 'EXPIRED') {
          setStatus('EXPIRED');
          clearInterval(pollInterval);
          clearInterval(timer);
        }
      } catch (err) {
        console.warn('Bakong polling notice:', err.message);
      }
    }, 2500);

    // Socket.io Listener
    let socket;
    if (user?.id) {
      socket = createSocket();
      socket.emit('join_user_room', user.id);
      socket.on('payment_success', (data) => {
        if (data.transactionId === qrData.transactionId) {
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
  }, [isOpen, qrData?.transactionId, user?.id, navigate, fetchWallet, onClose, orderId]);

  if (!isOpen || !qrData) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-theme-card border border-amber-500/40 rounded-3xl p-6 shadow-gold-glow text-center space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase bg-red-600/20 text-red-400 border border-red-500/30 mb-2">
            BAKONG KHQR • NBC STANDARD
          </span>
          <h3 className="text-xl font-black text-white">Scan to Pay via KHQR</h3>
          <p className="text-xs text-gray-400 mt-1">
            Amount: <span className="text-theme-gold font-bold">${qrData.amount} USD</span>
          </p>
        </div>

        {/* QR Display */}
        {status === 'PAID' ? (
          <div className="py-10 space-y-3">
            <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-emerald-400">Payment Completed!</h4>
            <p className="text-xs text-gray-300">Transaction verified successfully.</p>
          </div>
        ) : status === 'EXPIRED' ? (
          <div className="py-10 space-y-3">
            <RefreshCw className="w-16 h-16 text-rose-400 mx-auto" />
            <h4 className="text-lg font-bold text-rose-400">QR Code Expired</h4>
            <p className="text-xs text-gray-400">Please close this modal and regenerate a new KHQR code.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="inline-block p-4 bg-white rounded-2xl shadow-xl border-4 border-red-600">
              <img
                src={qrData.qrImage}
                alt="Bakong KHQR"
                className="w-56 h-56 mx-auto object-contain"
              />
              <p className="text-[10px] font-bold text-black uppercase mt-2 tracking-wider">
                BAKONG NATIONAL BANK OF CAMBODIA
              </p>
            </div>

            {/* Real-time Reactive Status Indicator */}
            <div className="space-y-1">
              {status === 'DETECTED' ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-sky-400 bg-sky-500/10 py-1.5 px-4 rounded-full border border-sky-500/20 w-fit mx-auto">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  <span>Payment detected...</span>
                </div>
              ) : status === 'VERIFYING' ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 py-1.5 px-4 rounded-full border border-emerald-500/20 w-fit mx-auto">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Payment verified...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 py-1.5 px-4 rounded-full border border-amber-500/20 w-fit mx-auto">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Waiting for payment...</span>
                </div>
              )}
              <p className="text-[11px] text-gray-400">
                {status === 'DETECTED'
                  ? 'Payment detected on Bakong network. Confirming transaction...'
                  : status === 'VERIFYING'
                  ? 'Transaction verified! Unlocking purchase...'
                  : 'Please complete payment in your mobile banking app.'}
              </p>
              <div className="text-xs text-gray-400 pt-1">
                QR expires in:{' '}
                <span className="font-mono font-bold text-theme-gold text-sm">
                  0{minutes}:{seconds < 10 ? '0' : ''}{seconds}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 bg-slate-900/60 rounded-2xl border border-gray-800 text-xs text-gray-400 text-left space-y-1">
          <p className="text-[11px]">Transaction ID: <span className="font-mono text-gray-300">{qrData.transactionId}</span></p>
          {orderId && <p className="text-[11px]">Order ID: <span className="font-mono text-gray-300">#{orderId}</span></p>}
        </div>

      </div>
    </div>
  );
};

export default KHQRModal;
