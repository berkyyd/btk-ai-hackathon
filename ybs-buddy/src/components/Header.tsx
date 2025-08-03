'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, loading, logout, role, isAuthenticated } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleDropdown = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  return (
    <header className="navbar-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-8">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-400 hover:text-primary-300 transition-colors duration-300 mr-16 focus:outline-none">
              YBS Buddy
            </Link>
          </div>

          <nav className="hidden md:flex space-x-16" ref={dropdownRef}>
            <Link href="/" className="text-text-secondary hover:text-primary-400 hover:scale-105 transition-all duration-300 font-medium focus:outline-none">
              Ana Sayfa
            </Link>
            
            {/* Eğitim Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('education')}
                onMouseEnter={() => setActiveDropdown('education')}
                className="text-text-secondary hover:text-primary-400 transition-colors duration-300 font-medium flex items-center focus:outline-none"
              >
                Eğitim
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === 'education' && (
                <div 
                  className="absolute top-full left-0 mt-2 w-48 bg-card-light rounded-md shadow-lg border border-primary-700/30 z-[9999]"
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="py-1">
                    <Link 
                      href="/mufredat" 
                      className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-primary-900/20 transition-colors duration-300 focus:outline-none"
                      onClick={() => setActiveDropdown(null)}
                    >
                      📚 Müfredat
                    </Link>
                    <Link 
                      href="/ders-notlari" 
                      className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-primary-900/20 transition-colors duration-300 focus:outline-none"
                      onClick={() => setActiveDropdown(null)}
                    >
                      📝 Ders Notları
                    </Link>
                    <Link 
                      href="/sinav-simulasyonu" 
                      className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-primary-900/20 transition-colors duration-300 focus:outline-none"
                      onClick={() => setActiveDropdown(null)}
                    >
                      🎯 Sınav Simülasyonu
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Kişisel Dropdown - Tüm kullanıcılar için görünür */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('personal')}
                onMouseEnter={() => setActiveDropdown('personal')}
                className="text-text-secondary hover:text-primary-400 transition-colors duration-300 font-medium flex items-center focus:outline-none"
              >
                Kişisel
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === 'personal' && (
                <div 
                  className="absolute top-full left-0 mt-2 w-48 bg-card-light rounded-md shadow-lg border border-primary-700/30 z-[9999]"
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="py-1">
                    {isAuthenticated && user ? (
                      <>
                        <Link 
                          href="/kisisel-takip" 
                          className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-primary-900/20 transition-colors duration-300 focus:outline-none"
                          onClick={() => setActiveDropdown(null)}
                        >
                          📊 Kişisel Takip
                        </Link>
                        <Link 
                          href="/profile" 
                          className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-primary-900/20 transition-colors duration-300 focus:outline-none"
                          onClick={() => setActiveDropdown(null)}
                        >
                          👤 Profilim
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 text-sm text-text-muted border-b border-primary-800/30">
                          Giriş yaparak kişisel özellikleri kullanabilirsiniz
                        </div>
                        <Link 
                          href="/login" 
                          className="block px-4 py-2 text-sm text-primary-400 hover:text-primary-300 hover:bg-primary-900/20 transition-colors duration-300 focus:outline-none"
                          onClick={() => setActiveDropdown(null)}
                        >
                          🔑 Giriş Yap
                        </Link>
                        <Link 
                          href="/register" 
                          className="block px-4 py-2 text-sm text-secondary-400 hover:text-secondary-300 hover:bg-secondary-900/20 transition-colors duration-300 focus:outline-none"
                          onClick={() => setActiveDropdown(null)}
                        >
                          📝 Kayıt Ol
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center space-x-8">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="loading-spinner"></div>
                <span className="text-sm text-text-secondary">Yükleniyor...</span>
              </div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary-900/30 text-text-primary text-sm font-medium hover:bg-primary-800/40 transition-colors duration-300 border border-primary-700/30">
                    {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-text-secondary">
                    Merhaba, {user.displayName || user.email || 'Kullanıcı'}
                  </span>
                </div>
                
                {role === 'admin' && (
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-300 border border-red-500/30 focus:outline-none">
                      Admin Panel
                    </button>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button 
                    onClick={handleLogout}
                    className="px-3 py-1 text-sm bg-secondary-600 text-white rounded hover:bg-secondary-700 transition-colors duration-300 border border-secondary-500/30 focus:outline-none"
                  >
                    Çıkış
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link href="/login" className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors duration-300 border border-primary-500/30 focus:outline-none">
                  Giriş
                </Link>
                <Link href="/register" className="px-3 py-1 text-sm bg-secondary-600 text-white rounded hover:bg-secondary-700 transition-colors duration-300 border border-secondary-500/30 focus:outline-none">
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
