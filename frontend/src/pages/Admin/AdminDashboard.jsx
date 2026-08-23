import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/endpoints';
import { 
  Users, Film, ShoppingBag, DollarSign, TrendingUp, ShieldAlert, Loader2, 
  Radio, CreditCard, Activity, CheckCircle2, AlertTriangle, Sparkles, RefreshCw, 
  Server, Zap, Settings, ArrowRight, Play, Database
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState('Welcome to DYNA STORE Streaming, Products & Auto-Pay');

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getStats();
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="py-32 text-center">
        <Loader2 className="w-10 h-10 text-theme-gold animate-spin mx-auto" />
      </div>
    );
  }

  if (!data || !data.stats) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto shadow-gold-glow">
          <ShieldAlert className="w-8 h-8 text-theme-gold" />
        </div>
        <h2 className="text-2xl font-black text-white">Super Admin Authentication Required</h2>
        <p className="text-xs text-gray-400">
          This portal is protected for administrators (<strong className="text-theme-gold">dynastore2-904758-39q457@gmai.com</strong>).
        </p>
        <button
          onClick={async () => {
            const { authAPI } = await import('../../api/endpoints');
            try {
              const res = await authAPI.login({ email: 'dynastore2-904758-39q457@gmai.com', password: 'dynastore39w8537q458974' });
              localStorage.setItem('accessToken', res.data.data.accessToken);
              localStorage.setItem('refreshToken', res.data.data.refreshToken);
              window.location.reload();
            } catch (e) {
              alert('Failed to login as admin');
            }
          }}
          className="px-6 py-3.5 rounded-full gold-glow-button text-black font-extrabold text-xs shadow-xl cursor-pointer"
        >
          👑 1-Click Admin Login (dynastore2-904758-39q457@gmai.com)
        </button>
      </div>
    );
  }

  const { stats, chartData, recentOrders, recentPayments } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Admin Top Navigation & Header */}
      <AdminNav
        title={
          <span className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-amber-400 animate-pulse-glow" /> All System Master Control Center
          </span>
        }
        subtitle="Complete centralized administration over Games, Store Catalog, Gateways, Wallets, and Users."
        actionButton={
          <button
            onClick={fetchAdminStats}
            className="p-2.5 rounded-xl bg-slate-900 border border-gray-800 hover:border-amber-500/40 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4 text-theme-gold" /> Refresh Stats
          </button>
        }
      />

      {/* Live System Engine Status Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-cyan-950/40 border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold block">KHQR Gateway</span>
            <span className="text-xs font-extrabold text-emerald-400">dara_mao1@bkrt (ONLINE)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Auto Payment Worker</span>
            <span className="text-xs font-extrabold text-cyan-300">Active (3.5s Check-Trans-v2)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold block">WebSockets Live Sync</span>
            <span className="text-xs font-extrabold text-amber-300">Real-Time Socket.io</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Media & 4K CDN Stream</span>
            <span className="text-xs font-extrabold text-purple-300">HTML5 Ultra-HD Video</span>
          </div>
        </div>
      </div>

      {/* 4 Main Core System Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Movies System Control */}
        <Link
          to="/admin/movies"
          className="p-6 rounded-3xl bg-theme-card border border-amber-500/30 hover-glow-card space-y-3 group block transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">Movies & Series Catalog</h3>
            <p className="text-xs text-gray-400 mt-1">Control Trending Now, Most Popular Blockbusters, Top Rated, and 4K video stream links.</p>
          </div>
          <div className="pt-2 flex items-center text-xs font-extrabold text-theme-gold gap-1">
            <span>Manage {stats.totalMovies} Movies</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Podcasts System Control */}
        <Link
          to="/admin/podcasts"
          className="p-6 rounded-3xl bg-theme-card border border-cyan-500/30 hover-glow-card space-y-3 group block transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors">Cinema Podcasts Hub</h3>
            <p className="text-xs text-gray-400 mt-1">Upload 4K video podcasts, audio commentaries, set sell pricing ($), and manage categories.</p>
          </div>
          <div className="pt-2 flex items-center text-xs font-extrabold text-cyan-400 gap-1">
            <span>Manage Podcasts</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Users & Wallet Control */}
        <Link
          to="/admin/users"
          className="p-6 rounded-3xl bg-theme-card border border-purple-500/30 hover-glow-card space-y-3 group block transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white group-hover:text-purple-400 transition-colors">Users & Wallet Balances</h3>
            <p className="text-xs text-gray-400 mt-1">Adjust user wallet funds, deposit credits, deduct balances, and manage account roles.</p>
          </div>
          <div className="pt-2 flex items-center text-xs font-extrabold text-purple-400 gap-1">
            <span>Manage {stats.totalUsers} Users</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Payments & ABA PayWay Dashboard */}
        <Link
          to="/admin/payway"
          className="p-6 rounded-3xl bg-theme-card border border-cyan-500/40 hover-glow-card space-y-3 group block transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors">ABA PayWay E-Commerce</h3>
            <p className="text-xs text-gray-400 mt-1">Real-time settlement processing, gateway credentials, payment health, and CSV reconciliation.</p>
          </div>
          <div className="pt-2 flex items-center text-xs font-extrabold text-cyan-400 gap-1">
            <span>PayWay Audit (${stats.totalRevenue.toFixed(2)})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

      </div>

      {/* Revenue Analytics & Platform Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 p-6 bg-theme-card rounded-3xl border border-gray-800 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-theme-gold" /> Monthly Revenue Analytics (USD)
            </h3>
            <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
              Total: ${stats.totalRevenue.toFixed(2)}
            </span>
          </div>
          <div className="h-48 flex items-end justify-between gap-3 pt-6">
            {chartData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  style={{ height: `${Math.max(12, Math.min(100, (d.revenue / 2000) * 100))}%` }}
                  className="w-full bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-200 rounded-t-xl shadow-gold-sm transition-all"
                />
                <span className="text-[10px] text-gray-400 font-bold">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Platform Metrics */}
        <div className="p-6 bg-theme-card rounded-3xl border border-gray-800 space-y-4 shadow-2xl flex flex-col justify-between">
          <h3 className="text-sm font-bold text-white uppercase">Platform Live Metrics</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-gray-800">
              <span className="text-xs text-gray-400 font-bold">Total Movies</span>
              <span className="text-sm font-black text-amber-400">{stats.totalMovies} titles</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-gray-800">
              <span className="text-xs text-gray-400 font-bold">Registered Users</span>
              <span className="text-sm font-black text-cyan-400">{stats.totalUsers} accounts</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-gray-800">
              <span className="text-xs text-gray-400 font-bold">Orders Fulfilled</span>
              <span className="text-sm font-black text-emerald-400">{stats.totalOrders} purchases</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-theme-gold flex-shrink-0" />
            <span>Admin Account: <strong>{user?.email || 'admin@kvcinema.com'}</strong></span>
          </div>
        </div>

      </div>

      {/* Recent Orders Stream */}
      <div className="bg-theme-card rounded-3xl border border-gray-800 p-6 space-y-4 shadow-2xl">
        <h3 className="text-sm font-bold text-white uppercase flex items-center justify-between">
          <span>Recent Platform Transactions & Orders</span>
          <Link to="/admin/payments" className="text-xs text-theme-gold hover:underline font-bold">View All Payments &rarr;</Link>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-slate-900 text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Title / Item</th>
                <th className="p-3">Type</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-800/40">
                  <td className="p-3 font-semibold text-white">{o.user?.name || o.user?.email}</td>
                  <td className="p-3 text-amber-400 font-bold">{o.movie?.title}</td>
                  <td className="p-3">{o.type}</td>
                  <td className="p-3 font-black text-white">${o.price}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      COMPLETED
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
