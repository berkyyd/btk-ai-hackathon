'use client';

import Link from 'next/link'
import Card from '../components/Card'
import { useAuth } from '../contexts/AuthContext'

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className='py-8'>
      {/* Hero Section */}
      <section className='text-center mb-16 animate-fadeIn'>
        <h1 className='text-5xl font-extrabold text-text leading-tight mb-4 text-gradient'>
          YBS Buddy'ye Hoş Geldiniz!
        </h1>
        <p className='text-lg text-text-light max-w-3xl mx-auto leading-relaxed'>
          Bandırma Onyedi Eylül Üniversitesi Yönetim Bilişim Sistemleri (YBS)
          bölümü öğrencileri için tasarlanmış, akademik başarıyı ve kariyer
          gelişimini destekleyen kapsamlı platformunuz.
        </p>
        
        {/* Giriş yapmamış kullanıcılar için CTA butonları */}
        {!isAuthenticated && (
          <div className='mt-8 flex justify-center space-x-4'>
            <Link 
              href="/login" 
              className='px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 hover-lift font-medium'
            >
              🔑 Giriş Yap
            </Link>
            <Link 
              href="/register" 
              className='px-6 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-all duration-300 hover-lift font-medium'
            >
              📝 Kayıt Ol
            </Link>
          </div>
        )}
      </section>

      {/* YBS Tanımı */}
      <Card className='mb-16'>
        <h2 className='text-3xl font-bold text-text mb-6 text-center border-b-2 border-text-accent pb-3'>
          Yönetim Bilişim Sistemleri (YBS) Nedir?
        </h2>
        <p className='text-base text-text-light leading-relaxed text-justify'>
          Yönetim Bilişim Sistemleri (YBS), işletme yönetimi ile bilgi
          teknolojilerini bir araya getiren disiplinlerarası bir alandır. Bu
          bölüm, öğrencilere hem iş süreçlerini anlama hem de bu süreçleri
          teknolojiyle optimize etme becerileri kazandırır.
        </p>
      </Card>

      {/* Modül Kartları */}
      <section className='text-center'>
        <h2 className='text-3xl font-bold text-text mb-8 border-b-2 border-text-accent pb-3'>
          Uygulama Modülleri
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Link href="/mufredat" className='block'>
            <Card className='h-full flex flex-col items-center justify-center text-center'>
              <h3 className='text-2xl font-bold text-text-accent mb-2'>Müfredat</h3>
              <p className='text-text-light text-sm'>
                Ders müfredatını interaktif olarak inceleyin.
              </p>
            </Card>
          </Link>
          <Link href="/ders-notlari" className='block'>
            <Card className='h-full flex flex-col items-center justify-center text-center'>
              <h3 className='text-2xl font-bold text-text-accent mb-2'>
                Ders Notları
              </h3>
              <p className='text-text-light text-sm'>
                Paylaşılan ders notlarına kolayca erişin.
              </p>
            </Card>
          </Link>
          <Link href="/sinav-simulasyonu" className='block'>
            <Card className='h-full flex flex-col items-center justify-center text-center'>
              <h3 className='text-2xl font-bold text-text-accent mb-2'>
                Sınav Simülasyonu
              </h3>
              <p className='text-text-light text-sm'>
                Gerçek sınav deneyimi yaşayın.
              </p>
            </Card>
          </Link>
          <Link href="/kisisel-takip" className='block'>
            <Card className='h-full flex flex-col items-center justify-center text-center'>
              <h3 className='text-2xl font-bold text-text-accent mb-2'>
                Kişisel Takip
              </h3>
              <p className='text-text-light text-sm'>
                Gelişiminizi takip edin ve analiz edin.
              </p>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
} 