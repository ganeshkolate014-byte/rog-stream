import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApi, constructUrl } from '../services/api';
import { AnimeDetail as AnimeDetailType, Anime } from '../types';
import { 
  Play, 
  Share2, 
  Plus, 
  Check, 
  Star, 
  Download,
  Bookmark,
  Calendar,
  Layers,
  Monitor,
  Search,
  LayoutGrid,
  List,
  ArrowRight
} from 'lucide-react';
import { DetailSkeleton } from '../components/Skeletons';
import { AnimeCard } from '../components/AnimeCard';
import { useAuth } from '../context/AuthContext';
import { getUserProgress, UserProgress, addToWatchlist, removeUserProgress } from '../services/firebase';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

// --- Components for Detail Page ---

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon?: React.ElementType }> = ({ active, onClick, label, icon: Icon }) => (
    <button 
        onClick={onClick}
        className={`relative px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-300 group overflow-hidden ${active ? 'text-black' : 'text-zinc-500 hover:text-white'}`}
    >
        {/* Background Slide */}
        <span className={`absolute inset-0 bg-brand-400 transform origin-left transition-transform duration-300 ease-out skew-x-[-12deg] ${active ? 'scale-x-100' : 'scale-x-0 group-hover:bg-white/10 group-hover:scale-x-100'}`} />
        
        <span className="relative z-10 flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" />}
            {label}
        </span>
    </button>
);

const InfoChip: React.FC<{ label: string, value: string | number, icon?: React.ElementType }> = ({ label, value, icon: Icon }) => (
    <div className="flex flex-col">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</span>
        <div className="flex items-center gap-2 text-zinc-200 font-medium text-sm">
            {Icon && <Icon className="w-3.5 h-3.5 text-brand-400" />}
            {value || 'N/A'}
        </div>
    </div>
);

