import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../api/endpoints';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';
import { createSocket } from '../utils/socket';
import { toast } from 'react-toastify';
import BakongCard from './BakongCard';

const ABAKHQRModal = ({ isOpen, onClose, khqrData, orderId }) => {
  const navigate = useNavigate();
  const { fetchWallet } = useWallet();
  const { user } = useAuth();

  const [status, setStatus] = useState('pending'); // pending | paid | scanned | failed | expired
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins countdown
  const [checkingManual, setCheckingManual] = useState(false);

  useEffect(() => {
    if (!isOpen || !khqrData?.transactionId) return;

    setStatus(khqrData.status || 'pending');
    setTimeLeft(khqrData?.expiresInSeconds || 300);

    // 1. Countdown Timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Success Redirection Helper
    const handlePaymentComplete = (currentOrderId) => {
      const targetOrderId = currentOrderId || khqrData.orderId || orderId;
      setTimeout(() => {
        onClose();
        if (targetOrderId) {
          navigate(`/payment/success?tran_id=${khqrData.transactionId}&order_id=${targetOrderId}`);
        } else {
          navigate(`/wallet/topup/success?tran_id=${khqrData.transactionId}`);
        }
      }, 1500);
    };

    // 2. Automatic 5-Second Status Polling Loop
    const TERMINAL = new Set(['paid', 'PAID', 'expired', 'EXPIRED', 'failed', 'FAILED']);
    const pollInterval = setInterval(async () => {
      try {
        const res = await paymentAPI.checkStatus(khqrData.transactionId);
        const fetchedStatus = (res.data?.status || res.data?.data?.status || '').toLowerCase();

        if (fetchedStatus === 'paid' || fetchedStatus === 'success') {
          setStatus('paid');
          clearInterval(pollInterval);
          clearInterval(timer);
          await fetchWallet();
          toast.success('Payment confirmed successfully!');
          handlePaymentComplete(res.data?.orderId || res.data?.data?.orderId);
        } else if (fetchedStatus === 'scanned') {
          setStatus('scanned');
        } else if (fetchedStatus === 'failed' || fetchedStatus === 'cancelled') {
          setStatus('failed');
          clearInterval(pollInterval);
          clearInterval(timer);
        } else if (fetchedStatus === 'expired') {
          setStatus('expired');
          clearInterval(pollInterval);
          clearInterval(timer);
        }
      } catch (err) {
        console.warn('[CutLuy Polling Notice]', err.message);
      }
    }, 4000);

    // 3. Socket.io Real-time Event Listener
    let socket;
    if (user?.id) {
      socket = createSocket();
      socket.emit('join_user_room', user.id);
      socket.on('payment_success', (data) => {
        if (data.transactionId === khqrData.transactionId || data.transaction_id === khqrData.transactionId) {
          setStatus('paid');
          clearInterval(pollInterval);
          clearInterval(timer);
          fetchWallet();
          toast.success('Payment verified in real time!');
          handlePaymentComplete(data.orderId || data.order_id);
        }
      });
    }

    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
      if (socket) socket.disconnect();
    };
  }, [isOpen, khqrData?.transactionId, khqrData?.orderId, khqrData?.status, khqrData?.expiresInSeconds, user?.id, navigate, fetchWallet, onClose, orderId]);

  if (!isOpen || !khqrData) return null;

  const handleManualCheck = async () => {
    if (checkingManual) return;
    setCheckingManual(true);
    try {
      const res = await paymentAPI.checkStatus(khqrData.transactionId);
      const currentStatus = (res.data?.status || res.data?.data?.status || '').toLowerCase();

      if (currentStatus === 'paid' || currentStatus === 'success') {
        setStatus('paid');
        await fetchWallet();
        toast.success('Payment confirmed successfully!');
        const targetOrderId = res.data?.orderId || res.data?.data?.orderId || orderId;
        setTimeout(() => {
          onClose();
          if (targetOrderId) {
            navigate(`/payment/success?tran_id=${khqrData.transactionId}&order_id=${targetOrderId}`);
          } else {
            navigate(`/wallet/topup/success?tran_id=${khqrData.transactionId}`);
          }
        }, 1200);
      } else if (currentStatus === 'expired') {
        setStatus('expired');
        toast.warn('This QR session has expired.');
      } else if (currentStatus === 'failed') {
        setStatus('failed');
        toast.error('Payment failed.');
      } else {
        toast.info('Payment still pending. Please confirm in your mobile banking app.');
      }
    } catch (err) {
      toast.error('Unable to verify payment status.');
    } finally {
      setCheckingManual(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 p-2 text-gray-300 hover:text-white rounded-full bg-slate-900 border border-gray-700 shadow-xl transition-transform hover:scale-110"
        >
          <X className="size-4" />
        </button>

        {/* Bakong Card */}
        <BakongCard
          qrString={khqrData.qr_string || khqrData.qrString || khqrData.qrData}
          qrImage={khqrData.qrImage || khqrData.qrCode}
          amount={khqrData.amount}
          currency={khqrData.currency || 'USD'}
          merchantName={khqrData.merchantName || 'KV Digital Cinema'}
          logoUrl="/logo.png"
          checkoutUrl={khqrData.checkout_url || khqrData.checkoutUrl}
          transactionId={khqrData.transactionId}
          status={status}
          timeLeft={timeLeft}
          onCheckStatus={handleManualCheck}
          isChecking={checkingManual}
        />
      </div>
    </div>
  );
};

export default ABAKHQRModal;
