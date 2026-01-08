import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate, useNavigationType } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { AnimeDetail } from './pages/AnimeDetail';
import { Watch } from './pages/Watch';
import { Schedule } from './pages/Schedule';
import { Search } from './pages/Search';
import { Category } from './pages/Category';
import { Genres } from './pages/Genres'; // Import Genres
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { Benefits } from './pages/Benefits';
import { Profile } from './pages/Profile';
import { Documentation } from './pages/Documentation';
import { ApiDocs } from './pages/ApiDocs'; 
import { Trackpad } from './components/Trackpad';
import { AuthProvider } from './context/AuthContext';
import { AiChatbot } from './components/AiChatbot';

// ScrollToTop Component
const ScrollToTop = () => {
    const location = useLocation();
    const navType = useNavigationType();
  
    useEffect(() => {
      // Only scroll to top if PUSHing to a new route. 
      // On POP (Back button), let the browser restore scroll position.
      if (navType !== 'POP') {
        window.scrollTo(0, 0);
      }
    }, [location.pathname, navType]);
  
    return null;
};

const AppRoutes = () => {
    const location = useLocation();
    return (
        <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/benefits" element={<Benefits />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="/anime/:id" element={<AnimeDetail />} />
            <Route path="/watch/:episodeId" element={<Watch />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/search" element={<Search />} />
            <Route path="/genres" element={<Genres />} /> {/* New Route */}
            <Route path="/animes/:category" element={<Category />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Trackpad />
        
        {/* Main Layout Container with Simple Fade In */}
        <div className="min-h-screen text-zinc-100 font-sans selection:bg-brand-500 selection:text-white flex flex-col overflow-x-hidden animate-in fade-in duration-700">
            
            <Navbar />
            
            <div className="flex-grow"> 
                <AppRoutes />
            </div>
            
            <AiChatbot />

            <footer className="bg-dark-900 border-t border-brand-400/20 py-12 mt-auto block relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-400 to-transparent opacity-50"></div>
                <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-black text-white mb-4 font-display italic tracking-tighter">
                    <span className="text-brand-400">STREAMING</span>
                </h2>
                <p className="text-zinc-500 text-sm max-w-md mx-auto mb-8 font-mono">
                    PREMIUM ANIME EXPERIENCE.
                </p>
                <div className="flex justify-center gap-6 mb-8">
                    <a href="#/benefits" className="text-zinc-500 hover:text-brand-400 text-xs font-bold uppercase tracking-widest transition-colors">Why Join?</a>
                    <a href="#/documentation" className="text-zinc-500 hover:text-brand-400 text-xs font-bold uppercase tracking-widest transition-colors">How It Works</a>
                    <a href="#/api-docs" className="text-zinc-500 hover:text-brand-400 text-xs font-bold uppercase tracking-widest transition-colors">API Docs</a>
                    <a href="#/admin" className="text-zinc-500 hover:text-brand-400 text-xs font-bold uppercase tracking-widest transition-colors">Config</a>
                </div>
                <div className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} ALL RIGHTS RESERVED.
                </div>
                </div>
            </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;