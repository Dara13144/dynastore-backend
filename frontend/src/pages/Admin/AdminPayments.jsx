import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/endpoints';
import { CreditCard, CheckCircle, XCircle, RefreshCw, Loader2, Download, Search, Filter } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getPayments();
      setPayments(res.data.data);
    } catch (err) {
      console.error('Failed to load payments log', err);
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
      toast.success(`Payment updated to ${status}`);
      fetchPayments();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      p.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const exportCSV = () => {
    if (!filteredPayments.length) return toast.info('No transactions to export');
    const headers = ['Transaction ID', 'User Name', 'User Email', 'Payment Method', 'Amount (USD)', 'Status', 'Date'];
    const rows = filteredPayments.map((p) => [
      p.transactionId,
      `"${p.user?.name || ''}"`,
      `"${p.user?.email || ''}"`,
      p.paymentMethod,
      p.amount,
      p.status,
      new Date(p.createdAt).toISOString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ABA_Bakong_Transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV report exported successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-400" /> Payments & Transactions Log
          </h1>
          <p className="text-xs text-gray-400 mt-1">Audit official ABA PayWay & Bakong KHQR deposits.</p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-gray-700"
        >
          <Download className="w-4 h-4 text-theme-gold" /> Export CSV Report
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by Tran ID, Name, or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-theme-card border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white focus:border-theme-gold focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-theme-card border border-gray-800 rounded-xl py-2.5 px-3 text-xs font-bold text-white focus:border-theme-gold focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="WAITING">WAITING</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-10 h-10 text-theme-gold animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-theme-card rounded-3xl border border-gray-800 overflow-hidden">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-slate-900 text-gray-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-800/40">
                  <td className="p-4">
                    <p className="font-bold text-white">{p.user?.name}</p>
                    <p className="text-[10px] text-gray-500">{p.user?.email}</p>
                  </td>
                  <td className="p-4 font-bold text-blue-400">{p.paymentMethod}</td>
                  <td className="p-4 font-bold text-emerald-400">${p.amount.toFixed(2)}</td>
                  <td className="p-4 font-mono text-gray-400">{p.transactionId}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                      p.status === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : p.status === 'REFUNDED'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {p.status === 'WAITING' || p.status === 'PENDING' ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateStatus(p.id, 'PAID')}
                          className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[11px] shadow-sm transition-all"
                        >
                          Approve & Credit Balance
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(p.id, 'CANCELLED')}
                          className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-[10px] font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : p.status === 'PAID' ? (
                      <button
                        onClick={() => handleUpdateStatus(p.id, 'REFUNDED')}
                        className="px-3 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-[11px]"
                      >
                        Refund
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(p.id, 'PAID')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 text-[10px]"
                      >
                        Force Credit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default AdminPayments;
