import React, { useState, useEffect } from 'react';
import { adminAPI, paymentAPI } from '../../api/endpoints';
import { 
  CreditCard, DollarSign, TrendingUp, CheckCircle2, Clock, XCircle, 
  Download, Search, Filter, RefreshCw, ShieldCheck, Zap, ExternalLink, 
  Layers, ArrowUpRight, ArrowDownRight, QrCode, Loader2, Sparkles, Trash2
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';
import { toast } from 'react-toastify';

const AdminPayWay = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getPayments();
      setPayments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load ABA PayWay transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleUpdateStatus = async (paymentId, status) => {
    try {
      await adminAPI.updatePaymentStatus({ paymentId, status });
      toast.success(`Transaction marked as ${status}`);
      fetchPayments();
    } catch (err) {
      toast.error('Failed to update transaction status');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear ALL payment transaction records? This action cannot be undone.')) {
      return;
    }
    try {
      await adminAPI.clearAllPayments();
      toast.success('All payment transactions cleared!');
      fetchPayments();
    } catch (err) {
      toast.error('Failed to clear payments');
    }
  };

  const handleDeleteOne = async (id) => {
    if (!window.confirm('Delete this transaction record?')) return;
    try {
      await adminAPI.deletePayment(id);
      toast.success('Transaction deleted!');
      fetchPayments();
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleExportCSV = () => {
    if (!payments.length) {
      toast.info('No transactions to export');
      return;
    }

    const headers = ['Transaction ID', 'User Email', 'Amount (USD)', 'Gateway Method', 'Status', 'Date'];
    const rows = payments.map((p) => [
      p.transactionId,
      p.user?.email || 'N/A',
      p.amount.toFixed(2),
      p.paymentMethod || 'CUTLUY_KHQR',
      p.status,
      new Date(p.createdAt).toISOString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DYNA_STORE_Settlement_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('DYNA STORE Settlement Audit CSV exported successfully!');
  };

  // KPIs
  const totalVolume = payments.reduce((acc, p) => acc + (p.status === 'PAID' ? p.amount : 0), 0);
  const pendingVolume = payments.reduce((acc, p) => acc + (p.status === 'PENDING' ? p.amount : 0), 0);
  const paidCount = payments.filter(p => p.status === 'PAID').length;
  const pendingCount = payments.filter(p => p.status === 'PENDING').length;
  const successRate = payments.length ? ((paidCount / payments.length) * 100).toFixed(1) : 100;

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Admin Top Navigation & Header */}
      <AdminNav
        title={
          <span className="flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-emerald-400 animate-pulse-glow" /> CutLuy & Bakong KHQR E-Commerce Dashboard
          </span>
        }
        subtitle="Real-time CutLuy settlement processing, Bakong gateway credentials, payment health, and merchant reconciliation."
        actionButton={
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchPayments}
              className="p-2.5 rounded-xl bg-slate-900 border border-gray-800 hover:border-cyan-500/40 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" /> Refresh Stream
            </button>

            {payments.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                Clear All System Transactions
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg"
            >
              <Download className="w-4 h-4" /> Export CSV Report
            </button>
          </div>
        }
      />

      {/* CutLuy & Bakong Merchant Integration Credentials Card */}
      <div className="p-6 rounded-3xl bg-theme-card border border-cyan-500/30 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800/80 pb-3">
          <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Live CutLuy & Bakong KHQR Gateway Configuration
          </span>
          <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> GATEWAY ONLINE & ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Bakong Merchant Account</span>
            <span className="text-white font-mono font-bold">dara_mao1@bkrt</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">CutLuy API Key</span>
            <span className="text-cyan-300 font-mono font-bold truncate block">ck_live_QuVCpMzXMhvf5jUobZ...</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Store Name</span>
            <span className="text-amber-400 font-mono font-bold">DYNA STORE / MAO DARA</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Auto-Verification Worker</span>
            <span className="text-emerald-400 font-bold">CutLuy 5s Check-Trans (Live)</span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        
        <div className="p-5 rounded-3xl bg-theme-card border border-emerald-500/30 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase">Gross Settlements</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-white">${totalVolume.toFixed(2)}</p>
          <p className="text-[10px] text-gray-400">{paidCount} Successful Transactions</p>
        </div>

        <div className="p-5 rounded-3xl bg-theme-card border border-amber-500/30 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-theme-gold">
            <span className="text-xs font-bold uppercase">Pending Collections</span>
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-white">${pendingVolume.toFixed(2)}</p>
          <p className="text-[10px] text-gray-400">{pendingCount} Orders awaiting payment</p>
        </div>

        <div className="p-5 rounded-3xl bg-theme-card border border-cyan-500/30 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-bold uppercase">Settlement Success Rate</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-white">{successRate}%</p>
          <p className="text-[10px] text-gray-400">Auto-fulfillment rate</p>
        </div>

        <div className="p-5 rounded-3xl bg-theme-card border border-purple-500/30 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-bold uppercase">Supported Methods</span>
            <QrCode className="w-5 h-5" />
          </div>
          <p className="text-xl font-black text-white mt-1">KHQR • ABA • Cards</p>
          <p className="text-[10px] text-gray-400">Multi-Channel Gateway</p>
        </div>

      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 text-xs font-extrabold bg-slate-900 p-1.5 rounded-2xl border border-gray-800">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-xl transition-all ${
              statusFilter === 'ALL' ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            All Transactions ({payments.length})
          </button>
          
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              statusFilter === 'PAID' ? 'bg-emerald-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Settled / Paid ({payments.filter(p => p.status === 'PAID').length})
          </button>

          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              statusFilter === 'PENDING' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Pending ({payments.filter(p => p.status === 'PENDING').length})
          </button>

          <button
            onClick={() => setStatusFilter('FAILED')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              statusFilter === 'FAILED' ? 'bg-rose-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" /> Failed / Cancelled ({payments.filter(p => p.status === 'FAILED').length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search Trans ID, Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-theme-card border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white font-bold focus:border-cyan-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-theme-card rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-slate-900 text-gray-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Transaction ID & Ref</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Amount ($ USD)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4 text-right">Manual Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="p-4 font-mono">
                      <span className="font-extrabold text-white block">{p.transactionId}</span>
                      <span className="text-[10px] text-gray-500">Ref: {p.pwTranId || 'AUTO_KHQR_CC'}</span>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white">{p.user?.name || 'Customer'}</div>
                      <div className="text-[10px] text-gray-400">{p.user?.email || 'N/A'}</div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                        {p.paymentMethod || 'ABA_PAYWAY_KHQR'}
                      </span>
                    </td>

                    <td className="p-4 font-black text-white text-sm">
                      ${Number(p.amount).toFixed(2)}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit ${
                        p.status === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : p.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {p.status === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                        {p.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {p.status === 'FAILED' && <XCircle className="w-3 h-3" />}
                        {p.status}
                      </span>
                    </td>

                    <td className="p-4 text-gray-400 font-mono text-[11px]">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status !== 'PAID' ? (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'PAID')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 text-emerald-400 font-extrabold text-[11px] transition-all"
                          >
                            Approve & Credit
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'REFUNDED')}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-400 font-bold text-[11px] transition-all"
                          >
                            Refund
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOne(p.id)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-gray-700 transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPayWay;
