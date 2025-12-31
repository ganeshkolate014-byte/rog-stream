import React from 'react';
import { Link } from 'react-router-dom';
import { Anime } from '../types';
import { Play, MoreVertical } from 'lucide-react';

interface AnimeCardProps {
  anime: Anime;
  rank?: number;
  variant?: 'portrait' | 'landscape';
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, rank, variant = 'portrait' }) => {
  if (!anime) return null;

  const isDub = anime.episodes?.dub && anime.episodes.dub > 0;
  const isSub = anime.episodes?.sub && anime.episodes.sub > 0;
  const subDubText = isSub && isDub ? 'Sub | Dub' : isSub ? 'Sub' : 'Dub';
  
  const progress = Math.floor(Math.random() * 80) + 10;
  const timeLeft = `${15 + Math.floor(Math.random() * 10)}m left`;

  if (variant === 'landscape') {
    return (
      <div className="w-[280px] md:w-[320px] flex-shrink-0 group/card relative">
        <Link to={`/watch/${encodeURIComponent(anime.id)}`} className="block">
          {/* Thumbnail Container */}
          <div className="relative aspect-video bg-dark-800 overflow-hidden rounded-sm border border-white/5 group-hover/card:border-brand-400/50 transition-all">
            <img
              src={anime.banner || anime.image || anime.poster}
              alt={anime.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
              loading="lazy"
            />
            
            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            
            {/* Play Overlay - Scoped to group/card */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/card:opacity-100 group-hover/card:bg-black/40 transition-all duration-300">
               <div className="w-10 h-10 rounded-full bg-black/80 border border-white/20 flex items-center justify-center scale-75 group-hover/card:scale-110 group-hover/card:bg-brand-400 group-hover/card:border-brand-400 transition-all duration-300">
                  <Play className="w-4 h-4 fill-white text-white group-hover/card:fill-black group-hover/card:text-black ml-0.5" />
               </div>
            </div>

            {/* Overlaid Text */}
            <div className="absolute bottom-3 left-3 right-20">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5 line-clamp-1">
                  {anime.title}
              </h4>
              <h3 className="text-sm font-bold text-white group-hover/card:text-brand-400 transition-colors line-clamp-1 leading-tight">
                  Episode {anime.episodes?.sub || anime.episodes?.eps || '1'}
              </h3>
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-[10px] font-bold text-zinc-300 rounded-[2px] uppercase tracking-wider">
               {timeLeft}
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
               <div className="h-full bg-brand-400" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Portrait Mode (Default)
  return (
    <div className="w-[160px] md:w-[200px] flex-shrink-0 group/card relative">
      <Link to={`/anime/${anime.id}`} className="block relative">
        {/* Card Container */}
        <div className="relative aspect-[2/3] overflow-hidden bg-dark-800 mb-3 transition-all duration-300 rounded-sm group-hover/card:shadow-[0_0_20px_rgba(246,195,67,0.1)]">
          
          <img
            src={anime.poster || anime.image} 
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            loading="lazy"
          />
          
          {/* Dark Gradient Overlay for Rank visibility */}
          {rank && <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/60 to-transparent" />}

          {/* Rank Badge */}
          {rank && (
             <div className="absolute top-0 left-0 bg-brand-400 text-black w-8 h-8 flex items-center justify-center text-lg font-black clip-path-polygon z-10">
               {rank}
             </div>
          )}
          
          {/* Hover Overlay (Minimal) - Scoped to group/card */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
             <div className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-400/90 shadow-lg transform scale-50 group-hover/card:scale-100 transition-all duration-300">
                <Play className="w-5 h-5 text-black fill-black ml-0.5" />
             </div>
          </div>
        </div>

        {/* Text Content */}
        <div>
          <h3 className="text-sm md:text-base font-bold text-zinc-200 group-hover/card:text-brand-400 transition-colors line-clamp-1 leading-tight" title={anime.title}>
            {anime.title}
          </h3>
          <div className="flex items-center justify-between mt-1">
             <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
                <span>{anime.type || 'Series'}</span>
                <span className="w-0.5 h-0.5 bg-zinc-600 rounded-full"></span>
                <span>{subDubText}</span>
             </div>
             <button className="text-zinc-600 hover:text-white transition-colors">
                <MoreVertical className="w-4 h-4" />
             </button>
          </div>
        </div>
      </Link>
    </div>
  );
};