'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  role: string | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Başlangıçta false
  const [role, setRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Hızlıca localStorage kontrolü yap
    const savedAuth = localStorage.getItem('ybs-auth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        if (authData.user && authData.role) {
          setUser(authData.user);
          setRole(authData.role);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error parsing saved auth:', error);
        localStorage.removeItem('ybs-auth');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Kullanıcı rolünü al
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userRole = userDoc.exists() ? userDoc.data().role || 'student' : 'student';
      
      setUser(user);
      setRole(userRole);
      setIsAuthenticated(true);
      
      // LocalStorage'a kaydet
      localStorage.setItem('ybs-auth', JSON.stringify({
        user: user,
        role: userRole
      }));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Kullanıcı rolünü al
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userRole = userDoc.exists() ? userDoc.data().role || 'student' : 'student';
      
      setUser(user);
      setRole(userRole);
      setIsAuthenticated(true);
      
      // LocalStorage'a kaydet
      localStorage.setItem('ybs-auth', JSON.stringify({
        user: user,
        role: userRole
      }));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
      
      // LocalStorage'dan temizle
      localStorage.removeItem('ybs-auth');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    role,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 