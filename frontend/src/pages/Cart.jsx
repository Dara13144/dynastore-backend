import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal, itemCount } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-slate-900 border border-gray-800 flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-2xl font-black text-white">Your Cart is Empty</h2>
        <p className="text-xs text-gray-400 max-w-sm">
          Looks like you haven't added any cinema passes or merchandise yet.
        </p>
        <Link
          to="/products"
          className="px-6 py-3 rounded-full gold-glow-button text-black font-extrabold text-xs inline-flex items-center gap-2"
        >
          Browse Products Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Shopping Cart</h1>
          <p className="text-xs text-gray-400 mt-1">{itemCount} items in cart</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-gray-400 hover:text-rose-400 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="p-5 bg-theme-card rounded-3xl border border-gray-800 flex items-center gap-4 shadow-lg"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-2xl bg-slate-900 shrink-0"
              />
              
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="text-sm font-bold text-white truncate">{product.name}</h3>
                <p className="text-xs text-theme-gold font-black">${product.price.toFixed(2)} USD</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3 bg-slate-900/80 p-1.5 rounded-xl border border-gray-800">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-black text-white w-4 text-center">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => removeFromCart(product.id)}
                className="p-2 text-gray-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="p-6 bg-theme-card rounded-3xl border border-gray-800 space-y-6 h-fit shadow-xl">
          <h3 className="text-lg font-black text-white">Order Summary</h3>

          <div className="space-y-3 text-xs border-b border-gray-800 pb-4">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal ({itemCount} items)</span>
              <span className="font-bold text-white">${subtotal.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Estimated Tax</span>
              <span className="font-bold text-emerald-400">$0.00 USD</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm font-black text-white">
            <span>Total</span>
            <span className="text-2xl text-theme-gold">${subtotal.toFixed(2)} USD</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 rounded-full gold-glow-button text-black font-black text-xs flex items-center justify-center gap-2"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-gray-500 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure Official ABA PayWay Checkout
          </p>
        </div>

      </div>

    </div>
  );
};

export default Cart;
