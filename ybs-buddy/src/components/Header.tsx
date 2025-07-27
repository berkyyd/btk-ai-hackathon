'use client'

import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'

function Header() {
  const { user, signOut, loading } = useAuth()
  
  console.log('Header - User:', user, 'Loading:', loading)
  
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className='bg-card shadow-sm py-4'>
      <div className='container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8'>
        <Link
          href="/"
          className='text-2xl font-bold text-primary hover:text-text transition-colors duration-300'
        >
          YBS Buddy
        </Link>
        <nav>
          <ul className='flex space-x-8'>
            <li>
              <Link
                href="/"
                className='text-text-light hover:text-primary transition-colors duration-300 font-medium'
              >
                Ana Sayfa
              </Link>
            </li>
            <li>
              <Link
                href="/mufredat"
                className='text-text-light hover:text-primary transition-colors duration-300 font-medium'
              >
                Müfredat
              </Link>
            </li>
            <li>
              <Link
                href="/ders-notlari"
                className='text-text-light hover:text-primary transition-colors duration-300 font-medium'
              >
                Ders Notları
              </Link>
            </li>
            <li>
              <Link
                href="/sinav-simulasyonu"
                className='text-text-light hover:text-primary transition-colors duration-300 font-medium'
              >
                Sınav Simülasyonu
              </Link>
            </li>
          </ul>
        </nav>
        <div className='flex items-center space-x-4'>
          <button
            onClick={toggleDarkMode}
            className='p-2 rounded-full bg-gray-100 text-text text-sm font-medium
                       hover:bg-gray-200 transition-colors duration-300'
          >
            🌙
          </button>
          
          {user ? (
            <div className='flex items-center space-x-2'>
              <span className='text-sm text-gray-600'>
                Merhaba, {user.displayName || user.email}
              </span>
              <button
                onClick={signOut}
                className='px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300'
              >
                Çıkış
              </button>
            </div>
          ) : (
            <div className='flex items-center space-x-2'>
              <Link
                href="/login"
                className='px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300'
              >
                Giriş
              </Link>
              <Link
                href="/register"
                className='px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-300'
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
