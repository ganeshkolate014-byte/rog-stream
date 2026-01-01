import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Monitor, Globe, Info, AlertTriangle, List, Maximize2, Minimize2 } from 'lucide-react';
import { Episode } from '../types';

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
  hasPrevEp,
}) => {
  const [category, setCategory] = useState<'sub' | 'dub'>('sub');
  const [server, setServer] = useState<'vidWish' | 'megaPlay'>('megaPlay');
  const [isWebFullscreen, setIsWebFullscreen] = useState(false);

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
  // Added autoplay=1 parameter
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
      </div>

      <div className={`bg-dark-900 border-x border-b border-dark-700 p-3 md:p-6 flex flex-col gap-4 md:gap-6 shadow-lg relative overflow-hidden ${isWebFullscreen ? 'flex-shrink-0 z-50' : ''}`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImgridIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjQ2LDE5NSw2NywwLjAzKSIiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz48L3N2Zz4=')] opacity-50 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Controls Group - Mobile Optimized */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
             
             {/* Server Select */}
             <div className="flex flex-col gap-1.5 flex-1 md:flex-none min-w-[140px]">
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Monitor className="w-3 h-3" /> Server
                 </span>
                 <div className="flex bg-dark-950 p-1 rounded-sm border border-dark-700">
                    <button
                        onClick={() => setServer("megaPlay")}
                        className={`flex-1 px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase transition-all rounded-sm ${
                            server === "megaPlay"
                            ? 'bg-brand-400 text-black'
                            : 'text-zinc-500 hover:text-white'
                        }`}
                    >
                        Mega
                    </button>
                    <button
                        onClick={() => setServer("vidWish")}
                        className={`flex-1 px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase transition-all rounded-sm ${
                            server === "vidWish"
                            ? 'bg-brand-400 text-black'
                            : 'text-zinc-500 hover:text-white'
                        }`}
                    >
                        VidWish
                    </button>
                 </div>
             </div>

             {/* Audio Select */}
             <div className="flex flex-col gap-1.5 flex-1 md:flex-none">
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Audio
                 </span>
                 <div className="flex bg-dark-950 p-1 rounded-sm border border-dark-700">
                    {["sub", "dub"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setCategory(type as 'sub' | 'dub')}
                            className={`flex-1 px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase transition-all rounded-sm ${
                                category === type
                                ? 'bg-white text-black'
                                : 'text-zinc-500 hover:text-white'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                 </div>
             </div>

          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between md:justify-end gap-2 border-t border-dark-700 pt-3 md:border-0 md:pt-0">
             <span className="md:hidden text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                 Navigation
             </span>
             <div className="flex gap-2">
                <button
                    onClick={() => changeEpisode("prev")}
                    disabled={!hasPrevEp}
                    className="group px-3 py-2 bg-dark-800 border border-dark-600 text-zinc-400 hover:text-white hover:border-brand-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all -skew-x-12"
                    title="Previous Episode"
                >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 skew-x-12" />
                </button>
                
                <button
                    onClick={toggleWebFullscreen}
                    className="group px-3 py-2 bg-dark-800 border border-dark-600 text-zinc-400 hover:text-white hover:border-brand-400 transition-all -skew-x-12"
                    title={isWebFullscreen ? "Exit Fullscreen" : "Web Fullscreen"}
                >
                    {isWebFullscreen ? (
                         <Minimize2 className="w-4 h-4 md:w-5 md:h-5 skew-x-12" />
                    ) : (
                         <Maximize2 className="w-4 h-4 md:w-5 md:h-5 skew-x-12" />
                    )}
                </button>

                <button
                    onClick={() => changeEpisode("next")}
                    disabled={!hasNextEp}
                    className="group px-3 py-2 bg-dark-800 border border-dark-600 text-zinc-400 hover:text-white hover:border-brand-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all -skew-x-12"
                    title="Next Episode"
                >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 skew-x-12" />
                </button>
             </div>
          </div>

        </div>

        <div className="relative z-10 pt-3 md:pt-4 border-t border-dark-700 flex justify-between items-center text-[10px] md:text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-400">
                <Info className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-400" />
                <span className="hidden md:inline">PLAYING: </span>
                <span className="text-white font-bold">EP {currentEp.number}</span> 
            </div>
            {currentEp.isFiller && (
                <span className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-wider bg-red-500/10 px-2 py-0.5 border border-red-500/20 rounded-sm">
                    <AlertTriangle className="w-3 h-3" /> Filler
                </span>
            )}
        </div>

      </div>
    </div>
  );
};