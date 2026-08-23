import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { orderAPI, walletAPI, movieAPI, authAPI } from '../api/endpoints';
import {
  User,
  Wallet,
  ShoppingBag,
  Heart,
  CreditCard,
  Play,
  KeyRound,
  Loader2,
  Settings,
  PlusCircle,
  Film,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const { user, login } = useAuth();
  const { balance, fetchWallet } = useWallet();
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState('purchases'); // 'purchases' | 'favorites' | 'transactions' | 'settings'

  // Data States
  const [purchases, setPurchases] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const defaultAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  ];

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [purchasesRes, walletRes, favRes] = await Promise.all([
        orderAPI.getUserPurchases().catch(() => ({ data: { data: [] } })),
        walletAPI.getWallet().catch(() => ({ data: { data: { transactions: [] } } })),
        movieAPI.getFavorites().catch(() => ({ data: { data: [] } }))
      ]);

      setPurchases(purchasesRes.data?.data || []);
      setTransactions(walletRes.data?.data?.transactions || []);
      setFavorites(favRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    try {
      setIsUpdatingProfile(true);
      const res = await authAPI.updateProfile({ name, avatar });
      toast.success(res.data.message || 'Profile updated successfully!');
      // Update local storage user
      const updatedUser = { ...user, name, avatar };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      return toast.error('Please enter all required password fields');
    }
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }

    try {
      setIsChangingPass(true);
      const res = await authAPI.changePassword({
        currentPassword,
        newPassword
      });
      toast.success(res.data.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPass(false);
    }
  };

  // Handle Remove Favorite
  const handleRemoveFavorite = async (movieId) => {
    try {
      await movieAPI.toggleFavorite(movieId);
      setFavorites((prev) => prev.filter((m) => m.id !== movieId));
      toast.success('Removed from favorites');
    } catch (e) {
      toast.error('Failed to update favorites');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Header Profile Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-theme-card via-slate-900 to-theme-card border border-gray-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative group">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-theme-gold shadow-gold-sm"
            />
            <button
              onClick={() => setActiveTab('settings')}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-theme-gold text-black shadow-md hover:scale-110 transition-transform"
              title="Change Avatar"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-theme-gold border border-amber-500/40 text-[10px] font-black uppercase">
                {user?.role || 'MEMBER'}
              </span>
            </div>
            <p className="text-xs text-gray-400">{user?.email}</p>
            <p className="text-[11px] text-gray-400 flex items-center justify-center sm:justify-start gap-1">
              <Calendar className="w-3.5 h-3.5 text-theme-gold" />
              Member of KV Cinema
            </p>
          </div>
        </div>

        {/* Quick Action Top Up */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/topup')}
            className="px-6 py-3 rounded-full gold-glow-button text-black font-extrabold text-xs flex items-center gap-2 shadow-gold-sm hover:scale-105 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 fill-black" />
            <span>Top Up Wallet</span>
          </button>
          <button
            onClick={() => navigate('/movies')}
            className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-gray-700 transition-colors shadow-md cursor-pointer"
          >
            Browse Movies
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Wallet Balance */}
        <div className="p-5 rounded-2xl bg-theme-card border border-amber-500/30 flex items-center justify-between shadow-gold-sm">
          <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Wallet Balance</p>
            <p className="text-2xl sm:text-3xl font-black text-theme-gold mt-1">${balance.toFixed(2)}</p>
            <span className="text-[10px] text-emerald-400 font-semibold">Ready for 1-click buy</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-theme-gold">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Purchased Movies */}
        <div className="p-5 rounded-2xl bg-theme-card border border-gray-800 flex items-center justify-between shadow-md">
          <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">My Unlocked Videos</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{purchases.length}</p>
            <span className="text-[10px] text-gray-400 font-semibold">Lifetime & Rentals</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Film className="w-6 h-6" />
          </div>
        </div>

        {/* Wishlist Favorites */}
        <div className="p-5 rounded-2xl bg-theme-card border border-gray-800 flex items-center justify-between shadow-md">
          <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Saved Favorites</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{favorites.length}</p>
            <span className="text-[10px] text-rose-400 font-semibold">Wishlist Movies</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        {/* Total Transactions */}
        <div className="p-5 rounded-2xl bg-theme-card border border-gray-800 flex items-center justify-between shadow-md">
          <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Total Transactions</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{transactions.length}</p>
            <span className="text-[10px] text-gray-400 font-semibold">KHQR & Wallet Logs</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-theme-card/70 p-1.5 rounded-2xl border border-gray-800 text-xs font-bold w-fit shadow-md">
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'purchases' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>My Purchased Movies ({purchases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'favorites' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>My Favorites ({favorites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'transactions' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Wallet History ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Account Settings</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-10 h-10 text-theme-gold animate-spin mx-auto" />
          <p className="text-xs text-gray-400">Loading your dashboard...</p>
        </div>
      ) : activeTab === 'purchases' ? (
        
        /* 🎬 1. My Purchased Movies Panel */
        <div className="space-y-4">
          {purchases.length === 0 ? (
            <div className="py-20 text-center bg-theme-card rounded-3xl border border-gray-800 space-y-4 p-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-theme-gold mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">No Purchased Movies Yet</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Browse our high-speed 4K blockbusters, buy with your wallet balance, and stream immediately.
                </p>
              </div>
              <button
                onClick={() => navigate('/movies')}
                className="px-6 py-3 rounded-full gold-glow-button text-black font-extrabold text-xs shadow-gold-sm hover:scale-105 transition-all"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {purchases.map((p) => (
                <div
                  key={p.orderId || p.id}
                  className="p-4 rounded-3xl bg-theme-card border border-gray-800 hover:border-amber-500/50 transition-all flex gap-4 items-center shadow-lg group"
                >
                  <img
                    src={p.movie?.poster || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400'}
                    alt={p.movie?.title}
                    className="w-20 h-28 rounded-2xl object-cover shadow-md border border-gray-700/60 shrink-0"
                  />
                  <div className="space-y-1.5 flex-grow min-w-0">
                    <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full inline-block">
                      {p.purchaseType || 'LIFETIME'} ACCESS
                    </span>
                    <h4 className="text-sm font-black text-white truncate">{p.movie?.title}</h4>
                    <p className="text-xs text-theme-gold font-bold">Paid: ${p.pricePaid || p.movie?.price}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {new Date(p.createdAt || Date.now()).toLocaleDateString()}
                    </p>

                    <button
                      onClick={() => navigate(`/watch/${p.movie?.slug || p.movie?.id}`)}
                      className="px-4 py-2 rounded-full gold-glow-button text-black font-black text-xs flex items-center gap-1.5 mt-2 shadow-gold-sm hover:scale-105 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Watch Stream (4K)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : activeTab === 'favorites' ? (

        /* ❤️ 2. Favorites / Wishlist Panel */
        <div className="space-y-4">
          {favorites.length === 0 ? (
            <div className="py-20 text-center bg-theme-card rounded-3xl border border-gray-800 space-y-4 p-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">Your Wishlist is Empty</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Click the heart icon on any movie poster to bookmark it for later.
                </p>
              </div>
              <button
                onClick={() => navigate('/movies')}
                className="px-6 py-3 rounded-full gold-glow-button text-black font-extrabold text-xs shadow-gold-sm hover:scale-105 transition-all"
              >
                Discover Movies
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-3xl bg-theme-card border border-gray-800 flex gap-4 items-center shadow-lg group hover:border-amber-500/40 transition-all"
                >
                  <img
                    src={m.poster}
                    alt={m.title}
                    className="w-20 h-28 rounded-2xl object-cover shadow-md border border-gray-700/60 shrink-0"
                  />
                  <div className="space-y-1.5 flex-grow min-w-0">
                    <span className="text-[10px] font-black text-theme-gold uppercase bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full inline-block">
                      ★ {m.rating || '9.0'}
                    </span>
                    <h4 className="text-sm font-black text-white truncate">{m.title}</h4>
                    <p className="text-xs text-gray-400">{m.releaseYear} • {m.duration}m</p>
                    
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => navigate(`/movie/${m.slug || m.id}`)}
                        className="px-3.5 py-1.5 rounded-full gold-glow-button text-black font-black text-xs flex items-center gap-1 shadow-gold-sm cursor-pointer hover:scale-105 transition-all"
                      >
                        <Play className="w-3 h-3 fill-black" />
                        <span>View / Buy</span>
                      </button>

                      <button
                        onClick={() => handleRemoveFavorite(m.id)}
                        className="p-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : activeTab === 'transactions' ? (

        /* 💳 3. Wallet Transactions History Panel */
        <div className="space-y-4">
          <div className="bg-theme-card rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-900/90 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-theme-gold" /> All Wallet & Payment Logs
              </h3>
              <button
                onClick={() => navigate('/topup')}
                className="px-3 py-1 rounded-xl gold-glow-button text-black font-bold text-xs"
              >
                + Top Up Now
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="py-16 text-center text-xs text-gray-400 space-y-2">
                <CreditCard className="w-8 h-8 mx-auto text-gray-600" />
                <p>No transaction history recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-slate-900 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                    <tr>
                      <th className="p-4">Type</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Reference ID</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {transactions.map((tx) => {
                      const isDeposit = tx.type === 'DEPOSIT' || tx.type === 'TOPUP' || tx.amount > 0;
                      return (
                        <tr key={tx.id} className="hover:bg-gray-800/40 transition-colors">
                          <td className="p-4">
                            <span className={`font-black text-[10px] px-2.5 py-1 rounded-full uppercase ${
                              isDeposit ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}>
                              {tx.type || 'PAYMENT'}
                            </span>
                          </td>
                          <td className="p-4 font-black text-sm text-white">
                            <span className={isDeposit ? 'text-emerald-400' : 'text-amber-400'}>
                              {isDeposit ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)} USD
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-gray-200">{tx.description || 'Cinema Order'}</td>
                          <td className="p-4 font-mono text-[11px] text-gray-400">{tx.reference || tx.id?.slice(0, 12) || 'N/A'}</td>
                          <td className="p-4">
                            <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              COMPLETED
                            </span>
                          </td>
                          <td className="p-4 text-gray-400 text-[11px]">{new Date(tx.createdAt).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      ) : (

        /* ⚙️ 4. Account Settings Panel */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Profile Details Form */}
          <div className="p-6 rounded-3xl bg-theme-card border border-gray-800 space-y-5 shadow-xl">
            <div className="border-b border-gray-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <User className="w-5 h-5 text-theme-gold" /> Personal Profile Information
              </h3>
              <p className="text-xs text-gray-400">Update your display name and avatar photo.</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-theme-gold focus:outline-none"
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Email Address (Registered)</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full bg-slate-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-slate-900 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-theme-gold focus:outline-none font-mono"
                  placeholder="https://..."
                />
                
                {/* Preset Avatar Selection */}
                <p className="text-[11px] text-gray-400">Or pick a preset avatar:</p>
                <div className="flex items-center gap-2 pt-1">
                  {defaultAvatars.map((avUrl, i) => (
                    <img
                      key={i}
                      src={avUrl}
                      alt="Preset"
                      onClick={() => setAvatar(avUrl)}
                      className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 transition-transform hover:scale-110 ${
                        avatar === avUrl ? 'border-theme-gold ring-2 ring-amber-500/40' : 'border-gray-700 opacity-60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full py-3.5 rounded-full gold-glow-button text-black font-black text-xs flex items-center justify-center gap-2 shadow-gold-sm hover:scale-105 transition-all cursor-pointer mt-4"
              >
                {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Security & Password Form */}
          <div className="p-6 rounded-3xl bg-theme-card border border-gray-800 space-y-5 shadow-xl">
            <div className="border-b border-gray-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-theme-gold" /> Security & Password
              </h3>
              <p className="text-xs text-gray-400">Change your account password securely.</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-theme-gold focus:outline-none pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-theme-gold focus:outline-none pr-10"
                    placeholder="Minimum 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-theme-gold focus:outline-none"
                  placeholder="Re-type new password"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPass}
                className="w-full py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-black text-xs border border-gray-700 flex items-center justify-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer mt-4"
              >
                {isChangingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
              </button>
            </form>
          </div>

        </div>

      )}

    </div>
  );
};

export default UserDashboard;
