import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-theme-bg border-t border-gray-800/80 pt-16 pb-12 mt-20 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Official Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="DYNA STORE"
                className="h-10 w-auto rounded-xl object-contain shadow-gold-glow border border-amber-500/30"
              />
              <div>
                <span className="text-lg font-black text-white tracking-wider">
                  DYNA STORE
                </span>
                <span className="block text-[9px] font-extrabold tracking-[0.18em] text-theme-gold uppercase -mt-1">
                  DIGITAL STORE
                </span>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-gray-400">
              The premier digital game store platform. Buy and download games and digital items instantly with CutLuy and Bakong KHQR.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Explore</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/movies" className="hover:text-theme-gold transition-colors">GAME & Media</Link></li>
              <li><Link to="/topup" className="hover:text-theme-gold transition-colors">Top Up Wallet</Link></li>
              <li><Link to="/orders" className="hover:text-theme-gold transition-colors">MY ORDERS</Link></li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Support & Legal</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/about" className="hover:text-theme-gold transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-theme-gold transition-colors">Contact Support</Link></li>
              <li><Link to="/terms" className="hover:text-theme-gold transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-theme-gold transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Supported Payments */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Payment Methods</h4>
            <p className="text-xs text-gray-400 mb-3">Instant auto-verifying balance top up via:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-theme-card border border-gray-700/60 text-[11px] font-bold text-red-400">
                ABA PAYWAY
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-theme-card border border-gray-700/60 text-[11px] font-bold text-amber-400">
                BAKONG KHQR
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-theme-card border border-gray-700/60 text-[11px] font-bold text-blue-400">
                VISA / MASTER
              </span>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-800/80 mt-12 pt-8 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} DYNA STORE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
