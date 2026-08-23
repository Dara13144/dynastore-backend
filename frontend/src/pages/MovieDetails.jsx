import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieAPI, orderAPI, paymentAPI } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import MovieCard from '../components/MovieCard';
import ABAKHQRModal from '../components/ABAKHQRModal';
import {
  Play,
  Star,
  ShoppingBag,
  Heart,
  Calendar,
  Clock,
  Film,
  UserCheck,
  CheckCircle2,
  Lock,
  X,
  MessageSquare,
  Sparkles,
  Loader2,
  QrCode,
  ShieldCheck,
  Zap,
  ArrowRight,
  Tag,
  Wallet,
  AlertCircle,
  PlusCircle,
  Download
} from 'lucide-react';
import { toast } from 'react-toastify';

const MovieDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { balance, fetchWallet } = useWallet();

  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [purchaseType, setPurchaseType] = useState('LIFETIME'); // 'LIFETIME' | 'RENTAL'
  const [couponCode, setCouponCode] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [activeTrailer, setActiveTrailer] = useState(null);

  // Instant KHQR Modal
  const [showKhqrModal, setShowKhqrModal] = useState(false);
  const [khqrData, setKhqrData] = useState(null);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const isSuperAdmin = user && ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await movieAPI.getMovieBySlug(slug);
        setMovieData(res.data.data);
      } catch (err) {
        console.error('Failed to load movie details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-32 text-center space-y-3">
        <Loader2 className="w-12 h-12 text-theme-gold animate-spin mx-auto" />
        <p className="text-xs text-gray-400">Loading movie details...</p>
      </div>
    );
  }

  if (!movieData?.movie) return null;

  const { movie, related } = movieData;
  const currentPrice = purchaseType === 'LIFETIME' ? movie.price : movie.rentalPrice;

  // 1-Click Wallet Purchase
  const handleWalletPurchase = async () => {
    if (!user) return openAuthModal('login');
    try {
      setIsPurchasing(true);
      const res = await orderAPI.purchaseMovie({
        movieId: movie.id,
        purchaseType,
        couponCode
      });
      toast.success(res.data.message || 'Movie unlocked successfully!');
      setShowBuyModal(false);
      await fetchWallet();
      
      // Update local state access
      setMovieData(prev => ({
        ...prev,
        movie: { ...prev.movie, hasAccess: true }
      }));
    } catch (err) {
      if (err.response?.status === 402) {
        toast.warning('Insufficient wallet balance! Switching to instant KHQR scan...');
        handleKhqrDirectPay();
      } else {
        toast.error(err.response?.data?.message || 'Purchase failed');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  // Direct KHQR QR Code Payment
  const handleKhqrDirectPay = async () => {
    if (!user) return openAuthModal('login');
    try {
      setIsPurchasing(true);
      const res = await paymentAPI.createKhqrCcQR(
        currentPrice,
        null,
        `Unlock ${movie.title} (${purchaseType})`
      );
      setKhqrData(res.data.data);
      setShowBuyModal(false);
      setShowKhqrModal(true);
    } catch (e) {
      toast.error('Failed to initiate KHQR payment');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) return openAuthModal('login');
    try {
      await movieAPI.addReview({
        movieId: movie.id,
        rating: reviewRating,
        comment: reviewComment
      });
      toast.success('Review added successfully!');
      setReviewComment('');
      // Refresh movie details
      const res = await movieAPI.getMovieBySlug(slug);
      setMovieData(res.data.data);
    } catch (err) {
      toast.error('Failed to submit review');
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : url;
  };

  const canWatch = Boolean(movie.hasAccess || (!movie.isPremium || Number(movie.price) <= 0));

  return (
    <div className="min-h-screen space-y-12 pb-20">
      
      {/* Hero Banner Section */}
      <div className="relative w-full h-[60vh] lg:h-[70vh] bg-theme-bg overflow-hidden">
        <img
          src={movie.banner || movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-theme-bg via-theme-bg/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-theme-bg via-theme-bg/80 to-transparent" />
      </div>

      {/* Main Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
              {/* Poster Card */}
              <div className="lg:col-span-1">
                <div className="rounded-3xl overflow-hidden border-2 border-gray-800 shadow-2xl bg-theme-card relative group">
                  <img src={movie.poster} alt={movie.title} className="w-full h-auto object-cover" />
                  {canWatch ? (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase flex items-center gap-1 shadow-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" /> PURCHASED
                    </div>
                  ) : movie.isPremium && movie.price > 0 ? (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-black text-xs font-black flex items-center gap-1 shadow-gold-sm">
                      <Tag className="w-3.5 h-3.5 fill-black text-black" /> ${Number(movie.price).toFixed(2)}
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase shadow-md">
                      FREE
                    </div>
                  )}
                </div>
              </div>

              {/* Details Content */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Title & Badges */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 text-xs font-bold text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{movie.rating} / 10</span>
                    </div>

                    {canWatch ? (
                      <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> READY TO WATCH
                      </span>
                    ) : movie.isPremium && movie.price > 0 ? (
                      <span className="px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/50 text-theme-gold flex items-center gap-1.5 shadow-sm">
                        <Tag className="w-3.5 h-3.5 fill-theme-gold text-theme-gold" /> Price: ${Number(movie.price).toFixed(2)} USD
                      </span>
                    ) : (
                      <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                        FREE STREAM
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black text-white">{movie.title}</h1>
                  
                  <p className="text-xs text-gray-400">
                    Genres: <span className="text-white font-semibold">{movie.genres?.join(', ') || 'Action, Sci-Fi, Drama'}</span>
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-300 leading-relaxed bg-theme-card/60 p-5 rounded-2xl border border-gray-800/80 shadow-lg">
                  {movie.description}
                </p>

                {/* Director & Cast */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-theme-card/60 p-4 rounded-2xl border border-gray-800 shadow-md">
                  <div>
                    <p className="text-gray-400 font-bold uppercase mb-0.5">Director</p>
                    <p className="text-white font-semibold">{movie.director || 'Christopher Nolan'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold uppercase mb-0.5">Starring Cast</p>
                    <p className="text-white font-semibold line-clamp-1">{movie.cast || 'Hollywood Cast'}</p>
                  </div>
                </div>

                  {/* Primary Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    
                    {canWatch ? (
                      /* When Purchased / Unlocked -> Show Download & Watch Now */
                      <>
                        <a
                          href={movie.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                          download={`${(movie.title || 'Game').replace(/\s+/g, '_')}_Full.mp4`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 px-9 py-4 rounded-full gold-glow-button text-black font-black text-sm shadow-gold-glow animate-pulse-glow cursor-pointer hover:scale-105 transition-all"
                        >
                          <Download className="w-5 h-5" /> Download Game
                        </a>

                        <button
                          onClick={() => navigate(`/watch/${movie.slug || movie.id}`)}
                          className="flex items-center gap-2.5 px-8 py-4 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm border border-gray-700 transition-all cursor-pointer hover:scale-105 shadow-lg"
                        >
                          <Play className="w-5 h-5 text-theme-gold fill-current" /> Watch Now
                        </button>
                      </>
                    ) : (
                      /* When Not Purchased Yet -> Show Buy Now & Watch Preview */
                      <>
                        <button
                          onClick={() => {
                            if (!user) return openAuthModal('login');
                            setPurchaseType('LIFETIME');
                            setShowBuyModal(true);
                          }}
                          className="flex items-center gap-2.5 px-9 py-4 rounded-full gold-glow-button text-black font-black text-sm shadow-gold-glow cursor-pointer hover:scale-105 transition-all"
                        >
                          <ShoppingBag className="w-5 h-5 fill-black text-black" /> Buy Now (${Number(movie.price).toFixed(2)})
                        </button>

                        <button
                          onClick={() => navigate(`/watch/${movie.slug || movie.id}`)}
                          className="flex items-center gap-2.5 px-7 py-4 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm border border-gray-700 transition-all cursor-pointer hover:scale-105 shadow-lg"
                        >
                          <Play className="w-5 h-5 text-theme-gold fill-current" /> Watch Now
                        </button>
                      </>
                    )}

                  </div>

            </div>

          </div>

          {/* Buy More Related Movies */}
          {related && related.length > 0 && (
            <div className="mt-16 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-theme-gold" /> More Games Like This
                </h3>
                <button
                  onClick={() => navigate('/movies')}
                  className="text-xs font-bold text-theme-gold hover:underline"
                >
                  Explore Store
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {related.map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            </div>
          )}

      </div>

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in-up">
          <div className="relative w-full max-w-md bg-theme-card border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-gold-glow text-center space-y-5">
            
            <button
              onClick={() => setShowBuyModal(false)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/50"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-theme-gold border border-amber-500/30">
                INSTANT MOVIE ACCESS
              </span>
              <h3 className="text-2xl font-black text-white mt-1">Buy "{movie.title}"</h3>
              <p className="text-xs text-gray-400 mt-0.5">Stream in 4K Ultra HD on any device.</p>
            </div>

            {/* Movie Price Card */}
            <div className="p-4 rounded-2xl border border-theme-gold bg-amber-500/10 text-left space-y-1 shadow-md">
              <p className="font-black uppercase text-[10px] text-theme-gold tracking-wider">LIFETIME ACCESS • 4K ULTRA HD</p>
              <p className="text-2xl font-black text-white">${Number(movie.price).toFixed(2)} USD</p>
              <p className="text-[10px] text-gray-400">Unlimited streaming forever on all devices</p>
            </div>

            {/* Wallet Balance Display & Need Add Balance Warning */}
            <div className="space-y-2">
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-gray-800 text-xs flex items-center justify-between">
                <span className="text-gray-400 font-bold flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-theme-gold" /> Your Wallet Balance:
                </span>
                <span className="font-black text-theme-gold text-sm">${balance.toFixed(2)} USD</span>
              </div>

              {balance < Number(currentPrice) && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <AlertCircle className="w-4 h-4" /> Need to Add Balance to Buy Video
                  </div>
                  <p className="text-gray-300 text-[11px] leading-relaxed">
                    You have <strong className="text-white">${balance.toFixed(2)}</strong>. You need <strong className="text-theme-gold">${(Number(currentPrice) - balance).toFixed(2)} USD</strong> more to buy this video.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-1">
              {balance >= Number(currentPrice) ? (
                /* Wallet Pay with Sufficient Balance */
                <button
                  onClick={handleWalletPurchase}
                  disabled={isPurchasing}
                  className="w-full py-4 rounded-full gold-glow-button text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all cursor-pointer"
                >
                  {isPurchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : `⚡ Confirm & Buy with Wallet ($${Number(currentPrice).toFixed(2)})`}
                </button>
              ) : (
                /* Add Balance Flow */
                <>
                  <button
                    onClick={() => navigate(`/topup?amount=${Math.ceil(Number(currentPrice) - balance)}`)}
                    className="w-full py-4 rounded-full gold-glow-button text-black font-black text-xs flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 fill-black text-black" />
                    <span>Add Balance to Wallet (Bakong KHQR)</span>
                  </button>

                  <button
                    onClick={handleKhqrDirectPay}
                    disabled={isPurchasing}
                    className="w-full py-3.5 rounded-full bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-cyan-400" />
                    <span>Or Scan ABA KHQR Directly ($${Number(currentPrice).toFixed(2)})</span>
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Instant KHQR QR Modal */}
      {showKhqrModal && khqrData && (
        <ABAKHQRModal
          isOpen={showKhqrModal}
          onClose={() => {
            setShowKhqrModal(false);
            // Refresh access
            movieAPI.getMovieBySlug(slug).then(res => setMovieData(res.data.data));
          }}
          khqrData={khqrData}
          orderId={null}
        />
      )}

      {/* Trailer Modal */}
      {activeTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in-up">
          <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden aspect-video border border-gray-800 shadow-2xl">
            <button
              onClick={() => setActiveTrailer(null)}
              className="absolute right-4 top-4 p-2 text-white bg-black/70 hover:bg-theme-gold hover:text-black rounded-full z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe
              src={getYoutubeEmbedUrl(activeTrailer)}
              title="Movie Trailer"
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default MovieDetails;
