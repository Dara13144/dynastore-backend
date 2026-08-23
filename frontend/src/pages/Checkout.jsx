import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI, paymentAPI } from '../api/endpoints';
import ABAKHQRModal from '../components/ABAKHQRModal';
import { QrCode, ShieldCheck, Loader2, Lock, User, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import AbaKhqrLogo from '../components/AbaKhqrLogo';

const Checkout = () => {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('ABA_KHQR');
  const [loading, setLoading] = useState(false);

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('012345678');

  const [khqrData, setKhqrData] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-white">No items to checkout</h2>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-3 rounded-full gold-glow-button text-black font-bold text-xs"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!user) {
      toast.info('Please sign in to proceed with payment');
      return openAuthModal('login');
    }

    setLoading(true);
    try {
      // Step 1: Create Pending Order on Backend
      const itemsPayload = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const orderRes = await orderAPI.createOrder({ items: itemsPayload, type: 'ECOMMERCE' });
      const orderId = orderRes.data?.data?.orderId || orderRes.data?.data?.order?.id;
      setActiveOrderId(orderId);

      // Step 2: Initialize CutLuy KHQR Gateway
      const payRes = await paymentAPI.createCutLuyPayment(subtotal, orderId);
      setKhqrData(payRes.data?.data);
      toast.success('Bakong KHQR generated for Order #' + orderId);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Checkout failed. Please try again.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white">Checkout Order</h1>
        <p className="text-xs text-gray-400">Complete your transaction instantly using official NBC Bakong KHQR.</p>
      </div>

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Customer Details & Payment Options */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer Information */}
          <div className="p-6 bg-theme-card rounded-3xl border border-gray-800 space-y-4 shadow-lg">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-theme-gold" /> Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-900 border border-gray-800 rounded-xl py-2.5 px-4 text-xs font-bold text-white focus:border-theme-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold">Email Address</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-gray-800 rounded-xl py-2.5 px-4 text-xs font-bold text-white focus:border-theme-gold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 bg-theme-card rounded-3xl border border-gray-800 space-y-4 shadow-lg">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-theme-gold" /> Payment Method
            </h3>

            <div className="space-y-3">
              {/* Option: Bakong KHQR */}
              <label
                onClick={() => setPaymentMethod('ABA_KHQR')}
                className="p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all select-none border-red-500 bg-red-600/10 text-white shadow-lg ring-1 ring-red-500/40"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'ABA_KHQR'}
                    onChange={() => setPaymentMethod('ABA_KHQR')}
                    className="accent-red-500"
                  />
                  <AbaKhqrLogo className="w-10 h-10" />
                  <div>
                    <p className="text-xs font-black text-white">Bakong KHQR</p>
                    <p className="text-[10px] text-gray-400">Scan & Pay using ABA Mobile & all Bakong banking apps</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-600/20 text-red-400 border border-red-500/30">
                  SCAN & PAY
                </span>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Action */}
        <div className="p-6 bg-theme-card rounded-3xl border border-gray-800 space-y-6 h-fit shadow-xl">
          <h3 className="text-lg font-black text-white">Order Summary</h3>

          {/* Product Items Breakdown */}
          <div className="space-y-3 border-b border-gray-800 pb-4 max-h-60 overflow-y-auto pr-1">
            {cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate max-w-[170px]">
                  <span className="font-bold text-gray-400">{quantity}x</span>
                  <span className="text-white truncate">{product.name}</span>
                </div>
                <span className="font-bold text-theme-gold">${(product.price * quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs border-b border-gray-800 pb-4">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span className="font-bold text-white">${subtotal.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Tax & Processing</span>
              <span className="font-bold text-emerald-400">$0.00 USD</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm font-black text-white">
            <span>Total Payable</span>
            <span className="text-2xl text-theme-gold">${subtotal.toFixed(2)} USD</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-500 hover:to-amber-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-gold-glow transition-all transform hover:scale-[1.01] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating KHQR Code...
              </>
            ) : (
              'Pay with Bakong KHQR'
            )}
          </button>

          <p className="text-[11px] text-gray-500 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Protected by NBC Bakong & 256-bit Encryption
          </p>

        </div>

      </form>

      {/* Modals */}
      <ABAKHQRModal
        isOpen={Boolean(khqrData)}
        onClose={() => setKhqrData(null)}
        khqrData={khqrData}
        orderId={activeOrderId}
      />

    </div>
  );
};

export default Checkout;
