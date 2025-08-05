'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Bu email adresi ile kayıtlı kullanıcı bulunamadı');
      } else if (err.code === 'auth/wrong-password') {
        setError('Şifre yanlış');
      } else if (err.code === 'auth/invalid-email') {
        setError('Geçersiz email adresi');
      } else {
        setError('Giriş yaparken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden" style={{ marginTop: '72px' }}>
      {/* Background Animated Elements */}
      <div className="absolute inset-0">
        {/* Floating AI Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-primary-300 rounded-full opacity-15 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-primary-400 rounded-full opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Additional Light Effects */}
        <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-blue-200 rounded-full opacity-15 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/3 right-1/4 w-28 h-28 bg-indigo-200 rounded-full opacity-12 animate-pulse" style={{animationDelay: '1.5s'}}></div>
        
        {/* AI Circuit-like Elements */}
        <div className="absolute top-1/2 left-1/6 w-12 h-12 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-lg opacity-20 animate-pulse" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute bottom-1/4 right-1/6 w-16 h-16 bg-gradient-to-br from-indigo-300 to-blue-400 rounded-lg opacity-15 animate-pulse" style={{animationDelay: '1.2s'}}></div>
        
        {/* Floating Light Particles */}
        <div className="absolute top-1/4 right-1/3 w-8 h-8 bg-white rounded-full opacity-30 animate-pulse shadow-lg" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-white rounded-full opacity-25 animate-pulse shadow-lg" style={{animationDelay: '0.7s'}}></div>
        <div className="absolute top-2/3 right-1/2 w-10 h-10 bg-white rounded-full opacity-20 animate-pulse shadow-lg" style={{animationDelay: '1.8s'}}></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
          {/* Modern Glassmorphism Border Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-blue-500/10"></div>
          
          {/* Subtle Border Glow */}
          <div className="absolute inset-0 rounded-3xl border border-white/30"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Hesabınıza giriş yapın
              </h2>
              <p className="text-gray-600">
                Veya{' '}
                <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  yeni hesap oluşturun
                </Link>
              </p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email adresi
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:bg-white/90"
                    placeholder="Email adresi"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Şifre
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:bg-white/90"
                    placeholder="Şifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Giriş yapılıyor...
                    </div>
                  ) : (
                    'Giriş Yap'
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  Ana sayfaya dön
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 