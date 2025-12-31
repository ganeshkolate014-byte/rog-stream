import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, Bell, Compass, Calendar, Flame, Settings, LogIn, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      // Increased threshold to 50 to prevent micro-jitters at top
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsMobileOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Trending', path: '/animes/trending' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Movies', path: '/animes/movie' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 h-20"
      >
        {/* Background Layer - Smooth Opacity Transition to prevent flickering */}
        <div 
            className={`absolute inset-0 bg-black border-b border-white/5 transition-opacity duration-300 ease-in-out ${
                isScrolled ? 'opacity-100 shadow-lg' : 'opacity-0 border-transparent'
            }`} 
        />
        
        {/* Gradient Overlay for Top Visibility (Always visible slightly for contrast) */}
        <div className={`absolute inset-0 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 ${isScrolled ? 'opacity-0' : 'opacity-100'}`} />

        <div className="relative z-20 max-w-[1600px] mx-auto px-4 md:px-8 h-full">
          <div className="flex items-center h-full gap-8">
            
            {/* Left: Logo & Links - Fixed Flex */}
            <div className="flex items-center gap-12 flex-shrink-0">
              <Link to="/" className="text-white hover:text-brand-400 transition-colors transform hover:scale-110 duration-200">
                <Home className="w-7 h-7" strokeWidth={2.5} />
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all skew-x-[-12deg] border-l-2 border-transparent hover:border-brand-400 hover:bg-brand-400/10 ${
                      isActive(link.path) ? 'text-brand-400 border-brand-400 bg-brand-400/10 shadow-[inset_0_0_10px_rgba(255,0,51,0.2)]' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="block skew-x-[12deg]">{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Center: Search - Stretches to fill space */}
            <div className="hidden md:flex flex-1 items-center justify-end max-w-4xl mx-auto">
              <form onSubmit={handleSearch} className="w-full relative group mt-1">
                <div className={`relative flex items-center border rounded-none px-4 py-2 transition-all duration-300 group-focus-within:border-brand-400 skew-x-[-12deg] w-full ${isScrolled ? 'bg-black border-zinc-800' : 'bg-black/60 border-white/10 backdrop-blur-sm'}`}>
                  <Search className="w-4 h-4 text-zinc-500 skew-x-[12deg] group-focus-within:text-brand-400 transition-colors flex-shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="INITIATE SEARCH..."
                    className="bg-transparent border-none outline-none text-base text-white placeholder-zinc-600 ml-3 w-full skew-x-[12deg] font-mono tracking-wider uppercase"
                  />
                  {/* Subtle Corner Accents */}
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-brand-400 opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-brand-400 opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                </div>
              </form>
            </div>

            {/* Right: Actions - Fixed Flex */}
            <div className="flex items-center gap-4 md:gap-6 flex-shrink-0 ml-auto md:ml-0">
              
              {/* Icons */}
              <div className="hidden md:flex items-center gap-6">
                <button className="text-zinc-400 hover:text-brand-400 transition-colors relative group">
                    <Bell className="w-5 h-5 group-hover:animate-ping absolute opacity-30" />
                    <Bell className="w-5 h-5 relative z-10" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-400 rounded-none rotate-45 shadow-[0_0_5px_#ff0033]" />
                </button>
                <Link to="/admin" className="text-zinc-400 hover:text-brand-400 transition-colors">
                   <Settings className="w-5 h-5 hover:rotate-180 transition-transform duration-700" />
                </Link>
                <button className="flex items-center gap-2 bg-brand-400 hover:bg-white text-black px-6 py-2 text-xs font-black uppercase tracking-widest transition-all skew-x-[-12deg] clip-path-polygon hover:scale-105 shadow-[0_0_15px_rgba(255,0,51,0.4)]">
                    <span className="skew-x-[12deg] flex items-center gap-2">
                        <User className="w-4 h-4" /> Login
                    </span>
                </button>
              </div>

              {/* Mobile Toggle */}
              <button 
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden text-white p-2 hover:text-brand-400 transition-colors border border-white/10 bg-white/5 skew-x-[-10deg]"
              >
                <Menu className="w-6 h-6 skew-x-[10deg]" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/90 z-50 lg:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-black border-l-2 border-brand-400 z-50 lg:hidden shadow-[0_0_50px_rgba(255,0,51,0.3)] overflow-y-auto"
            >
              <div className="p-6 relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-400/10 blur-3xl pointer-events-none"></div>

                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                  <span className="text-3xl font-display font-black text-white italic tracking-tighter">MENU</span>
                  <button 
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 text-zinc-400 hover:text-brand-400 transition-colors border border-white/10 hover:border-brand-400"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Mobile Search - Ensure text-base here too */}
                <form onSubmit={handleSearch} className="mb-8">
                  <div className="relative group">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="SEARCH DATABASE..."
                        className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 pl-11 rounded-none focus:border-brand-400 focus:bg-black outline-none transition-colors skew-x-[-5deg] font-mono text-base uppercase"
                    />
                    <Search className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500 group-focus-within:text-brand-400" />
                  </div>
                </form>

                {/* Mobile Links */}
                <div className="space-y-1">
                    <div className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-4 opacity-70 border-b border-brand-400/20 pb-1">Navigation Module</div>
                    
                    <Link to="/" className="flex items-center gap-4 p-4 hover:bg-brand-400/10 text-zinc-300 hover:text-brand-400 transition-all border-l-2 border-transparent hover:border-brand-400 group">
                        <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                        <span className="font-bold uppercase tracking-wider">Home Base</span>
                    </Link>
                    <Link to="/animes/trending" className="flex items-center gap-4 p-4 hover:bg-brand-400/10 text-zinc-300 hover:text-brand-400 transition-all border-l-2 border-transparent hover:border-brand-400 group">
                        <Flame className="w-5 h-5 group-hover:text-orange-500 transition-colors" />
                        <span className="font-bold uppercase tracking-wider">Trending</span>
                    </Link>
                    <Link to="/schedule" className="flex items-center gap-4 p-4 hover:bg-brand-400/10 text-zinc-300 hover:text-brand-400 transition-all border-l-2 border-transparent hover:border-brand-400">
                        <Calendar className="w-5 h-5" />
                        <span className="font-bold uppercase tracking-wider">Schedule</span>
                    </Link>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 space-y-2">
                    <div className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-4 opacity-70 border-b border-brand-400/20 pb-1">User System</div>
                    <Link to="/admin" className="flex items-center gap-4 p-4 hover:bg-brand-400/10 text-zinc-300 hover:text-white transition-all border-l-2 border-transparent hover:border-white">
                        <Settings className="w-5 h-5" />
                        <span className="font-bold uppercase tracking-wider">Config</span>
                    </Link>
                     <button className="w-full flex items-center gap-4 p-4 hover:bg-brand-400/10 text-zinc-300 hover:text-white transition-all text-left border-l-2 border-transparent hover:border-white">
                        <LogIn className="w-5 h-5" />
                        <span className="font-bold uppercase tracking-wider">Authenticate</span>
                    </button>
                </div>
                
                {/* Decorative Bottom */}
                <div className="mt-12 p-4 bg-brand-400/10 border border-brand-400/30 rounded-none skew-x-[-5deg]">
                    <p className="text-brand-400 text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-brand-400 animate-pulse shadow-[0_0_5px_#ff0033]"></span>
                        SYSTEM ONLINE
                    </p>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
