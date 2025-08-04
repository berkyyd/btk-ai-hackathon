"use client";
import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import ChatIcon from '../components/ChatIcon';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="font-sans">
        <AuthProvider>

          <ThemeProvider>
            <div className='flex flex-col min-h-screen'>
              <Header />
              <main className='flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8'>
                {children}
              </main>
              <Footer />
            </div>
            <ChatIcon />
          </ThemeProvider>

        </AuthProvider>
      </body>
    </html>
  );
} 