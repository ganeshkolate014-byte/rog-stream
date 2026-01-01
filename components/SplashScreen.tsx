import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: Initial Reveal
    const timer1 = setTimeout(() => setStage(1), 500);
    // Stage 2: Expand/Loading
    const timer2 = setTimeout(() => setStage(2), 2000);
    // Stage 3: Complete (Exit)
    const timer3 = setTimeout(() => {
        onComplete();
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ y: '-100%', opacity: 1, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
    >
        <div className="relative w-full max-w-lg px-6 flex flex-col items-center justify-center">
            
            {/* Animated Title */}
            <div className="relative overflow-hidden mb-8">
                <motion.h1 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-6xl md:text-8xl font-black text-white font-display italic tracking-tighter text-center leading-none"
                >
                    STREAMING
                </motion.h1>
                
                {/* Reveal Curtain for Text */}
                <motion.div 
                    initial={{ top: 0, bottom: 0 }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeInOut" }}
                    className="absolute left-0 right-0 bg-[#050505] z-10"
                />
            </div>

            {/* Subtext */}
            <motion.div
                initial={{ opacity: 0, letterSpacing: "0px" }}
                animate={{ opacity: 1, letterSpacing: "4px" }}
                transition={{ delay: 0.8, duration: 1 }}
                className="text-brand-400 font-bold uppercase text-xs md:text-sm"
            >
                Premium Anime Experience
            </motion.div>

            {/* Loading Bar */}
            <div className="absolute bottom-[-100px] w-64 h-1 bg-zinc-900 overflow-hidden rounded-full">
                <motion.div 
                    className="h-full bg-brand-400 shadow-[0_0_15px_#ff0033]"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />
            </div>

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-400/10 blur-[120px] rounded-full opacity-50 animate-pulse" />
            </div>

        </div>
    </motion.div>
  );
};