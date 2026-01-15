import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Send, ExternalLink } from 'lucide-react';

export const Support: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20 px-4 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-400/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white italic font-display uppercase tracking-tighter mb-4">
            Support <span className="text-brand-400">Developer</span>
          </h1>
          <p className="text-zinc-400 max-w-lg mx-auto font-mono text-sm">
            Get in touch for support, feedback, or just to say hi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Telegram */}
            <motion.a
                href="https://t.me/Mysticsukuna"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="group bg-dark-900 border border-dark-700 p-8 flex flex-col items-center justify-center rounded-sm hover:border-brand-400/50 transition-colors"
            >
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                    <Send className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-2">Telegram</h3>
                <p className="text-zinc-500 font-mono text-sm mb-6">t.me/Mysticsukuna</p>
                <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-widest group-hover:text-brand-300">
                    Contact <ExternalLink className="w-3 h-3" />
                </div>
            </motion.a>

            {/* Instagram */}
            <motion.a
                href="https://instagram.com/sw.4pn1l.fx"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group bg-dark-900 border border-dark-700 p-8 flex flex-col items-center justify-center rounded-sm hover:border-brand-400/50 transition-colors"
            >
                <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-pink-500/20 transition-colors">
                    <Instagram className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-2">Instagram</h3>
                <p className="text-zinc-500 font-mono text-sm mb-6">@sw.4pn1l.fx</p>
                <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-widest group-hover:text-brand-300">
                    Follow <ExternalLink className="w-3 h-3" />
                </div>
            </motion.a>
        </div>
      </div>
    </div>
  );
};
