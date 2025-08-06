import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-xl">
      <div className="max-w-container mx-auto px-md lg:px-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-xl">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-sm mb-md">
              <div className="relative w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                <svg className="w-5 h-5 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">YBS Buddy</span>
                <span className="text-xs text-gray-500 font-medium">Eğitim Platformu</span>
              </div>
            </div>
            <p className="text-body text-gray-600 mb-md max-w-md">
              Yönetim Bilişim Sistemleri öğrencileri için modern eğitim platformu. 
              Ders notları, müfredat, sınav simülasyonu ve kişisel takip özellikleri.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-h4 font-semibold text-gray-900 mb-md">Hızlı Linkler</h3>
            <ul className="space-y-sm">
              <li>
                <Link href="/ders-notlari" className="text-body text-gray-600 hover:text-primary-500 transition-colors duration-200">
                  Ders Notları
                </Link>
              </li>
              <li>
                <Link href="/mufredat" className="text-body text-gray-600 hover:text-primary-500 transition-colors duration-200">
                  Müfredat
                </Link>
              </li>
              <li>
                <Link href="/sinav-simulasyonu" className="text-body text-gray-600 hover:text-primary-500 transition-colors duration-200">
                  Sınav Simülasyonu
                </Link>
              </li>
              <li>
                <Link href="/kisisel-takip" className="text-body text-gray-600 hover:text-primary-500 transition-colors duration-200">
                  Kişisel Takip
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-h4 font-semibold text-gray-900 mb-md">Destek</h3>
            <ul className="space-y-sm">
              <li>
                <Link href="/contact" className="text-body text-gray-600 hover:text-primary-500 transition-colors duration-200">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-100 mt-xl pt-md">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-small text-gray-500">
              © 2025 YBS Buddy. Tüm hakları saklıdır.
            </p>
            <p className="text-small text-gray-500 mt-sm md:mt-0">
              Yönetim Bilişim Sistemleri Eğitim Platformu
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
