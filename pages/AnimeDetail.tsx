import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi, constructUrl } from '../services/api';
import { AnimeDetail as AnimeDetailType } from '../types';
import { Play, Calendar, Clock, Layers, AlertCircle, ChevronDown, ChevronUp, Zap, Server, Monitor, Globe } from 'lucide-react';
import { DetailSkeleton } from '../components/Skeletons';
import { AnimeCard } from '../components/AnimeCard';

export const AnimeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showFullDesc, setShowFullDesc] = useState(false);
  
  // New backend provides everything in one call
  const { data: anime, isLoading, isError } = useApi<AnimeDetailType>(
      constructUrl('details', { id })
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowFullDesc(false);
  }, [id]);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !anime) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 text-white gap-4">
           <AlertCircle className="w-16 h-16 text-brand-400" />
           <p className="text-zinc-500 font-mono">DATA NOT FOUND</p>
           <Link to="/" className="text-sm font-bold text-brand-400 hover:underline uppercase tracking-wider">Return to Base</Link>
        </div>
     );
  }

  // Handle data fields from the new JSON structure
  const heroImage = anime.banner || anime.image;
  const episodes = anime.episodes || [];
  
  return (
    <div className="min-h-screen bg-dark-900 text-white pb-32">
      
      {/* Header Section */}
      <div className="relative w-full md:h-[600px] bg-black overflow-hidden group border-b border-brand-400/20">
        <div className="absolute inset-0">
             <img 
                src={heroImage} 
                className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-1000 blur-sm group-hover:blur-0 scale-105" 
                alt="Banner" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/80 to-transparent" />
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImgridIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDAsNTEsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz48L3N2Zz4=')] opacity-20" />
        </div>

        <div className="relative h-full max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col justify-end pb-16 pt-32">
            <div className="flex flex-wrap gap-2 mb-6">
                 {anime.status && <span className={`px-2 py-1 ${anime.status === 'Completed' ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'bg-brand-400/20 text-brand-400 border-brand-400/30'} border text-[10px] font-black uppercase tracking-widest skew-x-[-12deg]`}><span className="skew-x-[12deg]">{anime.status}</span></span>}
                 <span className="px-2 py-1 bg-dark-800 border border-dark-600 text-zinc-400 text-[10px] font-bold uppercase skew-x-[-12deg]"><span className="skew-x-[12deg]">{anime.type || 'TV'}</span></span>
                 {anime.season && <span className="px-2 py-1 bg-dark-800 border border-dark-600 text-zinc-400 text-[10px] font-bold uppercase skew-x-[-12deg]"><span className="skew-x-[12deg]">{anime.season}</span></span>}
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-none mb-4 max-w-5xl tracking-tighter text-white drop-shadow-2xl uppercase italic">
                {anime.title}
            </h1>
            
            {anime.japaneseTitle && (
                <h2 className="text-zinc-500 font-display text-2xl uppercase tracking-wider mb-8 opacity-80">{anime.japaneseTitle}</h2>
            )}

            <div className="flex flex-wrap items-center gap-8 text-sm font-bold text-zinc-400 border-t border-white/10 pt-6">
                <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-brand-400" />
                    <span className="font-mono uppercase tracking-wider">{anime.type || 'Show'}</span>
                </div>
                {anime.totalEpisodes && (
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-brand-400" />
                        <span className="font-mono uppercase tracking-wider">{anime.totalEpisodes} Eps</span>
                    </div>
                )}
                 <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-brand-400" />
                    <span className="font-mono uppercase tracking-wider">
                        {anime.subOrDub ? anime.subOrDub.toUpperCase() : (anime.hasSub ? 'SUB' : '') + (anime.hasDub ? ' / DUB' : '')}
                    </span>
                </div>
            </div>
            
            <div className="mt-8 md:hidden">
                 {episodes.length > 0 ? (
                    <Link to={`/watch/${encodeURIComponent(episodes[0].id)}`} className="flex items-center justify-center gap-2 w-full py-4 bg-brand-400 text-black font-black uppercase tracking-wider skew-x-[-12deg]">
                        <Play className="w-5 h-5 fill-black skew-x-[12deg]" /> <span className="skew-x-[12deg]">Initialise Playback</span>
                    </Link>
                 ) : (
                    <div className="w-full py-4 bg-dark-800 text-zinc-500 font-bold text-center border border-dashed border-dark-600">PENDING RELEASE</div>
                 )}
            </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Main Info */}
        <div className="lg:col-span-8 space-y-12">
            
            <section>
                <h2 className="text-brand-400 font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Intel / Synopsis
                </h2>
                <div className="relative bg-dark-800/30 p-6 border border-dark-700">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-400"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-400"></div>
                    
                    <p className={`text-zinc-300 leading-relaxed text-lg font-medium font-sans whitespace-pre-line ${!showFullDesc && 'line-clamp-4'}`}>
                        {anime.description}
                    </p>
                    {anime.description?.length > 300 && (
                        <button 
                            onClick={() => setShowFullDesc(!showFullDesc)}
                            className="text-brand-400 font-bold text-xs mt-4 flex items-center gap-1 hover:text-white transition-colors uppercase tracking-widest"
                        >
                            {showFullDesc ? <>Collapse <ChevronUp className="w-3 h-3"/></> : <>Expand Data <ChevronDown className="w-3 h-3"/></>}
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mt-6">
                    {anime.genres?.map((g: string) => (
                        <Link key={g} to={`/animes/${g.toLowerCase()}`} className="px-4 py-2 border border-dark-600 bg-dark-900 text-xs font-bold uppercase tracking-wider hover:bg-brand-400 hover:text-black hover:border-brand-400 transition-all text-zinc-500 skew-x-[-12deg]">
                            <span className="skew-x-[12deg]">{g}</span>
                        </Link>
                    ))}
                </div>
            </section>

            <section>
                <div className="flex items-center justify-between mb-8 border-l-4 border-brand-400 pl-4 bg-gradient-to-r from-brand-400/10 to-transparent py-2">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Episode <span className="text-zinc-600">Index</span></h2>
                    <span className="text-brand-400 font-mono text-xs font-bold bg-black px-3 py-1 border border-brand-400/50">{episodes.length} FILES</span>
                </div>

                {episodes.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-brand-400 scrollbar-track-dark-800">
                        {episodes.map((ep) => (
                            <Link 
                                key={ep.id}
                                to={`/watch/${encodeURIComponent(ep.id)}`}
                                className={`group bg-dark-800 p-4 hover:bg-brand-400 hover:text-black transition-all flex flex-col justify-between h-24 relative overflow-hidden border ${ep.isFiller ? 'border-red-500/30' : 'border-dark-700'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-black text-zinc-500 group-hover:text-black/60 uppercase tracking-widest mb-1">EP // {String(ep.number).padStart(2, '0')}</span>
                                    {ep.isFiller && <span className="text-[8px] bg-red-500 text-white px-1 font-bold">FILLER</span>}
                                </div>
                                <span className="text-xs font-bold text-white group-hover:text-black line-clamp-2">{ep.title || 'Episode ' + ep.number}</span>
                                <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play className="w-8 h-8 fill-black text-black -mb-2 -mr-2 opacity-20" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 bg-dark-800/50 text-center border border-dashed border-dark-600">
                        <p className="text-zinc-500 font-mono text-sm">NO EPISODE DATA AVAILABLE</p>
                    </div>
                )}
            </section>
            
            {/* Related / Recommendations */}
            {(anime.relatedAnime?.length > 0 || anime.recommendations?.length > 0) && (
                <section>
                     <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8 border-l-4 border-zinc-600 pl-4">
                        Related <span className="text-brand-400">Database</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {/* Combine and slice to show a reasonable amount */}
                        {[...(anime.relatedAnime || []), ...(anime.recommendations || [])].slice(0, 8).map(rel => (
                            <AnimeCard key={rel.id} anime={rel} />
                        ))}
                    </div>
                </section>
            )}

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
             <div className="hidden lg:block sticky top-24">
                 <div className="relative group border border-dark-700 p-1 bg-dark-800">
                     <img src={anime.image} alt="" className="w-full grayscale group-hover:grayscale-0 transition-all duration-500 object-cover aspect-[2/3]" />
                     <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImgridIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDAsNTEsMC4xKSIiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz48L3N2Zz4=')] opacity-50 pointer-events-none" />
                 </div>
                 
                 {episodes.length > 0 ? (
                    <Link to={`/watch/${encodeURIComponent(episodes[0].id)}`} className="flex items-center justify-center gap-3 w-full py-5 bg-brand-400 text-black font-black uppercase text-lg hover:bg-white transition-colors mt-4 -skew-x-12 shadow-[0_0_20px_rgba(255,0,51,0.3)]">
                        <Play className="w-6 h-6 fill-black skew-x-12" /> <span className="skew-x-12">Initialise</span>
                    </Link>
                 ) : (
                    <button disabled className="w-full py-5 bg-dark-800 text-zinc-500 font-bold uppercase mt-4 cursor-not-allowed border border-dark-600">
                        OFFLINE
                    </button>
                 )}

                 <div className="bg-dark-800 p-6 mt-8 border border-dark-700 relative">
                     <h3 className="font-black text-white mb-6 text-sm uppercase tracking-widest border-b border-dark-600 pb-2 flex items-center gap-2">
                        <Server className="w-4 h-4 text-brand-400" />
                        Technical Specs
                     </h3>
                     <div className="space-y-4">
                        {[
                            { label: 'Japanese', value: anime.japaneseTitle, truncate: true },
                            { label: 'Season', value: anime.season },
                            { label: 'Aired', value: anime.season }, // Using season as proxy if aired not available
                            { label: 'MAL ID', value: anime.malID }
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-sm group">
                                <span className="text-zinc-500 font-mono uppercase text-xs group-hover:text-brand-400 transition-colors">{item.label}</span>
                                <span className={`font-bold text-zinc-300 ${item.truncate ? 'truncate max-w-[150px]' : ''}`}>{item.value || 'N/A'}</span>
                            </div>
                        ))}
                     </div>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};