import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ShoppingBag, Star, Info, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HeroSlider = ({ movies = [], onOpenTrailer }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!movies || movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];

  return (
    <div className="relative w-full h-[75vh] lg:h-[85vh] overflow-hidden bg-theme-bg">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Live Motion Video or Image Backdrop */}
          {currentMovie.slug?.includes('spider') || currentMovie.title?.toLowerCase().includes('spider') ? (
            <video
              src="https://motionbgs.com/media/9917/spider-man-at-sunset.960x540.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-center scale-105"
            />
          ) : (
            <img
              src={currentMovie.banner || currentMovie.poster}
              alt={currentMovie.title}
              className="w-full h-full object-cover object-center"
            />
          )}

          {/* Gradients Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-theme-bg via-theme-bg/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-theme-bg via-theme-bg/80 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end pb-16 z-20">
        <div className="max-w-2xl space-y-4">
          
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-md text-[11px] font-extrabold uppercase bg-amber-500/20 text-theme-gold border border-amber-500/40">
              FEATURED EXCLUSIVE
            </span>
            {currentMovie.isPremium && currentMovie.price > 0 ? (
              <span className="px-3 py-1 rounded-md text-[11px] font-black uppercase bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-black shadow-gold-sm">
                ${Number(currentMovie.price).toFixed(2)} USD
              </span>
            ) : (
              <span className="px-3 py-1 rounded-md text-[11px] font-black uppercase bg-emerald-500 text-black shadow-md">
                FREE STREAM
              </span>
            )}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/60 text-xs font-bold text-amber-400 border border-gray-800">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{currentMovie.rating}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
            {currentMovie.title}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-300 line-clamp-3 leading-relaxed max-w-xl">
            {currentMovie.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {currentMovie.isPremium && currentMovie.price > 0 ? (
              <>
                <button
                  onClick={() => navigate(`/movie/${currentMovie.slug || currentMovie.id}`)}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full gold-glow-button text-black font-black text-sm hover:scale-105 transition-transform cursor-pointer shadow-gold-glow"
                >
                  <ShoppingBag className="w-4 h-4 fill-black" /> Buy Now (${Number(currentMovie.price).toFixed(2)})
                </button>

                <button
                  onClick={() => navigate(`/watch/${currentMovie.slug || currentMovie.id}`)}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm border border-gray-700 transition-all hover:scale-105 shadow-lg cursor-pointer"
                >
                  <Play className="w-4 h-4 text-theme-gold fill-current" /> Watch Now
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate(`/watch/${currentMovie.slug || currentMovie.id}`)}
                className="flex items-center gap-2 px-7 py-3.5 rounded-full gold-glow-button text-black font-black text-sm hover:scale-105 transition-transform cursor-pointer shadow-gold-glow"
              >
                <Play className="w-4 h-4 fill-black" /> Watch Now
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Slide Navigation Controls */}
      <div className="absolute right-6 bottom-16 z-30 hidden sm:flex items-center gap-2">
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)}
          className="p-2.5 rounded-full bg-black/50 hover:bg-theme-gold hover:text-black text-white border border-gray-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % movies.length)}
          className="p-2.5 rounded-full bg-black/50 hover:bg-theme-gold hover:text-black text-white border border-gray-700 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default HeroSlider;
