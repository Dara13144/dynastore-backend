import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Film,
  Tv,
  Radio,
  Search,
  Wallet,
  User,
  LogOut,
  ShieldAlert,
  ShoppingBag,
  Heart,
  PlusCircle,
  Menu,
  X,
  Sun,
  Moon,
  Globe
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, openAuthModal } = useAuth();
  const { balance } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isSuperAdmin = user && ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);

  const navLinks = [
    { name: t('navHome'), path: '/' },
    { name: t('navMovies'), path: '/movies' },
    { name: t('navOrders'), path: '/orders', protected: true }
  ];

  return (
    <header className="sticky top-0 z-50 bg-theme-nav/80 backdrop-blur-md border-b border-gray-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Official Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="DYNA STORE"
              className="h-11 w-auto rounded-xl object-contain shadow-gold-glow animate-float group-hover:scale-110 transition-all duration-300 border border-amber-500/40"
            />
            <div>
              <span className="text-xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-white to-cyan-400">
                DYNA STORE
              </span>
              <span className="block text-[9px] font-extrabold tracking-[0.2em] text-theme-gold uppercase -mt-1">
                DIGITAL STORE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.protected && !user) return null;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-theme-gold bg-theme-slate/50 font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/40'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Search & Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* Live Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 lg:w-56 bg-theme-card/90 border border-gray-700/60 rounded-full py-1.5 pl-8 pr-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-theme-gold focus:ring-1 focus:ring-theme-gold transition-all"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            </form>

            {/* Language Switcher Button (EN / KM) */}
            <button
              onClick={toggleLang}
              className="px-2.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-gray-700/60 text-xs font-bold text-gray-200 flex items-center gap-1.5 transition-all shadow-sm"
              title="Switch Language (English / ភាសាខ្មែរ)"
            >
              <Globe className="w-3.5 h-3.5 text-theme-gold" />
              <span>{lang === 'en' ? '🇬🇧 EN' : '🇰🇭 ខ្មែរ'}</span>
            </button>

            {/* Night / Light Mode Switcher Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-gray-700/60 text-amber-400 transition-all shadow-sm"
              title={theme === 'dark' ? t('modeLight') : t('modeNight')}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>

            {/* Wallet Balance Badge */}
            {user ? (
              <Link
                to="/topup"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-theme-card border border-amber-500/30 hover:border-theme-gold transition-colors group shadow-gold-sm"
              >
                <div className="w-6 h-6 rounded-full bg-theme-gold/20 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5 text-theme-gold" />
                </div>
                <span className="text-xs font-bold text-theme-gold">
                  ${balance.toFixed(2)}
                </span>
                <PlusCircle className="w-3.5 h-3.5 text-gray-400 group-hover:text-theme-gold transition-colors" />
              </Link>
            ) : null}

            {/* Auth / Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-theme-gold/60 shadow-md hover:border-theme-gold transition-all"
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div
                    className="absolute right-0 mt-3 w-56 bg-theme-card/95 backdrop-blur-xl border border-gray-700/80 rounded-2xl shadow-2xl py-2 z-50"
                    onMouseLeave={() => setIsProfileOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-theme-gold font-bold uppercase">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/topup"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-xs text-theme-gold font-bold hover:bg-amber-500/10"
                    >
                      <span className="flex items-center gap-2.5">
                        <Wallet className="w-4 h-4 text-theme-gold" /> Add Balance (Bakong KHQR)
                      </span>
                      <span>${balance.toFixed(2)}</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-300 hover:bg-gray-800/60 hover:text-white"
                    >
                      <User className="w-4 h-4 text-theme-gold" /> User Dashboard
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-300 hover:bg-gray-800/60 hover:text-white"
                    >
                      <Heart className="w-4 h-4 text-rose-400" /> Favorites Wishlist
                    </Link>

                    {isSuperAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-amber-400 hover:bg-amber-500/10 font-medium"
                      >
                        <ShieldAlert className="w-4 h-4" /> Admin Portal
                      </Link>
                    )}

                    <div className="border-t border-gray-800 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 text-left"
                      >
                        <LogOut className="w-4 h-4" /> {t('navSignOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 text-xs font-bold text-gray-300 hover:text-white transition-colors"
                >
                  {t('signIn')}
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-2 text-xs font-black rounded-full gold-glow-button text-black"
                >
                  {t('register')}
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-800 space-y-2">
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-theme-card border border-gray-700 rounded-lg py-2 pl-9 pr-4 text-xs text-white"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </form>
            {navLinks.map((link) => {
              if (link.protected && !user) return null;
              if (link.adminOnly && !['ADMIN', 'SUPER_ADMIN'].includes(user?.role)) return null;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-theme-gold hover:bg-gray-800/50 transition-all"
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
