import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../api/endpoints';
import { useCart } from '../contexts/CartContext';
import { ShoppingBag, Star, ShoppingCart, Loader2, Sparkles, Filter } from 'lucide-react';
import { toast } from 'react-toastify';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const { addToCart } = useCart();

  const categories = ['ALL', 'Memberships', 'Electronics', 'Tickets', 'Snacks'];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getProducts({ category: selectedCategory });
      setProducts(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load product catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    addToCart(product, 1);
    toast.success(`Added ${product.name} to cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-block px-4 py-1 rounded-full text-xs font-black uppercase bg-amber-500/20 text-theme-gold border border-amber-500/30">
          KV CINEMA E-STORE
        </span>
        <h1 className="text-4xl font-black text-white">Cinema Merchandise & VIP Passes</h1>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto">
          Explore exclusive cinema VIP passes, IMAX vouchers, spatial audio headphones, and gourmet snacks with instant ABA PayWay & KHQR payment.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all border ${
              selectedCategory === cat
                ? 'bg-gold-gradient text-black border-amber-400 shadow-gold-glow'
                : 'bg-slate-900/80 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-10 h-10 text-theme-gold animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="group bg-theme-card border border-gray-800 rounded-3xl overflow-hidden hover:border-amber-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-black/70 text-theme-gold border border-amber-500/30 backdrop-blur-md">
                    {p.category}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{p.rating || 4.8}</span>
                  </div>
                  <Link to={`/products/${p.id}`} className="block">
                    <h3 className="text-base font-bold text-white group-hover:text-theme-gold transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 line-clamp-2">{p.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-gray-800/60 mt-4">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Price</span>
                  <span className="text-xl font-black text-theme-gold">${p.price.toFixed(2)} USD</span>
                </div>
                <button
                  onClick={(e) => handleAddToCart(p, e)}
                  className="p-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-theme-gold border border-amber-500/40 transition-all"
                  title="Add to Cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Products;
