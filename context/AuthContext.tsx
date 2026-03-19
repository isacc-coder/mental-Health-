'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockAuth } from '@/lib/mock-api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for user in localStorage on mount
    const savedUser = localStorage.getItem('auth_user');
    const initAuth = () => {
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };
    
    // Defer to avoid cascading render warning in some linters
    const timeoutId = setTimeout(initAuth, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const signup = async (email: string, password: string) => {
    const newUser = await mockAuth.signup(email, password);
    setUser(newUser);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    router.push('/onboarding');
  };

  const login = async (email: string, password: string) => {
    const loggedUser = await mockAuth.login(email, password);
    setUser(loggedUser);
    localStorage.setItem('auth_user', JSON.stringify(loggedUser));
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
