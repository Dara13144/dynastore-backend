import React, { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../../api/endpoints';
import { 
  Users, DollarSign, X, Loader2, Search, Filter, ArrowUpDown, 
  TrendingUp, History, Shield, CheckCircle2, AlertCircle, Plus, 
  Minus, RefreshCw, Eye, Sparkles, Wallet, CreditCard, ChevronRight,
  ArrowRight, ShieldCheck, UserCheck, ArrowUpRight, ArrowDownRight, Tag
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdminNav from '../../components/AdminNav';

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];
const QUICK_REASONS = [
  'VIP Pass Top-up',
  'Manual Cash Payment',
  'Loyalty / Promo Bonus',
  'Customer Support Credit',
  'Refund Adjustment'
];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'highest-balance' | 'lowest-balance' | 'name'

  // Modals & Drawers
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('50.00');
  const [action, setAction] = useState('ADD'); // 'ADD' | 'DEDUCT' | 'SET'
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // User History Drawer
  const [historyUser, setHistoryUser] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Role Edit Modal
  const [roleUser, setRoleUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('USER');
  const [updatingRole, setUpdatingRole] = useState(false);

  const fetchUsers = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);
      const res = await adminAPI.getUsers();
      setUsers(res.data.data || []);
      if (showRefreshToast) toast.success('Users & wallet data refreshed');
    } catch (err) {
      console.error('Failed to load users', err);
      toast.error('Failed to fetch user accounts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const matchesSearch = 
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        const balanceA = a.wallet?.balance || 0;
        const balanceB = b.wallet?.balance || 0;
        if (sortBy === 'highest-balance') return balanceB - balanceA;
        if (sortBy === 'lowest-balance') return balanceA - balanceB;
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [users, searchTerm, roleFilter, sortBy]);

  // Overall Statistics
  const totalSystemBalance = useMemo(() => {
    return users.reduce((sum, u) => sum + (u.wallet?.balance || 0), 0);
  }, [users]);

  const adminCount = useMemo(() => {
    return users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length;
  }, [users]);

  // Quick 1-click add handler
  const handleQuickAdd = async (user, quickAmount) => {
    try {
      await adminAPI.adjustBalance({
        userId: user.id,
        amount: quickAmount,
        action: 'ADD',
        reason: `Quick +$${quickAmount} top-up`
      });
      toast.success(`+$${quickAmount} USD credited to ${user.name}!`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust balance');
    }
  };

  // Detailed Balance Adjustment Form
  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return toast.warning('Please enter a valid positive amount');
    }

    try {
      setSubmitting(true);
      const res = await adminAPI.adjustBalance({
        userId: selectedUser.id,
        amount: numAmount,
        action,
        reason
      });
      
      const newBal = res.data.data?.balanceAfter ?? res.data.data?.wallet?.balance;
      toast.success(
        `Balance updated for ${selectedUser.name}! Current balance: $${Number(newBal || 0).toFixed(2)} USD`
      );
      setSelectedUser(null);
      setReason('');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update balance');
    } finally {
      setSubmitting(false);
    }
  };

  // View User Transaction History
  const handleViewHistory = async (user) => {
    setHistoryUser(user);
    setLoadingHistory(true);
    try {
      const res = await adminAPI.getUserTransactions(user.id);
      setUserTransactions(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load transaction history');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Update Role Handler
  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!roleUser) return;
    try {
      setUpdatingRole(true);
      await adminAPI.updateUserRole({
        userId: roleUser.id,
        role: selectedRole
      });
      toast.success(`Updated ${roleUser.name}'s role to ${selectedRole}!`);
      setRoleUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingRole(false);
    }
  };

  // Calculate simulated preview balance in modal
  const simulatedBalance = useMemo(() => {
    if (!selectedUser) return 0;
    const current = Number(selectedUser.wallet?.balance || 0);
    const val = parseFloat(amount) || 0;
    if (action === 'ADD') return current + val;
    if (action === 'DEDUCT') return Math.max(0, current - val);
    if (action === 'SET') return val;
    return current;
  }, [selectedUser, amount, action]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Admin Top Navigation */}
      <AdminNav
        title={
          <span className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" /> Users & Wallet Balances Management
          </span>
        }
        subtitle="Manage user accounts, execute manual wallet credits/deductions, and review live transaction audit histories."
        actionButton={
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-900 border border-gray-800 hover:border-purple-500/40 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-purple-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Users</span>
          </button>
        }
      />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-5 rounded-3xl bg-theme-card border border-purple-500/20 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Accounts</span>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white">{users.length}</p>
          <p className="text-[11px] text-gray-400">Registered Platform Members</p>
        </div>

        <div className="p-5 rounded-3xl bg-theme-card border border-emerald-500/20 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider">
            <span>System Wallet Funds</span>
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">${totalSystemBalance.toFixed(2)} USD</p>
          <p className="text-[11px] text-emerald-500/80 font-semibold">Active balances across all wallets</p>
        </div>

        <div className="p-5 rounded-3xl bg-theme-card border border-amber-500/20 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider">
            <span>Average Balance</span>
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400">
            ${users.length > 0 ? (totalSystemBalance / users.length).toFixed(2) : '0.00'} USD
          </p>
          <p className="text-[11px] text-gray-400">Per registered user wallet</p>
        </div>

        <div className="p-5 rounded-3xl bg-theme-card border border-cyan-500/20 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider">
            <span>Admin Accounts</span>
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-cyan-400">{adminCount} Admins</p>
          <p className="text-[11px] text-cyan-500/80 font-semibold">Super Admins & Moderators</p>
        </div>

      </div>

      {/* Search, Filter, and Sort Toolbar */}
      <div className="bg-theme-card p-4 rounded-3xl border border-gray-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-gray-800 rounded-2xl text-xs text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-2xl border border-gray-800">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Roles</option>
              <option value="USER" className="bg-slate-900 text-white">USER</option>
              <option value="ADMIN" className="bg-slate-900 text-white">ADMIN</option>
              <option value="SUPER_ADMIN" className="bg-slate-900 text-white">SUPER_ADMIN</option>
              <option value="MODERATOR" className="bg-slate-900 text-white">MODERATOR</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-2xl border border-gray-800">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-slate-900 text-white">Newest First</option>
              <option value="highest-balance" className="bg-slate-900 text-white">Highest Balance</option>
              <option value="lowest-balance" className="bg-slate-900 text-white">Lowest Balance</option>
              <option value="name" className="bg-slate-900 text-white">Name (A-Z)</option>
            </select>
          </div>
        </div>

      </div>

      {/* Users & Wallets Main Table */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto" />
          <p className="text-xs text-gray-400 font-bold">Loading KV Digital Cinema Users & Wallets...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-20 text-center bg-theme-card rounded-3xl border border-gray-800 space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No users matching search filters</h3>
          <p className="text-xs text-gray-400">Try changing your search query or role filter.</p>
        </div>
      ) : (
        <div className="bg-theme-card rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-slate-900/90 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="p-4">User Account</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Wallet Balance</th>
                  <th className="p-4">1-Click Quick Add</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredUsers.map((u) => {
                  const currentBalance = u.wallet?.balance ?? 0;
                  const isSuperAdmin = u.role === 'SUPER_ADMIN';
                  const isAdmin = u.role === 'ADMIN';

                  return (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                      {/* User Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={u.name}
                            className="w-10 h-10 rounded-2xl object-cover bg-slate-900 border border-gray-800 shadow-sm"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white text-sm">{u.name}</span>
                              {u.emailVerified && (
                                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                  Verified
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">{u.email}</p>
                            <span className="text-[10px] text-gray-500">
                              Joined {new Date(u.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setRoleUser(u);
                            setSelectedRole(u.role);
                          }}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSuperAdmin
                              ? 'bg-amber-500/20 text-theme-gold border-amber-500/40 hover:bg-amber-500 hover:text-black'
                              : isAdmin
                              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500 hover:text-black'
                              : 'bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20'
                          }`}
                          title="Click to edit role"
                        >
                          <Shield className="w-3 h-3" />
                          <span>{u.role}</span>
                        </button>
                      </td>

                      {/* Wallet Balance */}
                      <td className="p-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                          <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-base font-black text-emerald-400 tracking-tight">
                            ${currentBalance.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            {u.wallet?.currency || 'USD'}
                          </span>
                        </div>
                      </td>

                      {/* 1-Click Quick Add Chips */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[10, 50, 100].map((amt) => (
                            <button
                              key={amt}
                              onClick={() => handleQuickAdd(u, amt)}
                              className="px-2.5 py-1 rounded-xl bg-slate-900 border border-gray-800 hover:border-emerald-500/60 hover:bg-emerald-500/10 text-emerald-400 text-[11px] font-extrabold transition-all cursor-pointer"
                              title={`Instant +$${amt} to ${u.name}`}
                            >
                              +${amt}
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* History Button */}
                          <button
                            onClick={() => handleViewHistory(u)}
                            className="p-2 rounded-xl bg-slate-900 border border-gray-800 hover:border-cyan-500 text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer"
                            title="View Audit & Transaction History"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Adjust Balance Main Button */}
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setAmount('50.00');
                              setAction('ADD');
                              setReason('');
                            }}
                            className="px-3.5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Adjust Balance</span>
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Balance Master Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-theme-card border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-6 text-left">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-2">
                AUDITED WALLET ADJUSTMENT
              </span>
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <Wallet className="w-6 h-6 text-purple-400" /> Adjust User Balance
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Target User: <strong className="text-white">{selectedUser.name}</strong> ({selectedUser.email})
              </p>
            </div>

            {/* Live Balance Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-gray-800 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Current</span>
                <span className="text-sm font-black text-gray-300">
                  ${Number(selectedUser.wallet?.balance || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-1 text-xs font-black text-purple-400">
                  {action === 'ADD' ? <Plus className="w-3.5 h-3.5 text-emerald-400" /> : action === 'DEDUCT' ? <Minus className="w-3.5 h-3.5 text-rose-400" /> : null}
                  <span>${(parseFloat(amount) || 0).toFixed(2)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                </div>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Simulated New</span>
                <span className="text-base font-black text-emerald-400">
                  ${simulatedBalance.toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handleAdjustBalance} className="space-y-4 text-xs">
              
              {/* Action Type Selector */}
              <div>
                <label className="text-gray-400 font-bold block mb-1.5 uppercase text-[10px]">
                  Adjustment Operation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAction('ADD')}
                    className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      action === 'ADD'
                        ? 'bg-emerald-500 text-black shadow-emerald-sm'
                        : 'bg-slate-900 text-gray-400 border border-gray-800 hover:text-white'
                    }`}
                  >
                    <Plus className="w-4 h-4" /> Credit (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction('DEDUCT')}
                    className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      action === 'DEDUCT'
                        ? 'bg-rose-500 text-white shadow-rose-sm'
                        : 'bg-slate-900 text-gray-400 border border-gray-800 hover:text-white'
                    }`}
                  >
                    <Minus className="w-4 h-4" /> Deduct (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction('SET')}
                    className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      action === 'SET'
                        ? 'bg-purple-500 text-white shadow-purple-sm'
                        : 'bg-slate-900 text-gray-400 border border-gray-800 hover:text-white'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Set Exact (=)
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-gray-400 font-bold block mb-1.5 uppercase text-[10px]">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-gray-800 rounded-2xl pl-8 pr-4 py-3 text-white font-black text-base focus:border-purple-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Quick Amount Chips */}
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Preset Chips:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_AMOUNTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(p.toFixed(2))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        parseFloat(amount) === p
                          ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                          : 'bg-slate-900 border-gray-800 text-gray-300 hover:border-gray-700'
                      }`}
                    >
                      ${p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason / Audit Note */}
              <div>
                <label className="text-gray-400 font-bold block mb-1.5 uppercase text-[10px]">
                  Audit Reason / Description (Optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., VIP Pass Bonus, Manual KHQR Cash Deposit, Reward"
                  className="w-full bg-slate-900 border border-gray-800 rounded-2xl p-3 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
                
                {/* Fast Reason Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {QUICK_REASONS.map((qr) => (
                    <button
                      key={qr}
                      type="button"
                      onClick={() => setReason(qr)}
                      className="px-2 py-0.5 rounded-lg bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-white text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      +{qr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Confirm & Execute Adjustment</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* User Transaction History Modal / Drawer */}
      {historyUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-theme-card border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-6 text-left max-h-[85vh] flex flex-col">
            
            <button
              onClick={() => setHistoryUser(null)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-2">
                TRANSACTION AUDIT LEDGER
              </span>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" /> Wallet History: {historyUser.name}
              </h3>
              <p className="text-xs text-gray-400">
                Current Balance: <strong className="text-emerald-400">${Number(historyUser.wallet?.balance || 0).toFixed(2)} USD</strong>
              </p>
            </div>

            {/* Transaction List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingHistory ? (
                <div className="py-16 text-center space-y-2">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                  <p className="text-xs text-gray-400">Loading user ledger records...</p>
                </div>
              ) : userTransactions.length === 0 ? (
                <div className="py-12 text-center bg-slate-900/60 rounded-2xl border border-gray-800/60 space-y-2">
                  <AlertCircle className="w-8 h-8 text-gray-500 mx-auto" />
                  <p className="text-xs text-gray-400">No transaction logs recorded for this user yet.</p>
                </div>
              ) : (
                userTransactions.map((tx) => {
                  const isDeposit = tx.type === 'DEPOSIT' || tx.type === 'ADMIN_ADJUSTMENT';
                  const isWithdraw = tx.type === 'WITHDRAW' || tx.type === 'MOVIE_PURCHASE' || tx.type === 'ECOMMERCE';

                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-gray-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isDeposit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {isDeposit ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white uppercase text-[11px]">{tx.type}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.2 rounded-full ${
                              tx.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {tx.status}
                            </span>
                          </div>
                          <p className="text-gray-400 text-[11px] mt-0.5">{tx.description || 'Wallet transaction'}</p>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {new Date(tx.createdAt).toLocaleString()} | Ref: {tx.reference || tx.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-sm font-black ${isDeposit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isDeposit ? '+' : '-'}${Number(tx.amount || 0).toFixed(2)}
                        </span>
                        {tx.balanceAfter !== undefined && tx.balanceAfter !== null && (
                          <span className="block text-[10px] text-gray-500">
                            Bal: ${Number(tx.balanceAfter).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {roleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-theme-card border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-left">
            
            <button
              onClick={() => setRoleUser(null)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" /> Change Account Role
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                User: <strong className="text-white">{roleUser.name}</strong>
              </p>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="text-gray-400 font-bold block mb-1.5 text-[10px] uppercase">
                  Select Role Permissions
                </label>
                <div className="space-y-2">
                  {['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'].map((r) => (
                    <label
                      key={r}
                      onClick={() => setSelectedRole(r)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedRole === r
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900 border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>{r}</span>
                      {selectedRole === r && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingRole}
                className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                {updatingRole ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save User Role'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;
