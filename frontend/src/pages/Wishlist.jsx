import React, { useState, useEffect } from 'react';
import { movieAPI } from '../api/endpoints';
import MovieCard from '../components/MovieCard';
import { Heart, Loader2 } from 'lucide-react';

const Wishlist = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const res = await movieAPI.getFavorites();
        setFavorites(res.data.data);
      } catch (err) {
        console.error('Failed to load favorites', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavs();
  }, []);

  const handleToggleFav = (movieId) => {
    setFavorites(prev => prev.filter(m => m.id !== movieId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      <div className="flex items-center gap-3 border-b border-gray-800 pb-6">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Your Favorite Movies</h1>
          <p className="text-xs text-gray-400">Your saved movies watchlist.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-10 h-10 text-theme-gold animate-spin mx-auto" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-20 text-center bg-theme-card rounded-2xl border border-gray-800 space-y-2">
          <Heart className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Favorites Yet</h3>
          <p className="text-xs text-gray-400">Click the heart icon on any movie to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {favorites.map((m) => (
            <MovieCard
              key={m.id}
              movie={m}
              isFavorite={true}
              onToggleFav={handleToggleFav}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
