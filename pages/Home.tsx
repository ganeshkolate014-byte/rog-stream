import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi, constructUrl } from '../services/api';
import { HomeData, Anime } from '../types';
import { Hero } from '../components/Hero';
import { AnimeCard } from '../components/AnimeCard';
import { ContinueWatchingCard } from '../components/ContinueWatchingCard'; // New Component
import { HomeSkeleton, ContinueWatchingCardSkeleton } from '../components/Skeletons';
import { ChevronRight, AlertCircle, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProgress, UserProgress } from '../services/firebase';
import { motion } from 'framer-motion';

const HorizontalSection: React.FC<{ title: string; items: Anime[]; variant?: 'portrait' | 'landscape'; link?: string; subtitle?: string }> = ({ 
    title, items, variant = 'portrait', link, subtitle 
}) => {
    if (!items || items.length === 0) return null;

    return (
        <section className="mb-8 md:mb-12 relative group">
            <div className="max-w-[1600px] mx-auto px-3 md:px-6">
                {/* Header */}
                <div className="flex items-end justify-between mb-3 md:mb-4 border-l-4 border-brand-400 pl-3 md:pl-4">
                    <div>
                        <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-wide font-display italic">
                            {title}
                        </h2>
                        {subtitle && <p className="text-brand-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-0.5">{subtitle}</p>}
                    </div>
                    {link && (
                        <Link to={link} className="hidden md:flex items-center text-xs font-bold text-zinc-500 hover:text-brand-400 uppercase tracking-widest transition-colors">
                            View All <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                    )}
                </div>

                {/* Scroll Container */}
                <div className="relative -mx-3 md:-mx-6 px-3 md:px-6">
                    <div className="flex overflow-x-auto gap-3 md:gap-5 pb-4 scrollbar-hide snap-x">
                        {items.map((anime, idx) => (
                            <div key={anime.id} className="snap-start">
                                <AnimeCard anime={anime} variant={variant} rank={subtitle === 'Global Top 10' ? idx + 1 : undefined} layout="row" />
                            </div>
                        ))}
                        
                        {/* View All Card at the end */}
                        {link && (
                             <div className="snap-start flex-shrink-0 w-[80px] md:w-[100px] flex items-center justify-center">
                                <Link to={link} className="w-10 h-10 md:w-12 md:h-12 rounded-none border border-white/20 flex items-center justify-center hover:bg-brand-400 hover:text-black hover:border-brand-400 transition-all skew-x-[-12deg]">
                                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 skew-x-[12deg]" />
                                </Link>
                             </div>
                        )}
                    </div>
                    
                    {/* Fade Edges */}
                    <div className="absolute top-0 right-0 bottom-4 w-12 bg-gradient-to-l from-dark-950 to-transparent pointer-events-none md:hidden" />
                </div>
            </div>
        </section>
    );
};

