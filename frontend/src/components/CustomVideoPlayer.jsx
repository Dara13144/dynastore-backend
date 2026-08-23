import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  ListVideo,
  RotateCcw,
  RotateCw,
  Subtitles,
  ArrowLeft,
  Youtube,
  Cloud,
  Shield,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { movieAPI } from '../api/endpoints';
import { useAntiScreenRecord } from '../hooks/useAntiScreenRecord';
import AntiScreenRecordShield from './AntiScreenRecordShield';

export const getGoogleDriveEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]+)/i);
  return match ? `https://drive.google.com/file/d/${match[1]}/preview` : null;
};

export const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1` : null;
};

export const getVimeoEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/(?:vimeo\.com\/)(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : null;
};

const CustomVideoPlayer = ({ movie, currentEpisode, episodes = [], onSelectEpisode }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [quality, setQuality] = useState('1080p');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);

  // Anti-Screen Recording & DRM Shield Hook
  const { isScreenCaptureBlocked } = useAntiScreenRecord({ enabled: true, showWarnings: true });

  const activeVideoUrl = currentEpisode ? currentEpisode.videoUrl : movie?.videoUrl;
  const gDriveEmbedUrl = getGoogleDriveEmbedUrl(activeVideoUrl);
  const ytEmbedUrl = getYouTubeEmbedUrl(activeVideoUrl);
  const vimeoEmbedUrl = getVimeoEmbedUrl(activeVideoUrl);
  const isEmbedStream = Boolean(gDriveEmbedUrl || ytEmbedUrl || vimeoEmbedUrl);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isEmbedStream) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);

      // Periodically save watch progress every 10 seconds
      if (Math.floor(video.currentTime) % 10 === 0 && movie) {
        movieAPI.saveProgress({
          movieId: movie.id,
          episodeId: currentEpisode?.id,
          progressSeconds: Math.floor(video.currentTime),
          durationSeconds: Math.floor(video.duration || 0)
        }).catch(() => {});
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [movie, currentEpisode, isEmbedStream]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
    setShowSettings(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (timeInSec) => {
    const min = Math.floor(timeInSec / 60);
    const sec = Math.floor(timeInSec % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // If Google Drive Video Link, render native Google Drive Cloud Player
  if (gDriveEmbedUrl) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-blue-500/30 group select-none">
        {/* Anti-Screen Recording & Dynamic Forensic Watermark Shield */}
        <AntiScreenRecordShield isBlocked={isScreenCaptureBlocked} movieTitle={movie?.title} />

        {/* Top Floating Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/95 via-black/70 to-transparent flex items-center justify-between z-20 pointer-events-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black text-xs text-gray-200 hover:text-white font-bold border border-gray-700/60 transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-theme-gold" /> Back to Movie Details
          </button>
          
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-black">
              <Shield className="w-3.5 h-3.5" /> Anti-Record DRM Active
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-400 text-xs font-black">
              <Cloud className="w-3.5 h-3.5 text-blue-400" /> Google Drive 4K Cloud Stream
            </span>
          </div>
        </div>

        {/* Google Drive Iframe Player */}
        <iframe
          src={gDriveEmbedUrl}
          title={movie?.title || 'Google Drive Cloud Stream'}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // If YouTube Video URL, render responsive YouTube Embed Player
  if (ytEmbedUrl) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30 group select-none">
        {/* Anti-Screen Recording & Dynamic Forensic Watermark Shield */}
        <AntiScreenRecordShield isBlocked={isScreenCaptureBlocked} movieTitle={movie?.title} />

        {/* Top Floating Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between z-20 pointer-events-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black text-xs text-gray-200 hover:text-white font-bold border border-gray-700/60 transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-theme-gold" /> Back to Movie Details
          </button>
          
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-black">
              <Shield className="w-3.5 h-3.5" /> Anti-Record DRM Active
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-400 text-xs font-black">
              <Youtube className="w-3.5 h-3.5 fill-red-500" /> YouTube 4K Stream
            </span>
          </div>
        </div>

        {/* YouTube Iframe Player */}
        <iframe
          src={ytEmbedUrl}
          title={movie?.title || 'YouTube Stream'}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // If Vimeo Video URL, render Vimeo Embed Player
  if (vimeoEmbedUrl) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-cyan-500/30 group select-none">
        <AntiScreenRecordShield isBlocked={isScreenCaptureBlocked} movieTitle={movie?.title} />
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between z-20 pointer-events-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black text-xs text-gray-200 hover:text-white font-bold border border-gray-700/60 transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-theme-gold" /> Back to Movie Details
          </button>
        </div>
        <iframe
          src={vimeoEmbedUrl}
          title={movie?.title || 'Vimeo Stream'}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Native HTML5 Video Player for Direct MP4 / MKV / WebM / Local /uploads/ files
  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800 group select-none"
    >
      {/* Anti-Screen Recording & Dynamic Forensic Watermark Shield */}
      <AntiScreenRecordShield isBlocked={isScreenCaptureBlocked} movieTitle={movie?.title} />

      {/* Video Element with DRM protection */}
      <video
        ref={videoRef}
        src={activeVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        poster={movie?.banner || movie?.poster}
        controlsList="nodownload nofullscreen noplaybackrate"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Top Controls Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white font-semibold"
        >
          <ArrowLeft className="w-5 h-5 text-theme-gold" /> Back to Movie
        </button>
        <div className="text-sm font-bold text-white">
          {movie?.title} {currentEpisode ? `- E${currentEpisode.episodeNumber}: ${currentEpisode.title}` : ''}
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] border border-emerald-500/30">
            <Shield className="w-3 h-3" /> DRM SHIELD
          </span>
          <span className="px-2 py-0.5 rounded bg-theme-gold text-black font-extrabold text-[10px]">
            {quality} STREAM
          </span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 space-y-2">
        
        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-gray-700 accent-theme-gold rounded-lg cursor-pointer"
        />

        <div className="flex items-center justify-between">
          
          {/* Left Controls */}
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-theme-gold transition-colors">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white hover:text-theme-gold transition-colors">
                {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-gray-700 accent-theme-gold rounded-lg cursor-pointer hidden sm:block"
              />
            </div>

            <span className="text-xs text-gray-300 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            
            {/* Episode Drawer Trigger */}
            {episodes.length > 0 && (
              <button
                onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-300 hover:text-theme-gold"
              >
                <ListVideo className="w-4 h-4" /> Episodes ({episodes.length})
              </button>
            )}

            {/* Quality & Speed Settings */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-theme-gold transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              {showSettings && (
                <div className="absolute bottom-8 right-0 bg-theme-card border border-gray-700 rounded-xl p-3 shadow-xl w-40 space-y-3 z-30 text-xs text-gray-300">
                  <div>
                    <div className="font-bold text-white mb-1">Speed</div>
                    <div className="flex justify-between">
                      {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSpeedChange(s)}
                          className={`px-1 rounded ${playbackSpeed === s ? 'text-theme-gold font-bold' : 'hover:text-white'}`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-white mb-1">Quality</div>
                    <div className="space-y-1">
                      {['4K UHD', '1080p', '720p', '480p'].map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setQuality(q);
                            setShowSettings(false);
                          }}
                          className={`block w-full text-left py-0.5 ${quality === q ? 'text-theme-gold font-bold' : 'hover:text-white'}`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button onClick={toggleFullscreen} className="text-white hover:text-theme-gold transition-colors">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default CustomVideoPlayer;
