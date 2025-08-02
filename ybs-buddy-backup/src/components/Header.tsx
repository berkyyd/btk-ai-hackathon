'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { user, loading, logout, role, isAuthenticated } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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

  // Check if current page is active
  const isActivePage = (path: string) => {
    return pathname === path;
  };

  // Check if page is in education section
  const isEducationPage = () => {
    return pathname.startsWith('/mufredat') || pathname.startsWith('/ders-notlari') || pathname.startsWith('/sinav-simulasyonu');
  };

  // Check if page is in personal section
  const isPersonalPage = () => {
    return pathname.startsWith('/kisisel-takip') || pathname.startsWith('/profile');
  };

  return (
    <header className="bg-background-card shadow-dark-card border-b border-border-light backdrop-blur-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-text-accent hover:text-secondary-400 transition-all duration-300 hover-lift">
              YBS Buddy
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8" ref={dropdownRef}>
            <Link 
              href="/" 
              className={`nav-hover px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                isActivePage('/') 
                  ? 'nav-active' 
                  : 'text-text-light hover:text-text-accent'
              }`}
            >
              Ana Sayfa
            </Link>
            
            {/* Eğitim Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('education')}
                onMouseEnter={() => setActiveDropdown('education')}
                className={`nav-hover px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-300 ${
                  isEducationPage()
                    ? 'nav-active' 
                    : 'text-text-light hover:text-text-accent'
                }`}
              >
                Eğitim
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === 'education' && (
                <div 
                  className="absolute top-full left-0 mt-2 w-48 dropdown-menu rounded-md z-50"
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="py-1">
                    {!isAuthenticated && (
                      <div className="px-4 py-2 text-sm text-text-muted border-b border-border-light">
                        Giriş yaparak kişiselleştirilmiş içerikleri görebilirsiniz
                      </div>
                    )}
                    <Link 
                      href="/mufredat" 
                      className={`dropdown-item block px-4 py-2 text-sm ${
                        isActivePage('/mufredat') 
                          ? 'nav-active' 
                          : 'text-text hover:text-text-accent'
                      }`}
                      onClick={() => setActiveDropdown(null)}
                    >
                      📚 Müfredat
                    </Link>
                    <Link 
                      href="/ders-notlari" 
                      className={`dropdown-item block px-4 py-2 text-sm ${
                        isActivePage('/ders-notlari') 
                          ? 'nav-active' 
                          : 'text-text hover:text-text-accent'
                      }`}
                      onClick={() => setActiveDropdown(null)}
                    >
                      📝 Ders Notları
                    </Link>
                    <Link 
                      href="/sinav-simulasyonu" 
                      className={`dropdown-item block px-4 py-2 text-sm ${
                        isActivePage('/sinav-simulasyonu') 
                          ? 'nav-active' 
                          : 'text-text hover:text-text-accent'
                      }`}
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
                className={`nav-hover px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-300 ${
                  isPersonalPage()
                    ? 'nav-active' 
                    : 'text-text-light hover:text-text-accent'
                }`}
              >
                Kişisel
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === 'personal' && (
                <div 
                  className="absolute top-full left-0 mt-2 w-48 dropdown-menu rounded-md z-50"
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="py-1">
                    {isAuthenticated && user ? (
                      <>
                        <Link 
                          href="/kisisel-takip" 
                          className={`dropdown-item block px-4 py-2 text-sm ${
                            isActivePage('/kisisel-takip') 
                              ? 'nav-active' 
                              : 'text-text hover:text-text-accent'
                          }`}
                          onClick={() => setActiveDropdown(null)}
                        >
                          📊 Kişisel Takip
                        </Link>
                        <Link 
                          href="/profile" 
                          className={`dropdown-item block px-4 py-2 text-sm ${
                            isActivePage('/profile') 
                              ? 'nav-active' 
                              : 'text-text hover:text-text-accent'
                          }`}
                          onClick={() => setActiveDropdown(null)}
                        >
                          👤 Profilim
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 text-sm text-text-muted border-b border-border-light">
                          Giriş yaparak kişisel özellikleri kullanabilirsiniz
                        </div>
                        <Link 
                          href="/login" 
                          className={`dropdown-item block px-4 py-2 text-sm ${
                            isActivePage('/login') 
                              ? 'nav-active' 
                              : 'text-text-accent hover:text-secondary-400'
                          }`}
                          onClick={() => setActiveDropdown(null)}
                        >
                          🔑 Giriş Yap
                        </Link>
                        <Link 
                          href="/register" 
                          className={`dropdown-item block px-4 py-2 text-sm ${
                            isActivePage('/register') 
                              ? 'nav-active' 
                              : 'text-secondary-400 hover:text-secondary-300'
                          }`}
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
              <div className="flex space-x-2">
                <Link 
                  href="/login" 
                  className={`px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-all duration-300 hover-lift ${
                    isActivePage('/login') ? 'active-link' : ''
                  }`}
                >
                  Giriş
                </Link>
                <Link 
                  href="/register" 
                  className={`px-3 py-1 text-sm bg-secondary-600 text-white rounded hover:bg-secondary-700 transition-all duration-300 hover-lift ${
                    isActivePage('/register') ? 'active-link' : ''
                  }`}
                >
                  Kayıt Ol
                </Link>
              </div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-background-hover text-text text-sm font-medium hover:bg-secondary-400 hover:text-white transition-all duration-300 hover-lift">
                    {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-text-light">
                    Merhaba, {user.displayName || user.email || 'Kullanıcı'}
                  </span>
                </div>
                
                {role === 'admin' && (
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-all duration-300 hover-lift">
                      Admin Panel
                    </button>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button 
                    onClick={handleLogout}
                    className="px-3 py-1 text-sm bg-secondary-600 text-white rounded hover:bg-secondary-700 transition-all duration-300 hover-lift"
                  >
                    Çıkış
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link 
                  href="/login" 
                  className={`px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-all duration-300 hover-lift ${
                    isActivePage('/login') ? 'active-link' : ''
                  }`}
                >
                  Giriş
                </Link>
                <Link 
                  href="/register" 
                  className={`px-3 py-1 text-sm bg-secondary-600 text-white rounded hover:bg-secondary-700 transition-all duration-300 hover-lift ${
                    isActivePage('/register') ? 'active-link' : ''
                  }`}
                >
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
