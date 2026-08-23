import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { movieAPI, orderAPI, paymentAPI } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import CustomVideoPlayer from '../components/CustomVideoPlayer';
import MovieCard from '../components/MovieCard';
import ABAKHQRModal from '../components/ABAKHQRModal';
import {
  Loader2,
  Lock,
  ShoppingBag,
  ArrowLeft,
  Play,
  Sparkles,
  Film,
  Zap,
  Wallet,
  AlertCircle,
  PlusCircle,
  QrCode,
  Download,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAntiScreenRecord } from '../hooks/useAntiScreenRecord';

const WatchMovie = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { balance, fetchWallet } = useWallet();
  const episodeIdParam = searchParams.get('episode');

  // Anti-Screen Recording & DRM Protection
  useAntiScreenRecord({ enabled: true, showWarnings: true });

  const [movieData, setMovieData] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPreviewVideo, setShowPreviewVideo] = useState(false);

  // Buy Modal State
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [purchaseType, setPurchaseType] = useState('LIFETIME');
  const [isPurchasing, setIsPurchasing] = useState(false);

  // KHQR Direct Modal
  const [showKhqrModal, setShowKhqrModal] = useState(false);
  const [khqrData, setKhqrData] = useState(null);

  const fetchMovie = async () => {
    setLoading(true);
    try {
      const res = await movieAPI.getMovieBySlug(slug);
      const data = res.data.data;
      setMovieData(data);

      if (data.movie?.episodes?.length > 0) {
        if (episodeIdParam) {
          const foundEp = data.movie.episodes.find((e) => e.id === episodeIdParam);
          setCurrentEpisode(foundEp || data.movie.episodes[0]);
        } else {
          setCurrentEpisode(data.movie.episodes[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load movie for streaming', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovie();
  }, [slug, episodeIdParam]);

  if (loading) {
    return (
      <div className="py-32 text-center space-y-3">
        <Loader2 className="w-12 h-12 text-theme-gold animate-spin mx-auto" />
        <p className="text-xs text-gray-400">Preparing high-speed stream...</p>
      </div>
    );
  }

  if (!movieData?.movie) return null;

  const { movie, related } = movieData;
  const canWatch = Boolean(movie.hasAccess || (!movie.isPremium || Number(movie.price) <= 0));
  const currentPrice = purchaseType === 'LIFETIME' ? movie.price : (movie.rentalPrice || (movie.price * 0.4));

  // 1-Click Wallet Purchase on Watch Screen
  const handleWalletPurchase = async () => {
    if (!user) return openAuthModal('login');
    try {
      setIsPurchasing(true);
      const res = await orderAPI.purchaseMovie({
        movieId: movie.id,
        purchaseType
      });
      toast.success(res.data.message || `"${movie.title}" unlocked! Enjoy streaming.`);
      setShowBuyModal(false);
      await fetchWallet();
      
      // Update local state access to immediately start playing
      setMovieData((prev) => ({
        ...prev,
        movie: { ...prev.movie, hasAccess: true }
      }));
    } catch (err) {
      if (err.response?.status === 402) {
        toast.warning('Insufficient wallet balance! Switching to KHQR scan...');
        handleKhqrDirectPay();
      } else {
        toast.error(err.response?.data?.message || 'Purchase failed');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  // Direct KHQR QR Code Payment on Watch Screen
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 min-h-screen">
      
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/movie/${movie.slug || movie.id}`)}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Details
        </button>

        <button
          onClick={() => navigate('/movies')}
          className="inline-flex items-center gap-2 text-xs font-extrabold text-theme-gold hover:underline cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" /> Explore All Games
        </button>
      </div>

      {/* Access Guard or Video Player */}
      {canWatch || showPreviewVideo ? (
        <div className="space-y-4">
          {!canWatch && showPreviewVideo && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 text-xs">
              <span className="text-theme-gold font-bold flex items-center gap-2">
                <Play className="w-4 h-4 text-theme-gold fill-current" />
                Preview Mode: Streaming Game Trailer & Gameplay Video. Buy full access to download installer!
              </span>
              <button
                onClick={() => {
                  if (!user) return openAuthModal('login');
                  setPurchaseType('LIFETIME');
                  setShowBuyModal(true);
                }}
                className="px-4 py-1.5 rounded-xl gold-glow-button text-black font-extrabold text-xs shadow-gold-sm"
              >
                Buy Game (${Number(movie.price).toFixed(2)})
              </button>
            </div>
          )}
          <CustomVideoPlayer
            movie={{ ...movie, videoUrl: (!canWatch && movie.trailerUrl) ? movie.trailerUrl : movie.videoUrl }}
            currentEpisode={currentEpisode}
            episodes={movie.episodes || []}
            onSelectEpisode={(ep) => setCurrentEpisode(ep)}
          />
        </div>
      ) : (
        /* Video Lock Screen with Instant Preview Option */
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black border-2 border-amber-500/40 flex flex-col items-center justify-center p-6 text-center space-y-5 shadow-2xl">
          
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-gold-glow">
            <Lock className="w-8 h-8 text-theme-gold" />
          </div>

          <div className="max-w-md space-y-2">
            <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-amber-500/20 text-theme-gold border border-amber-500/40">
              PREMIUM ACCESS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              "{movie.title}"
            </h2>
            <p className="text-xs text-gray-400">
              Buy now with your wallet balance or ABA KHQR to unlock instant downloads and full 4K stream!
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                if (!user) return openAuthModal('login');
                setPurchaseType('LIFETIME');
                setShowBuyModal(true);
              }}
              className="px-9 py-4 rounded-full gold-glow-button text-black font-black text-sm flex items-center gap-2 shadow-gold-glow hover:scale-105 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 fill-black text-black" />
              Buy Now (${Number(movie.price).toFixed(2)})
            </button>

            <button
              onClick={() => setShowPreviewVideo(true)}
              className="px-7 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-gray-700 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 text-theme-gold fill-current" /> Watch Video Preview
            </button>
          </div>
        </div>
      )}

      {/* Movie Details Under Player */}
      <div className="bg-theme-card p-6 rounded-3xl border border-gray-800 space-y-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">{movie.title}</h1>
            <span className="text-xs text-theme-gold font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 mt-2 inline-block">
              Official Game Release
            </span>
          </div>

          {canWatch && (
            <a
              href={movie.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
              download={`${(movie.title || 'Game').replace(/\s+/g, '_')}_Full.mp4`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-full gold-glow-button text-black font-black text-xs shadow-gold-glow hover:scale-105 transition-all"
            >
              <Download className="w-4 h-4" /> Download Game
            </a>
          )}
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          {movie.description}
        </p>
      </div>

      {/* 🎬 Buy More Videos / Recommended Section */}
      {related && related.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-theme-gold" /> Buy More 4K Videos & Movies
            </h3>
            <button
              onClick={() => navigate('/movies')}
              className="text-xs font-bold text-theme-gold hover:underline"
            >
              View Full Catalog &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {related.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </div>
      )}

      {/* Instant Buy Modal inside Watch Screen */}
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
                INSTANT UNLOCK
              </span>
              <h3 className="text-2xl font-black text-white mt-1">Buy "{movie.title}"</h3>
              <p className="text-xs text-gray-400 mt-0.5">Stream immediately after purchase.</p>
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
            // Re-fetch movie to immediately unlock stream
            fetchMovie();
          }}
          khqrData={khqrData}
          orderId={null}
        />
      )}

    </div>
  );
};

export default WatchMovie;
