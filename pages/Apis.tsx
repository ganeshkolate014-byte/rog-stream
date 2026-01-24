import React, { useState } from 'react';
import { Clipboard, Check, Terminal, Globe, PlayCircle } from 'lucide-react';

const CopyBtn = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={handleCopy} className="text-zinc-500 hover:text-brand-400 transition-colors" title="Copy URL">
      {copied ? <Check size={16} /> : <Clipboard size={16} />}
    </button>
  )
}

const Endpoint = ({ title, method, url, desc, params, example }: any) => (
  <div className="mb-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-brand-400/30 transition-colors">
    <div className="flex items-center gap-3 mb-3">
      <span className={`font-bold px-2 py-1 text-[10px] rounded uppercase tracking-wider ${method === 'GET' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-green-500/10 text-green-400'}`}>
        {method}
      </span>
      <h3 className="text-xl font-bold text-white font-display uppercase tracking-wide">{title}</h3>
    </div>
    
    <div className="flex items-center gap-3 bg-black/40 p-3 rounded mb-4 font-mono text-xs md:text-sm text-zinc-300 border border-white/5 group">
      <Globe className="w-4 h-4 text-zinc-600 group-hover:text-brand-400 transition-colors" />
      <span className="flex-1 truncate select-all">{url}</span>
      <CopyBtn text={url} />
    </div>

    <p className="text-zinc-400 text-sm leading-relaxed mb-4 border-l-2 border-zinc-700 pl-3">
      {desc}
    </p>

    {params && (
      <div className="mb-4">
        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2 tracking-widest">Parameters Needed</h4>
        <ul className="grid gap-2">
          {params.map((p: string, i: number) => (
            <li key={i} className="text-xs text-zinc-300 flex items-start gap-2 bg-white/5 p-2 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0"></span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    )}

    {example && (
        <div className="mt-4 pt-4 border-t border-white/5">
             <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2 tracking-widest">Example Usage (JavaScript)</h4>
             <div className="bg-[#0d0d0d] p-3 rounded border border-white/5 font-mono text-xs text-zinc-400 overflow-x-auto">
                <pre>{example}</pre>
             </div>
        </div>
    )}
  </div>
)

export const Apis: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 font-display italic tracking-tighter">
                SIMPLE <span className="text-brand-400">API</span> GUIDE
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
               This is a secret developer page. Here you can find all the API endpoints used in ROG Stream and how to use them in your own projects.
            </p>
        </div>
        
        <div className="space-y-4">
            
            <Endpoint 
            title="1. Get Home Page Data" 
            method="GET" 
            url="https://backendweb-ivory.vercel.app/api/v1/home"
            desc="This is the most important endpoint. It gives you everything for the homepage: Spotlight anime, Trending list, Top Upcoming, and Latest Episodes."
            example={`fetch('https://backendweb-ivory.vercel.app/api/v1/home')\n  .then(res => res.json())\n  .then(data => console.log(data));`}
            />

            <Endpoint 
            title="2. Search for Anime" 
            method="GET" 
            url="https://newanimebackend.vercel.app/anime/hianime/{query}?page=1"
            desc="Use this to search. Replace {query} with the name of the anime you want to find."
            params={[
                'query: The name of the anime (e.g. naruto)',
                'page: Page number (optional, defaults to 1)'
            ]}
            example={`// Search for "One Piece"\nfetch('https://newanimebackend.vercel.app/anime/hianime/one-piece?page=1')`}
            />

            <Endpoint 
            title="3. Get Anime Details" 
            method="GET" 
            url="https://newanimebackend.vercel.app/anime/hianime/info?id={id}"
            desc="Get full information about an anime, including description, genre, and total episodes."
            params={[
                'id: The unique ID of the anime (you get this from the Home or Search API)'
            ]}
            example={`// Get info for "one-piece"\nfetch('https://newanimebackend.vercel.app/anime/hianime/info?id=one-piece')`}
            />

            <Endpoint 
            title="4. Get Episodes List" 
            method="GET" 
            url="https://newanimebackend.vercel.app/anime/episodes/{id}"
            desc="Get the list of all episodes for a specific anime ID."
            params={[
                'id: The unique ID of the anime'
            ]}
            example={`fetch('https://newanimebackend.vercel.app/anime/episodes/one-piece')`}
            />

            <Endpoint 
            title="5. Get Stream Links (Video)" 
            method="GET" 
            url="https://newanimebackend.vercel.app/anime/episode-srcs?id={episodeId}&server=vidstreaming&category=sub"
            desc="This gives you the video file (m3u8) to play in a video player."
            params={[
                'id: The episode ID (e.g. one-piece-100$episode$1)',
                'server: vidstreaming (default) or megacloud',
                'category: sub (default) or dub'
            ]}
            example={`fetch('https://newanimebackend.vercel.app/anime/episode-srcs?id=one-piece-100$episode$1')`}
            />

             <Endpoint 
            title="6. Get Airing Schedule" 
            method="GET" 
            url="https://newanimebackend.vercel.app/anime/hianime/schedule"
            desc="Get the list of anime airing today in Japan."
            example={`fetch('https://newanimebackend.vercel.app/anime/hianime/schedule')`}
            />

        </div>

        <div className="mt-12 p-6 bg-brand-400/10 border border-brand-400/20 rounded-lg flex items-start gap-4">
            <Terminal className="w-6 h-6 text-brand-400 mt-1" />
            <div>
                <h4 className="text-white font-bold uppercase mb-2">Developer Note</h4>
                <p className="text-zinc-400 text-sm">
                    These APIs are free to use. Please do not spam requests to avoid getting blocked. 
                    Most endpoints are hosted on <span className="text-white font-mono">newanimebackend.vercel.app</span> except for the Home endpoint.
                </p>
            </div>
        </div>

      </div>
    </div>
  )
}