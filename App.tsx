import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { AnimeDetail } from './pages/AnimeDetail';
import { Watch } from './pages/Watch';
import { Schedule } from './pages/Schedule';
import { Search } from './pages/Search';
import { Category } from './pages/Category';
import { Admin } from './pages/Admin';
import { Trackpad } from './components/Trackpad';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Trackpad />
      <div className="min-h-screen text-zinc-100 font-sans selection:bg-brand-500 selection:text-white flex flex-col">
        <Navbar />
        <div className="flex-grow"> 
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/anime/:id" element={<AnimeDetail />} />
            <Route path="/watch/:episodeId" element={<Watch />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/search" element={<Search />} />
            <Route path="/animes/:category" element={<Category />} />
            <Route path="/admin" element={<Admin />} />
            
            {/* Fallback Routes */}
            <Route path="/genres" element={<Category />} />
            <Route path="/simulcast" element={<Category />} />

            {/* Default Catch-All: Redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
        
        {/* Footer */}
        <footer className="bg-dark-900 border-t border-brand-400/20 py-12 mt-auto block relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-400 to-transparent opacity-50"></div>
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-white mb-4 font-display italic tracking-tighter">
              <span className="text-brand-400">STREAMING</span>
            </h2>
            <p className="text-zinc-500 text-sm max-w-md mx-auto mb-8 font-mono">
              PREMIUM ANIME EXPERIENCE.
            </p>
            <div className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} ALL RIGHTS RESERVED.
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;