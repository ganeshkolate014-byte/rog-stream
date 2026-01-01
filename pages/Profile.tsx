import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProgress, UserProgress } from '../services/firebase';
import { ProfileAnimeCard } from '../components/ProfileAnimeCard'; // New Component
import { User, LogOut, Loader2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Profile: React.FC = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'watching' | 'completed'>('watching');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      if (user) {
        try {
          const data = await getUserProgress(user.uid);
          const progressArray = Object.values(data).sort((a, b) => b.lastUpdated - a.lastUpdated);
          setProgressData(progressArray);
        } catch (e: any) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      } else if (!authLoading) {
        navigate('/login');
      }
    };
    fetchData();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
        </div>
    );
  }

  if (!user) return null;

  // Filter lists
  const watchingList = progressData.filter(p => p.status === 'Watching');
  const completedList = progressData.filter(p => p.status === 'Completed');

  return (
    <div className="min-h-screen bg-dark-950 pt-20 md:pt-24 pb-20 px-3 md:px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Profile Card */}
        <div className="bg-dark-900 border border-dark-700 p-6 md:p-10 mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-400/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-brand-400/10 transition-colors" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-brand-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,0,51,0.3)]">
                         <span className="text-2xl md:text-4xl font-black text-black uppercase">
                             {user.email?.charAt(0) || 'U'}
                         </span>
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tighter">
                            {user.email?.split('@')[0]}
                        </h1>
                        <p className="text-zinc-500 font-mono text-[10px] md:text-xs uppercase tracking-widest mt-1">PRO MEMBER</p>
                    </div>
                </div>
                
                <button 
                    onClick={logout}
                    className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-white hover:text-black text-zinc-300 border border-dark-600 transition-all uppercase font-bold text-xs tracking-widest -skew-x-12"
                >
                    <LogOut className="w-4 h-4 skew-x-12" /> <span className="skew-x-12">Logout</span>
                </button>
            </div>
        </div>

        {/* Error Display */}
        {error && (
            <div className="bg-red-900/20 border border-red-500/30 p-6 text-center my-8 rounded-md">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3"/>
                <h3 className="text-red-400 font-bold uppercase tracking-wider">Failed to load your data</h3>
                <p className="text-zinc-400 text-sm mt-2 font-mono">{error}</p>
                <p className="text-zinc-500 text-xs mt-4">
                    This can happen if the database is offline or due to a network issue. You can try logging out and using the <strong>Demo Login</strong> for an offline experience.
                </p>
            </div>
        )}

        {/* Main Content (Tabs & Grid) */}
        {!error && (
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.5 }}
          >
            <div className="mb-6 flex gap-4 border-b border-dark-700 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('watching')}
                    className={`pb-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'watching' ? 'text-white border-b-2 border-brand-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Clock className="w-3 h-3 md:w-4 md:h-4" /> Continue ({watchingList.length})
                </button>
                <button 
                    onClick={() => setActiveTab('completed')}
                    className={`pb-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'completed' ? 'text-white border-b-2 border-brand-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> Completed ({completedList.length})
                </button>
            </div>

            <div className="min-h-[300px]">
                {activeTab === 'watching' && (
                    <>
                        {watchingList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-dark-700 bg-dark-900/50">
                                <p className="text-zinc-500 font-bold uppercase text-sm mb-4">Your watch list is empty</p>
                                <button onClick={() => navigate('/')} className="px-6 py-2 bg-brand-400 text-black font-bold uppercase text-xs skew-x-[-12deg]">
                                    <span className="skew-x-12">Browse Anime</span>
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-6">
                                {watchingList.map((p) => (
                                    <ProfileAnimeCard key={p.animeId} progress={p} />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'completed' && (
                    <>
                        {completedList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-dark-700 bg-dark-900/50">
                                <p className="text-zinc-500 font-bold uppercase text-sm">No completed anime yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-6">
                                {completedList.map((p) => (
                                    <ProfileAnimeCard key={p.animeId} progress={p} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};