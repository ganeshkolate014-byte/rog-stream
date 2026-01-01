import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Settings, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginDemo } = useAuth();

  const handleGuestAccess = () => {
    loginDemo();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        
        {/* Subtle Background */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-dark-900 via-dark-950 to-dark-950 opacity-80" />
        </div>

        <div className="w-full max-w-md relative z-10">
            <div className="bg-dark-900 border border-dark-700 rounded-lg p-8 md:p-10 shadow-2xl text-center">
                
                {/* Icon */}
                <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-dark-700">
                    <Settings className="w-10 h-10 text-brand-400 animate-spin-slow" style={{ animationDuration: '10s' }} />
                </div>

                {/* Text Content */}
                <h1 className="text-2xl font-bold text-white mb-3 tracking-wide uppercase">
                    Under Maintenance
                </h1>
                
                <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                    Our login servers are currently being upgraded to improve security. You can still access the full library for free during this period.
                </p>

                {/* Features Pill */}
                <div className="flex justify-center gap-4 mb-8 text-xs font-medium text-zinc-500">
                    <span className="flex items-center gap-1.5 bg-dark-950 px-3 py-1.5 rounded-full border border-dark-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Safe Mode
                    </span>
                    <span className="flex items-center gap-1.5 bg-dark-950 px-3 py-1.5 rounded-full border border-dark-800">
                        <Zap className="w-3.5 h-3.5 text-brand-400" /> Premium Unlocked
                    </span>
                </div>

                {/* Action Button */}
                <button 
                    onClick={handleGuestAccess}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-md transition-all flex items-center justify-center gap-2 group"
                >
                    Enter App
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <p className="mt-6 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                    Est. Completion: 2 Hours
                </p>
            </div>
        </div>
    </div>
  );
};