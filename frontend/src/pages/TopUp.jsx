import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { paymentAPI, walletAPI } from '../api/endpoints';
import ABAKHQRModal from '../components/ABAKHQRModal';
import { Wallet, QrCode, Loader2, CheckCircle2, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import AbaKhqrLogo from '../components/AbaKhqrLogo';

const TopUp = () => {
  const { balance, fetchWallet } = useWallet();
  const { user, openAuthModal } = useAuth();
  const [amount, setAmount] = useState('25.00');
  const [paymentMethod, setPaymentMethod] = useState('ABA_KHQR');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [abaKhqrData, setAbaKhqrData] = useState(null);

  const presets = ['0.01', '1.00', '5.00', '10.00', '25.00', '50.00'];

  // Cooldown countdown timer for 429 rate limit
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleGeneratePayment = async (e) => {
    e.preventDefault();
    if (loading || cooldown > 0) return;

    if (!user) {
      toast.info('Please sign in to top up your balance');
      return openAuthModal('login');
    }

    if (!amount || parseFloat(amount) <= 0) {
      return toast.error('Please enter a valid top up amount');
    }

    setLoading(true);
    try {
      const res = await paymentAPI.createCutLuyPayment(parseFloat(amount));
      setAbaKhqrData(res.data.data);
      toast.success('Bakong KHQR generated successfully!');
    } catch (err) {
      if (err.response?.status === 429) {
        toast.warn('Too many payment requests. Please wait 10 seconds.');
        setCooldown(10);
      } else {
        const errMsg = err.response?.data?.message || 'Payment initialization failed. Please try again.';
        toast.error(errMsg);
        if (err.response?.status === 401) {
          openAuthModal('login');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Page Title */}
      <div className="text-center space-y-2">
        <img
          src="/logo.png"
          alt="KV MOVIES DIGITAL CINEMA"
          className="w-14 h-14 rounded-2xl mx-auto shadow-gold-glow object-contain border border-amber-500/30"
        />
        <h1 className="text-3xl font-black text-white">Top Up Wallet Balance</h1>
        <p className="text-xs text-gray-400">Instant auto-verifying deposit via NBC Bakong KHQR Gateway.</p>
      </div>

      {/* Current Balance Card */}
      <div className="p-6 bg-gradient-to-r from-theme-card via-slate-900 to-theme-card rounded-3xl border border-amber-500/30 shadow-gold-glow flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Available Balance</p>
          <p className="text-4xl font-black text-theme-gold mt-1">${balance.toFixed(2)} USD</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-4 py-2 rounded-full text-xs font-bold bg-amber-500/20 text-theme-gold border border-amber-500/30 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> INSTANT 24/7 AUTO CONFIRM
          </span>
        </div>
      </div>

      {/* Top Up Form */}
      <form onSubmit={handleGeneratePayment} className="p-6 sm:p-8 bg-theme-card rounded-3xl border border-gray-800 space-y-6">
        
        {/* Preset Amounts */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-300">Select Preset Amount</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`py-2.5 rounded-xl text-xs font-black transition-all border ${
                  amount === preset
                    ? 'bg-amber-500 text-black border-amber-400 shadow-gold-sm scale-105'
                    : 'bg-slate-900 text-gray-300 border-gray-800 hover:border-gray-700'
                }`}
              >
                ${parseFloat(preset).toFixed(0)}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-300">Custom Top Up Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-sm font-bold text-theme-gold">$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              disabled={loading || cooldown > 0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-900 border border-gray-800 rounded-xl py-3 pl-8 pr-4 text-sm font-bold text-white focus:border-theme-gold focus:outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-300">Payment Gateway</label>
          <div className="space-y-3">
            
            {/* Option: Bakong KHQR */}
            <div
              onClick={() => setPaymentMethod('ABA_KHQR')}
              className="p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all select-none border-red-500 bg-red-600/10 text-white shadow-lg ring-1 ring-red-500/40"
            >
              <div className="flex items-center gap-3.5">
                <AbaKhqrLogo className="w-11 h-11" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-white">Bakong KHQR</p>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                      SCAN & PAY
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Instant KHQR Scan & Pay via ABA Mobile & Bakong banking apps</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30">
                <CheckCircle2 className="w-4 h-4" />
                <span>Selected</span>
              </div>
            </div>

          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || cooldown > 0}
          className="w-full py-4 rounded-full gold-glow-button text-black font-extrabold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-gold-glow"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Generating KHQR Code...
            </>
          ) : cooldown > 0 ? (
            `Please wait ${cooldown}s before retrying`
          ) : (
            <>
              Proceed with KHQR Payment (${parseFloat(amount || 0).toFixed(2)} USD) <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </form>

      {/* Modals */}
      <ABAKHQRModal
        isOpen={Boolean(abaKhqrData)}
        onClose={() => setAbaKhqrData(null)}
        khqrData={abaKhqrData}
      />

    </div>
  );
};

export default TopUp;
