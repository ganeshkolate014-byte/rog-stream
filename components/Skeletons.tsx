import React from 'react';

// Enhanced Skeleton with Shimmer
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`skeleton-shimmer rounded-sm ${className}`} />
);

export const AnimeCardSkeleton: React.FC = () => (
  <div className="flex-shrink-0 w-full mb-6">
    {/* Card Image Area */}
    <div className="relative aspect-[2/3] w-full overflow-hidden bg-dark-800 mb-3 border border-dark-700">
       <Skeleton className="absolute inset-0 w-full h-full" />
       {/* Badge Placeholder */}
       <Skeleton className="absolute top-0 left-0 w-8 h-8 rounded-none" />
    </div>
    
    {/* Text Content */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-2">
             <Skeleton className="h-3 w-10" />
             <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-3 w-3" />
      </div>
    </div>
  </div>
);

export const HeroSkeleton: React.FC = () => (
  <div className="relative w-full aspect-video md:h-[80vh] bg-dark-950 overflow-hidden flex items-end">
    <div className="absolute inset-0 skeleton-shimmer opacity-20" />
    
    {/* Gradient Overlay Simulation */}
    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/50 to-transparent" />

    <div className="relative z-10 max-w-[1600px] w-full mx-auto px-4 md:px-12 pb-16 md:pb-24">
        <div className="max-w-2xl space-y-6">
            {/* Title Block */}
            <Skeleton className="h-12 md:h-20 w-3/4 rounded-sm" />
            <Skeleton className="h-12 md:h-20 w-1/2 rounded-sm" />
            
            {/* Meta Tags */}
            <div className="flex gap-3 pt-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-24" />
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2 hidden md:block">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
                <Skeleton className="h-12 w-40 skew-x-[-12deg]" />
                <Skeleton className="h-12 w-14 skew-x-[-12deg]" />
            </div>
        </div>
    </div>
  </div>
);

export const SectionSkeleton: React.FC = () => (
  <div className="mb-12 relative group">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-4 border-l-4 border-dark-800 pl-4">
              <div className="space-y-2">
                   <Skeleton className="h-6 w-48 md:w-64" />
                   <Skeleton className="h-3 w-24" />
              </div>
          </div>
          
          {/* Horizontal Row */}
          <div className="flex gap-4 overflow-hidden">
               {[...Array(6)].map((_, i) => (
                   <div key={i} className="w-[160px] md:w-[200px] flex-shrink-0">
                       <AnimeCardSkeleton />
                   </div>
               ))}
          </div>
      </div>
  </div>
);

export const HomeSkeleton: React.FC = () => (
  <div className="min-h-screen bg-dark-950 pb-20 overflow-hidden">
      <HeroSkeleton />
      
      {/* Pull up content to match Home.tsx layout */}
      <div className="relative z-40 -mt-10 md:-mt-16 space-y-2">
           <SectionSkeleton />
           <SectionSkeleton />
           <SectionSkeleton />
           <SectionSkeleton />
      </div>
  </div>
);

export const DetailSkeleton: React.FC = () => (
  <div className="min-h-screen bg-dark-900 pb-20">
      {/* Banner Area */}
      <div className="relative w-full h-[50vh] md:h-[600px] bg-dark-950 overflow-hidden">
          <Skeleton className="absolute inset-0 w-full h-full opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 max-w-[1400px] mx-auto">
             <div className="flex gap-3 mb-6">
                <Skeleton className="h-6 w-20 skew-x-[-12deg]" />
                <Skeleton className="h-6 w-16 skew-x-[-12deg]" />
             </div>
             <Skeleton className="h-12 md:h-20 w-3/4 md:w-1/2 mb-4" />
             <Skeleton className="h-8 w-1/3 mb-8" />
             <div className="flex gap-8 border-t border-white/5 pt-6">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
             </div>
          </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
               {/* Description */}
               <div className="bg-dark-800/30 p-6 border border-dark-700">
                   <Skeleton className="h-4 w-full mb-3" />
                   <Skeleton className="h-4 w-full mb-3" />
                   <Skeleton className="h-4 w-5/6 mb-3" />
                   <Skeleton className="h-4 w-4/6" />
               </div>

               {/* Genres */}
               <div className="flex gap-2">
                   <Skeleton className="h-8 w-24 skew-x-[-12deg]" />
                   <Skeleton className="h-8 w-24 skew-x-[-12deg]" />
                   <Skeleton className="h-8 w-24 skew-x-[-12deg]" />
               </div>

               {/* Episodes Grid */}
               <div>
                   <div className="flex justify-between mb-8">
                       <Skeleton className="h-8 w-48" />
                       <Skeleton className="h-8 w-24" />
                   </div>
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-dark-800 p-4 border border-dark-700 h-24 flex flex-col justify-between">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        ))}
                   </div>
               </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
              <div className="border border-dark-700 p-1 bg-dark-800">
                  <Skeleton className="w-full aspect-[2/3]" />
              </div>
              <Skeleton className="h-14 w-full skew-x-[-12deg]" />
              
              <div className="bg-dark-800 p-6 border border-dark-700 space-y-4">
                  <Skeleton className="h-6 w-32 mb-6" />
                  {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-32" />
                      </div>
                  ))}
              </div>
          </div>
      </div>
  </div>
);

export const SideCardSkeleton: React.FC = () => (
  <div className="flex gap-4 p-2 items-center">
    <Skeleton className="w-16 h-24 rounded-sm flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);