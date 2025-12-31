import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
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

// Robust Refresh Handler
const RefreshHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (hasChecked) return;

    // Check performance navigation type (works in most modern browsers)
    const navEntries = window.performance.getEntriesByType("navigation");
    let isReload = false;

    if (navEntries.length > 0) {
        const navEntry = navEntries[0] as PerformanceNavigationTiming;
        if (navEntry.type === 'reload') {
            isReload = true;
        }
    } else if ((window.performance.navigation as any).type === 1) {
        // Deprecated fallback
        isReload = true;
    }

    if (isReload && location.pathname !== '/') {
        console.log("System Reload Detected - Redirecting to Home Base");
        navigate('/', { replace: true });
    }
    
    setHasChecked(true);
  }, [navigate, location, hasChecked]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <RefreshHandler />
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
        
        {/* Footer - Visible on all screens now */}
        <footer className="bg-dark-900 border-t border-brand-400/20 py-12 mt-auto block relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-400 to-transparent opacity-50"></div>
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-white mb-4 font-display italic tracking-tighter">
              ROG <span className="text-brand-400">STREAM</span>
            </h2>
            <p className="text-zinc-500 text-sm max-w-md mx-auto mb-8 font-mono">
              ELITE GAMING GRADE ANIME STREAMING.
            </p>
            <div className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} ROG STREAM SYSTEM. ALL RIGHTS RESERVED.
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;