import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Star, Heart, Tag } from 'lucide-react';
import { movieAPI } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const MovieCard = ({ movie, isFavorite = false, onToggleFav }) => {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!user) return openAuthModal('login');
    try {
      await movieAPI.toggleFavorite(movie.id);
      if (onToggleFav) onToggleFav(movie.id);
      toast.success('Favorites updated!');
    } catch (err) {
      toast.error('Failed to update favorite');
    }
  };

  const isPremium = Boolean(movie.isPremium && movie.price > 0);
  const displayPrice = movie.price ? Number(movie.price).toFixed(2) : '0.00';
  const displayRentalPrice = movie.rentalPrice ? Number(movie.rentalPrice).toFixed(2) : null;

  return (
    <div
      onClick={() => navigate(`/movie/${movie.slug || movie.id}`)}
      className="group relative rounded-2xl bg-theme-card border border-gray-800/80 overflow-hidden cursor-pointer shadow-lg hover:border-theme-gold/80 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-gold-glow flex flex-col h-full"
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-950">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top-Left Price Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start pointer-events-none z-10">
          {isPremium ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-black shadow-gold-sm flex items-center gap-1">
              <Tag className="w-3 h-3 fill-black text-black" />
              ${displayPrice}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-500 text-black shadow-md">
              FREE
            </span>
          )}
        </div>

        {/* Top-Right Favorite Toggle Button */}
        <div className="absolute top-3 right-3 flex items-center pointer-events-none z-10">
          <button
            onClick={handleFavoriteClick}
            className="pointer-events-auto p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-rose-400 backdrop-blur-md transition-colors shadow-md hover:scale-110"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/watch/${movie.slug || movie.id}`);
            }}
            className="px-5 py-2.5 rounded-full gold-glow-button flex items-center gap-1.5 text-black font-black text-xs shadow-gold-glow hover:scale-110 transition-transform"
          >
            <Play className="w-4 h-4 fill-black" /> Watch Now
          </button>
        </div>
      </div>

      {/* Card Information */}
      <div className="p-3.5 flex flex-col flex-grow justify-between space-y-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
            <span className="font-semibold text-theme-gold uppercase text-[10px]">GAME</span>
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{movie.rating}</span>
            </div>
          </div>

          <h3 className="text-sm font-bold text-white group-hover:text-theme-gold transition-colors line-clamp-1">
            {movie.title}
          </h3>
        </div>

        {/* Price Bar */}
        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-800/80">
          <div>
            {isPremium ? (
              <span className="text-xs font-black text-theme-gold flex items-center gap-1">
                ${displayPrice} <span className="text-[9px] font-normal text-gray-400">USD</span>
              </span>
            ) : (
              <span className="text-xs font-black text-emerald-400">
                100% Free
              </span>
            )}
          </div>
          <span className="text-emerald-400 font-bold text-[10px]">INSTANT</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
