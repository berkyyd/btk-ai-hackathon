'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    invitationCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      setLoading(false);
      return;
    }

    try {
      // API'yi kullanarak kayıt işlemi yap
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          invitationCode: formData.invitationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Kayıt olurken bir hata oluştu');
        return;
      }

      // Başarılı kayıt - Kullanıcıyı otomatik olarak giriş yaptır
      await login(formData.email, formData.password);
      
      // Ana sayfaya yönlendir
      router.push('/');

    } catch (err: any) {
      console.error('Register error:', err);
      setError('Kayıt olurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text">
            Yeni hesap oluşturun
          </h2>
          <p className="mt-2 text-center text-sm text-text-light">
            Veya{' '}
            <Link href="/login" className="font-medium text-primary-400 hover:text-primary-300">
              mevcut hesabınıza giriş yapın
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="displayName" className="sr-only">
                Ad Soyad
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                className="appearance-none relative block w-full px-3 py-2 border border-border-light placeholder-text-muted text-text rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-background-card"
                placeholder="Ad Soyad"
                value={formData.displayName}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="sr-only">
                Email adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-border-light placeholder-text-muted text-text rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-background-card"
                placeholder="Email adresi"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Şifre (en az 6 karakter)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Şifre Tekrar
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Şifre Tekrar"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="invitationCode" className="sr-only">
                Davet Kodu (isteğe bağlı)
              </label>
              <input
                id="invitationCode"
                name="invitationCode"
                type="text"
                autoComplete="off"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Davet Kodu (isteğe bağlı)"
                value={formData.invitationCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
              Ana sayfaya dön
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 
