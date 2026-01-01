import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, DEMO_USER_ID } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginDemo: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  loginDemo: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check if we were in demo mode (simple persistence)
    const storedDemo = localStorage.getItem('is_demo_session');
    if (storedDemo === 'true') {
        setIsDemo(true);
        // Create a mock user object compatible with Firebase User type
        const mockUser = {
            uid: DEMO_USER_ID,
            email: 'guest@system.override',
            displayName: 'System Guest (Premium)',
            emailVerified: true,
            isAnonymous: false,
            metadata: {},
            providerData: [],
            refreshToken: '',
            tenantId: null,
            delete: async () => {},
            getIdToken: async () => 'mock-token',
            getIdTokenResult: async () => ({
                token: 'mock',
                signInProvider: 'custom',
                claims: {},
                authTime: Date.now().toString(),
                issuedAtTime: Date.now().toString(),
                expirationTime: (Date.now() + 3600).toString(),
            }),
            reload: async () => {},
            toJSON: () => ({}),
            phoneNumber: null,
            photoURL: null
        } as unknown as User;
        setUser(mockUser);
        setLoading(false);
    } else {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!isDemo) {
              setUser(currentUser);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }
  }, [isDemo]);

  const loginDemo = () => {
    setLoading(true);
    localStorage.setItem('is_demo_session', 'true');
    // Trigger the effect reload
    window.location.reload(); 
  };

  const logout = async () => {
    if (isDemo) {
        localStorage.removeItem('is_demo_session');
        setIsDemo(false);
        setUser(null);
        window.location.reload();
    } else {
        await signOut(auth);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, loginDemo }}>
      {children}
    </AuthContext.Provider>
  );
};