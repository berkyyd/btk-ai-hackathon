# YBS Buddy - Akademik Destek Platformu

**YBS Buddy**, Bandırma Onyedi Eylül Üniversitesi Yönetim Bilişim Sistemleri (YBS) bölümü öğrencileri için tasarlanmış kapsamlı bir akademik destek ve kariyer gelişim platformudur.

## 🚀 Özellikler

### 📚 Ana Modüller
- **Ana Sayfa**: YBS bölümü tanıtımı ve kariyer bilgileri
- **Müfredat Görüntüleyici**: Sınıf ve dönem bazında ders filtreleme
- **Ders Notları**: PDF yükleme ve metin çıkarma özelliği
- **Sınav Simülasyonu**: AI destekli quiz üretimi
- **Profil Yönetimi**: Kullanıcı hesap yönetimi

### 🤖 AI Entegrasyonu
- **Gemini API**: Quiz soruları üretimi ve not özetleme
- **PDF İşleme**: PDF dosyalarından metin çıkarma
- **Akıllı Yönlendirme**: Kullanıcı performansına göre öneriler

### 🔐 Güvenlik
- **Firebase Authentication**: Güvenli kullanıcı girişi
- **Firestore**: Gerçek zamanlı veri yönetimi
- **Role-based Access**: Akademisyen ve öğrenci rolleri

## 🛠️ Teknoloji Yığını

### Frontend
- **Next.js 15**: App Router ile modern React framework
- **TypeScript**: Tip güvenliği
- **Tailwind CSS**: Utility-first CSS framework
- **React 19**: Component-based UI

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Firebase**: Authentication, Firestore, Storage
- **Google Gemini API**: AI-powered content generation

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## 📦 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm 8+
- Firebase hesabı
- Google AI Studio hesabı (Gemini API)

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone <repository-url>
cd ybs-buddy
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment dosyasını oluşturun**
```bash
cp .env.example .env.local
```

4. **Environment değişkenlerini ayarlayın**
```bash
# .env.local dosyasına ekleyin:
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
GEMINI_API_KEY=your_gemini_api_key
```

5. **Development server'ı başlatın**
```bash
npm run dev
```

6. **Tarayıcıda açın**
```
http://localhost:3000
```

## 🚀 Kullanılabilir Komutlar

```bash
# Development server başlatma
npm run dev

# Production build
npm run build

# Production server başlatma
npm run start

# Code linting
npm run lint
```

## 📁 Proje Yapısı

```
ybs-buddy/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API endpoints
│   │   ├── ders-notlari/      # Ders notları sayfası
│   │   ├── mufredat/          # Müfredat sayfası
│   │   ├── sinav-simulasyonu/ # Sınav simülasyonu
│   │   ├── login/             # Giriş sayfası
│   │   ├── register/          # Kayıt sayfası
│   │   └── profile/           # Profil sayfası
│   ├── components/            # Reusable UI components
│   ├── contexts/              # React Context providers
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   ├── config/                # Configuration files
│   └── constants.ts           # Application constants
├── docs/                      # Project documentation
├── public/                    # Static assets
└── package.json
```

## 🔧 Firebase Kurulumu

1. **Firebase Console'da proje oluşturun**
2. **Authentication'ı etkinleştirin** (Email/Password)
3. **Firestore Database'i oluşturun**
4. **Storage'ı etkinleştirin**
5. **Web app ekleyin** ve config bilgilerini alın

## 🤖 Gemini API Kurulumu

1. **Google AI Studio'ya gidin**
2. **API key oluşturun**
3. **Environment değişkenine ekleyin**

## 📚 Dokümantasyon

- [Proje Bilgileri](docs/proje_bilgileri.md) - Teknik geliştirici rehberi
- [Development Guidelines](docs/development_guidelines.md) - Geliştirme kuralları
- [TODO](docs/TODO.md) - Yapılacaklar listesi
- [PRD](docs/version1_prd.md) - Ürün gereksinim dokümanı

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 Geliştirici

**YBS Buddy** - Bandırma Onyedi Eylül Üniversitesi YBS Bölümü Öğrenci Projesi

---

**Not**: Bu proje eğitim amaçlı geliştirilmiştir ve sürekli güncellenmektedir.
