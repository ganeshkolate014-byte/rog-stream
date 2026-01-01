import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Monitor, AlertTriangle, Maximize2, Minimize2, Settings, Loader2 } from 'lucide-react';
import Hls from 'hls.js';
import { Episode, StreamData } from '../types';
import { useApi, constructUrl } from '../services/api';

interface VideoPlayerProps {
  episodeId: string;
  currentEp: Episode;
  changeEpisode: (direction: 'prev' | 'next') => void;
  hasNextEp: boolean;
  hasPrevEp: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  episodeId, 
  currentEp, 
  changeEpisode, 
  hasNextEp, 
  hasPrevEp 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Fetch Stream Data
  const { data: streamData, isLoading, error } = useApi<StreamData>(
    constructUrl('stream', { id: episodeId })
  );

  const source = streamData?.sources?.[0];

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Setup HLS / Video Player
  useEffect(() => {
    let hls: Hls;

    if (source && videoRef.current && source.isM3U8) {
      if (Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
        });
        hls.loadSource(source.url);
        hls.attachMedia(videoRef.current);
        
        // Auto Play when manifest is parsed
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const playPromise = videoRef.current?.play();
          if (playPromise !== undefined) {
             playPromise.catch(() => {
                 console.log('Autoplay prevented by browser policy.');
             });
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
             if (data.fatal) {
                 console.error("HLS Fatal Error", data);
             }
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS (Safari)
        videoRef.current.src = source.url;
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current?.play().catch(() => {});
        });
      }
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [source, episodeId]);


  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-black rounded-sm flex flex-col items-center justify-center border border-dark-700 shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-tr from-brand-400/5 to-transparent animate-pulse" />
         <Loader2 className="w-10 h-10 text-brand-400 animate-spin mb-4 relative z-10" />
         <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest relative z-10">Initializing Stream...</p>
      </div>
    );
  }

  if (error || !source) {
    return (
       <div className="w-full aspect-video bg-dark-950 rounded-sm flex flex-col items-center justify-center border border-dark-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/l1J9EdzfOSgfyueLm/giphy.gif')] bg-cover opacity-5 grayscale" />
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4 z-10" />
          <h3 className="text-white font-bold uppercase tracking-widest z-10">Stream Offline</h3>
          <p className="text-zinc-500 text-xs mt-2 font-mono z-10">Server response timed out.</p>
       </div>
    );
  }

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-sm overflow-hidden group border border-dark-700 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {source.isM3U8 ? (
             <video
                ref={videoRef}
                className="w-full h-full object-contain focus:outline-none"
                controls
                autoPlay
                playsInline
                poster={currentEp?.image} // Fallback if available
             />
        ) : (
            // Iframe Fallback with Autoplay
            <iframe 
                src={`${source.url}${source.url.includes('?') ? '&' : '?'}autoplay=1&autoPlay=1`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        )}

        {/* Custom Overlay Controls (Only visible for Custom Video Player if needed, hidden for native controls) */}
        {/* We rely on native controls for reliability across devices for now, but added fullscreen toggle logic above if we implement custom UI later */}
      </div>

      {/* Player Controls Bar */}
      <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 rounded-sm border border-dark-700">
                <Monitor className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Server: HD-1</span>
             </div>
             <button className="p-1.5 hover:bg-dark-800 rounded-sm text-zinc-500 hover:text-white transition-colors">
                 <Settings className="w-4 h-4" />
             </button>
          </div>

          <div className="flex items-center gap-2">
             <button 
                onClick={() => changeEpisode('prev')}
                disabled={!hasPrevEp}
                className="flex items-center gap-1 px-3 py-1.5 bg-dark-800 hover:bg-brand-400 hover:text-black disabled:opacity-50 disabled:hover:bg-dark-800 disabled:hover:text-zinc-500 text-white rounded-sm transition-all text-xs font-bold uppercase tracking-wider disabled:cursor-not-allowed"
             >
                <ChevronLeft className="w-3 h-3" /> Prev
             </button>
             <button 
                onClick={() => changeEpisode('next')}
                disabled={!hasNextEp}
                className="flex items-center gap-1 px-3 py-1.5 bg-dark-800 hover:bg-brand-400 hover:text-black disabled:opacity-50 disabled:hover:bg-dark-800 disabled:hover:text-zinc-500 text-white rounded-sm transition-all text-xs font-bold uppercase tracking-wider disabled:cursor-not-allowed"
             >
                Next <ChevronRight className="w-3 h-3" />
             </button>
          </div>
      </div>
    </div>
  );
};