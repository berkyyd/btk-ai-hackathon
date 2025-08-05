import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-hidden border-b border-gray-200/60">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-indigo-300 rounded-full opacity-15 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-purple-400 rounded-full opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-green-200 rounded-full opacity-10 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">📚</span>
              </div>
              <h1 className="text-6xl font-extrabold text-gray-900 leading-tight bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                YBS Buddy
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              Yönetim Bilişim Sistemleri alanında kapsamlı eğitim materyalleri, interaktif sınav simülasyonları ve kişiselleştirilmiş öğrenme deneyimi sunan yenilikçi dijital platform. Akademik mükemmelliği teknolojik yeniliklerle birleştirerek, öğrencilerin teorik bilgilerini pratik becerilere dönüştürmelerini sağlayan kapsamlı eğitim ekosistemi.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/register" 
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 font-semibold text-lg"
              >
                🚀 Hemen Başla
              </Link>
              <Link 
                href="/mufredat" 
                className="px-8 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 font-semibold text-lg"
              >
                📖 Müfredatı İncele
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🎯</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">YBS Nedir?</h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto font-medium">
              Yönetim Bilişim Sistemleri (YBS), işletmelerin bilgi teknolojilerini kullanarak 
              verimliliğini artırmasını ve rekabet avantajı elde etmesini sağlayan bir disiplindir. 
              Bu alan, işletme yönetimi ile bilgi teknolojilerini birleştirerek, organizasyonların 
              dijital dönüşüm süreçlerini yönetmelerine yardımcı olur.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">✨</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Platform Özellikleri
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              YBS öğrencileri için özel olarak tasarlanmış kapsamlı öğrenme araçları
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Ders Notları */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-8 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 leading-tight">Ders Notları</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                YBS müfredatına uygun kapsamlı ders notları ve kaynaklar
              </p>
              <Link href="/ders-notlari" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors group-hover:translate-x-1 inline-block transition-transform duration-300">
                İncele →
              </Link>
            </div>

            {/* Müfredat */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-8 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 leading-tight">Müfredat</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Güncel YBS müfredatı ve ders planları
              </p>
              <Link href="/mufredat" className="text-green-600 font-semibold hover:text-green-700 transition-colors group-hover:translate-x-1 inline-block transition-transform duration-300">
                İncele →
              </Link>
            </div>

            {/* Sınav Simülasyonu */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-8 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 leading-tight">Sınav Simülasyonu</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Gerçek sınav deneyimi sunan interaktif testler
              </p>
              <Link href="/sinav-simulasyonu" className="text-amber-600 font-semibold hover:text-amber-700 transition-colors group-hover:translate-x-1 inline-block transition-transform duration-300">
                İncele →
              </Link>
            </div>

            {/* Kişisel Takip */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-8 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 leading-tight">Kişisel Takip</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Öğrenme sürecinizi takip edin ve gelişiminizi görün
              </p>
              <Link href="/kisisel-takip" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors group-hover:translate-x-1 inline-block transition-transform duration-300">
                İncele →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 