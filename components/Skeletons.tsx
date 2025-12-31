import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-zinc-800/50 ${className}`} />
);

export const AnimeCardSkeleton: React.FC = () => (
  <div className="space-y-3">
    <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden relative bg-zinc-800/50">
       {/* Optional shimmer effect overlay could go here */}
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4 rounded-full" />
      <div className="flex gap-2">
        <Skeleton className="h-3 w-10 rounded-full" />
        <Skeleton className="h-3 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

export const HeroSkeleton: React.FC = () => (
  <div className="relative h-[60vh] md:h-[75vh] w-full bg-zinc-900/50 overflow-hidden">
    <div className="absolute inset-0 bg-zinc-800/30" />
    <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
        <div className="w-full md:w-1/2 space-y-6 mt-16">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-12 md:h-20 w-3/4 rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="flex gap-4">
            <Skeleton className="h-12 w-40 rounded-full" />
            <Skeleton className="h-12 w-32 rounded-full" />
        </div>
        </div>
    </div>
  </div>
);

export const SideCardSkeleton: React.FC = () => (
  <div className="flex gap-4 p-2 items-center">
    <Skeleton className="w-16 h-24 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-full rounded-full" />
      <Skeleton className="h-3 w-1/2 rounded-full" />
    </div>
  </div>
);

export const DetailSkeleton: React.FC = () => (
  <div className="min-h-screen bg-dark-900 pb-20">
      <Skeleton className="h-[400px] w-full opacity-30" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-60 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-[300px] flex-shrink-0 flex flex-col gap-4">
            <Skeleton className="w-full aspect-[2/3] rounded-3xl shadow-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="flex-1 pt-12 md:pt-32 space-y-6">
            <Skeleton className="h-12 w-3/4 rounded-xl" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
            </div>
            <Skeleton className="h-40 w-full rounded-xl" />
            <div className="space-y-4 pt-8">
                 <Skeleton className="h-8 w-40 rounded-lg mb-4" />
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                     {[...Array(12)].map((_, i) => (
                         <Skeleton key={i} className="h-24 w-full rounded-xl" />
                     ))}
                 </div>
            </div>
          </div>
        </div>
      </div>
  </div>
);
