import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useApi } from '../services/api';
import { CategoryResult } from '../types';
import { AnimeCard } from '../components/AnimeCard';
import { AnimeCardSkeleton } from '../components/Skeletons';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

export const Category: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  
  // List of endpoints that are NOT genres and reside at /animes/{endpoint}
  const staticLists = [
    'top-airing', 'most-popular', 'most-favorite', 'completed', 
    'recently-added', 'recently-updated', 'top-upcoming', 
    'subbed-anime', 'dubbed-anime', 'movie', 'tv', 'ova', 'ona', 'special', 'events', 'trending'
  ];

  const isStaticList = category && staticLists.includes(category);
  
  // If it's not a static list, we assume it's a genre and use /animes/genre/{category}
  const endpoint = isStaticList 
    ? `/animes/${category}?page=${page}`
    : `/animes/genre/${category}?page=${page}`;

  const { data: categoryResult, isLoading, error } = useApi<CategoryResult>(
      category ? endpoint : ''
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [category, page]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  const formatTitle = (str: string) => str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  const animes = categoryResult?.response || categoryResult?.animes || [];
  const hasNextPage = categoryResult?.hasNextPage ?? categoryResult?.pageInfo?.hasNextPage;

  return (
    <div className="min-h-screen bg-dark-900 pt-28 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-10 border-l-8 border-brand-500 pl-6">
          {category ? formatTitle(category) : 'Anime List'}
        </h1>

        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-500/5 rounded-3xl border border-red-500/10">
             <AlertCircle className="w-12 h-12 mb-4" />
             <p className="font-bold text-center px-4">{error.message || "Failed to load content"}</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {[...Array(10)].map((_, i) => (
              <AnimeCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {animes.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>

            {animes.length === 0 && (
               <div className="text-center text-zinc-500 py-32 font-medium bg-white/5 rounded-3xl mt-8">No anime found in this category.</div>
            )}

            {/* Pagination */}
            {animes.length > 0 && (
              <div className="flex justify-center items-center gap-4 mt-16 pb-20 md:pb-0">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="p-3 rounded-full bg-zinc-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:text-black transition-all active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <span className="text-white font-bold bg-zinc-800 px-6 py-2 rounded-full border border-white/5">
                  Page {page}
                </span>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!hasNextPage}
                  className="p-3 rounded-full bg-zinc-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:text-black transition-all active:scale-95"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};