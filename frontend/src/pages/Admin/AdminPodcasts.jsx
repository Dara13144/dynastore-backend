import React, { useState, useEffect } from 'react';
import { adminAPI, podcastAPI, uploadAPI } from '../../api/endpoints';
import { Radio, Plus, Trash2, Edit3, Play, Pause, Video, X, Loader2, Music, Sparkles, DollarSign, Upload, Image } from 'lucide-react';
import AdminNav from '../../components/AdminNav';
import { toast } from 'react-toastify';

const AdminPodcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Audio & Video Playback in Admin
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [audioObj, setAudioObj] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);
  const [previewPodcastTitle, setPreviewPodcastTitle] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPodcastId, setEditingPodcastId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audioUrl, setAudioUrl] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600');
  const [category, setCategory] = useState('Director Interviews');
  const [duration, setDuration] = useState('1800');
  const [price, setPrice] = useState('2.99');
  const [isPremium, setIsPremium] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [uploadingCover, setUploadingCover] = useState(false);

  const handleMediaUpload = async (file, type) => {
    if (!file) return;
    const formData = new FormData();
    formData.append(type === 'video' ? 'video' : 'file', file);

    try {
      if (type === 'audio') {
        setUploadingAudio(true);
        setAudioProgress(0);
      } else if (type === 'video') {
        setUploadingVideo(true);
        setVideoProgress(0);
      } else if (type === 'cover') {
        setUploadingCover(true);
      }

      const res = await uploadAPI.uploadFile(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (type === 'audio') setAudioProgress(percent);
          else if (type === 'video') setVideoProgress(percent);
        }
      });

      const uploadedUrl = res.data.data.url;
      const sizeStr = res.data.data.sizeFormatted || '';

      if (type === 'audio') {
        setAudioUrl(uploadedUrl);
        toast.success(`Audio uploaded successfully! (${sizeStr})`);
      } else if (type === 'video') {
        setVideoUrl(uploadedUrl);
        toast.success(`Video podcast uploaded successfully! (${sizeStr})`);
      } else if (type === 'cover') {
        setCoverImage(uploadedUrl);
        toast.success('Cover image uploaded successfully!');
      }
    } catch (err) {
      toast.error('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      if (type === 'audio') {
        setUploadingAudio(false);
        setAudioProgress(0);
      } else if (type === 'video') {
        setUploadingVideo(false);
        setVideoProgress(0);
      } else if (type === 'cover') {
        setUploadingCover(false);
      }
    }
  };

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      const res = await podcastAPI.getPodcasts();
      setPodcasts(res.data.data || []);
    } catch (err) {
      console.error('Failed to load podcasts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
    return () => {
      if (audioObj) audioObj.pause();
    };
  }, []);

  const handlePlayAudio = (pod) => {
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

  const openCreateModal = () => {
    setEditingPodcastId(null);
    setTitle('');
    setDescription('');
    setAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    setCoverImage('https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600');
    setCategory('Director Interviews');
    setDuration('1800');
    setPrice('2.99');
    setIsPremium(false);
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingPodcastId(p.id);
    setTitle(p.title || '');
    setDescription(p.description || '');
    setAudioUrl(p.audioUrl || '');
    setVideoUrl(p.videoUrl || '');
    setCoverImage(p.coverImage || '');
    setCategory(p.category || 'Director Interviews');
    setDuration(String(p.duration || '1800'));
    setPrice(String(p.price || '0.00'));
    setIsPremium(Boolean(p.isPremium));
    setShowModal(true);
  };

  const handleSavePodcast = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        audioUrl,
        videoUrl: videoUrl || null,
        coverImage,
        category,
        duration: parseInt(duration),
        price: parseFloat(price || 0),
        isPremium: Boolean(isPremium)
      };

      if (editingPodcastId) {
        await adminAPI.updatePodcast(editingPodcastId, payload);
        toast.success('Podcast episode & pricing updated successfully!');
      } else {
        await adminAPI.createPodcast(payload);
        toast.success('New Podcast episode & sell price created successfully!');
      }

      setShowModal(false);
      fetchPodcasts();
    } catch (err) {
      toast.error('Failed to save podcast: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this podcast episode permanently?')) return;
    try {
      await adminAPI.deletePodcast(id);
      toast.success('Podcast deleted');
      fetchPodcasts();
    } catch (err) {
      toast.error('Failed to delete podcast');
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : null;
  };

  // 1-Click Video & Audio Podcast Preset Fillers
  const applyPreset = (preset) => {
    if (preset === 'nolan') {
      setTitle('Christopher Nolan: 4K Masterclass on IMAX Film Craft');
      setDescription('Exclusive 4K video podcast & audio discussion on practical IMAX cinematography, sound editing, and screenplay design.');
      setAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      setVideoUrl('https://www.youtube.com/watch?v=YoHD9XEInc0');
      setCoverImage('https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600');
      setCategory('Director Masterclass');
      setPrice('4.99');
      setIsPremium(true);
    } else if (preset === 'sound') {
      setTitle('Sci-Fi Sound Design & Dolby Atmos Immersion in 4K');
      setDescription('Watch and listen to the masterclass breaking down synthesizer soundscapes and sub-bass acoustics in 4K.');
      setAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3');
      setVideoUrl('https://www.youtube.com/watch?v=zSWdZVtXT7E');
      setCoverImage('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600');
      setCategory('Sound Design');
      setPrice('2.99');
      setIsPremium(true);
    } else if (preset === 'score') {
      setTitle('Hans Zimmer: Orchestral Film Scoring Sessions');
      setDescription('Live studio audio & video breakdowns of iconic Hollywood orchestral arrangements.');
      setAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3');
      setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4');
      setCoverImage('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600');
      setCategory('Original Soundtracks');
      setPrice('0.00');
      setIsPremium(false);
    }
    toast.info('Applied Video Podcast Preset');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Admin Top Navigation & Header */}
      <AdminNav
        title={
          <span className="flex items-center gap-3">
            <Radio className="w-8 h-8 text-cyan-400 animate-pulse-glow" /> Cinema Podcasts Hub & Video Stream Control
          </span>
        }
        subtitle="Add audio & video podcast streams, set sell prices ($), and manage episode catalog."
        actionButton={
          <button
            onClick={openCreateModal}
            className="px-6 py-3 rounded-full gold-glow-button text-black font-extrabold text-xs flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add Video Podcast Episode
          </button>
        }
      />

      {/* Podcasts Table */}
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
                  <th className="p-4">Episode & Cover</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Sell Price ($)</th>
                  <th className="p-4">Audio & Video Streams</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {podcasts.map((p) => {
                  const isThisPlaying = currentPlaying?.id === p.id && isPlaying;
                  return (
                    <tr key={p.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={p.coverImage} alt={p.title} className="w-12 h-12 rounded-xl object-cover shadow-md border border-amber-500/20" />
                        <div>
                          <p className="font-extrabold text-white text-sm line-clamp-1">{p.title}</p>
                          <p className="text-[10px] text-gray-400 line-clamp-1">{p.description}</p>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-theme-gold border border-amber-500/30">
                          {p.category}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-extrabold">
                          {p.isPremium || p.price > 0 ? (
                            <span className="text-emerald-400 text-sm font-black">${Number(p.price).toFixed(2)}</span>
                          ) : (
                            <span className="text-gray-400 text-[11px] bg-gray-800 px-2 py-0.5 rounded-md font-bold">FREE</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePlayAudio(p)}
                            className={`p-2 rounded-xl flex items-center gap-1.5 font-bold text-xs transition-all ${
                              isThisPlaying
                                ? 'bg-emerald-500 text-black shadow-lg animate-pulse'
                                : 'bg-amber-500/20 text-theme-gold hover:bg-amber-500 hover:text-black'
                            }`}
                          >
                            {isThisPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                            {isThisPlaying ? 'Playing' : 'Audio'}
                          </button>

                          {p.videoUrl && (
                            <button
                              onClick={() => {
                                setPreviewVideoUrl(p.videoUrl);
                                setPreviewPodcastTitle(p.title);
                              }}
                              className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-black font-bold text-xs flex items-center gap-1.5 transition-all border border-cyan-500/30"
                            >
                              <Video className="w-3.5 h-3.5" /> Video Stream
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-colors border border-cyan-500/20"
                            title="Edit Episode"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-rose-500/20"
                            title="Delete Episode"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Podcast Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in-up">
          <div className="relative w-full max-w-xl bg-theme-card border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/50"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-theme-gold border border-amber-500/30">
                {editingPodcastId ? 'EDIT VIDEO & AUDIO PODCAST' : 'NEW VIDEO & AUDIO PODCAST'}
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                {editingPodcastId ? 'Edit Podcast & Set Sell Price' : 'Upload Video/Audio Podcast & Pricing'}
              </h3>
            </div>

            {/* Quick 1-Click Presets */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-gray-800 space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-theme-gold" /> 1-Click Working Video & Audio Podcast Templates:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('nolan')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-theme-gold text-[11px] font-bold border border-amber-500/30"
                >
                  🎙️ Christopher Nolan 4K Video ($4.99)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('sound')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[11px] font-bold border border-cyan-500/30"
                >
                  🎬 Sci-Fi Sound 4K Video ($2.99)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('score')}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-bold border border-rose-500/30"
                >
                  🎧 Hans Zimmer Free Score ($0.00)
                </button>
              </div>
            </div>

            <form onSubmit={handleSavePodcast} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Episode Title</label>
                <input
                  type="text"
                  placeholder="e.g. Cinema Soundstages & Dolby Atmos Masterclass"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-gray-800 rounded-xl p-3 text-white font-bold focus:border-theme-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Description & Topics</label>
                <textarea
                  placeholder="Episode summary and topics covered..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows="3"
                  className="w-full bg-slate-900 border border-gray-800 rounded-xl p-3 text-white focus:border-theme-gold focus:outline-none"
                />
              </div>

              {/* Video Podcast Streaming Link & Direct Video Upload */}
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Full Video Podcast (MP4 / Stream URL / Local File)
                  </label>
                  <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 flex items-center gap-1 transition-colors">
                    {uploadingVideo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    <span>{uploadingVideo ? `Uploading ${videoProgress}%` : '📁 Upload Video File'}</span>
                    <input
                      type="file"
                      accept="video/*,.mp4,.webm,.mkv,.mov,.m4v"
                      disabled={uploadingVideo}
                      onChange={(e) => handleMediaUpload(e.target.files[0], 'video')}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadingVideo && (
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-cyan-500/30">
                    <div
                      className="bg-cyan-500 h-2 transition-all duration-300 rounded-full"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                )}

                <input
                  type="text"
                  placeholder="https://.../video.mp4 or /uploads/video-....mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl p-2.5 text-xs text-cyan-300 font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Audio Stream Link & Direct Audio Upload */}
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-amber-400 uppercase flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" /> Audio Stream (MP3 / AAC / Local File)
                  </label>
                  <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-theme-gold text-[10px] font-bold border border-amber-500/40 flex items-center gap-1 transition-colors">
                    {uploadingAudio ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    <span>{uploadingAudio ? `Uploading ${audioProgress}%` : '📁 Upload Audio File'}</span>
                    <input
                      type="file"
                      accept="audio/*,.mp3,.wav,.ogg,.aac,.m4a"
                      disabled={uploadingAudio}
                      onChange={(e) => handleMediaUpload(e.target.files[0], 'audio')}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadingAudio && (
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-amber-500/30">
                    <div
                      className="bg-amber-500 h-2 transition-all duration-300 rounded-full"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                )}

                <input
                  type="text"
                  placeholder="https://.../audio.mp3 or /uploads/audio-....mp3"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-amber-500/40 rounded-xl p-2.5 text-xs text-amber-300 font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-400 uppercase mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Sell Price ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl p-3 text-emerald-400 font-bold focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase">Cover Image</label>
                    <label className="cursor-pointer text-[10px] font-bold text-theme-gold hover:underline flex items-center gap-0.5">
                      {uploadingCover ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Upload className="w-2.5 h-2.5" />}
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingCover}
                        onChange={(e) => handleMediaUpload(e.target.files[0], 'cover')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-gray-800 rounded-xl p-3 text-white focus:border-theme-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-gray-800 rounded-xl p-3 text-white focus:border-theme-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="podcastPremiumCheck"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="rounded bg-slate-900 border-gray-800 text-amber-500 w-4 h-4"
                />
                <label htmlFor="podcastPremiumCheck" className="text-gray-300 font-bold">
                  Require Wallet Purchase / Paid Premium Access
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full gold-glow-button text-black font-extrabold text-sm shadow-xl"
              >
                {editingPodcastId ? '💾 Save Changes & Update Podcast' : '🚀 Publish Video/Audio Podcast & Sell Price'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Video Podcast Player Preview Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in-up">
          <div className="relative w-full max-w-4xl bg-theme-card border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <button
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute right-4 top-4 p-2.5 text-gray-400 hover:text-white rounded-full bg-gray-800/80 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest block">VIDEO PODCAST STREAM PREVIEW</span>
              <h3 className="text-xl font-black text-white">{previewPodcastTitle}</h3>
              <p className="text-xs text-gray-400 font-mono truncate">{previewVideoUrl}</p>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black border border-gray-800 aspect-video shadow-2xl">
              {(() => {
                const gdMatch = previewVideoUrl?.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]+)/i);
                const ytMatch = previewVideoUrl?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                if (gdMatch) {
                  return (
                    <iframe
                      src={`https://drive.google.com/file/d/${gdMatch[1]}/preview`}
                      title={previewPodcastTitle}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                } else if (ytMatch) {
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`}
                      title={previewPodcastTitle}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                } else {
                  return (
                    <video
                      src={previewVideoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    >
                      Your browser does not support the video tag.
                    </video>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPodcasts;
