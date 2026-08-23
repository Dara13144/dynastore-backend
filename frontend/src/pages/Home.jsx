import React, { useState, useEffect } from 'react';
import { movieAPI } from '../api/endpoints';
import HeroSlider from '../components/HeroSlider';
import MovieCard from '../components/MovieCard';
import { Sparkles, TrendingUp, Flame, Star, Film, Radio, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [homeData, setHomeData] = useState({
    featured: [],
    trending: [],
    popular: [],
    topRated: [],
    latest: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTrailerUrl, setActiveTrailerUrl] = useState(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const res = await movieAPI.getHomeContent();
        setHomeData(res.data.data);
      } catch (err) {
        console.error('Failed to load homepage content:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : url;
  };

  return (
    <div className="min-h-screen space-y-12 pb-16">
      
      {/* Hero Banner Slider */}
      <HeroSlider
        movies={homeData.featured}
        onOpenTrailer={(url) => setActiveTrailerUrl(url)}
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Trending Now Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-theme-gold" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Game Trending Now
              </h2>
            </div>
            <Link to="/movies?sort=popular" className="text-xs font-semibold text-theme-gold hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {homeData.trending.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onOpenTrailer={(url) => setActiveTrailerUrl(url)}
              />
            ))}
          </div>
        </section>

        {/* Popular Movies Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Most Popular Games
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {homeData.popular.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onOpenTrailer={(url) => setActiveTrailerUrl(url)}
              />
            ))}
          </div>
        </section>

        {/* Top Rated Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-theme-gold" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Top Rated Games
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {homeData.topRated.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onOpenTrailer={(url) => setActiveTrailerUrl(url)}
              />
            ))}
          </div>
        </section>

      </div>

      {/* Trailer Video Modal Popup */}
      {activeTrailerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in-up">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden aspect-video border border-gray-800 shadow-2xl">
            <button
              onClick={() => setActiveTrailerUrl(null)}
              className="absolute right-4 top-4 p-2 text-white bg-black/70 hover:bg-theme-gold hover:text-black rounded-full z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe
              src={getYoutubeEmbedUrl(activeTrailerUrl)}
              title="Movie Trailer"
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
