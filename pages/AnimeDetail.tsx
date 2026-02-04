import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApi, constructUrl } from '../services/api';
import { AnimeDetail as AnimeDetailType } from '../types';
import { 
  Play, 
  Share2, 
  Plus, 
  Check, 
  ChevronDown, 
  Star, 
  Download,
  Bookmark
} from 'lucide-react';
import { DetailSkeleton } from '../components/Skeletons';
import { AnimeCard } from '../components/AnimeCard';
import { useAuth } from '../context/AuthContext';
import { getUserProgress, UserProgress, addToWatchlist, removeUserProgress } from '../services/firebase';
import { motion, AnimatePresence } from 'framer-motion';

export const AnimeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Data States
  const { data: anime, isLoading, isError } = useApi<AnimeDetailType>(
      constructUrl('details', { id })
  );
  
  // Interaction States
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [activeTab, setActiveTab] = useState<'episodes' | 'related'>('episodes');
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [malData, setMalData] = useState<{ score: number | null; scored_by: number | null } | null>(null);

  // Fetch User Progress
  useEffect(() => {
    const fetchProgress = async () => {
        if (user && id) {
            try {
                const allProgress = await getUserProgress(user.uid);
                if (allProgress[id]) {
                    setUserProgress(allProgress[id]);
                } else {
                    setUserProgress(null);
                }
            } catch (e) {
                console.error("Failed to fetch user progress:", e);
            }
        } else {
          setUserProgress(null);
        }
    };
    fetchProgress();
  }, [id, user]);

  // Fetch External Ratings (MAL)
  useEffect(() => {
    if (!anime) return;

    const loadMalInfo = async () => {
        let effectiveMalId = anime.malID;
        if (!effectiveMalId) {
            try {
                const searchRes = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(anime.title)}&limit=1`);
                if (searchRes.ok) {
                    const searchData = await searchRes.json();
                    if (searchData.data && searchData.data.length > 0) {
                        effectiveMalId = searchData.data[0].mal_id;
                    }
                }
            } catch(e) {}
        }

        if (effectiveMalId) {
            try {
                const statsRes = await fetch(`https://api.jikan.moe/v4/anime/${effectiveMalId}`);
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setMalData({
                        score: statsData.data?.score,
                        scored_by: statsData.data?.scored_by
                    });
                }
            } catch (e) {}
        } else {
            setMalData(null);
        }
    };
    loadMalInfo();
  }, [anime]);
  
  // Actions
  const handleToggleList = async () => {
    if (!user) {
        navigate('/login');
        return;
    }
    if (!anime) return;
    
    setIsSaving(true);
    try {
        if (userProgress) {
            // Remove
            await removeUserProgress(user.uid, anime.id);
            setUserProgress(null);
        } else {
            // Add
            await addToWatchlist(user.uid, anime);
            setUserProgress({
                animeId: anime.id,
                title: anime.title,
                poster: anime.poster || anime.image,
                currentEpisode: 0,
                totalEpisodes: anime.totalEpisodes || anime.episodes?.length || 0,
                status: 'On Hold',
                lastUpdated: Date.now()
            });
        }
    } catch (e) {
        console.error("List toggle failed", e);
    } finally {
        setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
    } catch (e) {
        console.error("Copy failed", e);
    }
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Render Logic
  if (isLoading) return <DetailSkeleton />;
  if (isError || !anime) return <div className="min-h-screen bg-dark-950 flex items-center justify-center text-white">Anime Not Found</div>;

  const heroImage = anime.banner || anime.image;
  const episodes = anime.episodes || [];
  
  const currentEpNumber = userProgress?.currentEpisode || 0;
  let nextEp = episodes.find(e => e.number === currentEpNumber + 1);
  if (!nextEp && episodes.length > 0) nextEp = episodes[0]; // Fallback to Ep 1
  if (!nextEp && episodes.length > 0) nextEp = episodes[episodes.length - 1];

  const watchLink = nextEp ? `/watch/${encodeURIComponent(nextEp.id)}` : '#';
  const buttonText = currentEpNumber > 0 && nextEp?.number !== 1 ? `Continue E${nextEp?.number}` : `Start Watching E1`;

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden">
      
      {/* 
        1. Fixed Background Layer (The Poster) 
        - z-0 ensures it stays behind
        - h-[70vh] limits it so it doesn't cover entire page height behind content
      */}
      <div className="fixed top-0 left-0 w-full h-[80vh] z-0 pointer-events-none">
          {/* Base darkening */}
          <div className="absolute inset-0 bg-black" /> 
          
          <img 
            src={heroImage} 
            alt={anime.title} 
            className="w-full h-full object-cover opacity-80" 
          />
          
          {/* Enhanced Gradient Overlay for smoothness */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* 
        2. Main Scrollable Content Wrapper 
        - z-10 places it above the fixed background
        - min-h-screen ensures footer is pushed down
      */}
      <div className="relative z-10 flex flex-col min-h-screen w-full">
          
          {/* Spacer to reveal background */}
          <div className="h-[50vh] md:h-[60vh] w-full flex-shrink-0" />

          {/* 
            Content Body 
            - bg-black ensures no background bleed when scrolling past the image
            - negative margin helps blend the transition
          */}
          <div className="flex-1 bg-black w-full shadow-[0_-50px_100px_black]">
               
               <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center -mt-12 md:-mt-20 relative z-20 pb-12">
                   
                   {/* Title */}
                   <h1 className="text-3xl md:text-5xl lg:text-7xl font-black uppercase font-display tracking-tight leading-none mb-2 text-balance drop-shadow-2xl">
                      {anime.title}
                   </h1>
                   
                   {/* Subtitle / JP Title */}
                   {anime.japaneseTitle && (
                       <p className="text-zinc-300 text-xs md:text-sm font-medium mb-4 drop-shadow-md">{anime.japaneseTitle}</p>
                   )}

                   {/* Metadata Line */}
                   <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] md:text-xs font-bold text-zinc-300 mb-6 uppercase tracking-wider drop-shadow-md bg-black/40 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                       {/* Dub/Sub Badges */}
                       <div className="flex items-center gap-1">
                           {anime.hasDub && <span className="bg-white text-black px-1.5 py-0.5 rounded-[2px]">DUB</span>}
                           {anime.hasSub && <span className="bg-zinc-800 text-white border border-white/20 px-1.5 py-0.5 rounded-[2px] ml-0.5">SUB</span>}
                       </div>
                       <span className="opacity-30">|</span>
                       {/* Genres */}
                       <span className="text-zinc-400">
                           {anime.genres?.slice(0, 3).join(', ')}
                       </span>
                   </div>

                   {/* Rating & Stats */}
                   <div className="flex items-center gap-2 mb-8 bg-brand-400/10 px-4 py-2 rounded-full border border-brand-400/20 shadow-[0_0_20px_rgba(255,0,51,0.1)]">
                       <div className="flex text-brand-400">
                           <Star className="w-4 h-4 fill-current" />
                       </div>
                       <span className="text-sm font-black text-brand-400">
                           {malData?.score || anime.malScore || "4.8"}
                       </span>
                       <span className="text-xs text-brand-400/70 font-bold border-l border-brand-400/20 pl-2 ml-1">
                           {malData?.scored_by ? formatNumber(malData.scored_by) : "12k"} Votes
                       </span>
                   </div>

                   {/* Action Buttons Row */}
                   <div className="flex items-center gap-8 md:gap-16 mb-10 w-full justify-center">
                       <button 
                         onClick={handleToggleList}
                         className="flex flex-col items-center gap-3 group"
                       >
                           <div className={`p-4 rounded-full border-2 transition-all duration-300 shadow-xl ${userProgress ? 'bg-brand-400 border-brand-400 scale-110' : 'bg-zinc-900 border-zinc-700 group-hover:border-brand-400 group-hover:bg-zinc-800'}`}>
                             {userProgress ? (
                                 <Check className="w-6 h-6 text-black" />
                             ) : (
                                 <Plus className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
                             )}
                           </div>
                           <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${userProgress ? 'text-brand-400' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                               {userProgress ? 'Saved' : 'My List'}
                           </span>
                       </button>
                       
                       <button onClick={handleShare} className="flex flex-col items-center gap-3 group">
                           <div className="p-4 rounded-full bg-zinc-900 border-2 border-zinc-700 group-hover:border-white transition-all duration-300 shadow-xl">
                             <Share2 className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
                           </div>
                           <span className="text-[10px] md:text-xs font-bold text-zinc-500 group-hover:text-zinc-300 uppercase tracking-wider">Share</span>
                       </button>
                   </div>

                   {/* Description (Smooth Collapse) */}
                   <div className="w-full max-w-3xl mb-8 relative group">
                        <motion.div 
                            className="relative overflow-hidden"
                            initial={{ height: 80 }}
                            animate={{ height: showFullDesc ? "auto" : 80 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <p className="text-zinc-400 text-sm leading-relaxed text-center md:px-8">
                                {anime.description}
                            </p>
                        </motion.div>
                        
                        {/* Smooth Fade Overlay */}
                        <AnimatePresence>
                            {!showFullDesc && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none"
                                />
                            )}
                        </AnimatePresence>

                        <button 
                            onClick={() => setShowFullDesc(!showFullDesc)}
                            className="flex items-center gap-1.5 mx-auto text-[10px] font-bold text-zinc-500 hover:text-white uppercase mt-4 transition-colors relative z-10 px-4 py-1 rounded-full bg-zinc-900/50 border border-white/5 hover:bg-zinc-800"
                        >
                            {showFullDesc ? 'Show Less' : 'Show More'} 
                            <motion.div animate={{ rotate: showFullDesc ? 180 : 0 }}>
                                <ChevronDown className="w-3 h-3" />
                            </motion.div>
                        </button>
                   </div>
               </div>

               {/* Lists Container - Solid Background */}
               <div className="w-full bg-black min-h-[600px] relative z-20 pb-20">
                   
                   {/* Tabs */}
                   <div className="sticky top-14 md:top-20 z-40 bg-black/90 backdrop-blur-xl border-b border-white/5 mb-8 shadow-2xl">
                       <div className="flex items-center justify-center gap-8 md:gap-16 max-w-7xl mx-auto px-4">
                           <button 
                             onClick={() => setActiveTab('episodes')}
                             className={`py-4 md:py-5 text-xs md:text-sm font-black uppercase tracking-widest relative transition-all ${activeTab === 'episodes' ? 'text-brand-400 scale-105' : 'text-zinc-600 hover:text-zinc-300'}`}
                           >
                               Episodes
                               {activeTab === 'episodes' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-400 shadow-[0_0_10px_#ff0033]" />}
                           </button>
                           <button 
                             onClick={() => setActiveTab('related')}
                             className={`py-4 md:py-5 text-xs md:text-sm font-black uppercase tracking-widest relative transition-all ${activeTab === 'related' ? 'text-brand-400 scale-105' : 'text-zinc-600 hover:text-zinc-300'}`}
                           >
                               Related
                               {activeTab === 'related' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-400 shadow-[0_0_10px_#ff0033]" />}
                           </button>
                       </div>
                   </div>

                   {/* Tab Content */}
                   <div className="max-w-7xl mx-auto px-4">
                       {activeTab === 'episodes' ? (
                           <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                           >
                               {/* List Header */}
                               <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider px-2 mb-4">
                                   <span>{episodes.length} Episodes</span>
                                   <div className="flex items-center gap-2">
                                       <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
                                       <span className="text-zinc-400">Available Now</span>
                                   </div>
                               </div>

                               {/* List */}
                               <div className="flex flex-col gap-2 md:gap-3">
                                   {episodes.map(ep => {
                                       const isNext = nextEp?.id === ep.id;
                                       return (
                                           <Link 
                                             key={ep.id} 
                                             to={`/watch/${encodeURIComponent(ep.id)}`}
                                             className={`flex gap-4 p-2.5 md:p-3 rounded-lg transition-all duration-300 group relative overflow-hidden ${isNext ? 'bg-brand-400/10 border border-brand-400/30 shadow-[0_0_15px_rgba(255,0,51,0.1)]' : 'bg-zinc-900/30 border border-transparent hover:bg-zinc-900 hover:border-zinc-800'}`}
                                           >
                                               {isNext && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-400" />}
                                               
                                               {/* Thumbnail */}
                                               <div className="w-28 md:w-40 aspect-video bg-zinc-800 rounded overflow-hidden relative shadow-lg flex-shrink-0 group-hover:shadow-2xl transition-all">
                                                   <img src={anime.image} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500" alt="" />
                                                   <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                                                       <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isNext ? 'bg-brand-400 text-black scale-110 shadow-lg' : 'bg-black/60 text-white group-hover:bg-brand-400 group-hover:text-black group-hover:scale-110'}`}>
                                                            <Play className="w-3 h-3 fill-current ml-0.5" />
                                                       </div>
                                                   </div>
                                                   {ep.isFiller && <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500/90 backdrop-blur-sm text-[8px] font-black text-white rounded-sm uppercase tracking-wider shadow-sm">Filler</div>}
                                               </div>
                                               
                                               <div className="flex flex-col justify-center min-w-0 flex-1 py-1">
                                                   <div className="flex items-start justify-between gap-2">
                                                       <h4 className={`text-sm md:text-base font-bold line-clamp-1 transition-colors ${isNext ? 'text-brand-400' : 'text-zinc-300 group-hover:text-white'}`}>
                                                           {ep.number}. {ep.title || `Episode ${ep.number}`}
                                                       </h4>
                                                   </div>
                                                   <p className="text-[10px] md:text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed group-hover:text-zinc-400">
                                                       {(anime.description || "").slice(0, 100)}...
                                                   </p>
                                                   <div className="mt-auto pt-2 flex items-center gap-2">
                                                       <span className="text-[9px] font-mono text-zinc-500 bg-black/40 px-1.5 py-0.5 rounded border border-white/5 group-hover:border-white/10">24m</span>
                                                       {isNext && <span className="text-[9px] font-bold text-brand-400 uppercase tracking-wider ml-auto">Up Next</span>}
                                                   </div>
                                               </div>
                                           </Link>
                                       )
                                   })}
                               </div>
                           </motion.div>
                       ) : (
                           <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4"
                           >
                               {[...(anime.relatedAnime || []), ...(anime.recommendations || [])].map(rel => (
                                   <AnimeCard key={rel.id} anime={rel} layout="grid" />
                               ))}
                           </motion.div>
                       )}
                   </div>
               </div>
          </div>
      </div>

      {/* 
        3. Sticky Bottom Action Bar
        This remains fixed at the bottom regardless of scroll.
      */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 p-4 z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
              <Link 
                to={watchLink}
                className="flex-1 bg-brand-400 hover:bg-white hover:text-black text-black font-black uppercase tracking-widest h-12 flex items-center justify-center gap-3 clip-path-polygon transition-all shadow-[0_0_30px_rgba(255,0,51,0.25)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transform hover:scale-[1.01] active:scale-[0.99]"
              >
                  <Play className="w-5 h-5 fill-current" />
                  {buttonText}
              </Link>
              
              <button 
                onClick={handleToggleList}
                className={`w-12 h-12 flex items-center justify-center border transition-colors rounded-sm ${userProgress ? 'bg-zinc-800 border-brand-400 text-brand-400' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-white hover:text-white'}`}
              >
                  {userProgress ? <Check className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
              </button>
              
               <button className="w-12 h-12 flex items-center justify-center border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white hover:border-white transition-colors rounded-sm">
                  <Download className="w-6 h-6" />
              </button>
          </div>
      </div>

    </div>
  );
};
