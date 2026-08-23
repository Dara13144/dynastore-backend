import React, { useState, useEffect } from 'react';
import { adminAPI, movieAPI, uploadAPI } from '../../api/endpoints';
import { Film, Plus, Trash2, Edit3, Play, X, Loader2, Video, Sparkles, Flame, Star, TrendingUp, CheckCircle, Search, Filter, Crown, Zap, CheckCircle2, Upload, Image } from 'lucide-react';
import AdminNav from '../../components/AdminNav';
import { toast } from 'react-toastify';

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'TRENDING' | 'FEATURED' | 'TOP_RATED'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);
  const [previewMovieTitle, setPreviewMovieTitle] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [poster, setPoster] = useState('');
  const [banner, setBanner] = useState('');
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [trailerUrl, setTrailerUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4');
  const [price, setPrice] = useState('9.99');
  const [rentalPrice, setRentalPrice] = useState('3.99');
  const [isPremium, setIsPremium] = useState(true);
  const [isFeatured, setIsFeatured] = useState(true);
  const [isTrending, setIsTrending] = useState(true);
  const [rating, setRating] = useState('9.2');
  const [director, setDirector] = useState('Christopher Nolan');
  const [cast, setCast] = useState('Leonardo DiCaprio, Cillian Murphy');
  const [releaseYear, setReleaseYear] = useState('2026');
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [uploadingTrailer, setUploadingTrailer] = useState(false);
  const [trailerProgress, setTrailerProgress] = useState(0);

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      if (type === 'poster') setUploadingPoster(true);
      if (type === 'banner') setUploadingBanner(true);

      const res = await uploadAPI.uploadFile(formData);
      const uploadedUrl = res.data.data.url;

      if (type === 'poster') {
        setPoster(uploadedUrl);
        toast.success('Poster image uploaded successfully!');
      } else {
        setBanner(uploadedUrl);
        toast.success('Banner backdrop uploaded successfully!');
      }
    } catch (err) {
      toast.error('Failed to upload image: ' + (err.response?.data?.message || err.message));
    } finally {
      if (type === 'poster') setUploadingPoster(false);
      if (type === 'banner') setUploadingBanner(false);
    }
  };

  const handleVideoUpload = async (file, type) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('video', file);

    try {
      if (type === 'video') {
        setUploadingVideo(true);
        setVideoProgress(0);
      } else {
        setUploadingTrailer(true);
        setTrailerProgress(0);
      }

      const res = await uploadAPI.uploadVideo(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (type === 'video') setVideoProgress(percent);
          else setTrailerProgress(percent);
        }
      });

      const uploadedUrl = res.data.data.url;
      const sizeStr = res.data.data.sizeFormatted || '';

      if (type === 'video') {
        setVideoUrl(uploadedUrl);
        toast.success(`Video file uploaded successfully! (${sizeStr})`);
      } else {
        setTrailerUrl(uploadedUrl);
        toast.success(`Trailer video uploaded successfully! (${sizeStr})`);
      }
    } catch (err) {
      toast.error('Failed to upload video: ' + (err.response?.data?.message || err.message));
    } finally {
      if (type === 'video') {
        setUploadingVideo(false);
        setVideoProgress(0);
      } else {
        setUploadingTrailer(false);
        setTrailerProgress(0);
      }
    }
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await movieAPI.getMovies({ limit: 100 });
      setMovies(res.data.data.movies || []);
    } catch (err) {
      console.error('Failed to load movies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const openCreateModal = () => {
    setEditingMovieId(null);
    setTitle('');
    setDescription('');
    setPoster('https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800');
    setBanner('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600');
    setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    setTrailerUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4');
    setPrice('9.99');
    setRentalPrice('3.99');
    setIsPremium(true);
    setIsFeatured(true);
    setIsTrending(true);
    setRating('9.2');
    setDirector('Christopher Nolan');
    setCast('Leonardo DiCaprio, Cillian Murphy');
    setReleaseYear('2026');
    setShowModal(true);
  };

  const openEditModal = (m) => {
    setEditingMovieId(m.id);
    setTitle(m.title || '');
    setDescription(m.description || '');
    setPoster(m.poster || '');
    setBanner(m.banner || '');
    setVideoUrl(m.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    setTrailerUrl(m.trailerUrl || '');
    setPrice(String(m.price || '9.99'));
    setRentalPrice(String(m.rentalPrice || '3.99'));
    setIsPremium(Boolean(m.isPremium));
    setIsFeatured(Boolean(m.isFeatured));
    setIsTrending(Boolean(m.isTrending));
    setRating(String(m.rating || '9.0'));
    setDirector(m.director || '');
    setCast(m.cast || '');
    setReleaseYear(String(m.releaseYear || '2026'));
    setShowModal(true);
  };

  const handleSaveMovie = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        poster,
        banner,
        videoUrl,
        trailerUrl,
        price: parseFloat(price),
        rentalPrice: parseFloat(rentalPrice),
        isPremium,
        isFeatured,
        isTrending,
        rating: parseFloat(rating),
        director,
        cast,
        releaseYear: parseInt(releaseYear)
      };

      if (editingMovieId) {
        await adminAPI.updateMovie(editingMovieId, payload);
        toast.success('Movie & Stream updated successfully!');
      } else {
        await adminAPI.createMovie(payload);
        toast.success('New Blockbuster published successfully!');
      }

      setShowModal(false);
      fetchMovies();
    } catch (err) {
      toast.error('Failed to save movie: ' + (err.response?.data?.message || err.message));
    }
  };

  // Quick Instant Toggle in Table
  const toggleTrending = async (movie) => {
    try {
      const newStatus = !movie.isTrending;
      await adminAPI.updateMovie(movie.id, { isTrending: newStatus });
      setMovies(prev => prev.map(m => m.id === movie.id ? { ...m, isTrending: newStatus } : m));
      toast.success(`"${movie.title}" is ${newStatus ? 'now Trending 🔥' : 'removed from Trending'}`);
    } catch (e) {
      toast.error('Failed to toggle trending');
    }
  };

  const toggleFeatured = async (movie) => {
    try {
      const newStatus = !movie.isFeatured;
      await adminAPI.updateMovie(movie.id, { isFeatured: newStatus });
      setMovies(prev => prev.map(m => m.id === movie.id ? { ...m, isFeatured: newStatus } : m));
      toast.success(`"${movie.title}" is ${newStatus ? 'now a Popular Blockbuster 🌟' : 'removed from Blockbusters'}`);
    } catch (e) {
      toast.error('Failed to toggle featured');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this movie permanently?')) return;
    try {
      await adminAPI.deleteMovie(id);
      toast.success('Movie deleted');
      fetchMovies();
    } catch (err) {
      toast.error('Failed to delete movie');
    }
  };

  // Filtered List
  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      !searchQuery ||
      m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.director?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'TRENDING') return m.isTrending;
    if (filterType === 'FEATURED') return m.isFeatured;
    if (filterType === 'TOP_RATED') return m.rating >= 8.5;
    return true;
  });

  const getGoogleDriveEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]+)/i);
    return match ? `https://drive.google.com/file/d/${match[1]}/preview` : null;
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : null;
  };

  // 1-Click Video CDN, Google Drive & YouTube Preset Fillers
  const applyPreset = (preset) => {
    if (preset === 'gdrive_sneh') {
      setTitle('ស្នេហ៍ឆ្លងវេហា - សុីន សុីសាមុត & ឌី សាវ៉េត | Video MV [cover]');
      setDescription('បទចម្រៀងមរតកដើម "ស្នេហ៍ឆ្លងវេហា" ច្រៀងឡើងវិញយ៉ាងពិរោះរណ្តំដោយតារាចម្រៀងល្បីៗ រួមជាមួយការសម្តែងគុណភាពខ្ពស់ 4K Ultra HD');
      setVideoUrl('https://drive.google.com/file/d/1zPPSVHgufEB-zpFDosNTocxo9_z7H6yX/view?usp=sharing');
      setTrailerUrl('https://drive.google.com/file/d/1zPPSVHgufEB-zpFDosNTocxo9_z7H6yX/view?usp=sharing');
      setPoster('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800');
      setBanner('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600');
      setDirector('Sinn Sisamouth Classic Cover');
      setCast('Sinn Sisamouth, Dy Saveth, KV Cinema');
      setRating('9.9');
      setIsTrending(true);
      setIsFeatured(true);
      setIsPremium(false);
      setPrice('0.00');
    } else if (preset === 'yt_inception') {
      setTitle('Inception (4K IMAX Ultra HD)');
      setDescription('A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.');
      setVideoUrl('https://www.youtube.com/watch?v=YoHD9XEInc0');
      setTrailerUrl('https://www.youtube.com/watch?v=YoHD9XEInc0');
      setPoster('https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800');
      setBanner('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600');
      setDirector('Christopher Nolan');
      setCast('Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page');
      setRating('9.8');
      setIsTrending(true);
      setIsFeatured(true);
    } else if (preset === 'yt_interstellar') {
      setTitle('Interstellar (4K Space Exploration)');
      setDescription('A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.');
      setVideoUrl('https://www.youtube.com/watch?v=zSWdZVtXT7E');
      setTrailerUrl('https://www.youtube.com/watch?v=zSWdZVtXT7E');
      setPoster('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800');
      setBanner('https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600');
      setDirector('Christopher Nolan');
      setCast('Matthew McConaughey, Anne Hathaway, Jessica Chastain');
      setRating('9.9');
      setIsTrending(true);
      setIsFeatured(true);
    } else if (preset === 'bunny') {
      setTitle('Big Buck Bunny 4K Ultimate');
      setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
      setPoster('https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800');
      setRating('9.5');
      setIsTrending(true);
      setIsFeatured(true);
    } else if (preset === 'tears') {
      setTitle('Tears of Steel 4K Cyberpunk Sci-Fi');
      setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
      setPoster('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800');
      setRating('9.3');
      setIsTrending(true);
      setIsFeatured(true);
    }
    toast.info('Applied Video Stream Preset');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Admin Top Navigation & Header */}
      <AdminNav
        title={
          <span className="flex items-center gap-3">
            <Film className="w-8 h-8 text-theme-gold animate-pulse-glow" /> Movies & Series Catalog Control
          </span>
        }
        subtitle="Control Trending Now, Popular Blockbusters, Top Rated Masterpieces, and full video streaming links."
        actionButton={
          <button
            onClick={openCreateModal}
            className="px-6 py-3 rounded-full gold-glow-button text-black font-extrabold text-xs flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add Video Blockbuster
          </button>
        }
      />

      {/* Catalog Filters & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Quick Section Tabs */}
        <div className="flex flex-wrap gap-2 text-xs font-extrabold bg-slate-900 p-1.5 rounded-2xl border border-gray-800">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-4 py-2 rounded-xl transition-all ${
              filterType === 'ALL' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            All Titles ({movies.length})
          </button>
          
          <button
            onClick={() => setFilterType('TRENDING')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              filterType === 'TRENDING' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Game Trending Now ({movies.filter(m => m.isTrending).length})
          </button>

          <button
            onClick={() => setFilterType('FEATURED')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              filterType === 'FEATURED' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Popular Games ({movies.filter(m => m.isFeatured).length})
          </button>

          <button
            onClick={() => setFilterType('TOP_RATED')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              filterType === 'TOP_RATED' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" /> Top Rated Games ({movies.filter(m => m.rating >= 8.5).length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search title, director..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-theme-card border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white font-bold focus:border-theme-gold focus:outline-none"
          />
        </div>
      </div>

      {/* Movies Table */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-10 h-10 text-theme-gold animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-theme-card rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-slate-900 text-gray-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Movie & Poster</th>
                  <th className="p-4">Category & Rating</th>
                  <th className="p-4">Catalog Section Controls</th>
                  <th className="p-4">Video Stream</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredMovies.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={m.poster} alt={m.title} className="w-12 h-16 rounded-xl object-cover shadow-md border border-amber-500/20" />
                      <div>
                        <p className="font-extrabold text-white text-sm line-clamp-1">{m.title}</p>
                        <p className="text-[10px] text-gray-400">{m.director} • {m.releaseYear}</p>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        <span className="font-extrabold text-amber-400 flex items-center gap-1 text-xs">
                          ★ {m.rating} <span className="text-[10px] text-gray-500 font-normal">/ 10</span>
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${m.isPremium ? 'bg-amber-500/20 text-theme-gold' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {m.isPremium ? 'PREMIUM' : 'FREE'}
                        </span>
                      </div>
                    </td>

                    {/* Section Switcher Controls */}
                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        
                        {/* Trending Toggle */}
                        <button
                          onClick={() => toggleTrending(m)}
                          className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 transition-all border ${
                            m.isTrending
                              ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                              : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
                          }`}
                        >
                          <Flame className="w-3 h-3" /> Trending
                        </button>

                        {/* Blockbuster / Featured Toggle */}
                        <button
                          onClick={() => toggleFeatured(m)}
                          className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 transition-all border ${
                            m.isFeatured
                              ? 'bg-blue-500 text-white border-blue-400 shadow-md'
                              : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
                          }`}
                        >
                          <TrendingUp className="w-3 h-3" /> Blockbuster
                        </button>

                        {/* Top Rated Badge */}
                        {m.rating >= 8.5 && (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Star className="w-3 h-3" /> Masterpiece
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-emerald-400 truncate bg-emerald-950/40 border border-emerald-500/30 px-2 py-1 rounded-lg max-w-[130px]">
                          {m.videoUrl ? m.videoUrl : 'Default Stream'}
                        </span>
                        <button
                          onClick={() => {
                            setPreviewVideoUrl(m.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
                            setPreviewMovieTitle(m.title);
                          }}
                          className="p-1.5 rounded-lg bg-amber-500/20 text-theme-gold hover:bg-amber-500 hover:text-black transition-colors"
                          title="Preview Video Stream"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </td>

                    <td className="p-4 font-black text-white text-sm">${m.price?.toFixed(2) || '0.00'}</td>

                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-colors border border-cyan-500/20"
                          title="Edit Video Link & Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-rose-500/20"
                          title="Delete Movie"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Video Movie Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in-up">
          <div className="relative w-full max-w-2xl bg-theme-card border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/50"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-theme-gold border border-amber-500/30">
                {editingMovieId ? 'EDIT MOVIE & STREAM' : 'ADD NEW BLOCKBUSTER MOVIE'}
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                {editingMovieId ? 'Edit Streaming Link & Section Settings' : 'Publish New Movie & Video Stream'}
              </h3>
            </div>

            {/* Quick 1-Click Video URL Presets */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-gray-800 space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-theme-gold" /> 1-Click Working 4K YouTube & CDN Stream Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('gdrive_sneh')}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[11px] font-bold border border-blue-500/30 flex items-center gap-1"
                >
                  ☁️ Google Drive: ស្នេហ៍ឆ្លងវេហា 4K MV
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('yt_inception')}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-bold border border-red-500/30"
                >
                  ▶ YouTube: Inception 4K (★ 9.8)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('yt_interstellar')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[11px] font-bold border border-cyan-500/30"
                >
                  ▶ YouTube: Interstellar 4K (★ 9.9)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('bunny')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-theme-gold text-[11px] font-bold border border-amber-500/30"
                >
                  🐰 CDN MP4: Big Buck Bunny 4K
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveMovie} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Game Title / Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cyberpunk 2077 / Grand Theft Auto"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-gray-800 rounded-xl p-3 text-white font-bold focus:border-theme-gold focus:outline-none"
                />
              </div>

              {/* Game Download Link & Direct File Upload */}
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Upload Link Game & File Game (ZIP / EXE / APK / Direct Download URL)
                  </label>
                  <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1 transition-colors">
                    {uploadingVideo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    <span>{uploadingVideo ? `Uploading ${videoProgress}%` : '📁 Upload Game File (ZIP/EXE/APK/MP4)'}</span>
                    <input
                      type="file"
                      accept="*/*,.zip,.rar,.7z,.exe,.apk,.iso,.bin,.mp4,.webm,.mkv,.mov,.m4v,.avi"
                      disabled={uploadingVideo}
                      onChange={(e) => handleVideoUpload(e.target.files[0], 'video')}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadingVideo && (
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-emerald-500/30">
                    <div
                      className="bg-emerald-500 h-2 transition-all duration-300 rounded-full"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://.../game.zip, direct game download link, or /uploads/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl p-2.5 text-xs text-emerald-300 font-mono focus:border-emerald-400 focus:outline-none"
                  />
                  {videoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewVideoUrl(videoUrl);
                        setPreviewMovieTitle(title || 'Stream / Game Preview');
                      }}
                      className="px-3 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black font-bold text-xs flex items-center gap-1 transition-colors shrink-0"
                      title="Preview Game Link"
                    >
                      <Play className="w-3 h-3 fill-current" /> Preview
                    </button>
                  )}
                </div>
              </div>

              {/* Game Video Preview / Trailer */}
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Game Video Preview / Trailer (MP4 / Stream URL / Local File)
                  </label>
                  <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-theme-gold text-[10px] font-bold border border-amber-500/40 flex items-center gap-1 transition-colors">
                    {uploadingTrailer ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    <span>{uploadingTrailer ? `Uploading ${trailerProgress}%` : '📁 Upload Game Video (MP4)'}</span>
                    <input
                      type="file"
                      accept="video/*,.mp4,.webm,.mkv,.mov,.m4v"
                      disabled={uploadingTrailer}
                      onChange={(e) => handleVideoUpload(e.target.files[0], 'trailer')}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadingTrailer && (
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-amber-500/30">
                    <div
                      className="bg-amber-500 h-2 transition-all duration-300 rounded-full"
                      style={{ width: `${trailerProgress}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://.../trailer.mp4 or /uploads/video-....mp4"
                    value={trailerUrl}
                    onChange={(e) => setTrailerUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white font-mono focus:border-theme-gold focus:outline-none"
                  />
                  {trailerUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewVideoUrl(trailerUrl);
                        setPreviewMovieTitle((title ? title + ' (Trailer)' : 'Trailer Preview'));
                      }}
                      className="px-3 py-2.5 rounded-xl bg-amber-500/20 text-theme-gold hover:bg-amber-500 hover:text-black font-bold text-xs flex items-center gap-1 transition-colors shrink-0"
                      title="Preview Video"
                    >
                      <Play className="w-3 h-3 fill-current" /> Preview
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Game Description & Details</label>
                <textarea
                  placeholder="Game details, features, storyline..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows="3"
                  className="w-full bg-slate-900 border border-gray-800 rounded-xl p-3 text-white focus:border-theme-gold focus:outline-none"
                />
              </div>

              {/* Image Upload & URL Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Poster Image Upload & Preview */}
                <div className="space-y-2 p-3.5 bg-slate-900/90 rounded-2xl border border-gray-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase">Poster Image</label>
                    <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-theme-gold text-[10px] font-bold border border-amber-500/40 flex items-center gap-1 transition-colors">
                      {uploadingPoster ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      <span>{uploadingPoster ? 'Uploading...' : '📁 Upload Poster File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingPoster}
                        onChange={(e) => handleFileUpload(e.target.files[0], 'poster')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    {poster ? (
                      <img
                        src={poster}
                        alt="Poster Preview"
                        className="w-12 h-16 rounded-xl object-cover border border-amber-500/40 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-16 rounded-xl bg-slate-800 border border-gray-700 flex items-center justify-center text-gray-500 shrink-0">
                        <Image className="w-5 h-5" />
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Paste Poster URL or Upload above"
                      value={poster}
                      onChange={(e) => setPoster(e.target.value)}
                      className="w-full bg-slate-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:border-theme-gold focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Banner Backdrop Upload & Preview */}
                <div className="space-y-2 p-3.5 bg-slate-900/90 rounded-2xl border border-gray-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase">Banner Backdrop</label>
                    <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-theme-gold text-[10px] font-bold border border-amber-500/40 flex items-center gap-1 transition-colors">
                      {uploadingBanner ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      <span>{uploadingBanner ? 'Uploading...' : '📁 Upload Banner File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingBanner}
                        onChange={(e) => handleFileUpload(e.target.files[0], 'banner')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    {banner ? (
                      <img
                        src={banner}
                        alt="Banner Preview"
                        className="w-16 h-12 rounded-xl object-cover border border-amber-500/40 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-12 rounded-xl bg-slate-800 border border-gray-700 flex items-center justify-center text-gray-500 shrink-0">
                        <Image className="w-5 h-5" />
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Paste Banner URL or Upload above"
                      value={banner}
                      onChange={(e) => setBanner(e.target.value)}
                      className="w-full bg-slate-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:border-theme-gold focus:outline-none font-mono"
                    />
                  </div>
                </div>

              </div>

              {/* Price and Rating Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Buy Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-gray-800 rounded-xl p-3 text-white font-bold focus:border-theme-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-400 uppercase mb-1">Rating (★ 1-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full bg-slate-900 border border-amber-500/40 rounded-xl p-3 text-amber-400 font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Homepage Placement Checkboxes */}
              <div className="p-3 bg-slate-900 rounded-2xl border border-gray-800 space-y-2">
                <span className="text-[11px] font-bold text-white uppercase block">Homepage Placement Toggles:</span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="rounded bg-slate-900 border-gray-800 text-amber-500 w-4 h-4"
                    />
                    <span className="text-gray-300 font-bold">🔥 Show in "Trending Now"</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded bg-slate-900 border-gray-800 text-blue-500 w-4 h-4"
                    />
                    <span className="text-gray-300 font-bold">🌟 Show in "Most Popular Blockbusters"</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPremium}
                      onChange={(e) => setIsPremium(e.target.checked)}
                      className="rounded bg-slate-900 border-gray-800 text-amber-500 w-4 h-4"
                    />
                    <span className="text-gray-300 font-bold">👑 Premium (Requires Purchase)</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full gold-glow-button text-black font-extrabold text-sm shadow-xl"
              >
                {editingMovieId ? '💾 Save Changes & Update Sections' : '🚀 Publish Movie & Update Sections'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Video Player Preview Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in-up">
          <div className="relative w-full max-w-4xl bg-theme-card border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <button
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute right-4 top-4 p-2.5 text-gray-400 hover:text-white rounded-full bg-gray-800/80 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase text-theme-gold tracking-widest block">ADMIN STREAM PREVIEW</span>
              <h3 className="text-xl font-black text-white">{previewMovieTitle}</h3>
              <p className="text-xs text-gray-400 font-mono truncate">{previewVideoUrl}</p>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black border border-gray-800 aspect-video shadow-2xl">
              {getGoogleDriveEmbedUrl(previewVideoUrl) ? (
                <iframe
                  src={getGoogleDriveEmbedUrl(previewVideoUrl)}
                  title={previewMovieTitle}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : getYouTubeEmbedUrl(previewVideoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(previewVideoUrl)}
                  title={previewMovieTitle}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={previewVideoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminMovies;
