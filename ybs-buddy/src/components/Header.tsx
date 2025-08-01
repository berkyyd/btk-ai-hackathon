'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, loading, logout, role } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary hover:text-text transition-colors duration-300">
              YBS Buddy
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-text-light hover:text-primary transition-colors duration-300 font-medium">
              Ana Sayfa
            </Link>
            <Link href="/mufredat" className="text-text-light hover:text-primary transition-colors duration-300 font-medium">
              Müfredat
            </Link>
            <Link href="/ders-notlari" className="text-text-light hover:text-primary transition-colors duration-300 font-medium">
              Ders Notları
            </Link>
            <Link href="/sinav-simulasyonu" className="text-text-light hover:text-primary transition-colors duration-300 font-medium">
              Sınav Simülasyonu
            </Link>
            {user && (
              <>
                <Link href="/kisisel-takip" className="text-text-light hover:text-primary transition-colors duration-300 font-medium">
                  Kişisel Takip
                </Link>
                <Link href="/profile" className="text-text-light hover:text-primary transition-colors duration-300 font-medium">
                  Profilim
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="text-text-light">Yükleniyor...</div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-gray-100 text-text text-sm font-medium hover:bg-gray-200 transition-colors duration-300">
                    {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-text-light">
                    Merhaba, {user.displayName || user.email || 'Kullanıcı'}
                  </span>
                </div>
                
                {role === 'admin' && (
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300">
                      Admin Panel
                    </button>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button 
                    onClick={handleLogout}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-300"
                  >
                    Çıkış
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link href="/login" className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300">
                  Giriş
                </Link>
                <Link href="/register" className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-300">
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
