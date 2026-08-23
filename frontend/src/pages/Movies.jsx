import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { movieAPI } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import MovieCard from '../components/MovieCard';
import { Filter, Search, SortAsc, Film, Loader2, Sparkles, Zap, CheckCircle2 } from 'lucide-react';

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { balance } = useWallet();

  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [priceType, setPriceType] = useState(searchParams.get('priceType') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await movieAPI.getMovies({
        search,
        genre,
        category,
        priceType,
        sort,
        page,
        limit: 18
      });
      setMovies(res.data.data.movies || []);
      setPagination(res.data.data.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load games catalog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [search, genre, category, priceType, sort, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Header Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Film className="w-8 h-8 text-theme-gold animate-pulse-glow" /> GAME & Digital Store Catalog
          </h1>
          <p className="text-xs text-gray-400 mt-1">Browse, unlock, and play top games and digital items on any device.</p>
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-theme-card border border-gray-700/80 rounded-full py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-400 focus:border-theme-gold focus:outline-none"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Filter Chips & Controls */}
      <div className="bg-theme-card/60 p-4 rounded-3xl border border-gray-800/80 shadow-lg">
        
        {/* Price Type & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setPriceType(''); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                priceType === '' ? 'bg-slate-800 text-theme-gold border border-amber-500/40' : 'text-gray-400 hover:text-white'
              }`}
            >
              All Games
            </button>
            <button
              onClick={() => { setPriceType('free'); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                priceType === 'free' ? 'bg-slate-800 text-theme-gold border border-amber-500/40' : 'text-gray-400 hover:text-white'
              }`}
            >
              Free to Play
            </button>
            <button
              onClick={() => { setPriceType('premium'); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                priceType === 'premium' ? 'bg-slate-800 text-theme-gold border border-amber-500/40' : 'text-gray-400 hover:text-white'
              }`}
            >
              Premium Games
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-theme-gold" />
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="bg-slate-900 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-theme-gold"
            >
              <option value="newest">Newest Releases</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated (★)</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>

        </div>

      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="py-32 text-center space-y-3">
          <Loader2 className="w-10 h-10 text-theme-gold animate-spin mx-auto" />
          <p className="text-xs text-gray-400">Loading movies catalog...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="py-24 text-center space-y-3">
          <Film className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Movies Found</h3>
          <p className="text-xs text-gray-400">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-theme-card border border-gray-800 text-xs font-bold text-gray-300 disabled:opacity-40"
          >
            &larr; Previous
          </button>
          <span className="text-xs font-bold text-theme-gold px-4">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="px-4 py-2 rounded-xl bg-theme-card border border-gray-800 text-xs font-bold text-gray-300 disabled:opacity-40"
          >
            Next &rarr;
          </button>
        </div>
      )}

    </div>
  );
};

export default Movies;
