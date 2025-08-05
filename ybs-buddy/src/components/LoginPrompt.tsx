'use client'

import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

interface LoginPromptProps {
  title: string;
  description: string;
  features: string[];
}

export default function LoginPrompt({ title, description, features }: LoginPromptProps) {
  const { user } = useAuth();

  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-2xl w-full">
        <div className="card-glass rounded-2xl shadow-2xl p-8 text-center border-2 border-primary-700/30">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">🔒</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {description}
          </p>

          {/* Features */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Bu sayfada neler var?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-white/90">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm">✨</span>
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <Link
              href="/login"
              className="block w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
            >
              🚀 Hemen Giriş Yap
            </Link>
            
            <div className="flex gap-4">
              <Link
                href="/register"
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 border border-green-500/30 shadow-md hover:shadow-lg"
              >
                📝 Kayıt Ol
              </Link>
              
              <Link
                href="/"
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-200 shadow-sm hover:shadow-md"
              >
                🏠 Ana Sayfa
              </Link>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              Ücretsiz hesap oluşturarak:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-700 font-medium">Ders notlarına erişim</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-700 font-medium">Sınav simülasyonları</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-700 font-medium">Kişisel profil</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 