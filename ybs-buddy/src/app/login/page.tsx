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
      // Başarılı giriş - ana sayfaya yönlendir
      router.push('/');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Bu email adresi ile kayıtlı kullanıcı bulunamadı');
      } else if (err.code === 'auth/wrong-password') {
        setError('Şifre yanlış');
      } else {
        setError('Giriş yapılırken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="card-glass p-8 rounded-2xl">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-text-primary">
              Hesabınıza giriş yapın
            </h2>
            <p className="mt-2 text-center text-sm text-text-secondary">
              Veya{' '}
              <Link href="/register" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
                yeni hesap oluşturun
              </Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/20 border border-red-700/30 text-red-300 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                  Email adresi
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-primary-700/30 placeholder-text-muted text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-card-light sm:text-sm transition-all duration-300"
                  placeholder="Email adresi"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                  Şifre
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-primary-700/30 placeholder-text-muted text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-card-light sm:text-sm transition-all duration-300"
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
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white btn-premium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="loading-spinner w-4 h-4"></div>
                    Giriş yapılıyor...
                  </div>
                ) : (
                  'Giriş Yap'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link href="/" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
                Ana sayfaya dön
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 