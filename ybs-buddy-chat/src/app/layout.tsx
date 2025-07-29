"use client";
import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AuthProvider } from '../contexts/AuthContext';
import ChatIcon from '../components/ChatIcon';
import ChatWindow from '../components/ChatWindow';
import { useState } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <html lang="tr">
      <body className="font-sans">
        <AuthProvider>
          <div className='flex flex-col min-h-screen bg-background'>
            <Header />
            <main className='flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8'>
              {children}
            </main>
            <Footer />
          </div>
          <ChatIcon onClick={() => setIsChatOpen(true)} />
          {isChatOpen && <ChatWindow onClose={() => setIsChatOpen(false)} />}
        </AuthProvider>
      </body>
    </html>
  );
} 