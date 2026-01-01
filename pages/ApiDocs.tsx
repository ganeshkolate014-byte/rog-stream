import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Server, Copy, Check, ChevronRight, Zap, Globe, Shield, Code2, Cpu } from 'lucide-react';
import { DEFAULT_CONFIG } from '../services/api';

// --- Components ---

const MethodBadge: React.FC<{ method: string }> = ({ method }) => {
  const colors = {
    GET: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    POST: 'bg-green-500/10 text-green-400 border-green-500/20',
    PUT: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const style = colors[method as keyof typeof colors] || colors.GET;

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${style}`}>
      {method}
    </span>
  );
};

const CodeTerminal: React.FC<{ title: string; code: string }> = ({ title, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-lg overflow-hidden border border-white/10 bg-[#0D0D0D] shadow-2xl relative group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
           <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
           <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
           <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
        <div className="text-xs font-mono text-zinc-500 flex items-center gap-2">
            <Code2 className="w-3 h-3" /> {title}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-x-auto relative">
         <pre className="font-mono text-xs md:text-sm leading-relaxed text-zinc-300">
             {code.split('\n').map((line, i) => (
                 <div key={i} className="table-row">
                     <span className="table-cell text-zinc-700 select-none text-right pr-4 w-8">{i + 1}</span>
                     <span className="table-cell whitespace-pre">{line}</span>
                 </div>
             ))}
         </pre>
      </div>

      {/* Copy Button */}
      <button 
        onClick={handleCopy}
        className="absolute top-12 right-4 p-2 bg-zinc-800/80 backdrop-blur-md border border-white/10 rounded hover:bg-zinc-700 hover:text-white text-zinc-400 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
};

const EndpointCard: React.FC<{ 
    name: string; 
    path: string; 
    method: string; 
    desc: string; 
    params?: string[];
    index: number 
}> = ({ name, path, method, desc, params, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        className="group relative bg-dark-900/40 border border-white/5 rounded-lg p-5 hover:border-brand-400/30 hover:bg-dark-900/60 transition-all duration-300"
    >
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-400 to-purple-600 rounded-lg opacity-0 group-hover:opacity-10 transition duration-500 blur-lg" />
        
        <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <MethodBadge method={method} />
                    <h3 className="font-bold text-zinc-200 text-sm md:text-base">{name}</h3>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-black/50 border border-white/5 rounded px-3 py-2 mb-3 font-mono text-xs md:text-sm text-zinc-400 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <span className="text-brand-400 font-bold select-none">$</span>
                <span className="text-zinc-300">{path}</span>
            </div>

            <p className="text-xs md:text-sm text-zinc-500 leading-relaxed mb-3">
                {desc}
            </p>

            {params && params.length > 0 && (
                <div className="border-t border-white/5 pt-3 mt-3">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 block">Parameters</span>
                    <div className="flex flex-wrap gap-2">
                        {params.map(p => (
                            <span key={p} className="text-[10px] font-mono px-1.5 py-0.5 bg-white/5 rounded text-zinc-400 border border-white/5">
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </motion.div>
);

export const ApiDocs: React.FC = () => {
  const exampleCode = `
// Initialize Configuration
const config = {
  baseUrl: "${DEFAULT_CONFIG.baseUrl}",
  apiKey: "optional_public_key"
};

// Fetch Anime Details
async function getAnimeInfo(id) {
  try {
    const res = await fetch(\`\${config.baseUrl}/anime/hianime/info?id=\${id}\`);
    const data = await res.json();
    
    console.log("📺 Title:", data.title);
    console.log("⭐️ Episodes:", data.episodes.length);
    return data;
    
  } catch (err) {
    console.error("API Error:", err);
  }
}

// Execute
getAnimeInfo("one-piece-100");
  `.trim();

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20 relative overflow-hidden font-sans">
      
      {/* Background Grid - CSS Only for Performance */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" 
           style={{ 
               backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
           }} 
      />
      
      {/* Ambient Orbs */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-brand-400/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-400/10 border border-brand-400/20 text-brand-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                    <Cpu className="w-3 h-3" /> v1.0 Public Beta
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-white font-display italic tracking-tighter mb-4">
                    DEVELOPER <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-500">API</span>
                </h1>
                <p className="text-zinc-400 max-w-xl mx-auto text-sm md:text-lg">
                    Build your own anime discovery platform with our high-performance, RESTful JSON API.
                </p>
            </motion.div>
        </div>

        {/* Main Layout: Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Documentation (Scrollable) */}
            <div className="lg:col-span-7 space-y-12">
                
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Uptime", val: "99.9%", icon: Server },
                        { label: "Latency", val: "<50ms", icon: Zap },
                        { label: "Access", val: "Public", icon: Globe },
                    ].map((stat, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-dark-900/50 border border-white/5 p-4 rounded-lg text-center backdrop-blur-sm"
                        >
                            <stat.icon className="w-5 h-5 text-zinc-500 mx-auto mb-2" />
                            <div className="text-xl font-bold text-white font-mono">{stat.val}</div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Section: Endpoints */}
                <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Terminal className="w-6 h-6 text-brand-400" /> Endpoints
                    </h2>
                    
                    <div className="space-y-4">
                        <EndpointCard 
                            index={1}
                            name="Home Feed"
                            method="GET"
                            path={DEFAULT_CONFIG.endpoints.home}
                            desc="Returns trending anime, spotlights, and latest episodes for the homepage dashboard."
                        />
                        <EndpointCard 
                            index={2}
                            name="Anime Details"
                            method="GET"
                            path="/anime/hianime/info"
                            desc="Get full metadata including synopsis, episodes, and related media."
                            params={["id (required): The anime ID"]}
                        />
                        <EndpointCard 
                            index={3}
                            name="Stream Sources"
                            method="GET"
                            path="/anime/episode-srcs"
                            desc="Fetch HLS streaming links (m3u8) and subtitle tracks."
                            params={["id (required): The episode ID"]}
                        />
                         <EndpointCard 
                            index={4}
                            name="Search"
                            method="GET"
                            path="/anime/hianime/{query}"
                            desc="Search for anime by title keywords."
                            params={["page (optional): Pagination"]}
                        />
                        <EndpointCard 
                            index={5}
                            name="Schedule"
                            method="GET"
                            path="/anime/hianime/schedule"
                            desc="Get the daily airing schedule (JST)."
                        />
                    </div>
                </div>

                {/* Section: Authentication */}
                <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-lg">
                    <div className="flex items-start gap-4">
                        <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-1">Authentication</h3>
                            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
                                The API is currently open for public read access. Rate limits are applied per IP address to prevent abuse. 
                                For commercial use or higher limits, please contact support.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Column: Code Example (Sticky on Desktop) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <Code2 className="w-4 h-4" /> Usage Example
                    </h2>
                    <span className="text-[10px] bg-brand-400/10 text-brand-400 px-2 py-0.5 rounded border border-brand-400/20 font-bold uppercase">JS / TS</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <CodeTerminal title="client.js" code={exampleCode} />
                </motion.div>

                <div className="bg-dark-900/50 border border-white/5 p-4 rounded-lg backdrop-blur-sm">
                    <h3 className="text-xs font-bold text-white uppercase mb-2">Response Format</h3>
                    <p className="text-zinc-500 text-xs mb-3">All endpoints return a standard JSON envelope.</p>
                    <div className="font-mono text-[10px] text-zinc-400 bg-black/50 p-3 rounded border border-white/5">
                        {`{
  "success": true,
  "data": { ... }
}`}
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-600 mt-8 justify-center">
                    <span>Powered by HiAnime Scraper</span>
                    <span>•</span>
                    <span>JSON REST</span>
                    <span>•</span>
                    <span>Vercel Edge</span>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};