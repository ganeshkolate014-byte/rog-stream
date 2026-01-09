import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShieldCheck, Mail, Lock, User, Upload, AlertCircle, LoaderCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginDemo, loginWithEmail, registerWithEmail } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setProfileImage(file);
          setImagePreview(URL.createObjectURL(file));
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
        if (isLoginMode) {
            await loginWithEmail(email, password);
        } else {
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match");
            }
            if (password.length < 6) {
                throw new Error("Password must be at least 6 characters");
            }
            if (!name) {
                throw new Error("Please enter your name");
            }
            await registerWithEmail(email, password, name, profileImage);
        }
        navigate('/');
    } catch (err: any) {
        console.error("Auth Error:", err.code, err.message);
        
        // Custom Error Mapping
        if (
            err.code === 'auth/invalid-credential' || 
            err.code === 'auth/user-not-found' || 
            err.code === 'auth/wrong-password' ||
            err.code === 'auth/invalid-email'
        ) {
            setError("Password or Email Incorrect");
        } else if (err.code === 'auth/email-already-in-use') {
            setError("Email is already registered");
        } else {
            setError(err.message || "An error occurred. Please try again.");
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    loginDemo();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 pt-20 overflow-hidden">
        
        {/* Subtle Background */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-dark-900 via-dark-950 to-dark-950 opacity-80" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-400/5 blur-[120px] rounded-full" />
        </div>

        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md relative z-10"
        >
            <div className="bg-dark-900 border border-dark-700 rounded-lg p-6 md:p-8 shadow-2xl relative overflow-hidden">
                
                {/* Seamless Header Transition */}
                <div className="text-center mb-8 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLoginMode ? 'login-text' : 'signup-text'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                             <h1 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">
                                {isLoginMode ? 'Welcome Back' : 'Join the Elite'}
                            </h1>
                            <p className="text-zinc-500 text-sm">
                                {isLoginMode ? 'Enter your credentials to access your library.' : 'Create an account to track your anime journey.'}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded mb-6 flex items-center gap-2 font-bold overflow-hidden"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <AnimatePresence initial={false}>
                        {!isLoginMode && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="overflow-hidden"
                            >
                                 {/* Profile Upload */}
                                <div className="flex justify-center mb-6 pt-2">
                                    <label className="relative cursor-pointer group">
                                        <div className={`w-24 h-24 rounded-full border-2 ${imagePreview ? 'border-brand-400' : 'border-dashed border-dark-600'} flex items-center justify-center bg-dark-800 overflow-hidden transition-colors group-hover:border-brand-400`}>
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <Upload className="w-8 h-8 text-zinc-600 group-hover:text-brand-400" />
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                        <div className="absolute bottom-0 right-0 bg-brand-400 rounded-full p-1.5 border-2 border-dark-900">
                                            <User className="w-3 h-3 text-black" />
                                        </div>
                                    </label>
                                </div>

                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Username"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-dark-800 border border-dark-600 rounded p-3 pl-10 text-white focus:border-brand-400 focus:outline-none transition-colors"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
                        <input 
                            type="email" 
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-dark-800 border border-dark-600 rounded p-3 pl-10 text-white focus:border-brand-400 focus:outline-none transition-colors"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
                        <input 
                            type="password" 
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-dark-800 border border-dark-600 rounded p-3 pl-10 text-white focus:border-brand-400 focus:outline-none transition-colors"
                            required
                        />
                    </div>

                    <AnimatePresence initial={false}>
                        {!isLoginMode && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
                                    <input 
                                        type="password" 
                                        placeholder="Repeat Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-dark-800 border border-dark-600 rounded p-3 pl-10 text-white focus:border-brand-400 focus:outline-none transition-colors"
                                        required
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button 
                        layout
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-400 hover:bg-white hover:text-black text-black font-black uppercase py-4 rounded transition-all flex items-center justify-center gap-2 group skew-x-[-6deg] mt-4 relative overflow-hidden"
                    >
                        {isLoading ? (
                            <LoaderCircle className="w-5 h-5 animate-spin" />
                        ) : (
                            <motion.div 
                                key={isLoginMode ? 'btn-login' : 'btn-signup'}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex items-center gap-2"
                            >
                                <span className="skew-x-[6deg]">{isLoginMode ? 'Login' : 'Create Account'}</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform skew-x-[6deg]" />
                            </motion.div>
                        )}
                    </motion.button>

                </form>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => {
                            setIsLoginMode(!isLoginMode);
                            setError(null);
                        }}
                        className="text-zinc-500 hover:text-brand-400 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                         <AnimatePresence mode="wait">
                            <motion.span
                                key={isLoginMode ? 'switch-to-signup' : 'switch-to-login'}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                            </motion.span>
                         </AnimatePresence>
                    </button>
                </div>
                
                <div className="my-6 border-t border-dark-700 flex items-center justify-center">
                    <span className="bg-dark-900 px-3 text-zinc-600 text-xs uppercase font-bold -mt-2.5">OR</span>
                </div>

                <button 
                    onClick={handleGuestAccess}
                    className="w-full bg-dark-800 hover:bg-zinc-800 text-zinc-300 font-bold py-3 rounded transition-all flex items-center justify-center gap-2 border border-dark-600 text-xs uppercase tracking-wider"
                >
                    <ShieldCheck className="w-4 h-4" /> Continue as Guest
                </button>

            </div>
        </motion.div>
    </div>
  );
};