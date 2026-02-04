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
  Bookmark,
  Calendar,
  Clock,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { DetailSkeleton } from '../components/Skeletons';
import { AnimeCard } from '../components/AnimeCard';
import { useAuth } from '../context/AuthContext';
import { getUserProgress, UserProgress, addToWatchlist, removeUserProgress } from '../services/firebase';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

export const AnimeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax Hooks
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0.3]);
  const heroBlur = useTransform(scrollY, [0, 500], [0, 10]);
  const contentY = useTransform(scrollY, [0, 500], [0, -50]);

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
            await removeUserProgress(user.uid, anime.id);
            setUserProgress(null);
        } else {
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
        if (navigator.share) {
            await navigator.share({
                title: anime?.title,
                text: `Watch ${anime?.title} on ROG Stream`,
                url: window.location.href,
            });
        } else {
            await navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    } catch (e) {
        console.error("Share failed", e);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Logic
  if (isLoading) return <DetailSkeleton />;
  if (isError || !anime) return <div className="min-h-screen bg-dark-950 flex items-center justify-center text-white">Anime Not Found</div>;

  const heroImage = anime.banner || anime.image;
  const episodes = anime.episodes || [];
  
  const currentEpNumber = userProgress?.currentEpisode || 0;
  let nextEp = episodes.find(e => e.number === currentEpNumber + 1);
  if (!nextEp && episodes.length > 0) nextEp = episodes[0];
  if (!nextEp && episodes.length > 0) nextEp = episodes[episodes.length - 1];

  const watchLink = nextEp ? `/watch/${encodeURIComponent(nextEp.id)}` : '#';
  const buttonText = currentEpNumber > 0 && nextEp?.number !== 1 ? `Resume: E${nextEp?.number}` : `Start Watching`;

  return (
    <motion.div 
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-screen bg-dark-950 text-white font-sans selection:bg-brand-500 selection:text-white pb-24 relative overflow-hidden"
    >
      
      {/* 1. Immersive Parallax Hero */}
      <div className="fixed top-0 left-0 w-full h-[65vh] md:h-[80vh] z-0 overflow-hidden pointer-events-none">
          <motion.div style={{ scale: heroScale, opacity: heroOpacity, filter: `blur(${heroBlur}px)` }} className="w-full h-full">
            <img 
                src={heroImage} 
                alt={anime.title} 
                className="w-full h-full object-cover" 
            />
             <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-r from-dark-950/80 via-transparent to-transparent" />
          </motion.div>
      </div>

      {/* Back Button (Fixed) */}
      <Link to="/" className="fixed top-6 left-4 md:left-8 z-50 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/20 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-all group">
         <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" />
      </Link>

      {/* 2. Content Container (Scrolls over fixed hero) */}
      <motion.div 
        style={{ y: contentY }}
        className="relative z-10 pt-[35vh] md:pt-[45vh] max-w-[1400px] mx-auto px-4 md:px-8"
      >
          <div className="flex flex-col md:flex-row items-end gap-8 md:gap-12">
               
               {/* Poster Card (Floating) */}
               <motion.div 
                 initial={{ y: 50, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.2, duration: 0.8 }}
                 className="hidden md:block w-[240px] aspect-[2/3] rounded-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-dark-800 flex-shrink-0 relative group"
               >
                   <img src={anime.image} alt={anime.title} className="w-full h-full object-cover" />
               </motion.div>

               {/* Header Info */}
               <div className="flex-1 w-full text-shadow-lg">
                   <motion.div
                     initial={{ y: 30, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.3, duration: 0.8 }}
                   >
                       {/* Tags */}
                       <div className="flex flex-wrap items-center gap-2 mb-3">
                           {anime.type && <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider">{anime.type}</span>}
                           {anime.status && <span className="px-2 py-0.5 rounded-full bg-brand-400/20 backdrop-blur-md border border-brand-400/30 text-brand-400 text-[10px] font-bold uppercase tracking-wider">{anime.status}</span>}
                           <div className="flex items-center gap-1 text-[10px] font-bold bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span>{malData?.score || anime.malScore || "N/A"}</span>
                           </div>
                       </div>

                       <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase font-display italic tracking-tighter leading-[0.9] mb-4 text-white">
                           {anime.title}
                       </h1>

                       {/* Action Row */}
                       <div className="flex flex-wrap items-center gap-4 mb-8">
                            <Link 
                                to={watchLink}
                                className="h-12 md:h-14 px-8 bg-brand-400 hover:bg-white text-black font-black uppercase tracking-widest text-sm md:text-base rounded-full flex items-center gap-3 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(255,0,51,0.4)]"
                            >
                                <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                                {buttonText}
                            </Link>
                            
                            <button 
                                onClick={handleToggleList}
                                className={`h-12 md:h-14 w-12 md:w-14 rounded-full flex items-center justify-center border transition-all ${userProgress ? 'bg-green-500 border-green-500 text-black' : 'bg-white/10 border-white/10 hover:bg-white/20 text-white backdrop-blur-md'}`}
                            >
                                {userProgress ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : <Plus className="w-5 h-5 md:w-6 md:h-6" />}
                            </button>

                            <button 
                                onClick={handleShare}
                                className="h-12 md:h-14 w-12 md:w-14 rounded-full flex items-center justify-center bg-white/10 border border-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
                            >
                                <Share2 className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                       </div>
                   </motion.div>
               </div>
          </div>

          {/* 3. Details & Episodes Section */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Column: Details */}
              <motion.div 
                 className="lg:col-span-4 space-y-8"
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
              >
                  {/* Synopsis */}
                  <div className="bg-dark-900/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl">
                      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Synopsis</h3>
                      <div className={`relative text-sm text-zinc-300 leading-relaxed ${showFullDesc ? '' : 'line-clamp-4'}`}>
                          {anime.description}
                      </div>
                      <button 
                        onClick={() => setShowFullDesc(!showFullDesc)}
                        className="mt-2 text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1 hover:text-white transition-colors"
                      >
                          {showFullDesc ? 'Less' : 'More'} <ChevronDown className={`w-3 h-3 transition-transform ${showFullDesc ? 'rotate-180' : ''}`} />
                      </button>
                  </div>

                  {/* Info Grid */}
                  <div className="bg-dark-900/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl grid grid-cols-2 gap-6">
                      <div>
                          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                              <Calendar className="w-3 h-3" /> Aired
                          </div>
                          <div className="text-sm font-medium text-white">{anime.season || 'Unknown'}</div>
                      </div>
                      <div>
                          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                              <Layers className="w-3 h-3" /> Episodes
                          </div>
                          <div className="text-sm font-medium text-white">{anime.episodes?.length || '?'}</div>
                      </div>
                      <div className="col-span-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                              Genres
                          </div>
                          <div className="flex flex-wrap gap-2">
                              {anime.genres?.map(g => (
                                  <Link key={g} to={`/animes/${g.toLowerCase()}`} className="px-3 py-1 bg-white/5 hover:bg-brand-400 hover:text-black transition-colors rounded-full text-xs border border-white/5">
                                      {g}
                                  </Link>
                              ))}
                          </div>
                      </div>
                  </div>
              </motion.div>

              {/* Right Column: Episodes & Related */}
              <div className="lg:col-span-8">
                  {/* iOS Style Segmented Control */}
                  <div className="flex p-1 bg-white/5 rounded-full backdrop-blur-sm border border-white/5 mb-8 w-fit">
                      <button 
                        onClick={() => setActiveTab('episodes')}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'episodes' ? 'bg-brand-400 text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                      >
                          Episodes
                      </button>
                      <button 
                        onClick={() => setActiveTab('related')}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'related' ? 'bg-brand-400 text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                      >
                          Related
                      </button>
                  </div>

                  <AnimatePresence mode="wait">
                      {activeTab === 'episodes' ? (
                          <motion.div
                            key="episodes"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-3"
                          >
                              {episodes.map((ep, idx) => {
                                  const isNext = nextEp?.id === ep.id;
                                  return (
                                    <Link 
                                        key={ep.id}
                                        to={`/watch/${encodeURIComponent(ep.id)}`}
                                        className={`group relative flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 overflow-hidden ${isNext ? 'bg-brand-400/10 border-brand-400/30 shadow-[0_0_20px_rgba(255,0,51,0.1)]' : 'bg-dark-900/40 border-white/5 hover:bg-dark-800 hover:border-white/10'}`}
                                    >
                                        {/* Thumbnail (Simulated) */}
                                        <div className="w-24 md:w-32 aspect-video bg-black/50 rounded-lg overflow-hidden relative flex-shrink-0">
                                            <img src={anime.image} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity blur-[1px] group-hover:blur-0" alt="" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm ${isNext ? 'bg-brand-400 text-black' : 'bg-white/10 text-white group-hover:bg-white group-hover:text-black'} transition-colors`}>
                                                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isNext ? 'text-brand-400' : 'text-zinc-500'}`}>Episode {ep.number}</span>
                                                {ep.isFiller && <span className="text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded border border-red-500/20 uppercase font-bold">Filler</span>}
                                            </div>
                                            <h4 className="text-sm font-bold text-white truncate group-hover:text-brand-400 transition-colors">
                                                {ep.title || `Episode ${ep.number}`}
                                            </h4>
                                        </div>
                                    </Link>
                                  );
                              })}
                          </motion.div>
                      ) : (
                          <motion.div
                             key="related"
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, x: -20 }}
                             transition={{ duration: 0.4 }}
                             className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                          >
                             {[...(anime.relatedAnime || []), ...(anime.recommendations || [])].map(rel => (
                                  <AnimeCard key={rel.id} anime={rel} layout="grid" />
                              ))}
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>
          </div>

      </motion.div>

      {/* Sticky Bottom Bar for Mobile Only */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 bg-dark-950/80 backdrop-blur-xl border-t border-white/10 p-4 z-50 md:hidden pb-[env(safe-area-inset-bottom)]"
      >
          <Link 
            to={watchLink}
            className="w-full h-12 bg-brand-400 text-black font-black uppercase tracking-widest rounded-full flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,51,0.3)]"
          >
              <Play className="w-5 h-5 fill-current" /> {buttonText}
          </Link>
      </motion.div>

    </motion.div>
  );
};