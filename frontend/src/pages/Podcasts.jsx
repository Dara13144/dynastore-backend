import React, { useState, useEffect } from 'react';
import { podcastAPI, walletAPI } from '../api/endpoints';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { Radio, Play, Pause, Heart, Volume2, Sparkles, Loader2, Video, DollarSign, X, CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'react-toastify';

const Podcasts = () => {
  const { wallet, fetchWallet } = useWallet();
  const { user, openAuthModal } = useAuth();

  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [audioObj, setAudioObj] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [unlockedPodcasts, setUnlockedPodcasts] = useState({});

  // Video Streaming Modal
  const [activeVideoPodcast, setActiveVideoPodcast] = useState(null);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const res = await podcastAPI.getPodcasts();
        setPodcasts(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch podcasts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPodcasts();

    return () => {
      if (audioObj) audioObj.pause();
    };
  }, []);

  const handlePlayPodcast = async (pod) => {
    // Check if premium and needs purchase
    if (pod.isPremium && pod.price > 0 && !unlockedPodcasts[pod.id]) {
      if (!user) {
        openAuthModal('login');
        return;
      }

      if ((wallet?.balance || 0) < pod.price) {
        toast.warning(`Insufficient wallet balance ($${wallet?.balance?.toFixed(2) || '0.00'}). Please top up.`);
        return;
      }

      if (!window.confirm(`Unlock "${pod.title}" for $${Number(pod.price).toFixed(2)} USD from your wallet?`)) return;

      try {
        await walletAPI.payWithWallet({
          amount: pod.price,
          description: `Unlock Podcast Episode: ${pod.title}`
        });
        setUnlockedPodcasts(prev => ({ ...prev, [pod.id]: true }));
        await fetchWallet();
        toast.success(`Unlocked "${pod.title}"! Enjoy streaming.`);
      } catch (e) {
        toast.error('Failed to unlock podcast: ' + (e.response?.data?.message || e.message));
        return;
      }
    }

    if (currentPlaying?.id === pod.id) {
      if (isPlaying) {
        audioObj.pause();
        setIsPlaying(false);
      } else {
        audioObj.play();
        setIsPlaying(true);
      }
      return;
    }

    if (audioObj) audioObj.pause();

    const newAudio = new Audio(pod.audioUrl);
    newAudio.play();
    setAudioObj(newAudio);
    setCurrentPlaying(pod);
    setIsPlaying(true);

    newAudio.onended = () => setIsPlaying(false);
  };

  const handleWatchVideoPodcast = async (pod) => {
    if (pod.isPremium && pod.price > 0 && !unlockedPodcasts[pod.id]) {
      if (!user) {
        openAuthModal('login');
        return;
      }

      if ((wallet?.balance || 0) < pod.price) {
        toast.warning(`Insufficient wallet balance ($${wallet?.balance?.toFixed(2) || '0.00'}). Please top up.`);
        return;
      }

      if (!window.confirm(`Unlock "${pod.title}" for $${Number(pod.price).toFixed(2)} USD from your wallet?`)) return;

      try {
        await walletAPI.payWithWallet({
          amount: pod.price,
          description: `Unlock Video Podcast: ${pod.title}`
        });
        setUnlockedPodcasts(prev => ({ ...prev, [pod.id]: true }));
        await fetchWallet();
        toast.success(`Unlocked "${pod.title}"!`);
      } catch (e) {
        toast.error('Failed to unlock podcast: ' + (e.response?.data?.message || e.message));
        return;
      }
    }

    // Pause background audio when starting video
    if (audioObj) {
      audioObj.pause();
      setIsPlaying(false);
    }

    setActiveVideoPodcast(pod);
  };

  const handleLike = async (id) => {
    try {
      await podcastAPI.likePodcast(id);
      setPodcasts(prev =>
        prev.map(p => p.id === id ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p)
      );
      toast.success('Liked episode!');
    } catch (err) {
      toast.error('Failed to like podcast');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold-glow animate-float">
            <Radio className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Cinema Podcasts & Video Hub</h1>
            <p className="text-xs text-gray-400">Stream exclusive 4K video podcasts, director audio commentaries, and film discussions.</p>
          </div>
        </div>

        {user && (
          <div className="px-4 py-2 rounded-2xl bg-theme-card border border-amber-500/30 text-xs font-bold flex items-center gap-2">
            <span className="text-gray-400">Wallet:</span>
            <span className="text-theme-gold font-black">${wallet?.balance?.toFixed(2) || '0.00'} USD</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-10 h-10 text-theme-gold animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {podcasts.map((pod, idx) => {
            const isUnlocked = !pod.isPremium || pod.price <= 0 || unlockedPodcasts[pod.id];
            const isThisAudioPlaying = currentPlaying?.id === pod.id && isPlaying;

            return (
              <div
                key={pod.id}
                style={{ animationDelay: `${idx * 80}ms` }}
                className="p-5 rounded-3xl bg-theme-card border border-gray-800 hover-glow-card animate-fade-in-up flex flex-col sm:flex-row gap-4 justify-between"
              >
                <div className="relative w-full sm:w-32 h-32 flex-shrink-0">
                  <img
                    src={pod.coverImage}
                    alt={pod.title}
                    className="w-full h-full rounded-2xl object-cover shadow-md border border-amber-500/20"
                  />
                  {pod.videoUrl && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[9px] font-bold flex items-center gap-1">
                      <Video className="w-3 h-3" /> 4K VIDEO
                    </span>
                  )}
                </div>

                <div className="flex-grow space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-theme-gold bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                        {pod.category}
                      </span>
                      
                      {pod.isPremium && pod.price > 0 ? (
                        <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                          ${Number(pod.price).toFixed(2)} USD
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-800 px-2 py-0.5 rounded-md">
                          FREE
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-extrabold text-white mt-1.5 line-clamp-1">{pod.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">{pod.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-800/80">
                    <div className="flex items-center gap-2">
                      {/* Audio Button */}
                      <button
                        onClick={() => handlePlayPodcast(pod)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-extrabold text-xs transition-all ${
                          isThisAudioPlaying
                            ? 'bg-emerald-500 text-black shadow-lg animate-pulse'
                            : 'gold-glow-button text-black'
                        }`}
                      >
                        {isThisAudioPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                        {isThisAudioPlaying ? 'Pause Audio' : isUnlocked ? 'Listen Audio' : `Unlock Audio ($${Number(pod.price).toFixed(2)})`}
                      </button>

                      {/* Video Podcast Button */}
                      {pod.videoUrl && (
                        <button
                          onClick={() => handleWatchVideoPodcast(pod)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500 hover:text-black text-cyan-400 font-bold text-xs border border-cyan-500/40 transition-all shadow-md"
                        >
                          <Video className="w-3.5 h-3.5" /> Watch Video
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleLike(pod.id)}
                      className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1 rounded-lg hover:bg-rose-500/10"
                    >
                      <Heart className="w-4 h-4 fill-rose-500/30" /> {pod.likesCount || 0}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Podcast Modal Player */}
      {activeVideoPodcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in-up">
          <div className="relative w-full max-w-4xl bg-theme-card border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            
            <button
              onClick={() => setActiveVideoPodcast(null)}
              className="absolute right-4 top-4 p-2.5 text-gray-400 hover:text-white rounded-full bg-gray-800/80 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest block">4K VIDEO PODCAST STREAM</span>
              <h3 className="text-2xl font-black text-white mt-0.5">{activeVideoPodcast.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{activeVideoPodcast.description}</p>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black border border-gray-800 aspect-video shadow-2xl">
              {(() => {
                const match = activeVideoPodcast.videoUrl?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                if (match) {
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`}
                      title={activeVideoPodcast.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }
                return (
                  <video
                    src={activeVideoPodcast.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Podcasts;
