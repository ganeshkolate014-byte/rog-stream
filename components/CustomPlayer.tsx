import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Loader2, SkipForward, SkipBack } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const CustomPlayer: React.FC<CustomPlayerProps> = ({
  src,
  poster,
  autoPlay = false,
  onEnded,
  onNext,
  onPrev,
  hasNext,
  hasPrev
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) video.play().catch(() => {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      if (autoPlay) video.play().catch(() => {});
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src, autoPlay]);

  // Handle Controls Visibility
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (isPlaying) setShowControls(false);
  };

  // Video Event Handlers
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black group overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={onEnded}
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none z-20">
          <Loader2 className="w-12 h-12 text-brand-400 animate-spin" />
        </div>
      )}

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 z-30 flex flex-col justify-end p-4 md:p-6"
          >
             {/* Center Play Button (only when paused) */}
             {!isPlaying && !isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <button
                        onClick={togglePlay}
                        className="pointer-events-auto bg-brand-400/90 hover:bg-brand-400 text-black p-4 rounded-full transform transition-all hover:scale-110 shadow-[0_0_30px_rgba(255,0,51,0.4)]"
                    >
                        <Play className="w-8 h-8 fill-black" />
                    </button>
                </div>
             )}

            {/* Bottom Controls Bar */}
            <div className="space-y-3">
              {/* Progress Bar */}
              <div className="relative group/progress h-1 hover:h-2 transition-all cursor-pointer">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  aria-label="Seek time"
                />
                {/* Background Track */}
                <div className="absolute inset-0 bg-white/20 rounded-full" />
                {/* Buffered (Placeholder - can be implemented with video.buffered) */}

                {/* Active Progress */}
                <div
                    className="absolute top-0 left-0 h-full bg-brand-400 rounded-full relative"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-brand-400 rounded-full opacity-0 group-hover/progress:opacity-100 shadow-[0_0_10px_#ff0033] transform scale-0 group-hover/progress:scale-100 transition-all" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Left Side: Play/Volume/Time */}
                <div className="flex items-center gap-4">
                  <button onClick={togglePlay} className="text-white hover:text-brand-400 transition-colors">
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>

                  {/* Skip Buttons */}
                  <div className="flex items-center gap-1">
                      <button onClick={onPrev} disabled={!hasPrev} className="text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                          <SkipBack className="w-5 h-5" />
                      </button>
                      <button onClick={onNext} disabled={!hasNext} className="text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                          <SkipForward className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="flex items-center gap-2 group/volume">
                    <button onClick={toggleMute} className="text-white hover:text-brand-400 transition-colors">
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-brand-400 [&::-webkit-slider-thumb]:rounded-full"
                        aria-label="Volume"
                      />
                    </div>
                  </div>

                  <div className="text-xs font-mono font-bold text-white tracking-wider">
                    {formatTime(currentTime)} <span className="text-zinc-500">/</span> {formatTime(duration)}
                  </div>
                </div>

                {/* Right Side: Settings/Fullscreen */}
                <div className="flex items-center gap-4">
                  <button className="text-white hover:text-brand-400 transition-colors">
                    <Settings className="w-5 h-5 hover:rotate-90 transition-transform duration-500" />
                  </button>
                  <button onClick={toggleFullscreen} className="text-white hover:text-brand-400 transition-colors">
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
