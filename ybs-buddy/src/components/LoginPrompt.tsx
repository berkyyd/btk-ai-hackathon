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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="card-glass rounded-2xl shadow-2xl p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔒</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            {title}
          </h1>

          {/* Description */}
          <p className="text-lg text-text-secondary mb-8 leading-relaxed">
            {description}
          </p>

          {/* Features */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-text-primary mb-4">
              Bu sayfada neler var?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-primary-900/20 rounded-lg border border-primary-700/30">
                  <span className="text-primary-400 text-xl">✨</span>
                  <span className="text-text-secondary">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <Link
              href="/login"
              className="block w-full btn-premium text-lg hover:shadow-glow-blue"
            >
              🚀 Hemen Giriş Yap
            </Link>
            
            <div className="flex gap-4">
              <Link
                href="/register"
                className="flex-1 bg-secondary-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-secondary-700 transition-colors border border-secondary-500/30"
              >
                📝 Kayıt Ol
              </Link>
              
              <Link
                href="/"
                className="flex-1 bg-primary-900/30 text-text-primary font-semibold py-3 px-6 rounded-xl hover:bg-primary-800/40 transition-colors border border-primary-700/30"
              >
                🏠 Ana Sayfa
              </Link>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-8 p-6 bg-gradient-to-r from-secondary-900/20 to-primary-900/20 rounded-xl border border-secondary-700/30">
            <h4 className="text-lg font-semibold text-secondary-300 mb-3">
              Ücretsiz hesap oluşturarak:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-secondary-400">✅</span>
                <span className="text-secondary-300">Ders notlarına erişim</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-secondary-400">✅</span>
                <span className="text-secondary-300">Sınav simülasyonları</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-secondary-400">✅</span>
                <span className="text-secondary-300">Kişisel profil</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 