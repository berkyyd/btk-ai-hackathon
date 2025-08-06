import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatIcon from '@/components/ChatIcon';
import { AuthProvider } from '@/contexts/AuthContext';
import ToastContainer from '@/components/ToastContainer';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'YBS Buddy - Yönetim Bilişim Sistemleri Eğitim Platformu',
  description: 'YBS öğrencileri için modern eğitim platformu. Ders notları, müfredat, sınav simülasyonu ve kişisel takip özellikleri.',
  keywords: 'YBS, Yönetim Bilişim Sistemleri, eğitim, ders notları, sınav, müfredat',
  authors: [{ name: 'YBS Buddy Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="font-inter">
        {/* Technological Background Lines */}
        <div className="tech-lines">
          <div className="tech-line"></div>
          <div className="tech-line"></div>
          <div className="tech-line"></div>
          <div className="tech-line"></div>
        </div>
        
        <AuthProvider>
          <ToastContainer>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 pt-18">
                {children}
              </main>
              <Footer />
              <ChatIcon />
            </div>
          </ToastContainer>
        </AuthProvider>
      </body>
    </html>
  );
} 