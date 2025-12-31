import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Monitor, Globe, Info, AlertTriangle } from 'lucide-react';
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

  // The URL requires the specific hianime episode ID (e.g. "anime-slug$episode$id")
  // We use the episodeId directly as it comes from the API's episode list
  const hianimeEpId = episodeId;
  
  const domain = server === "vidWish" ? "vidwish.live" : "megaplay.buzz";
  // Format: https://megaplay.buzz/stream/s-2/{hianime-ep-id}/{language}
  const src = `https://${domain}/stream/s-2/${hianimeEpId}/${category}`;

  return (
    <div className="flex flex-col gap-0 w-full">
      {/* Main Player Area with ROG Borders */}
      <div className="relative w-full aspect-video bg-black border border-dark-700 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden group z-10">
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-400 z-20 opacity-50 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-400 z-20 opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-400 z-20 opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-400 z-20 opacity-50 pointer-events-none"></div>

        <iframe
          key={`${server}-${category}-${episodeId}`}
          src={src}
          className="w-full h-full"
          allowFullScreen
          scrolling="no"
          frameBorder="0"
          title="Anime Stream"
        ></iframe>
      </div>

      {/* Control Deck */}
      <div className="bg-dark-900 border-x border-b border-dark-700 p-4 md:p-6 flex flex-col gap-6 shadow-lg relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImgridIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjQ2LDE5NSw2NywwLjAzKSIiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz48L3N2Zz4=')] opacity-50 pointer-events-none" />

        <div className="relative z-10 flex flex-wrap flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Server Select */}
          <div className="flex flex-col gap-2 items-center md:items-start w-full md:w-auto">
             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Monitor className="w-3 h-3" /> Server
             </span>
             <div className="flex gap-2">
                <button
                    onClick={() => setServer("megaPlay")}
                    className={`px-4 py-2 text-xs font-bold uppercase transition-all -skew-x-12 border min-w-[100px] ${
                        server === "megaPlay"
                        ? 'bg-brand-400 text-black border-brand-400 shadow-[0_0_15px_rgba(246,195,67,0.4)]'
                        : 'bg-dark-800 text-zinc-500 border-dark-600 hover:text-white hover:border-zinc-500'
                    }`}
                >
                    <span className="skew-x-12 block">MegaPlay</span>
                </button>
                <button
                    onClick={() => setServer("vidWish")}
                    className={`px-4 py-2 text-xs font-bold uppercase transition-all -skew-x-12 border min-w-[100px] ${
                        server === "vidWish"
                        ? 'bg-brand-400 text-black border-brand-400 shadow-[0_0_15px_rgba(246,195,67,0.4)]'
                        : 'bg-dark-800 text-zinc-500 border-dark-600 hover:text-white hover:border-zinc-500'
                    }`}
                >
                    <span className="skew-x-12 block">VidWish</span>
                </button>
             </div>
          </div>

          {/* Audio Select */}
          <div className="flex flex-col gap-2 items-center md:items-start w-full md:w-auto">
             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-3 h-3" /> Audio
             </span>
             <div className="flex gap-2">
                {["sub", "dub"].map((type) => (
                    <button
                        key={type}
                        onClick={() => setCategory(type as 'sub' | 'dub')}
                        className={`px-4 py-2 text-xs font-bold uppercase transition-all -skew-x-12 border min-w-[80px] ${
                            category === type
                            ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                            : 'bg-dark-800 text-zinc-500 border-dark-600 hover:text-white hover:border-zinc-500'
                        }`}
                    >
                        <span className="skew-x-12 block">{type}</span>
                    </button>
                ))}
             </div>
          </div>

          {/* Episode Nav */}
          <div className="flex flex-col gap-2 items-center md:items-end w-full md:w-auto">
             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                 Navigate
             </span>
             <div className="flex gap-2">
                <button
                    onClick={() => changeEpisode("prev")}
                    disabled={!hasPrevEp}
                    className="group px-4 py-2 bg-dark-800 border border-dark-600 text-zinc-400 hover:text-white hover:border-brand-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all -skew-x-12"
                >
                    <ChevronLeft className="w-5 h-5 skew-x-12" />
                </button>
                <button
                    onClick={() => changeEpisode("next")}
                    disabled={!hasNextEp}
                    className="group px-4 py-2 bg-dark-800 border border-dark-600 text-zinc-400 hover:text-white hover:border-brand-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all -skew-x-12"
                >
                    <ChevronRight className="w-5 h-5 skew-x-12" />
                </button>
             </div>
          </div>

        </div>

        {/* Info Footer */}
        <div className="relative z-10 pt-4 border-t border-dark-700 flex justify-between items-center text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-400">
                <Info className="w-4 h-4 text-brand-400" />
                <span>PLAYING: EPISODE <span className="text-white font-bold">{currentEp.number}</span></span>
            </div>
            {currentEp.isFiller && (
                <span className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-wider bg-red-500/10 px-2 py-0.5 border border-red-500/20">
                    <AlertTriangle className="w-3 h-3" /> Filler
                </span>
            )}
        </div>

      </div>
    </div>
  );
};