// Continue Watching based on Auth state
const ContinueWatchingSection: React.FC = () => {
    const [watching, setWatching] = useState<UserProgress[]>([]);
    const [isLoadingProgress, setIsLoadingProgress] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        const fetchProgress = async () => {
            setIsLoadingProgress(true);
            setError(null);
            if (authLoading) return;

            if (user) {
                try {
                    const data = await getUserProgress(user.uid);
                    const watchingList = Object.values(data)
                        .filter(p => p.status === 'Watching')
                        .sort((a, b) => b.lastUpdated - a.lastUpdated);
                    setWatching(watchingList);
                } catch (e: any) {
                    setError(e.message);
                }
            } else {
                setWatching([]);
            }
            setIsLoadingProgress(false);
        };

        fetchProgress();
    }, [user, authLoading]);

    if (authLoading) {
        return null; // Don't show anything until auth state is resolved
    }

    if (!user) {
        return null; // Hide if not logged in.
    }

    if (error) {
        return (
            <section className="mb-12">
                <div className="max-w-[1600px] mx-auto px-4 md:px-6">
                     <div className="bg-red-900/20 border border-red-500/30 p-4 text-center rounded-md flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <h3 className="text-red-400 font-bold uppercase text-sm">Continue Watching Offline</h3>
                        </div>
                        <p className="text-zinc-400 text-xs font-mono">{error}</p>
                     </div>
                </div>
            </section>
        );
    }

    if (watching.length === 0 && !isLoadingProgress) {
        return null;
    }

    return (
        <section className="mb-8 md:mb-12 relative group">
            <div className="max-w-[1600px] mx-auto px-3 md:px-6">
                <div className="flex items-end justify-between mb-3 md:mb-4 border-l-4 border-brand-400 pl-3 md:pl-4">
                     <div>
                        <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-wide font-display italic">
                            Continue Session
                        </h2>
                        <p className="text-brand-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-0.5">Resume Playback</p>
                    </div>
                </div>

                <div className="relative -mx-3 md:-mx-6 px-3 md:px-6">
                    <div className="flex overflow-x-auto gap-3 md:gap-5 pb-4 scrollbar-hide snap-x">
                        {isLoadingProgress ? (
                            [...Array(4)].map((_, i) => <ContinueWatchingCardSkeleton key={i} />)
                        ) : (
                            watching.map((item) => (
                                <ContinueWatchingCard key={item.animeId} progress={item} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export const Home: React.FC = () => {
  const { data, isLoading, isError, error } = useApi<HomeData>(constructUrl('home'));
  const { data: genresData } = useApi<string[]>(constructUrl('genres')); // Fetch genres dynamically

  if (isLoading) return <HomeSkeleton />;
  if (isError) return (
      <div className="h-screen flex flex-col items-center justify-center bg-dark-950 text-center px-4">
        <AlertCircle className="w-16 h-16 text-brand-400 mb-4 opacity-50" />
        <h1 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">System Error</h1>
        <p className="text-zinc-500 font-mono text-sm">{error?.message || "Failed to load content"}</p>
      </div>
  );

  const spotlight = data?.spotlight || data?.spotlightAnimes || [];
  const trending = data?.trending || data?.trendingAnimes || [];
  const topAiring = data?.topAiring || data?.topAiringAnimes || [];
  const topUpcoming = data?.topUpcoming || data?.topUpcomingAnimes || [];
  const latestEpisode = data?.latestEpisode || data?.latestEpisodeAnimes || [];
  const top10 = data?.top10?.week || data?.top10Animes?.week || [];

  const defaultGenres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mecha", "Music", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller", "Mystery", "Psychological"];
  const displayGenres = genresData && genresData.length > 0 ? genresData : defaultGenres;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen pb-20 bg-dark-950"
    >
      
      {/* Hero Section - Hidden on mobile */}
      <div className="hidden md:block">
        {spotlight.length > 0 && <Hero items={spotlight} />}
      </div>

      {/* Content pulled up slightly to overlap hero fade with z-index correction - Adjusted for less overlap */}
      <div className={`relative z-40 space-y-4 ${spotlight.length > 0 ? 'md:-mt-16 -mt-0 pt-20 md:pt-0' : 'pt-24'}`}>
        
        {/* Real Continue Watching Section */}
        <ContinueWatchingSection />

        {/* Latest Releases */}
        <HorizontalSection 
            title="Latest Updates" 
            subtitle="Fresh Releases"
            items={latestEpisode} 
            link="/animes/recently-updated"
        />

        {/* Catch Up Before New Season (Trending) */}
        <HorizontalSection 
            title="Trending Now" 
            items={trending} 
            link="/animes/trending"
        />

        {/* Top 10 Ranking */}
        <HorizontalSection 
            title="Leaderboard" 
            subtitle="Global Top 10"
            items={top10} 
        />

        {/* Top Airing */}
        <HorizontalSection 
            title="Top Airing" 
            items={topAiring} 
            link="/animes/top-airing"
        />

        {/* Upcoming */}
        <HorizontalSection 
            title="Coming Soon" 
            items={topUpcoming} 
            link="/animes/top-upcoming"
        />
        
        {/* Kickstart Your Journey (Discovery) - Dynamic Genres - CLEAN GRID LAYOUT */}
        <div className="py-8 md:py-16 bg-gradient-to-b from-dark-900 to-dark-950 border-t border-white/5 mt-12">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                        <LayoutGrid className="w-6 h-6 text-brand-400" />
                        <div>
                            <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-wide font-display italic">
                                Explore <span className="text-brand-400">Genres</span>
                            </h2>
                            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mt-1">Categorized Database</p>
                        </div>
                     </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {displayGenres.map((genre) => (
                    <Link 
                        key={genre} 
                        to={`/animes/${genre.toLowerCase().replace(/ /g, '-')}`}
                        className="group relative overflow-hidden bg-dark-800 border border-white/5 hover:border-brand-400/50 rounded-sm p-4 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(255,0,51,0.1)]"
                    >
                        {/* Hover Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-400/0 via-brand-400/0 to-brand-400/5 group-hover:to-brand-400/10 transition-all duration-500" />
                        
                        {/* Text */}
                        <span className="relative z-10 text-xs md:text-sm font-bold text-zinc-400 group-hover:text-white uppercase tracking-widest transition-colors">
                            {genre}
                        </span>
                        
                        {/* Decorative Corner */}
                        <div className="absolute top-0 right-0 w-0 h-0 border-t-[6px] border-r-[6px] border-t-transparent border-r-white/5 group-hover:border-r-brand-400 transition-colors duration-300" />
                        <div className="absolute bottom-0 left-0 w-0 h-0 border-b-[6px] border-l-[6px] border-b-transparent border-l-white/5 group-hover:border-l-brand-400 transition-colors duration-300" />
                    </Link>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </motion.div>
  );
};