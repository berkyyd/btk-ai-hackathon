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
  user: (User & { role?: string }) | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUserManually: (user: User, role: string) => void;
  role: string | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(User & { role?: string }) | null>(null);
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
          const userWithRole = { ...authData.user, role: authData.role };
          setUser(userWithRole);
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
      
      const userWithRole = { ...user, role: userRole };
      setUser(userWithRole);
      setRole(userRole);
      setIsAuthenticated(true);
      
      // LocalStorage'a kaydet
      localStorage.setItem('ybs-auth', JSON.stringify({
        user: userWithRole,
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
      
      const userWithRole = { ...user, role: userRole };
      setUser(userWithRole);
      setRole(userRole);
      setIsAuthenticated(true);
      
      // LocalStorage'a kaydet
      localStorage.setItem('ybs-auth', JSON.stringify({
        user: userWithRole,
        role: userRole
      }));
    } catch (error: any) {
      console.error('Register error in AuthContext:', error);
      
      // Hata mesajlarını daha açıklayıcı hale getir
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Bu email adresi zaten kullanımda. Lütfen farklı bir email adresi kullanın veya giriş yapın.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Şifre en az 6 karakter olmalıdır.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Geçerli bir email adresi giriniz.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('İnternet bağlantınızı kontrol ediniz.');
      } else {
        throw new Error('Kayıt olurken bir hata oluştu. Lütfen tekrar deneyiniz.');
      }
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

  const setUserManually = (user: User, role: string) => {
    const userWithRole = { ...user, role };
    setUser(userWithRole);
    setRole(role);
    setIsAuthenticated(true);
    
    // LocalStorage'a kaydet
    localStorage.setItem('ybs-auth', JSON.stringify({
      user: userWithRole,
      role
    }));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUserManually,
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