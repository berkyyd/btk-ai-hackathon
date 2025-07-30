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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔒</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {title}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {description}
          </p>

          {/* Features */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Bu sayfada neler var?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-500 text-xl">✨</span>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <Link
              href="/login"
              className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-8 rounded-xl text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🚀 Hemen Giriş Yap
            </Link>
            
            <div className="flex gap-4">
              <Link
                href="/register"
                className="flex-1 bg-white border-2 border-blue-500 text-blue-500 font-semibold py-3 px-6 rounded-xl hover:bg-blue-50 transition-colors"
              >
                📝 Kayıt Ol
              </Link>
              
              <Link
                href="/"
                className="flex-1 bg-gray-100 text-gray-600 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors"
              >
                🏠 Ana Sayfa
              </Link>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <h4 className="text-lg font-semibold text-green-800 mb-3">
              Ücretsiz hesap oluşturarak:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="text-green-700">Ders notlarına erişim</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="text-green-700">Sınav simülasyonları</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="text-green-700">Kişisel profil</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 