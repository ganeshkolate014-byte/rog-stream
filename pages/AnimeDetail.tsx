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
  ChevronUp, 
  Star, 
  ChevronLeft, 
  MoreVertical, 
  Cast, 
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [malData, setMalData] = useState<{ score: number | null; scored_by: number | null } | null>(null);

  // Detect Scroll for Navbar
  useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  
  // Logic for "Start Watching" button
  const currentEpNumber = userProgress?.currentEpisode || 0;
  // If we haven't started (0), watch ep 1. If we have, watch current + 1 (next) or current if completed/caught up logic isn't perfect
  // For simplicity: If 0, start at 1. If >0, try to find next.
  let nextEp = episodes.find(e => e.number === currentEpNumber + 1);
  if (!nextEp && episodes.length > 0) nextEp = episodes[0]; // Fallback to Ep 1
  
  // If we completed the last episode available, just show the last one? 
  // Or if we are in the middle of an episode? UserProgress stores 'currentEpisode' as the last one COMPLETED usually or watched.
  // Let's assume userProgress.currentEpisode is the last one they finished. So we want +1.
  
  // If nextEp is missing (e.g., watched all), maybe fallback to the first one or stay on last.
  if (!nextEp && episodes.length > 0) nextEp = episodes[episodes.length - 1];

  const watchLink = nextEp ? `/watch/${encodeURIComponent(nextEp.id)}` : '#';
  const buttonText = currentEpNumber > 0 && nextEp?.number !== 1 ? `Continue E${nextEp?.number}` : `Start Watching E1`;

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-sans selection:bg-brand-500 selection:text-white">
      
      {/* 1. Navbar Overlay (Fixed) */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/90 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
         <div className="flex items-center justify-between px-4 h-14 md:h-16 max-w-7xl mx-auto">
             <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                 <ChevronLeft className="w-6 h-6 text-white" />
             </button>
             <div className="flex items-center gap-4">
                 <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                     <Cast className="w-5 h-5 text-white" />
                 </button>
                 <button className="p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors">
                     <MoreVertical className="w-5 h-5 text-white" />
                 </button>
             </div>
         </div>
      </div>

      {/* 2. Hero Section */}
      <div className="relative w-full aspect-[16/10] md:aspect-[21/9] lg:h-[60vh] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
             <img src={heroImage} alt={anime.title} className="w-full h-full object-cover" />
          </div>
          
          {/* Gradient Overlay - Crucial for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
          
          {/* 3. Centered Info Header */}
          <div className="flex flex-col items-center text-center">
              
              {/* Title */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-4xl lg:text-5xl font-bold uppercase font-display tracking-tight leading-none mb-1 text-balance"
              >
                  {anime.title}
              </motion.h1>
              
              {/* Subtitle / JP Title */}
              {anime.japaneseTitle && (
                  <p className="text-zinc-400 text-xs md:text-sm font-medium mb-3">{anime.japaneseTitle}</p>
              )}

              {/* Metadata Line */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] md:text-xs font-medium text-zinc-400 mb-3">
                  {/* Dub/Sub Badges */}
                  <div className="flex items-center gap-1">
                      {anime.hasDub && <span className="bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded-[2px]">Dub</span>}
                      {anime.hasSub && <span className="bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded-[2px] ml-0.5">Sub</span>}
                  </div>
                  <span>•</span>
                  {/* Genres */}
                  <span className="uppercase tracking-wide">
                      {anime.genres?.slice(0, 3).join(', ')}
                  </span>
              </div>

              {/* Rating Row */}
              <div className="flex items-center gap-1.5 mb-6">
                  <div className="flex text-brand-400">
                      {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                  </div>
                  <span className="text-xs font-bold text-zinc-300">
                      {malData?.score || anime.malScore || "4.8"}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                      ({malData?.scored_by ? formatNumber(malData.scored_by) : "12k"})
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-600" />
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-12 md:gap-20 mb-6">
                  <button 
                    onClick={handleToggleList}
                    className="flex flex-col items-center gap-1 group"
                  >
                      {userProgress ? (
                          <Check className="w-6 h-6 text-brand-400" />
                      ) : (
                          <Plus className="w-6 h-6 text-white group-hover:text-brand-400 transition-colors" />
                      )}
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${userProgress ? 'text-brand-400' : 'text-zinc-400 group-hover:text-white'}`}>
                          {userProgress ? 'Saved' : 'My List'}
                      </span>
                  </button>
                  
                  <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
                      <Share2 className="w-6 h-6 text-white group-hover:text-brand-400 transition-colors" />
                      <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white uppercase tracking-wider">Share</span>
                  </button>
              </div>

              {/* Description (Collapsible) */}
              <div className="w-full max-w-2xl mb-8">
                  <motion.div 
                    initial={false}
                    animate={{ height: showFullDesc ? 'auto' : '42px' }}
                    className="overflow-hidden relative text-xs md:text-sm text-zinc-300 leading-relaxed text-center"
                  >
                      {anime.description}
                  </motion.div>
                  <button 
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="text-[10px] font-bold text-zinc-500 uppercase mt-1 hover:text-white transition-colors"
                  >
                      {showFullDesc ? 'Less Details' : 'More Details'}
                  </button>
              </div>

          </div>

          {/* 4. Tabs Section */}
          <div className="border-b border-white/10 mb-4 sticky top-14 md:top-16 bg-black z-40">
              <div className="flex items-center gap-8">
                  <button 
                    onClick={() => setActiveTab('episodes')}
                    className={`py-3 text-sm font-bold uppercase tracking-wider relative ${activeTab === 'episodes' ? 'text-brand-400' : 'text-zinc-500 hover:text-white'}`}
                  >
                      Episodes
                      {activeTab === 'episodes' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-400" />}
                  </button>
                  <button 
                    onClick={() => setActiveTab('related')}
                    className={`py-3 text-sm font-bold uppercase tracking-wider relative ${activeTab === 'related' ? 'text-brand-400' : 'text-zinc-500 hover:text-white'}`}
                  >
                      More Like This
                      {activeTab === 'related' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-400" />}
                  </button>
              </div>
          </div>

          {/* 5. Tab Content */}
          <div className="min-h-[400px]">
              {activeTab === 'episodes' ? (
                  <div className="space-y-4">
                      {/* Season Selector (Mock) */}
                      <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider px-1">
                          <span>{episodes.length} Episodes</span>
                          <button className="flex items-center gap-1 text-zinc-400 hover:text-white">
                              Sort <ChevronDown className="w-3 h-3" />
                          </button>
                      </div>

                      {/* List */}
                      <div className="flex flex-col gap-2">
                          {episodes.map(ep => {
                              const isNext = nextEp?.id === ep.id;
                              return (
                                  <Link 
                                    key={ep.id} 
                                    to={`/watch/${encodeURIComponent(ep.id)}`}
                                    className={`flex gap-3 p-2 rounded hover:bg-white/5 transition-colors group ${isNext ? 'bg-white/5 border border-brand-400/20' : ''}`}
                                  >
                                      {/* Thumbnail Placeholder */}
                                      <div className="w-32 aspect-video bg-zinc-800 rounded-sm flex-shrink-0 overflow-hidden relative">
                                          <img src={anime.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                                          <div className="absolute inset-0 flex items-center justify-center">
                                              <Play className={`w-6 h-6 ${isNext ? 'text-brand-400 fill-brand-400' : 'text-white/50 fill-white/50 group-hover:text-white'}`} />
                                          </div>
                                          <div className="absolute bottom-1 right-1 px-1 bg-black/80 rounded text-[9px] font-bold text-white">24m</div>
                                      </div>
                                      
                                      <div className="flex flex-col justify-center min-w-0">
                                          <h4 className={`text-sm font-bold truncate ${isNext ? 'text-brand-400' : 'text-zinc-300 group-hover:text-white'}`}>
                                              {ep.number}. {ep.title || `Episode ${ep.number}`}
                                          </h4>
                                          <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2">
                                              {(anime.description || "").slice(0, 60)}...
                                          </p>
                                          {ep.isFiller && <span className="text-[9px] text-red-500 font-bold uppercase mt-1">Filler</span>}
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

      {/* 6. Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 p-3 z-50 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
              <Link 
                to={watchLink}
                className="flex-1 bg-brand-400 hover:bg-brand-500 text-black font-black uppercase tracking-wider h-11 flex items-center justify-center gap-2 clip-path-polygon transition-colors"
              >
                  <Play className="w-4 h-4 fill-black" />
                  {buttonText}
              </Link>
              
              <button 
                onClick={handleToggleList}
                className="w-11 h-11 flex items-center justify-center border border-zinc-700 bg-zinc-900 text-brand-400 hover:border-brand-400 transition-colors"
              >
                  {userProgress ? <Check className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
              
               <button className="w-11 h-11 flex items-center justify-center border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white transition-colors">
                  <Download className="w-5 h-5" />
              </button>
          </div>
      </div>

    </div>
  );
};
