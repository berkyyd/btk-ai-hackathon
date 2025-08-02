'use client'

import React from 'react';
import Link from 'next/link';
import Card from './Card';

interface LoginPromptProps {
  title?: string;
  message?: string;
  description?: string;
  features?: string[];
  showRegister?: boolean;
}

export default function LoginPrompt({ 
  title = "Giriş Yapmanız Gerekiyor", 
  message = "Bu özelliği kullanabilmek için lütfen giriş yapın.",
  description,
  features,
  showRegister = true 
}: LoginPromptProps) {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Card className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-text mb-2">{title}</h2>
          <p className="text-text-light">{message}</p>
          {description && (
            <p className="text-text-light mt-2">{description}</p>
          )}
          {features && features.length > 0 && (
            <ul className="text-left mt-4 space-y-1">
              {features.map((feature, index) => (
                <li key={index} className="text-text-light text-sm flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="space-y-3">
          <Link 
            href="/login" 
            className="block w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 hover-lift font-medium"
          >
            🔑 Giriş Yap
          </Link>
          
          {showRegister && (
            <Link 
              href="/register" 
              className="block w-full px-4 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-all duration-300 hover-lift font-medium"
            >
              📝 Kayıt Ol
            </Link>
          )}
          
          <Link 
            href="/" 
            className="block w-full px-4 py-2 text-text-light hover:text-text-accent transition-all duration-300"
          >
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </Card>
    </div>
  );
} 