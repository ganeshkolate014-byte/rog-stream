import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApi, constructUrl } from '../services/api';
import { AnimeDetail, Episode, HistoryItem } from '../types';
import { Loader2, AlertCircle, ChevronLeft, Play } from 'lucide-react';
import { VideoPlayer } from '../components/VideoPlayer';
import { AnimeCard } from '../components/AnimeCard';

export const Watch: React.FC = () => {
  const { episodeId } = useParams<{ episodeId: string }>();
  const navigate = useNavigate();

  const deriveAnimeId = (epId: string) => {
    if (!epId) return '';
    // Handle monster-37$episode$1046 format from new JSON
    if (epId.includes('$episode$')) return epId.split('$episode$')[0];
    if (epId.includes('::')) return epId.split('::')[0];
    return epId.replace(/-episode-\d+$/, '');
  };

  const animeId = episodeId ? deriveAnimeId(episodeId) : '';

  // Fetch from Details endpoint because it contains the full episode list now
  const { data: animeData, isLoading, error } = useApi<AnimeDetail>(
      animeId ? constructUrl('details', { id: animeId }) : ''
  );

  // Save to History Effect
  useEffect(() => {
    if (animeData && episodeId) {
        const episodes = animeData.episodes || [];
        const currentEp = episodes.find(e => e.id === episodeId);
        
        if (currentEp) {
            const historyItem: HistoryItem = {
                animeId: animeId,
                episodeId: episodeId,
                title: animeData.title,
                episodeNumber: currentEp.number,
                image: animeData.banner || animeData.image || animeData.poster || '',
                timestamp: Date.now()
            };

            try {
                const existingHistoryStr = localStorage.getItem('watch_history');
                let history: HistoryItem[] = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
                
                // Remove existing entry for this anime to push new state to top
                history = history.filter(h => h.animeId !== animeId);
                
                // Add new entry to start
                history.unshift(historyItem);
                
                // Keep only last 20 items
                if (history.length > 20) history.pop();
                
                localStorage.setItem('watch_history', JSON.stringify(history));
            } catch (e) {
                console.error("Failed to save history");
            }
        }
    }
  }, [animeData, episodeId, animeId]);

  if (isLoading) {
    return (
        <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center text-brand-400 gap-4">
            <Loader2 className="w-16 h-16 animate-spin" />
            <span className="font-bold text-sm tracking-widest uppercase">Loading Stream...</span>
        </div>
    );
  }

  if (error || !animeData || !animeData.episodes) {
      return (
        <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center gap-6">
            <AlertCircle className="w-20 h-20 text-red-500 opacity-50" />
            <div className="text-center">
                <h1 className="text-2xl font-bold text-white uppercase tracking-widest mb-2">Error</h1>
                <p className="text-zinc-500 text-sm">Episode data not found.</p>
            </div>
            <button 
                onClick={() => navigate('/')} 
                className="px-6 py-3 bg-dark-800 border border-dark-600 hover:bg-white hover:text-black transition-all text-sm font-bold uppercase tracking-wider -skew-x-12"
            >
                <span className="skew-x-12">Go Back</span>
            </button>
        </div>
      );
  }

  const episodes = animeData.episodes || [];
  const currentEpIndex = episodes.findIndex(e => e.id === episodeId);
  const currentEp = episodes[currentEpIndex];
  
  const prevEp = episodes[currentEpIndex - 1];
  const nextEp = episodes[currentEpIndex + 1];

  const handleNavigate = (direction: 'prev' | 'next') => {
      if (direction === 'prev' && prevEp) {
          navigate(`/watch/${encodeURIComponent(prevEp.id)}`);
      } else if (direction === 'next' && nextEp) {
          navigate(`/watch/${encodeURIComponent(nextEp.id)}`);
      }
  };

  if (!currentEp) {
      return (
          <div className="min-h-screen bg-dark-950 flex items-center justify-center text-white flex-col gap-4">
              <p>Episode ID not found in current list.</p>
              <button onClick={() => navigate(`/anime/${animeId}`)} className="text-brand-400 hover:underline">Return to Details</button>
          </div>
      );
  }

  // Combine related and recommendations
  const recommendations = [...(animeData.relatedAnime || []), ...(animeData.recommendations || [])];

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-12 text-zinc-200">
      <div className="max-w-[1600px] mx-auto w-full px-4 md:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-dark-700 pb-4">
             <div>
                <button 
                    onClick={() => navigate(`/anime/${animeId}`)}
                    className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-widest hover:text-white mb-2"
                >
                    <ChevronLeft className="w-3 h-3" /> Back to Anime
                </button>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white uppercase italic">
                    {currentEp.title || `Episode ${currentEp.number}`}
                </h1>
                <p className="text-zinc-500 text-xs mt-1 font-mono">
                    {animeData.title}
                </p>
             </div>
             
             <div className="flex items-center gap-2">
                 <span className="text-green-500 text-[10px] font-bold uppercase border border-green-500/30 px-2 py-1 bg-green-500/10">ONLINE</span>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Main Content: Player (Col Span 9) */}
            <div className="lg:col-span-9 space-y-12">
                <VideoPlayer 
                    episodeId={episodeId || ''}
                    currentEp={currentEp}
                    changeEpisode={handleNavigate}
                    hasPrevEp={!!prevEp}
                    hasNextEp={!!nextEp}
                />

                {/* Recommended Section (Below Player) */}
                {recommendations.length > 0 && (
                    <div className="pt-8 border-t border-dark-700">
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 border-l-4 border-zinc-600 pl-4">
                            Recommended <span className="text-brand-400">Data</span>
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {recommendations.slice(0, 10).map(rel => (
                                <AnimeCard key={rel.id} anime={rel} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar: Episode List (Col Span 3) */}
            <div className="lg:col-span-3">
                 <div className="bg-dark-900 border border-dark-700 flex flex-col h-[600px] lg:sticky lg:top-24">
                     <div className="p-4 border-b border-dark-700 bg-dark-800">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex justify-between items-center">
                            Episodes
                            <span className="text-brand-400 text-xs bg-black px-2 py-0.5 border border-brand-400/30">{episodes.length}</span>
                        </h3>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-brand-400 scrollbar-track-dark-800 p-2 space-y-2">
                        {episodes.map((ep) => (
                            <Link 
                                key={ep.id}
                                to={`/watch/${encodeURIComponent(ep.id)}`}
                                className={`flex items-center gap-3 p-3 transition-all group ${
                                    ep.id === episodeId 
                                    ? 'bg-brand-400 text-black font-bold' 
                                    : 'bg-dark-800 text-zinc-400 hover:bg-dark-700 hover:text-white'
                                }`}
                            >
                                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-black/20 text-xs font-mono">
                                    {ep.number}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs truncate">{ep.title || `Episode ${ep.number}`}</p>
                                    {ep.isFiller && <span className="text-[9px] bg-red-500 text-white px-1 font-bold inline-block mt-1">FILLER</span>}
                                </div>
                                {ep.id === episodeId && <Play className="w-3 h-3 fill-black" />}
                            </Link>
                        ))}
                     </div>
                 </div>
            </div>

        </div>
      </div>
    </div>
  );
};