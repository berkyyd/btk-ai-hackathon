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
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary hover:text-text transition-colors duration-300">
              YBS Buddy
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8" ref={dropdownRef}>
            <Link href="/" className="text-text-light hover:text-primary transition-colors duration-300 font-medium">
              Ana Sayfa
            </Link>
            
            {/* Eğitim Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('education')}
                onMouseEnter={() => setActiveDropdown('education')}
                className="text-text-light hover:text-primary transition-colors duration-300 font-medium flex items-center"
              >
                Eğitim
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === 'education' && (
                <div 
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50"
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="py-1">
                    <Link 
                      href="/mufredat" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setActiveDropdown(null)}
                    >
                      📚 Müfredat
                    </Link>
                    <Link 
                      href="/ders-notlari" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setActiveDropdown(null)}
                    >
                      📝 Ders Notları
                    </Link>
                    <Link 
                      href="/sinav-simulasyonu" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                className="text-text-light hover:text-primary transition-colors duration-300 font-medium flex items-center"
              >
                Kişisel
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === 'personal' && (
                <div 
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50"
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="py-1">
                    {isAuthenticated && user ? (
                      <>
                        <Link 
                          href="/kisisel-takip" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setActiveDropdown(null)}
                        >
                          📊 Kişisel Takip
                        </Link>
                        <Link 
                          href="/profile" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setActiveDropdown(null)}
                        >
                          👤 Profilim
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-200">
                          Giriş yaparak kişisel özellikleri kullanabilirsiniz
                        </div>
                        <Link 
                          href="/login" 
                          className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                          onClick={() => setActiveDropdown(null)}
                        >
                          🔑 Giriş Yap
                        </Link>
                        <Link 
                          href="/register" 
                          className="block px-4 py-2 text-sm text-green-600 hover:bg-green-50"
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

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm text-text-light">Yükleniyor...</span>
              </div>
            ) : isAuthenticated && user ? (
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
