import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShieldCheck, Mail, Lock, User, Upload, AlertCircle, LoaderCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginDemo, loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
  
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

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
        await loginWithGoogle();
        navigate('/');
    } catch (err: any) {
        console.error("Google Auth Error:", err);
        setError("Failed to sign in with Google.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    loginDemo();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-transparent to-dark-950 z-0" />

            {/* Glowing Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[4000ms]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        </div>

        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md relative z-10"
        >
            <div className="bg-dark-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl shadow-black/50 relative overflow-hidden">
                
                {/* Decorative Top Line */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

                {/* Header */}
                <div className="text-center mb-10 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLoginMode ? 'login-text' : 'signup-text'}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                        >
                             <h1 className="text-5xl font-display font-bold text-white mb-2 italic tracking-wide uppercase drop-shadow-lg">
                                {isLoginMode ? (
                                    <>Welcome <span className="text-brand-400">Back</span></>
                                ) : (
                                    <>Join The <span className="text-brand-400">Elite</span></>
                                )}
                            </h1>
                            <p className="text-zinc-400 font-sans text-sm tracking-wide">
                                {isLoginMode ? 'Sign in to continue your journey.' : 'Create an account and start watching.'}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2 font-medium backdrop-blur-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <AnimatePresence initial={false}>
                        {!isLoginMode && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="overflow-hidden"
                            >
                                 {/* Profile Upload */}
                                <div className="flex justify-center mb-6 pt-2">
                                    <label className="relative cursor-pointer group">
                                        <div className={`w-28 h-28 rounded-full border-2 ${imagePreview ? 'border-brand-500' : 'border-dashed border-zinc-700'} flex items-center justify-center bg-dark-950/50 overflow-hidden transition-all group-hover:border-brand-400 group-hover:shadow-lg group-hover:shadow-brand-500/20`}>
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <Upload className="w-8 h-8 text-zinc-600 group-hover:text-brand-400 transition-colors" />
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                        <div className="absolute bottom-1 right-1 bg-brand-500 rounded-full p-2 border-4 border-dark-900 shadow-sm">
                                            <User className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    </label>
                                </div>

                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="Username"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-dark-950/50 border border-white/5 rounded-xl p-3.5 pl-12 text-white placeholder:text-zinc-600 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 focus:outline-none transition-all"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
                        <input 
                            type="email" 
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-dark-950/50 border border-white/5 rounded-xl p-3.5 pl-12 text-white placeholder:text-zinc-600 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 focus:outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
                        <input 
                            type="password" 
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-dark-950/50 border border-white/5 rounded-xl p-3.5 pl-12 text-white placeholder:text-zinc-600 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 focus:outline-none transition-all"
                            required
                        />
                    </div>

                    <AnimatePresence initial={false}>
                        {!isLoginMode && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
                                    <input 
                                        type="password" 
                                        placeholder="Repeat Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-dark-950/50 border border-white/5 rounded-xl p-3.5 pl-12 text-white placeholder:text-zinc-600 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 focus:outline-none transition-all"
                                        required
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        layout
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold uppercase py-4 rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 group mt-6 relative overflow-hidden"
                    >
                        {isLoading ? (
                            <LoaderCircle className="w-5 h-5 animate-spin" />
                        ) : (
                            <motion.div 
                                key={isLoginMode ? 'btn-login' : 'btn-signup'}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex items-center gap-2 tracking-wider"
                            >
                                <span>{isLoginMode ? 'Sign In' : 'Create Account'}</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </motion.div>
                        )}
                    </motion.button>
                </form>

                <div className="mt-8 text-center">
                    <button 
                        onClick={() => {
                            setIsLoginMode(!isLoginMode);
                            setError(null);
                        }}
                        className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
                    >
                         <AnimatePresence mode="wait">
                            <motion.span
                                key={isLoginMode ? 'switch-to-signup' : 'switch-to-login'}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isLoginMode ? (
                                    <>Don't have an account? <span className="text-brand-400 font-bold ml-1 hover:underline">Sign Up</span></>
                                ) : (
                                    <>Already have an account? <span className="text-brand-400 font-bold ml-1 hover:underline">Login</span></>
                                )}
                            </motion.span>
                         </AnimatePresence>
                    </button>
                </div>
                
                <div className="my-8 flex items-center gap-4">
                    <div className="h-[1px] bg-white/10 flex-grow" />
                    <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">OR</span>
                    <div className="h-[1px] bg-white/10 flex-grow" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button 
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="bg-white/5 hover:bg-white/10 border border-white/5 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 group text-sm"
                    >
                         {/* Official Google Icon SVG */}
                         <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>

                    <button 
                        onClick={handleGuestAccess}
                        className="bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <ShieldCheck className="w-4 h-4" /> Guest
                    </button>
                </div>

            </div>
        </motion.div>
    </div>
  );
};