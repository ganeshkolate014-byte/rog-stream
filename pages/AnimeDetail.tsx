import React, { useEffect, useState } from 'react';
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
    <div className="min-h-screen bg-black text-white pb-24 font-sans selection:bg-brand-500 selection:text-white">
      
      {/* 
        1. Fixed Background Layer (The Poster) 
        This div stays fixed while content scrolls over it.
      */}
      <div className="fixed top-0 left-0 w-full h-[70vh] z-0">
          {/* Base darkening */}
          <div className="absolute inset-0 bg-black" /> 
          
          <img 
            src={heroImage} 
            alt={anime.title} 
            className="w-full h-full object-cover opacity-90" 
          />
          
          {/* Gradient Overlay: 
              - Top gradient for Navbar visibility
              - Bottom gradient to blend into the scrolling content
          */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
      </div>

      {/* 
        2. Main Scrollable Content Wrapper 
        Relative positioning places it *above* the fixed background.
      */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
          
          {/* Transparent Spacer - Allows seeing the fixed background initially */}
          <div className="h-[45vh] md:h-[55vh] w-full flex-shrink-0" />

          {/* 
            Content Body 
            Starts with a gradient to smooth the transition from the image,
            then becomes solid black for readability of the list.
          */}
          <div className="flex-1 bg-gradient-to-b from-transparent via-black/90 to-black pt-12">
              
               <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center pb-8">
                   
                   {/* Title - Static, no animation */}
                   <h1 className="text-3xl md:text-5xl lg:text-7xl font-black uppercase font-display tracking-tight leading-none mb-2 text-balance drop-shadow-2xl">
                      {anime.title}
                   </h1>
                   
                   {/* Subtitle / JP Title */}
                   {anime.japaneseTitle && (
                       <p className="text-zinc-300 text-xs md:text-sm font-medium mb-4 drop-shadow-md">{anime.japaneseTitle}</p>
                   )}

                   {/* Metadata Line */}
                   <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] md:text-xs font-bold text-zinc-300 mb-6 uppercase tracking-wider drop-shadow-md">
                       {/* Dub/Sub Badges */}
                       <div className="flex items-center gap-1">
                           {anime.hasDub && <span className="bg-white text-black px-1.5 py-0.5 rounded-[2px]">DUB</span>}
                           {anime.hasSub && <span className="bg-zinc-800 text-white border border-white/20 px-1.5 py-0.5 rounded-[2px] ml-0.5">SUB</span>}
                       </div>
                       <span className="opacity-50">•</span>
                       {/* Genres */}
                       <span>
                           {anime.genres?.slice(0, 3).join(', ')}
                       </span>
                   </div>

                   {/* Rating & Stats */}
                   <div className="flex items-center gap-2 mb-8 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-xl">
                       <div className="flex text-brand-400">
                           <Star className="w-4 h-4 fill-current" />
                       </div>
                       <span className="text-sm font-black text-white">
                           {malData?.score || anime.malScore || "4.8"}
                       </span>
                       <span className="text-xs text-zinc-400 font-bold border-l border-white/10 pl-2 ml-1">
                           {malData?.scored_by ? formatNumber(malData.scored_by) : "12k"} Votes
                       </span>
                   </div>

                   {/* Action Buttons Row */}
                   <div className="flex items-center gap-12 md:gap-20 mb-8">
                       <button 
                         onClick={handleToggleList}
                         className="flex flex-col items-center gap-2 group"
                       >
                           <div className={`p-3 rounded-full border-2 transition-all shadow-lg ${userProgress ? 'bg-brand-400 border-brand-400' : 'bg-black/60 border-white/30 group-hover:border-brand-400 backdrop-blur-sm'}`}>
                             {userProgress ? (
                                 <Check className="w-5 h-5 text-black" />
                             ) : (
                                 <Plus className="w-5 h-5 text-white group-hover:text-brand-400 transition-colors" />
                             )}
                           </div>
                           <span className={`text-[10px] font-bold uppercase tracking-wider ${userProgress ? 'text-brand-400' : 'text-zinc-300 group-hover:text-white'}`}>
                               {userProgress ? 'Saved' : 'My List'}
                           </span>
                       </button>
                       
                       <button onClick={handleShare} className="flex flex-col items-center gap-2 group">
                           <div className="p-3 rounded-full bg-black/60 border-2 border-white/30 group-hover:border-brand-400 transition-all backdrop-blur-sm shadow-lg">
                             <Share2 className="w-5 h-5 text-white group-hover:text-brand-400 transition-colors" />
                           </div>
                           <span className="text-[10px] font-bold text-zinc-300 group-hover:text-white uppercase tracking-wider">Share</span>
                       </button>
                   </div>

                   {/* Description (Collapsible) - No Animation */}
                   <div className="w-full max-w-2xl mb-4">
                       <div 
                         className={`overflow-hidden relative text-xs md:text-sm text-zinc-300 leading-relaxed text-center transition-[height] duration-300 ease-in-out ${showFullDesc ? 'h-auto' : 'h-[60px]'}`}
                       >
                           {anime.description}
                           {!showFullDesc && (
                               <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent" />
                           )}
                       </div>
                       <button 
                         onClick={() => setShowFullDesc(!showFullDesc)}
                         className="flex items-center gap-1 mx-auto text-[10px] font-bold text-zinc-500 uppercase mt-2 hover:text-white transition-colors"
                       >
                           {showFullDesc ? 'Show Less' : 'Show More'} <ChevronDown className={`w-3 h-3 transition-transform ${showFullDesc ? 'rotate-180' : ''}`} />
                       </button>
                   </div>
               </div>

               {/* Solid Background Section for Lists */}
               <div className="bg-black w-full min-h-[500px]">
                   
                   {/* Tabs */}
                   <div className="sticky top-14 md:top-20 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10 mb-6 shadow-2xl">
                       <div className="flex items-center justify-center gap-12 max-w-7xl mx-auto px-4">
                           <button 
                             onClick={() => setActiveTab('episodes')}
                             className={`py-4 text-sm font-black uppercase tracking-widest relative transition-colors ${activeTab === 'episodes' ? 'text-brand-400' : 'text-zinc-500 hover:text-white'}`}
                           >
                               Episodes
                               {activeTab === 'episodes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-400" />}
                           </button>
                           <button 
                             onClick={() => setActiveTab('related')}
                             className={`py-4 text-sm font-black uppercase tracking-widest relative transition-colors ${activeTab === 'related' ? 'text-brand-400' : 'text-zinc-500 hover:text-white'}`}
                           >
                               Related
                               {activeTab === 'related' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-400" />}
                           </button>
                       </div>
                   </div>

                   {/* Tab Content */}
                   <div className="max-w-7xl mx-auto px-4 min-h-[400px]">
                       {activeTab === 'episodes' ? (
                           <div className="space-y-4">
                               {/* List Header */}
                               <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-2 mb-2">
                                   <span>{episodes.length} Episodes Available</span>
                                   <span className="text-zinc-600">Sorted by Number</span>
                               </div>

                               {/* List */}
                               <div className="flex flex-col gap-3">
                                   {episodes.map(ep => {
                                       const isNext = nextEp?.id === ep.id;
                                       return (
                                           <Link 
                                             key={ep.id} 
                                             to={`/watch/${encodeURIComponent(ep.id)}`}
                                             className={`flex gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group ${isNext ? 'bg-brand-400/10 border border-brand-400/20' : 'bg-zinc-900/30 border border-transparent'}`}
                                           >
                                               {/* Thumbnail */}
                                               <div className="w-32 md:w-40 aspect-video bg-zinc-800 rounded overflow-hidden relative shadow-lg flex-shrink-0">
                                                   <img src={anime.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                                                   <div className="absolute inset-0 flex items-center justify-center">
                                                       <Play className={`w-8 h-8 ${isNext ? 'text-brand-400 fill-brand-400' : 'text-white/50 fill-white/50 group-hover:text-white'}`} />
                                                   </div>
                                                   {ep.isFiller && <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500 text-[8px] font-bold text-white rounded-sm uppercase tracking-wider">Filler</div>}
                                               </div>
                                               
                                               <div className="flex flex-col justify-center min-w-0 flex-1">
                                                   <div className="flex items-start justify-between gap-2">
                                                       <h4 className={`text-sm md:text-base font-bold line-clamp-1 ${isNext ? 'text-brand-400' : 'text-zinc-200 group-hover:text-white'}`}>
                                                           {ep.number}. {ep.title || `Episode ${ep.number}`}
                                                       </h4>
                                                   </div>
                                                   <p className="text-[10px] md:text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                                                       {(anime.description || "").slice(0, 100)}...
                                                   </p>
                                                   <div className="mt-2 flex items-center gap-2">
                                                       <span className="text-[9px] font-mono text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5">24m</span>
                                                   </div>
                                               </div>
                                           </Link>
                                       )
                                   })}
                               </div>
                           </div>
                       ) : (
                           <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                               {[...(anime.relatedAnime || []), ...(anime.recommendations || [])].map(rel => (
                                   <AnimeCard key={rel.id} anime={rel} layout="grid" />
                               ))}
                           </div>
                       )}
                   </div>
               </div>
          </div>
      </div>

      {/* 
        3. Sticky Bottom Action Bar
        This remains fixed at the bottom regardless of scroll.
      */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-white/10 p-4 z-50 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
              <Link 
                to={watchLink}
                className="flex-1 bg-brand-400 hover:bg-white hover:text-black text-black font-black uppercase tracking-widest h-12 flex items-center justify-center gap-3 clip-path-polygon transition-all shadow-[0_0_20px_rgba(255,0,51,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
              >
                  <Play className="w-5 h-5 fill-current" />
                  {buttonText}
              </Link>
              
              <button 
                onClick={handleToggleList}
                className="w-12 h-12 flex items-center justify-center border border-zinc-700 bg-zinc-900 text-brand-400 hover:border-brand-400 transition-colors rounded-sm"
              >
                  {userProgress ? <Check className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
              </button>
              
               <button className="w-12 h-12 flex items-center justify-center border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white transition-colors rounded-sm">
                  <Download className="w-6 h-6" />
              </button>
          </div>
      </div>

    </div>
  );
};
