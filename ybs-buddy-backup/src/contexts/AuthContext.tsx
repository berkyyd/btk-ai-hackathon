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
  const [loading, setLoading] = useState(true); // Başlangıçta true - auth durumu kontrol edilene kadar
  const [role, setRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false); // Auth durumu kontrol edildi mi?

  useEffect(() => {
    // Firebase Auth state listener'ı tamamen devre dışı bırak
    // Sadece loading durumunu kontrol et
    setAuthChecked(true);
    setLoading(false);
  }, []);

  // Sayfa yüklendiğinde localStorage'dan giriş durumunu kontrol et
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userId = localStorage.getItem('userId');
    
    if (isLoggedIn === 'true' && userId) {
      // LocalStorage'da giriş durumu varsa kullanıcıyı giriş yapmış kabul et
      // Firebase'den kullanıcı bilgilerini al
      getDoc(doc(db, 'users', userId))
        .then((userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: userId,
              email: userData.email || '',
              displayName: userData.displayName || '',
            } as User);
            setRole(userData.role || 'student');
            setIsAuthenticated(true);
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          // Hata durumunda localStorage'ı temizle
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userId');
        });
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
      
      // Manuel giriş yapıldığında auth durumunu güncelle - kalıcı giriş
      setUser(user);
      setRole(userRole);
      setIsAuthenticated(true);
      
      // LocalStorage'a giriş durumunu kaydet
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', user.uid);
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
      
      // Manuel kayıt yapıldığında auth durumunu güncelle - kalıcı giriş
      setUser(user);
      setRole(userRole);
      setIsAuthenticated(true);
      
      // LocalStorage'a giriş durumunu kaydet
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', user.uid);
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
      
      // LocalStorage'dan giriş durumunu temizle
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userId');
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