import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Film, X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { authAPI } from '../api/endpoints';

const AuthModal = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (authModalMode === 'login') {
      await login(email, password);
    } else if (authModalMode === 'register') {
      await register(name, email, password);
    } else if (authModalMode === 'forgot') {
      try {
        await authAPI.forgotPassword({ email });
        toast.success('Password reset link sent to your email.');
        setAuthModalMode('login');
      } catch (err) {
        toast.error('Failed to process request');
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-theme-card border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="DYNA STORE"
            className="w-14 h-14 rounded-2xl mx-auto shadow-gold-glow object-contain border border-amber-500/30"
          />
          <h3 className="text-2xl font-black text-white">
            {authModalMode === 'login' && 'Welcome Back'}
            {authModalMode === 'register' && 'Join DYNA STORE'}
            {authModalMode === 'forgot' && 'Reset Password'}
          </h3>
          <p className="text-xs text-gray-400">
            {authModalMode === 'login' && 'Sign in to access your digital store & wallet balance.'}
            {authModalMode === 'register' && 'Create your account to start streaming movies, podcasts & shopping.'}
            {authModalMode === 'forgot' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Auth Mode Tabs */}
        {authModalMode !== 'forgot' && (
          <div className="flex bg-gray-900/80 rounded-xl p-1 border border-gray-800 text-xs font-bold">
            <button
              onClick={() => setAuthModalMode('login')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authModalMode === 'login'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthModalMode('register')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authModalMode === 'register'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {authModalMode === 'register' && (
            <div className="relative">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-900 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:border-theme-gold focus:outline-none"
              />
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            </div>
          )}

          <div className="relative">
            <input
              type="text"
              placeholder="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:border-theme-gold focus:outline-none"
            />
            <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
          </div>

          {authModalMode !== 'forgot' && (
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:border-theme-gold focus:outline-none"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            </div>
          )}

          {authModalMode === 'login' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setAuthModalMode('forgot')}
                className="text-xs text-theme-gold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full gold-glow-button text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <>
                {authModalMode === 'login' && 'Sign In'}
                {authModalMode === 'register' && 'Create Free Account'}
                {authModalMode === 'forgot' && 'Send Recovery Email'}
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};

export default AuthModal;
