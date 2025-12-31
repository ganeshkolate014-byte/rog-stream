import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi, constructUrl } from '../services/api';
import { HomeData, Anime, HistoryItem } from '../types';
import { Hero } from '../components/Hero';
import { AnimeCard } from '../components/AnimeCard';
import { HomeSkeleton } from '../components/Skeletons';
import { ChevronRight, AlertCircle, Play } from 'lucide-react';

const HorizontalSection: React.FC<{ title: string; items: Anime[]; variant?: 'portrait' | 'landscape'; link?: string; subtitle?: string }> = ({ 
    title, items, variant = 'portrait', link, subtitle 
}) => {
    if (!items || items.length === 0) return null;

    return (
        <section className="mb-12 relative group">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="flex items-end justify-between mb-4 border-l-4 border-brand-400 pl-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide font-display italic">
                            {title}
                        </h2>
                        {subtitle && <p className="text-brand-400 text-xs font-bold uppercase tracking-widest mt-0.5">{subtitle}</p>}
                    </div>
                    {link && (
                        <Link to={link} className="hidden md:flex items-center text-xs font-bold text-zinc-500 hover:text-brand-400 uppercase tracking-widest transition-colors">
                            View All <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                    )}
                </div>

                {/* Scroll Container */}
                <div className="relative -mx-4 md:-mx-6 px-4 md:px-6">
                    <div className="flex overflow-x-auto gap-3 md:gap-4 pb-4 scrollbar-hide snap-x">
                        {items.map((anime, idx) => (
                            <div key={anime.id} className="snap-start">
                                <AnimeCard anime={anime} variant={variant} rank={subtitle === 'Global Top 10' ? idx + 1 : undefined} />
                            </div>
                        ))}
                        
                        {/* View All Card at the end */}
                        {link && (
                             <div className="snap-start flex-shrink-0 w-[100px] flex items-center justify-center">
                                <Link to={link} className="w-12 h-12 rounded-none border border-white/20 flex items-center justify-center hover:bg-brand-400 hover:text-black hover:border-brand-400 transition-all skew-x-[-12deg]">
                                    <ChevronRight className="w-6 h-6 skew-x-[12deg]" />
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

// Separate component for Continue Watching based on local storage history
const ContinueWatchingSection: React.FC = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('watch_history');
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch (e) {}
    }, []);

    if (history.length === 0) return null;

    return (
        <section className="mb-12 relative group">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6">
                <div className="flex items-end justify-between mb-4 border-l-4 border-brand-400 pl-4">
                     <div>
                        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide font-display italic">
                            Continue Session
                        </h2>
                        <p className="text-brand-400 text-xs font-bold uppercase tracking-widest mt-0.5">Resume Playback</p>
                    </div>
                </div>

                <div className="relative -mx-4 md:-mx-6 px-4 md:px-6">
                    <div className="flex overflow-x-auto gap-3 md:gap-4 pb-4 scrollbar-hide snap-x">
                        {history.map((item) => (
                             <div key={item.episodeId} className="w-[280px] md:w-[320px] flex-shrink-0 group snap-start">
                                <Link to={`/watch/${encodeURIComponent(item.episodeId)}`} className="block">
                                    <div className="relative aspect-video bg-dark-800 overflow-hidden rounded-sm border border-white/5 group-hover:border-brand-400/50 transition-all">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                        
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-black/80 border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-400 group-hover:border-brand-400 transition-all">
                                                <Play className="w-4 h-4 fill-white text-white group-hover:fill-black group-hover:text-black ml-0.5" />
                                            </div>
                                        </div>

                                        <div className="absolute bottom-3 left-3 right-3">
                                            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest mb-0.5 line-clamp-1">
                                                {item.title}
                                            </h4>
                                            <h3 className="text-brand-400 font-bold text-sm uppercase">
                                                Episode {item.episodeNumber}
                                            </h3>
                                        </div>
                                    </div>
                                </Link>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export const Home: React.FC = () => {
  const { data, isLoading, isError, error } = useApi<HomeData>(constructUrl('home'));

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

  return (
    <div className="min-h-screen pb-20 bg-dark-950">
      
      {/* Hero Section */}
      {spotlight.length > 0 && <Hero items={spotlight} />}

      {/* Content pulled up slightly to overlap hero fade with z-index correction - Adjusted for less overlap */}
      <div className="relative z-40 -mt-10 md:-mt-16 space-y-4">
        
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
        
        {/* Kickstart Your Journey (Discovery) */}
        <div className="py-12 bg-dark-900 border-y border-brand-400/10">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6">
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide font-display mb-6">
                    Select Genre
                </h2>
                <div className="flex flex-wrap gap-3">
                    {["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mecha", "Music", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller"].map((genre) => (
                    <Link 
                        key={genre} 
                        to={`/animes/${genre.toLowerCase().replace(/ /g, '-')}`}
                        className="px-6 py-3 bg-dark-800 hover:bg-brand-400 hover:text-black border border-white/5 hover:border-brand-400 rounded-none text-zinc-400 font-bold uppercase tracking-wider transition-all duration-200 skew-x-[-12deg]"
                    >
                        <span className="block skew-x-[12deg]">{genre}</span>
                    </Link>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};