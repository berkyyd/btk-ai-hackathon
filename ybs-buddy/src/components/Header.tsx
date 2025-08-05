'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.mobile-menu') && !target.closest('.hamburger')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-18 bg-gray-50/95 backdrop-blur-md border-b border-gray-100 shadow-soft">
      <div className="max-w-container mx-auto px-md lg:px-xl">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-md group">
            <div className="relative w-14 h-14 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              <svg className="w-7 h-7 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-500">YBS Buddy</span>
              <span className="text-xs text-gray-500 font-medium">Eğitim Platformu</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-xl">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-primary-500 transition-colors duration-300 font-semibold relative group"
            >
              <span className="relative">
                Ana Sayfa
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            
            {/* Eğitim Dropdown */}
            <div className="relative dropdown group">
              <button 
                onClick={() => toggleDropdown('egitim')}
                className="flex items-center space-x-sm text-gray-700 hover:text-primary-500 transition-colors duration-300 font-semibold relative group"
              >
                <span className="relative">
                  Eğitim
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === 'egitim' ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className={`absolute top-full left-0 mt-md w-40 bg-white border border-gray-200 rounded-lg shadow-lg p-sm transition-all duration-300 ${activeDropdown === 'egitim' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                <Link href="/ders-notlari" className="block px-sm py-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 font-medium text-sm">
                  Ders Notları
                </Link>
                <Link href="/mufredat" className="block px-sm py-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 font-medium text-sm">
                  Müfredat
                </Link>
                <Link href="/sinav-simulasyonu" className="block px-sm py-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 font-medium text-sm">
                  Sınav Simülasyonu
                </Link>
              </div>
            </div>

            {/* Kişisel Dropdown */}
            <div className="relative dropdown group">
              <button 
                onClick={() => toggleDropdown('kisisel')}
                className="flex items-center space-x-sm text-gray-700 hover:text-primary-500 transition-colors duration-300 font-semibold relative group"
              >
                <span className="relative">
                  Kişisel
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === 'kisisel' ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className={`absolute top-full left-0 mt-md w-40 bg-white border border-gray-200 rounded-lg shadow-lg p-sm transition-all duration-300 ${activeDropdown === 'kisisel' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                <Link href="/kisisel-takip" className="block px-sm py-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 font-medium text-sm">
                  Kişisel Takip
                </Link>
                <Link href="/profile" className="block px-sm py-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 font-medium text-sm">
                  Profil
                </Link>
              </div>
            </div>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-lg">
            {user ? (
              <div className="flex items-center space-x-lg">
                <Link 
                  href="/profile" 
                  className="flex items-center space-x-md text-gray-700 hover:text-primary-500 transition-colors duration-300"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-semibold text-sm">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="font-semibold">{user.displayName || user.email}</span>
                </Link>
                <button 
                  onClick={logout}
                  className="px-md py-sm text-gray-700 hover:text-red-600 transition-colors duration-300 font-semibold"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-lg">
                <Link 
                  href="/login" 
                  className="px-md py-sm text-gray-700 hover:text-primary-500 transition-colors duration-300 font-semibold"
                >
                  Giriş
                </Link>
                <Link 
                  href="/register" 
                  className="px-md py-sm bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-md text-gray-700 hover:text-primary-500 transition-colors duration-300 hamburger"
          >
            <svg 
              className={`w-6 h-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden mobile-menu ${isMobileMenuOpen ? 'block' : 'hidden'} bg-gray-50 border-t border-gray-100 shadow-large`}>
        <div className="px-md py-lg space-y-lg">
          <Link 
            href="/" 
            className="block px-md py-md text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Ana Sayfa
          </Link>
          
          <div className="space-y-md">
            <div className="px-md py-sm text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Eğitim
            </div>
            <Link 
              href="/ders-notlari" 
              className="block px-md py-md text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Ders Notları
            </Link>
            <Link 
              href="/mufredat" 
              className="block px-md py-md text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Müfredat
            </Link>
            <Link 
              href="/sinav-simulasyonu" 
              className="block px-md py-md text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sınav Simülasyonu
            </Link>
          </div>

          <div className="space-y-md">
            <div className="px-md py-sm text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Kişisel
            </div>
            <Link 
              href="/kisisel-takip" 
              className="block px-md py-md text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Kişisel Takip
            </Link>
            <Link 
              href="/profile" 
              className="block px-md py-md text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profil
            </Link>
          </div>

          {user ? (
            <div className="pt-lg border-t border-gray-100">
              <div className="flex items-center space-x-md px-md py-md">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="font-semibold text-gray-900">{user.displayName || user.email}</span>
              </div>
              <button 
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-md py-md text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-300"
              >
                Çıkış
              </button>
            </div>
          ) : (
            <div className="pt-lg border-t border-gray-100 space-y-md">
              <Link 
                href="/login" 
                className="block px-md py-md text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Giriş
              </Link>
              <Link 
                href="/register" 
                className="block px-md py-md bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
