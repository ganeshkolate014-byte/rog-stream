import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Bookmark, Volume2 } from 'lucide-react';
import { Anime } from '../types';

interface HeroProps {
  items: Anime[];
}

export const Hero: React.FC<HeroProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // UI Config State with defaults
  const [config, setConfig] = useState({
      interval: 8000,
      showTitle: true,
      titleColor: '#ffffff',
      titleSize: 'large',
      aspectRatio: '16:9' // Default to 16:9
  });

  useEffect(() => {
    // Load config from localStorage
    try {
        const stored = localStorage.getItem('ui_config');
        if (stored) {
            const parsed = JSON.parse(stored);
            setConfig({
                interval: Number(parsed.slideInterval) || 8000,
                showTitle: parsed.showHeroTitle !== undefined ? parsed.showHeroTitle : true,
                titleColor: parsed.heroTitleColor || '#ffffff',
                titleSize: parsed.heroTitleFontSize || 'large',
                aspectRatio: parsed.heroAspectRatio || '16:9'
            });
        }
    } catch (e) {
        console.error("Failed to load UI config");
    }
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, config.interval); // Use config.interval
    return () => clearInterval(interval);
  }, [items, config.interval]);

  // Helper to get Tailwind classes based on size setting
  const getTitleSizeClasses = (size: string) => {
      switch(size) {
          case 'small': return 'text-xl md:text-3xl lg:text-4xl';
          case 'normal': return 'text-2xl md:text-4xl lg:text-5xl';
          case 'large': return 'text-3xl md:text-5xl lg:text-6xl';
          case 'massive': return 'text-4xl md:text-7xl lg:text-8xl';
          default: return 'text-3xl md:text-5xl lg:text-6xl';
      }
  };

  // Helper for Aspect Ratio
  const getAspectRatioClass = () => {
    switch(config.aspectRatio) {
        case '16:9': return 'aspect-video';
        case 'cinematic': return 'h-[50vh] md:h-[80vh]';
        case 'fullscreen': return 'h-screen';
        default: return 'aspect-video';
    }
  };

  if (!items || items.length === 0) return null;
  const current = items[currentIndex];

  // Fallback if banner is missing, prioritize banner for 16:9
  const heroImage = current.banner || current.image || current.poster;

  return (
    <div className={`relative w-full ${getAspectRatioClass()} overflow-hidden bg-[#050505] group font-sans transition-all duration-500`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
           {/* Layer 1: Background Image */}
           <div className="absolute inset-0">
                <img
                  src={heroImage}
                  alt={current.title}
                  className="w-full h-full object-cover object-center"
                />
                 {/* Vignette / Gradients - OPTIMIZED FOR PERFECT FADE */}
                 
                 {/* 1. Left Gradient (Main Text Backdrop) - Wide and Smooth */}
                 <div className="absolute inset-y-0 left-0 w-full md:w-[65%] bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
                 
                 {/* 2. Bottom Gradient (Seamless Blend) - Reduced opacity for cleaner look */}
                 <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                 
                 {/* 3. Base Gradient to ensure footer connection (very subtle) */}
                 <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#050505] to-transparent" />

                 {/* 4. Top Gradient (Navbar Visibility) */}
                 <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#050505]/80 to-transparent" />
           </div>

          {/* Layer 2: Content Container - CHANGED: items-center to items-end for bottom alignment */}
          <div className="absolute inset-0 flex items-end justify-start z-30 pointer-events-none">
            {/* Added bottom padding to lift content off the edge */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-12 w-full pb-16 md:pb-24 pointer-events-auto">
              <div className="max-w-2xl flex flex-col items-start text-left relative z-40">
                
                {/* Brand/Logo Area (Title) */}
                {config.showTitle && (
                    <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-4"
                    >
                        {/* Render Title with Dynamic Styles */}
                        <h1 
                            className={`${getTitleSizeClasses(config.titleSize)} font-black leading-[0.9] uppercase tracking-tighter font-display mb-2 line-clamp-2 drop-shadow-xl`}
                            style={{ color: config.titleColor }}
                        >
                            {current.title}
                        </h1>
                    </motion.div>
                )}

                {/* Metadata Tags */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap items-center gap-3 mb-6 text-[10px] md:text-xs font-bold text-zinc-300 uppercase tracking-widest drop-shadow-md"
                >
                  <span className="text-brand-400 flex items-center gap-1">
                     <Volume2 className="w-3 h-3" />
                     {current.type || 'Series'}
                  </span>
                  <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                  <span className="text-zinc-300">{current.year || '2024'}</span>
                  <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                  <div className="flex gap-1">
                     <span className="px-1.5 py-0.5 bg-zinc-800/80 border border-zinc-700 rounded-sm text-zinc-400">SUB</span>
                     <span className="px-1.5 py-0.5 bg-zinc-800/80 border border-zinc-700 rounded-sm text-zinc-400">DUB</span>
                  </div>
                </motion.div>

                {/* Description - Optional for Hero but looks good on large screens */}
                {current.description && (
                   <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="text-zinc-400 text-sm line-clamp-3 mb-6 max-w-lg hidden md:block font-medium shadow-black drop-shadow-md"
                   >
                      {current.description}
                   </motion.p>
                )}

                {/* Action Buttons */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3 w-full md:w-auto"
                >
                  <Link
                    to={`/watch/${encodeURIComponent(current.id)}`}
                    className="flex-1 md:flex-none h-10 md:h-12 px-6 md:px-8 bg-brand-400 hover:bg-white hover:text-black text-black font-black uppercase tracking-widest transition-all skew-x-[-12deg] flex items-center justify-center gap-2 group/btn shadow-[0_0_20px_rgba(255,0,51,0.2)]"
                  >
                    <Play className="w-4 h-4 md:w-5 md:h-5 fill-black skew-x-[12deg] group-hover/btn:scale-110 transition-transform" />
                    <span className="text-xs md:text-sm skew-x-[12deg] whitespace-nowrap pt-0.5">Start Watching</span>
                  </Link>
                  
                  <button className="h-10 md:h-12 w-12 md:w-14 flex items-center justify-center border-2 border-brand-400/50 bg-black text-brand-400 hover:bg-brand-400 hover:text-black hover:border-brand-400 transition-all skew-x-[-12deg] group/bm">
                     <Bookmark className="w-4 h-4 md:w-5 md:h-5 skew-x-[12deg] group-hover/bm:fill-current" />
                  </button>
                </motion.div>

              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation Indicators */}
      <div className="absolute right-6 bottom-6 z-40 flex flex-col gap-2">
          {items.map((_, idx) => (
              <button 
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-brand-400 h-6' : 'bg-white/30 hover:bg-white'}`}
              />
          ))}
      </div>
    </div>
  );
};