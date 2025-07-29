import Link from 'next/link'
import Card from '../components/Card'

export default function HomePage() {
  return (
    <div className='py-8'>
      {/* Hero Section */}
      <section className='text-center mb-16 animate-fadeIn'>
        <h1 className='text-5xl font-extrabold text-text leading-tight mb-4'>
          YBS Buddy'ye Hoş Geldiniz!
        </h1>
        <p className='text-lg text-text-light max-w-3xl mx-auto leading-relaxed'>
          Bandırma Onyedi Eylül Üniversitesi Yönetim Bilişim Sistemleri (YBS)
          bölümü öğrencileri için tasarlanmış, akademik başarıyı ve kariyer
          gelişimini destekleyen kapsamlı platformunuz.
        </p>
      </section>

      {/* YBS Tanımı */}
      <Card className='mb-16'>
        <h2 className='text-3xl font-bold text-text mb-6 text-center border-b-2 border-primary pb-3'>
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
        <h2 className='text-3xl font-bold text-text mb-8 border-b-2 border-primary pb-3'>
          Uygulama Modülleri
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <Link href="/mufredat" className='block'>
            <Card className='h-full flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300'>
              <h3 className='text-2xl font-bold text-primary mb-2'>Müfredat</h3>
              <p className='text-text-light text-sm'>
                Ders müfredatını interaktif olarak inceleyin.
              </p>
            </Card>
          </Link>
          <Link href="/ders-notlari" className='block'>
            <Card className='h-full flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300'>
              <h3 className='text-2xl font-bold text-primary mb-2'>
                Ders Notları
              </h3>
              <p className='text-text-light text-sm'>
                Paylaşılan ders notlarına kolayca erişin.
              </p>
            </Card>
          </Link>
          <Link href="/sinav-simulasyonu" className='block'>
            <Card className='h-full flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300'>
              <h3 className='text-2xl font-bold text-primary mb-2'>
                Sınav Simülasyonu
              </h3>
              <p className='text-text-light text-sm'>
                Gerçek sınav deneyimi yaşayın.
              </p>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
} 