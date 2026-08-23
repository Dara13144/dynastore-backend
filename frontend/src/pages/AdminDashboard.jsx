import React, { useState, useEffect } from 'react';
import { adminAPI, productAPI } from '../api/endpoints';
import { LayoutDashboard, ShoppingBag, CreditCard, DollarSign, Clock, CheckCircle2, XCircle, Eye, Plus, Trash2, Edit, X, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'payments' | 'products'
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '100',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600'
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'overview' || activeTab === 'payments') {
        const [statsRes, paymentsRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getPayments()
        ]);
        setStats(statsRes.data.data);
        setPayments(paymentsRes.data.data || []);
      }
      if (activeTab === 'products') {
        const prodRes = await productAPI.getProducts({ category: 'ALL' });
        setProducts(prodRes.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await productAPI.createProduct(newProduct);
      toast.success('Product created successfully!');
      setShowProductModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to create product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productAPI.deleteProduct(id);
      toast.success('Product deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase bg-red-600/20 text-red-400 border border-red-500/30 mb-1">
            SECURE ADMIN PANEL
          </span>
          <h1 className="text-3xl font-black text-white">ABA PayWay E-Commerce Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-gray-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'overview' ? 'bg-gold-gradient text-black font-extrabold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'payments' ? 'bg-gold-gradient text-black font-extrabold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Payments Log
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'products' ? 'bg-gold-gradient text-black font-extrabold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Products
          </button>
        </div>
      </div>

      {/* Task 16: Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 bg-theme-card border border-gray-800 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase">
                <span>Total Orders</span>
                <ShoppingBag className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-black text-white">{stats.totalOrders || 0}</p>
            </div>

            <div className="p-6 bg-theme-card border border-gray-800 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase">
                <span>Paid Orders</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-emerald-400">{stats.paidPayments || 0}</p>
            </div>

            <div className="p-6 bg-theme-card border border-gray-800 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase">
                <span>Pending Payments</span>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-amber-400">{stats.pendingPayments || 0}</p>
            </div>

            <div className="p-6 bg-theme-card border border-gray-800 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase">
                <span>Total Revenue</span>
                <DollarSign className="w-5 h-5 text-theme-gold" />
              </div>
              <p className="text-3xl font-black text-theme-gold">${(stats.totalRevenue || 0).toFixed(2)} USD</p>
            </div>

          </div>
        </div>
      )}

      {/* Task 16: Payments Log Tab */}
      {(activeTab === 'payments' || activeTab === 'overview') && (
        <div className="bg-theme-card border border-gray-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-lg font-black text-white">ABA PayWay Transaction Audit Logs</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-slate-900/80 text-gray-400 text-[11px] font-bold uppercase">
                <tr>
                  <th className="p-3.5">Transaction ID</th>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Created At</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40">
                    <td className="p-3.5 font-mono text-white font-bold">{p.transactionId}</td>
                    <td className="p-3.5 font-mono text-gray-400">{p.orderId ? `#${p.orderId}` : '-'}</td>
                    <td className="p-3.5 font-bold text-theme-gold">${p.amount.toFixed(2)} USD</td>
                    <td className="p-3.5 uppercase font-bold text-blue-400">{p.paymentMethod}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        p.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        p.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-400">{new Date(p.createdAt).toLocaleString()}</td>
                    <td className="p-3.5">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center gap-1 text-[11px] font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task 16: Products Manager Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-white">Product Catalog Management</h3>
            <button
              onClick={() => setShowProductModal(true)}
              className="px-4 py-2.5 rounded-full gold-glow-button text-black font-extrabold text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => (
              <div key={prod.id} className="p-5 bg-theme-card border border-gray-800 rounded-3xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <img src={prod.image} alt={prod.name} className="w-full h-40 object-cover rounded-2xl bg-slate-900" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {prod.category}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1">{prod.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2">{prod.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                  <span className="text-lg font-black text-theme-gold">${prod.price.toFixed(2)} USD</span>
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="p-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task 16: Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-theme-card border border-gray-800 rounded-3xl p-6 space-y-4 text-left shadow-2xl">
            <button
              onClick={() => setSelectedPayment(null)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white">ABA PayWay Transaction Details</h3>

            <div className="space-y-2 text-xs font-mono bg-slate-900 p-4 rounded-2xl border border-gray-800 text-gray-300">
              <p><span className="text-gray-500">Merchant Tran ID:</span> {selectedPayment.transactionId}</p>
              <p><span className="text-gray-500">ABA PW Tran ID:</span> {selectedPayment.pwTranId || 'N/A'}</p>
              <p><span className="text-gray-500">Trace ID:</span> {selectedPayment.traceId || 'N/A'}</p>
              <p><span className="text-gray-500">Amount:</span> ${selectedPayment.amount.toFixed(2)} {selectedPayment.currency}</p>
              <p><span className="text-gray-500">Status:</span> <span className="text-emerald-400 font-bold uppercase">{selectedPayment.status}</span></p>
              <p><span className="text-gray-500">Created At:</span> {new Date(selectedPayment.createdAt).toISOString()}</p>
              <p><span className="text-gray-500">Updated At:</span> {new Date(selectedPayment.updatedAt).toISOString()}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Raw Response Log (Secrets Filtered):</label>
              <pre className="p-3 bg-black/70 rounded-xl text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-40 border border-gray-800">
                {selectedPayment.rawResponse ? JSON.stringify(JSON.parse(selectedPayment.rawResponse), null, 2) : 'No raw webhook response logged.'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <form onSubmit={handleCreateProduct} className="relative w-full max-w-md bg-theme-card border border-gray-800 rounded-3xl p-6 space-y-4 text-left shadow-2xl">
            <button
              type="button"
              onClick={() => setShowProductModal(false)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white">Create New Merchandise Product</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 font-bold block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-slate-900 border border-gray-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 font-bold block mb-1">Description</label>
                <textarea
                  required
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-slate-900 border border-gray-800 rounded-xl p-2.5 text-white h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 font-bold block mb-1">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-slate-900 border border-gray-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-bold block mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-slate-900 border border-gray-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 font-bold block mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full bg-slate-900 border border-gray-800 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full gold-glow-button text-black font-extrabold text-xs"
            >
              Create Product
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
