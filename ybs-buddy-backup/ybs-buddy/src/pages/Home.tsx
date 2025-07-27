import { Link } from 'react-router-dom'
import Card from '../components/Card.tsx'
import { ROUTES } from '../constants.ts'

function Home() {
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
          teknolojiyle optimize etme becerileri kazandırır. YBS mezunları,
          organizasyonların verimliliğini artırmak, karar alma süreçlerini
          desteklemek ve rekabet avantajı sağlamak için bilgi sistemlerini
          tasarlar, geliştirir ve yönetirler. Günümüzün hızla değişen dijital
          dünyasında, YBS profesyonelleri, işletmelerin teknolojiyle uyum
          sağlamasında ve yenilikçi çözümler üretmesinde köprü görevi görürler.
        </p>
      </Card>

      {/* Kariyer Alanları */}
      <section className='mb-16'>
        <h2 className='text-3xl font-bold text-text mb-8 text-center border-b-2 border-primary pb-3'>
          YBS Mezunları İçin Kariyer Alanları
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Statik veriler kaldırıldı - Backend entegrasyonu gerekiyor */}
          <Card>
            <h3 className='text-xl font-semibold text-primary mb-3'>
              Kariyer Alanları
            </h3>
            <p className='text-text-light leading-relaxed text-sm'>
              Backend entegrasyonu sonrası dinamik veriler yüklenecek.
            </p>
          </Card>
        </div>
      </section>

      {/* Teknoloji Alanları */}
      <Card className='mb-16'>
        <h2 className='text-3xl font-bold text-text mb-6 text-center border-b-2 border-primary pb-3'>
          Bölümde Odaklanılan Temel Teknoloji Alanları
        </h2>
        <ul className='list-disc list-inside text-base text-text-light space-y-2 max-w-3xl mx-auto'>
          {/* Statik veriler kaldırıldı - Backend entegrasyonu gerekiyor */}
          <li>
            <span className='font-semibold text-primary'>
              Teknoloji Alanları:
            </span>{' '}
            Backend entegrasyonu sonrası dinamik veriler yüklenecek.
          </li>
        </ul>
      </Card>

      {/* Modül Kartları */}
      <section className='text-center'>
        <h2 className='text-3xl font-bold text-text mb-8 border-b-2 border-primary pb-3'>
          Uygulama Modülleri
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <Link to={ROUTES.MUFEDAT} className='block'>
            <Card className='h-full flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300'>
              <h3 className='text-2xl font-bold text-primary mb-2'>Müfredat</h3>
              <p className='text-text-light text-sm'>
                Ders müfredatını interaktif olarak inceleyin.
              </p>
            </Card>
          </Link>
          <Link to={ROUTES.DERS_NOTLARI} className='block'>
            <Card className='h-full flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300'>
              <h3 className='text-2xl font-bold text-primary mb-2'>
                Ders Notları
              </h3>
              <p className='text-text-light text-sm'>
                Paylaşılan ders notlarına kolayca erişin.
              </p>
            </Card>
          </Link>
          <Link to={ROUTES.NOT_ALANI} className='block'>
            <Card className='h-full flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300'>
              <h3 className='text-2xl font-bold text-primary mb-2'>
                Akıllı Not Tutma
              </h3>
              <p className='text-text-light text-sm'>
                Kişisel notlarınızı güvenle oluşturun ve düzenleyin.
              </p>
            </Card>
          </Link>
          <Link to={ROUTES.SINAV_SIMULASYONU} className='block'>
            <Card className='h-full flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300'>
              <h3 className='text-2xl font-bold text-primary mb-2'>
                Sınav Simülasyonu
              </h3>
              <p className='text-text-light text-sm'>
                Sınavlara gerçekçi bir ortamda hazırlanmak için kendinizi test
                edin.
              </p>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
