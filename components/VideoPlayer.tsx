
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Monitor, Globe, Info, AlertTriangle, List, Maximize2, Minimize2, Play, X } from 'lucide-react';
import { Episode } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayerProps {
  episodeId: string;
  currentEp: Episode;
  nextEp?: Episode;
  changeEpisode: (direction: 'prev' | 'next') => void;
  hasNextEp: boolean;
  hasPrevEp: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  episodeId,
  currentEp,
  nextEp,
  changeEpisode,
  hasNextEp,
  hasPrevEp,
}) => {
  const [category, setCategory] = useState<'sub' | 'dub'>('sub');
  const [server, setServer] = useState<'vidWish' | 'megaPlay'>('megaPlay');
  const [isWebFullscreen, setIsWebFullscreen] = useState(false);
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // FIX: Use `number` for timer IDs in browser environments instead of `NodeJS.Timeout`.
  const autoplayTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);

  // NOTE: Since the iframe doesn't expose video duration, we assume a standard episode length.
  const ASSUMED_DURATION_SECONDS = 23 * 60; // 23 minutes
  const COUNTDOWN_SECONDS = 5;

  // Load/Save autoplay setting from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('autoplay_enabled');
    setIsAutoplayEnabled(savedState === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('autoplay_enabled', String(isAutoplayEnabled));
  }, [isAutoplayEnabled]);
  
  const cancelAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setCountdown(null);
  }, []);

  // Effect to start the main autoplay timer
  useEffect(() => {
    cancelAutoplay(); // Reset on episode change or toggle change

    if (isAutoplayEnabled && hasNextEp) {
      autoplayTimerRef.current = setTimeout(() => {
        setCountdown(COUNTDOWN_SECONDS);
      }, (ASSUMED_DURATION_SECONDS - COUNTDOWN_SECONDS) * 1000);
    }
    
    return () => cancelAutoplay();
  }, [episodeId, isAutoplayEnabled, hasNextEp, cancelAutoplay]);

  // Effect to handle the countdown itself
  useEffect(() => {
    if (countdown !== null) {
      if (countdown <= 0) {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        changeEpisode('next');
      } else {
        countdownTimerRef.current = setInterval(() => {
          setCountdown(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
      }
    }
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [countdown, changeEpisode]);


  const extractNumericId = (id: string) => {
      if (!id) return '';
      if (id.includes('$episode$')) return id.split('$episode$')[1];
      const match = id.match(/-(\d+)$/);
      if (match) return match[1];
      if (/^\d+$/.test(id)) return id;
      return id;
  };

  const hianimeEpId = extractNumericId(episodeId);
  const domain = server === "vidWish" ? "vidwish.live" : "megaplay.buzz";
  const src = `https://${domain}/stream/s-2/${hianimeEpId}/${category}?autoplay=1`;

  const toggleWebFullscreen = () => {
    setIsWebFullscreen(!isWebFullscreen);
  };

  const containerClass = isWebFullscreen 
    ? "fixed inset-0 z-50 bg-black flex flex-col" 
    : "flex flex-col gap-0 w-full relative group";

  const playerClass = isWebFullscreen
    ? "flex-1 w-full bg-black relative"
    : "relative w-full aspect-video bg-black border border-dark-700 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden z-10";

  return (
    <div className={containerClass}>
      <div className={playerClass}>
        <iframe
          key={`${server}-${category}-${episodeId}`}
          src={src}
          className="w-full h-full"
          allowFullScreen
          scrolling="no"
          frameBorder="0"
          allow="autoplay; fullscreen"
          title="Anime Stream"
        ></iframe>
         <AnimatePresence>
          {countdown !== null && nextEp && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="absolute bottom-4 right-4 z-20 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-4 w-72 text-white shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex-shrink-0 bg-dark-800 rounded-sm flex items-center justify-center border border-dark-600">
                    <ChevronRight className="w-6 h-6 text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Up Next</span>
                  <p className="font-bold text-sm truncate" title={nextEp.title || `Episode ${nextEp.number}`}>
                    {nextEp.title || `Episode ${nextEp.number}`}
                  </p>
                  <p className="text-brand-400 font-mono text-lg font-black mt-1">
                    Playing in {countdown}...
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    cancelAutoplay();
                    changeEpisode('next');
                  }}
                  className="h-8 flex-1 bg-brand-400 hover:bg-white text-black font-bold text-xs uppercase tracking-widest rounded-sm transition-colors"
                >
                  Play Now
                </button>
                <button
                  onClick={cancelAutoplay}
                  className="h-8 w-8 flex-shrink-0 bg-dark-800 hover:bg-dark-700 text-zinc-300 rounded-sm transition-colors flex items-center justify-center"
                  title="Cancel Autoplay"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`bg-dark-900 border-x border-b border-dark-700 p-3 md:p-6 flex flex-col gap-4 md:gap-6 shadow-lg relative overflow-hidden ${isWebFullscreen ? 'flex-shrink-0 z-50' : ''}`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImgridIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjQ2LDE5NSw2NywwLjAzKSIiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz48L3N2Zz4=')] opacity-50 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
             <div className="flex flex-col gap-1.5 flex-1 md:flex-none min-w-[140px]">
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1"><Monitor className="w-3 h-3" /> Server</span>
                 <div className="flex bg-dark-950 p-1 rounded-sm border border-dark-700">
                    <button onClick={() => setServer("megaPlay")} className={`flex-1 px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase transition-all rounded-sm ${server === "megaPlay" ? 'bg-brand-400 text-black' : 'text-zinc-500 hover:text-white'}`}>Mega</button>
                    <button onClick={() => setServer("vidWish")} className={`flex-1 px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase transition-all rounded-sm ${server === "vidWish" ? 'bg-brand-400 text-black' : 'text-zinc-500 hover:text-white'}`}>VidWish</button>
                 </div>
             </div>
             <div className="flex flex-col gap-1.5 flex-1 md:flex-none">
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1"><Globe className="w-3 h-3" /> Audio</span>
                 <div className="flex bg-dark-950 p-1 rounded-sm border border-dark-700">
                    {["sub", "dub"].map((type) => (
                        <button key={type} onClick={() => setCategory(type as 'sub' | 'dub')} className={`flex-1 px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase transition-all rounded-sm ${category === type ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>{type}</button>
                    ))}
                 </div>
             </div>
             <div className="flex flex-col gap-1.5 flex-1 md:flex-none min-w-[100px]">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1"><Play className="w-3 h-3" /> Autoplay</span>
                <div className="flex bg-dark-950 p-1 rounded-sm border border-dark-700">
                    <button onClick={() => setIsAutoplayEnabled(true)} className={`flex-1 px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase transition-all rounded-sm ${isAutoplayEnabled ? 'bg-brand-400 text-black' : 'text-zinc-500 hover:text-white'}`}>On</button>
                    <button onClick={() => setIsAutoplayEnabled(false)} className={`flex-1 px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase transition-all rounded-sm ${!isAutoplayEnabled ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>Off</button>
                </div>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 border-t border-dark-700 pt-3 md:border-0 md:pt-0">
             <span className="md:hidden text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Navigation</span>
             <div className="flex gap-2">
                <button onClick={() => changeEpisode("prev")} disabled={!hasPrevEp} className="group px-3 py-2 bg-dark-800 border border-dark-600 text-zinc-400 hover:text-white hover:border-brand-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all -skew-x-12" title="Previous Episode"><ChevronLeft className="w-4 h-4 md:w-5 md:h-5 skew-x-12" /></button>
                <button onClick={toggleWebFullscreen} className="group px-3 py-2 bg-dark-800 border border-dark-600 text-zinc-400 hover:text-white hover:border-brand-400 transition-all -skew-x-12" title={isWebFullscreen ? "Exit Fullscreen" : "Web Fullscreen"}>{isWebFullscreen ? <Minimize2 className="w-4 h-4 md:w-5 md:h-5 skew-x-12" /> : <Maximize2 className="w-4 h-4 md:w-5 md:h-5 skew-x-12" />}</button>
                <button onClick={() => changeEpisode("next")} disabled={!hasNextEp} className="group px-3 py-2 bg-dark-800 border border-dark-600 text-zinc-400 hover:text-white hover:border-brand-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all -skew-x-12" title="Next Episode"><ChevronRight className="w-4 h-4 md:w-5 md:h-5 skew-x-12" /></button>
             </div>
          </div>
        </div>

        <div className="relative z-10 pt-3 md:pt-4 border-t border-dark-700 flex justify-between items-center text-[10px] md:text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-400"><Info className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-400" /><span className="hidden md:inline">PLAYING: </span><span className="text-white font-bold">EP {currentEp.number}</span></div>
            {currentEp.isFiller && (<span className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-wider bg-red-500/10 px-2 py-0.5 border border-red-500/20 rounded-sm"><AlertTriangle className="w-3 h-3" /> Filler</span>)}
        </div>
      </div>
    </div>
  );
};