export const AnimeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Parallax Effect
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const contentY = useTransform(scrollY, [0, 500], [0, -50]);

  // Data States
  const { data: anime, isLoading, isError } = useApi<AnimeDetailType>(
      constructUrl('details', { id })
  );
  
  // Interaction States
  const [activeTab, setActiveTab] = useState<'episodes' | 'related'>('episodes');
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [episodeSearch, setEpisodeSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
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

  // Fetch External Ratings (MAL) - Reused logic
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
                    setMalData({ score: statsData.data?.score, scored_by: statsData.data?.scored_by });
                }
            } catch (e) {}
        }
    };
    loadMalInfo();
  }, [anime]);
  
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

  if (isLoading) return <DetailSkeleton />;
  if (isError || !anime) return <div className="min-h-screen bg-dark-950 flex items-center justify-center text-white">Anime Not Found</div>;

  const heroImage = anime.banner || anime.image;
  const posterImage = anime.poster || anime.image;
  const episodes = anime.episodes || [];
  
  const currentEpNumber = userProgress?.currentEpisode || 0;
  let nextEp = episodes.find(e => e.number === currentEpNumber + 1);
  if (!nextEp && episodes.length > 0) nextEp = episodes[0]; // Fallback to Ep 1
  if (!nextEp && episodes.length > 0) nextEp = episodes[episodes.length - 1]; // Fallback to last if completed

  const watchLink = nextEp ? `/watch/${encodeURIComponent(nextEp.id)}` : '#';
  const buttonText = currentEpNumber > 0 && nextEp?.number !== 1 ? `Continue E${nextEp?.number}` : `Start Watching`;

  const filteredEpisodes = episodes.filter(ep => 
      ep.number.toString().includes(episodeSearch) || 
      (ep.title && ep.title.toLowerCase().includes(episodeSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-dark-950 text-white font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden" ref={scrollRef}>
      
      {/* --- CINEMATIC HERO SECTION --- */}
      <div className="relative w-full h-[65vh] md:h-[80vh] overflow-hidden border-b border-brand-900/10">
          {/* Parallax Background */}
          <motion.div style={{ y, opacity }} className="absolute inset-0">
             <img 
                src={heroImage} 
                alt={anime.title} 
                className="w-full h-full object-cover" 
             />
             {/* Vignette & Gradients */}
             <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-black/30" />
             <div className="absolute inset-0 bg-gradient-to-r from-dark-950/90 via-transparent to-transparent" />
             
             {/* Noise Texture Overlay */}
             <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dj5hhott5/image/upload/v1739502930/noise_tij0m3.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
          </motion.div>

          {/* Floating Content */}
          <motion.div 
             style={{ y: contentY }}
             className="absolute inset-0 flex items-end pb-12 md:pb-24 z-10"
          >
              <div className="max-w-[1600px] w-full mx-auto px-4 md:px-12 flex flex-col md:flex-row gap-8 items-end">
                   
                   {/* Left: Poster (Desktop Only - Parallax Floating) */}
                   <div className="hidden md:block w-[260px] flex-shrink-0 -mb-32 relative z-20 group perspective-1000">
                        <div className="aspect-[2/3] rounded-lg overflow-hidden border-4 border-dark-950 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform duration-500 group-hover:rotate-y-12 bg-dark-900">
                             <img src={posterImage} className="w-full h-full object-cover" alt="" />
                             {userProgress && (
                                <div className="absolute top-2 left-2 bg-brand-400 text-black text-[10px] font-black px-2 py-1 uppercase tracking-widest rounded-sm shadow-lg">
                                    {userProgress.status}
                                </div>
                             )}
                        </div>
                   </div>

                   {/* Right: Info */}
                   <div className="flex-1 space-y-6">
                       <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6 }}
                          className="space-y-2"
                       >
                           {/* Badges */}
                           <div className="flex flex-wrap gap-2 mb-3">
                               {anime.type && <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md border border-white/10 rounded text-[10px] font-bold uppercase tracking-widest text-zinc-300">{anime.type}</span>}
                               {anime.status && <span className="px-2 py-0.5 bg-brand-400/10 backdrop-blur-md border border-brand-400/20 rounded text-[10px] font-bold uppercase tracking-widest text-brand-400">{anime.status}</span>}
                               {(malData?.score || anime.malScore) && (
                                   <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-[10px] font-bold text-yellow-500">
                                       <Star className="w-3 h-3 fill-current" /> {malData?.score || anime.malScore}
                                   </div>
                               )}
                           </div>
                           
                           <h1 className="text-4xl md:text-7xl font-black text-white font-display italic tracking-tight uppercase leading-[0.9] drop-shadow-2xl">
                               {anime.title}
                           </h1>
                           {anime.japaneseTitle && <p className="text-zinc-400 text-sm md:text-lg font-medium">{anime.japaneseTitle}</p>}
                       </motion.div>

                       <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                          className="flex flex-wrap gap-4"
                       >
                           <Link 
                                to={watchLink}
                                className="h-12 md:h-14 px-8 bg-brand-400 hover:bg-white text-black font-black text-sm md:text-base uppercase tracking-widest skew-x-[-12deg] flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(255,0,51,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-105"
                           >
                                <Play className="w-5 h-5 fill-current skew-x-[12deg]" />
                                <span className="skew-x-[12deg]">{buttonText}</span>
                           </Link>
                           
                           <button 
                                onClick={handleToggleList}
                                className={`h-12 md:h-14 w-14 md:w-16 border-2 flex items-center justify-center skew-x-[-12deg] transition-all hover:scale-105 ${userProgress ? 'bg-zinc-800 border-zinc-700 text-brand-400' : 'bg-transparent border-white/30 text-white hover:bg-white hover:text-black hover:border-white'}`}
                           >
                                {isSaving ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin skew-x-[12deg]"/> : userProgress ? <Check className="w-6 h-6 skew-x-[12deg]" /> : <Plus className="w-6 h-6 skew-x-[12deg]" />}
                           </button>

                           <button 
                                onClick={handleShare}
                                className="h-12 md:h-14 w-14 md:w-16 border-2 border-white/30 bg-transparent hover:bg-white hover:text-black hover:border-white text-white flex items-center justify-center skew-x-[-12deg] transition-all hover:scale-105"
                           >
                                <Share2 className="w-6 h-6 skew-x-[12deg]" />
                           </button>
                       </motion.div>
                   </div>
              </div>
          </motion.div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 py-12 md:py-20 relative z-20">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
              
              {/* Left Column (Meta & Stats) */}
              <div className="hidden lg:block w-[300px] flex-shrink-0 space-y-8 pt-20">
                   <div className="bg-dark-900/50 border border-white/5 p-6 rounded-lg backdrop-blur-sm space-y-6">
                       <InfoChip label="Format" value={anime.type} icon={Monitor} />
                       <InfoChip label="Episodes" value={anime.totalEpisodes || anime.episodes?.length} icon={Layers} />
                       <InfoChip label="Status" value={anime.status} icon={Check} />
                       <InfoChip label="Aired" value={anime.season} icon={Calendar} />
                       <div className="pt-4 border-t border-white/5">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Genres</span>
                            <div className="flex flex-wrap gap-2">
                                {anime.genres?.map(g => (
                                    <Link key={g} to={`/animes/${g.toLowerCase()}`} className="text-[11px] font-bold text-zinc-300 hover:text-brand-400 transition-colors bg-white/5 px-2 py-1 rounded hover:bg-white/10">
                                        {g}
                                    </Link>
                                ))}
                            </div>
                       </div>
                   </div>
              </div>

              {/* Right Column (Tabs & Content) */}
              <div className="flex-1 min-w-0">
                  
                  {/* Synopsis */}
                  <div className="mb-12">
                      <h3 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <span className="w-8 h-[1px] bg-brand-400"></span> Synopsis
                      </h3>
                      <p className="text-zinc-300 leading-relaxed text-sm md:text-base font-light max-w-4xl">
                          {anime.description}
                      </p>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-4 border-b border-white/5 mb-8">
                      <TabButton active={activeTab === 'episodes'} onClick={() => setActiveTab('episodes')} label="Episodes" icon={List} />
                      <TabButton active={activeTab === 'related'} onClick={() => setActiveTab('related')} label="Related" icon={LayoutGrid} />
                  </div>
                  
                  <AnimatePresence mode="wait">
                      {activeTab === 'episodes' ? (
                          <motion.div
                             key="episodes"
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: -10 }}
                             transition={{ duration: 0.3 }}
                          >
                               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                   <div className="text-sm font-bold text-zinc-400">
                                       <span className="text-white">{filteredEpisodes.length}</span> Episodes
                                   </div>
                                   
                                   <div className="flex gap-2">
                                       <div className="relative group">
                                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
                                           <input 
                                                type="text" 
                                                placeholder="Search number..." 
                                                value={episodeSearch}
                                                onChange={(e) => setEpisodeSearch(e.target.value)}
                                                className="bg-dark-900 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm focus:border-brand-400 outline-none w-[180px] focus:w-[220px] transition-all"
                                           />
                                       </div>
                                       <div className="flex bg-dark-900 rounded-full border border-white/10 p-1">
                                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-full transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}><List className="w-4 h-4"/></button>
                                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}><LayoutGrid className="w-4 h-4"/></button>
                                       </div>
                                   </div>
                               </div>

                               {/* Episodes List/Grid */}
                               {viewMode === 'list' ? (
                                   <div className="space-y-2">
                                       {filteredEpisodes.map((ep, i) => (
                                           <motion.div 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                                key={ep.id}
                                           >
                                               <Link 
                                                    to={`/watch/${encodeURIComponent(ep.id)}`}
                                                    className="group flex items-center gap-4 p-3 md:p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-brand-400/10 hover:border-brand-400/30 transition-all duration-300"
                                               >
                                                    <div className="relative w-24 md:w-32 aspect-video rounded overflow-hidden bg-black flex-shrink-0">
                                                        <img src={anime.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-brand-400 group-hover:scale-110 transition-all">
                                                                <Play className="w-3 h-3 fill-white text-white group-hover:fill-black group-hover:text-black ml-0.5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="text-xs font-black text-zinc-500 uppercase tracking-wider group-hover:text-brand-400">Episode {ep.number}</span>
                                                            {ep.isFiller && <span className="text-[9px] font-bold bg-red-500/20 text-red-500 px-1.5 rounded border border-red-500/20">FILLER</span>}
                                                        </div>
                                                        <h4 className="font-bold text-white text-sm md:text-lg truncate pr-4">{ep.title || `Episode ${ep.number}`}</h4>
                                                    </div>

                                                    <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0 duration-300">
                                                         <ArrowRight className="w-5 h-5 text-brand-400" />
                                                    </div>
                                               </Link>
                                           </motion.div>
                                       ))}
                                   </div>
                               ) : (
                                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                       {filteredEpisodes.map((ep, i) => (
                                           <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.02 }}
                                                key={ep.id}
                                           >
                                               <Link 
                                                    to={`/watch/${encodeURIComponent(ep.id)}`}
                                                    className="block group bg-white/5 border border-white/5 hover:bg-brand-400 hover:border-brand-400 rounded p-4 text-center transition-all duration-300"
                                               >
                                                    <div className="text-xl font-black text-zinc-500 group-hover:text-black mb-1">{ep.number}</div>
                                                    <div className="text-[10px] text-zinc-600 group-hover:text-black/70 font-bold uppercase tracking-widest">Episode</div>
                                               </Link>
                                           </motion.div>
                                       ))}
                                   </div>
                               )}
                          </motion.div>
                      ) : (
                          <motion.div
                             key="related"
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             exit={{ opacity: 0 }}
                             className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                          >
                              {[...(anime.relatedAnime || []), ...(anime.recommendations || [])].map((rel, i) => (
                                  <motion.div 
                                    key={rel.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                  >
                                      <AnimeCard anime={rel} layout="grid" />
                                  </motion.div>
                              ))}
                          </motion.div>
                      )}
                  </AnimatePresence>
                  
              </div>
          </div>
      </div>
    </div>
  );
};