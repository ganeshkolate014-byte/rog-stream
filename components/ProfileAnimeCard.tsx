import React from 'react';
import { Link } from 'react-router-dom';
import { UserProgress } from '../services/firebase';
import { Play, CheckCircle } from 'lucide-react';

interface ProfileAnimeCardProps {
  progress: UserProgress;
}

export const ProfileAnimeCard: React.FC<ProfileAnimeCardProps> = ({ progress }) => {
  const isCompleted = progress.status === 'Completed';
  
  const progressPercentage = (progress.currentEpisode / progress.totalEpisodes) * 100;
  
  // Link to the next episode if watching, otherwise to the main anime page
  const link = !isCompleted && progress.nextEpisodeId 
    ? `/watch/${encodeURIComponent(progress.nextEpisodeId)}` 
    : `/anime/${progress.animeId}`;

  return (
    <div className="group/card relative">
      <Link to={link} className="block relative">
        <div className="relative aspect-[2/3] overflow-hidden bg-dark-800 mb-2 transition-all duration-300 rounded-sm group-hover/card:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <img
            src={progress.poster} 
            alt={progress.title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover/card:scale-105 ${isCompleted ? 'grayscale group-hover/card:grayscale-0' : ''}`}
            loading="lazy"
          />
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
             <div className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-400/90 shadow-lg transform scale-50 group-hover/card:scale-100 transition-all duration-300">
                {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-black fill-black" />
                ) : (
                    <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                )}
             </div>
          </div>
          
          {/* Progress Bar */}
          {!isCompleted && progress.totalEpisodes > 0 && (
             <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10" title={`${progressPercentage.toFixed(0)}% watched`}>
               <div className="h-full bg-brand-400 transition-all" style={{ width: `${progressPercentage}%` }}></div>
             </div>
          )}
        </div>
      </Link>

      {/* Text Content */}
      <div>
        <h3 className="text-sm font-bold text-zinc-200 group-hover/card:text-brand-400 transition-colors line-clamp-1 leading-tight" title={progress.title}>
          {progress.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
           <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-zinc-500">
              {isCompleted ? (
                 <span className="text-green-500 font-bold">COMPLETED</span>
              ) : (
                 <span>EP {progress.currentEpisode} / {progress.totalEpisodes || '?'}</span>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
