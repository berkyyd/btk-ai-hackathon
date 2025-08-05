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
            <div className="flex space-x-sm">
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
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
                <Link href="/help" className="text-body text-gray-600 hover:text-primary-500 transition-colors duration-200">
                  Yardım Merkezi
                </Link>
              </li>
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
