# YBS Buddy - Yönetim Bilişim Sistemleri Eğitim Platformu

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS 3" />
  <img src="https://img.shields.io/badge/Firebase-12-orange?style=for-the-badge&logo=firebase" alt="Firebase 12" />
  <img src="https://img.shields.io/badge/Gemini-API-green?style=for-the-badge&logo=google" alt="Gemini API" />
</div>

## 📖 Proje Hakkında

**YBS Buddy**, Bandırma Onyedi Eylül Üniversitesi Yönetim Bilişim Sistemleri (YBS) bölümü öğrencileri için tasarlanmış kapsamlı bir akademik destek ve kariyer gelişim platformudur. Modern web teknolojileri ve yapay zeka entegrasyonu ile öğrencilerin akademik başarılarını artırmayı hedefleyen yenilikçi bir eğitim ekosistemi.

### 🎯 Ana Hedefler
- **Akademik Başarıyı Artırmak:** Ders materyallerine, müfredata ve sınav hazırlık araçlarına tek yerden erişim
- **Kaynakları Merkezileştirmek:** Ders notları, müfredat bilgileri ve kişisel çalışma materyallerini tek platformda birleştirme
- **Modern Öğrenme Deneyimi:** Temiz, sezgisel ve mobil uyumlu arayüz ile verimli öğrenme süreci
- **Kariyer Farkındalığı:** YBS bölümü ve kariyer olanakları hakkında bilgilendirme
- **Veri Güvenliği:** Kişisel notlar ve hassas verilerin güvenli saklanması

---

## 🚀 Özellikler

### 📚 Ana Modüller

#### 🏠 Ana Sayfa
- YBS bölümü tanıtımı ve kariyer bilgileri
- Platform özelliklerinin tanıtımı
- Hızlı navigasyon kartları
- Modern ve responsive tasarım

#### 📖 Müfredat Görüntüleyici
- Sınıf (1-4) ve dönem (Güz/Bahar) bazında filtreleme
- Ders türüne göre filtreleme (Zorunlu/Seçmeli)
- Dinamik ders listesi görüntüleme
- Her ders için detaylı bilgi kartları

#### 📝 Ders Notları
- PDF dosya yükleme ve metin çıkarma
- Not paylaşım platformu
- Gemini API ile akıllı not özetleme
- Favorilere ekleme
- Arama ve filtreleme özellikleri

#### 📊 Sınav Simülasyonu
- AI destekli quiz üretimi (Gemini API)
- Farklı sınav formatları (Test, Boşluk Doldurma, Doğru/Yanlış)
- Zorluk seviyesi seçimi
- Gerçek zamanlı sınav deneyimi
- Sonuç analizi ve performans takibi

#### 👤 Kişisel Takip
- Quiz sonuçları analizi
- Zayıf alan tespiti
- Kişiselleştirilmiş öneriler
- Akademik gelişim takibi

#### 🔐 Kullanıcı Yönetimi
- Firebase Authentication ile güvenli giriş
- Kullanıcı profil yönetimi
- Admin paneli (akademisyenler için)
- Davet kodu sistemi

### 🤖 AI Entegrasyonu

#### Gemini API Özellikleri
- **Quiz Üretimi:** Ders konularına uygun sorular oluşturma
- **Not Özetleme:** Uzun notları kısa ve anlaşılır özetlere dönüştürme
- **Akademik Yönlendirme:** Kullanıcı performansına göre öneriler
- **PDF İşleme:** PDF dosyalarından metin çıkarma
- **Türkçe Optimizasyonu:** Türkçe dil desteği ile prompt'lar

---

## 🛠️ Teknoloji Yığını

### Frontend
- **Next.js 15:** App Router ile modern React framework
- **React 19:** Component-based UI library
- **TypeScript 5:** Tip güvenliği ve geliştirici deneyimi
- **Tailwind CSS 3:** Utility-first CSS framework
- **ESLint + Prettier:** Kod kalitesi ve formatlama

### Backend
- **Next.js API Routes:** Server-side API endpoints
- **Firebase 12:** Backend-as-a-Service platformu
  - **Firestore:** NoSQL veritabanı
  - **Authentication:** Kullanıcı kimlik doğrulama
  - **Storage:** Dosya yönetimi
- **Google Gemini API:** Yapay zeka entegrasyonu

### Development Tools
- **Node.js 18+:** Runtime environment
- **NPM:** Package management
- **Git:** Version control
- **Vercel:** Deployment platform (önerilen)

---

## 📦 Kurulum ve Geliştirme

### Gereksinimler
- **Node.js:** v18.0.0 veya üzeri
- **NPM:** v9.0.0 veya üzeri
- **Git:** Version control
- **Firebase hesabı:** Backend servisleri için
- **Google AI Studio hesabı:** Gemini API için

### Adım Adım Kurulum

#### 1. Repository'yi Klonlayın
```bash
git clone <repository-url>
cd ybs-buddy
```

#### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

#### 3. Environment Dosyasını Oluşturun
```bash
cp .env.example .env.local
```

#### 4. Environment Değişkenlerini Ayarlayın
`.env.local` dosyasına aşağıdaki değişkenleri ekleyin:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
GEMINI_SUMMARY_API_KEY=your_gemini_summary_api_key

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 5. Development Server'ı Başlatın
```bash
npm run dev
```

#### 6. Tarayıcıda Açın
```
http://localhost:3000
```

### Kullanılabilir Komutlar

```bash
# Development
npm run dev          # Development server başlatma
npm run build        # Production build
npm run start        # Production server başlatma

# Code Quality
npm run lint         # ESLint ile kod kontrolü
npm run lint:fix     # ESLint hatalarını otomatik düzeltme
npm run type-check   # TypeScript tip kontrolü
npm run format       # Prettier ile kod formatlama

# Testing
npm run test         # Jest testleri çalıştırma
npm run test:watch   # Test izleme modu
npm run test:coverage # Test coverage raporu
```

---

## 🔧 Firebase Kurulumu

### 1. Firebase Console'da Proje Oluşturun
1. [Firebase Console](https://console.firebase.google.com/)'a gidin
2. "Add project" butonuna tıklayın
3. Proje adını girin (örn: "ybs-buddy")
4. Google Analytics'i etkinleştirin (isteğe bağlı)
5. "Create project" butonuna tıklayın

### 2. Authentication'ı Etkinleştirin
1. Sol menüden "Authentication" seçin
2. "Get started" butonuna tıklayın
3. "Sign-in method" sekmesine gidin
4. "Email/Password" sağlayıcısını etkinleştirin
5. "Save" butonuna tıklayın

### 3. Firestore Database'i Oluşturun
1. Sol menüden "Firestore Database" seçin
2. "Create database" butonuna tıklayın
3. "Start in test mode" seçin (geliştirme için)
4. Bölge seçin (örn: "europe-west3")
5. "Done" butonuna tıklayın

### 4. Storage'ı Etkinleştirin
1. Sol menüden "Storage" seçin
2. "Get started" butonuna tıklayın
3. "Start in test mode" seçin
4. Bölge seçin (Firestore ile aynı)
5. "Done" butonuna tıklayın

### 5. Web App Ekleyin
1. Proje genel bakış sayfasında "</>" simgesine tıklayın
2. App nickname girin (örn: "ybs-buddy-web")
3. "Register app" butonuna tıklayın
4. Config bilgilerini kopyalayın ve `.env.local` dosyasına ekleyin

---

## 🤖 Gemini API Kurulumu

### 1. Google AI Studio'ya Gidin
1. [Google AI Studio](https://makersuite.google.com/)'ya gidin
2. Google hesabınızla giriş yapın

### 2. API Key Oluşturun
1. Sol menüden "API keys" seçin
2. "Create API key" butonuna tıklayın
3. API key'i kopyalayın
4. `.env.local` dosyasına `GEMINI_API_KEY` olarak ekleyin

### 3. Billing Ayarlayın (Gerekirse)
1. Google Cloud Console'a gidin
2. Billing hesabı oluşturun
3. API kullanımı için kredi kartı ekleyin

---

## 📁 Proje Yapısı

```
ybs-buddy/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # Backend API endpoints
│   │   │   ├── auth/          # Kimlik doğrulama
│   │   │   ├── courses/       # Ders yönetimi
│   │   │   ├── notes/         # Not yönetimi
│   │   │   ├── quiz/          # Quiz sistemi
│   │   │   ├── analytics/     # Analitik
│   │   │   └── upload/        # Dosya yükleme
│   │   ├── ders-notlari/      # Ders notları sayfası
│   │   ├── mufredat/          # Müfredat sayfası
│   │   ├── sinav-simulasyonu/ # Sınav simülasyonu
│   │   ├── kisisel-takip/     # Kişisel takip
│   │   ├── profile/           # Profil sayfası
│   │   ├── login/             # Giriş sayfası
│   │   ├── register/          # Kayıt sayfası
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Ana sayfa
│   │   └── globals.css        # Global stiller
│   ├── components/            # Reusable UI components
│   │   ├── Header.tsx         # Navigasyon
│   │   ├── Footer.tsx         # Alt bilgi
│   │   ├── Card.tsx           # Genel kart
│   │   ├── QuizForm.tsx       # Quiz formu
│   │   ├── FileUpload.tsx     # Dosya yükleme
│   │   └── ...
│   ├── contexts/              # React Context providers
│   │   └── AuthContext.tsx    # Kimlik doğrulama durumu
│   ├── utils/                 # Utility functions
│   │   ├── geminiService.ts   # Gemini API entegrasyonu
│   │   ├── firebaseUtils.ts   # Firebase yardımcıları
│   │   ├── apiClient.ts       # HTTP client
│   │   └── ...
│   ├── types/                 # TypeScript tip tanımları
│   ├── config/                # Konfigürasyon dosyaları
│   └── constants.ts           # Uygulama sabitleri
├── docs/                      # Proje dokümantasyonu
├── public/                    # Static assets
├── package.json               # Proje konfigürasyonu
├── next.config.ts             # Next.js konfigürasyonu
├── tailwind.config.cjs        # Tailwind CSS konfigürasyonu
└── tsconfig.json              # TypeScript konfigürasyonu
```

---

## 🚀 Deployment

### Vercel ile Deployment (Önerilen)

#### 1. Vercel CLI Kurulumu
```bash
npm i -g vercel
```

#### 2. Vercel'e Giriş
```bash
vercel login
```

#### 3. Projeyi Deploy Edin
```bash
vercel
```

#### 4. Environment Variables Ayarlayın
1. Vercel Dashboard'a gidin
2. Projenizi seçin
3. Settings > Environment Variables
4. Tüm environment variables'ları ekleyin

---

## 🔒 Güvenlik

### Environment Variables
- Hassas bilgileri asla Git'e commit etmeyin
- `.env.local` dosyasını `.gitignore`'a ekleyin
- Production'da platform-specific secret management kullanın

### Firebase Security Rules
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /notes/{noteId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### API Security
- Rate limiting uygulayın
- Input validation yapın
- CORS ayarlarını yapılandırın

---

## 📚 Dokümantasyon

### 📖 Teknik Dokümantasyon
- [Proje Bilgileri](docs/proje_bilgileri.md) - Teknik geliştirici rehberi
- [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md) - Sistem mimarisi ve teknik detaylar
- [API Reference](docs/API_REFERENCE.md) - API endpoint'leri ve kullanım kılavuzu
- [Development Guidelines](docs/development_guidelines.md) - Geliştirme kuralları

### 👥 Kullanıcı Dokümantasyonu
- [User Guide](docs/USER_GUIDE.md) - Kullanıcı kılavuzu ve özellik açıklamaları
- [Chatbot Guide](docs/CHATBOT_GUIDE.md) - Chatbot kullanım rehberi

### 📋 Proje Yönetimi
- [TODO](docs/TODO.md) - Yapılacaklar listesi ve proje durumu
- [PRD](docs/version1_prd.md) - Ürün gereksinim dokümanı
- [Contributing](docs/CONTRIBUTING.md) - Katkıda bulunma rehberi
- [Changelog](docs/CHANGELOG.md) - Versiyon geçmişi ve değişiklikler

---

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

### Geliştirme Kuralları
- Clean Code prensiplerini takip edin
- TypeScript tip güvenliğini koruyun
- ESLint kurallarına uyun
- Prettier ile kod formatlaması yapın
- Test coverage'ını koruyun

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 👥 Geliştirici

**YBS Buddy** - Bandırma Onyedi Eylül Üniversitesi YBS Bölümü Öğrenci Projesi

### İletişim
- **GitHub:** https://github.com/berkyyd/btk-ai-hackathon
- **Berkay Demircanlı:** bdemircanli15@gmail.com
- **Cenker Gültekin:** cenkergultekin0@gmail.com

---

## 🔄 Changelog

### v1.0.0 (06.08.2025)
- ✅ Next.js 15 ile modern web uygulaması
- ✅ Firebase entegrasyonu (Auth, Firestore, Storage)
- ✅ Gemini API ile AI entegrasyonu
- ✅ Responsive tasarım (Tailwind CSS)
- ✅ TypeScript ile tip güvenliği
- ✅ Quiz üretimi ve analizi
- ✅ PDF işleme ve not yönetimi
- ✅ Kullanıcı yönetimi ve profil sistemi
- ✅ Chatbot sistemi
- ✅ Kişisel takip ve analitik
- ✅ Müfredat yönetimi
- ✅ Dosya upload sistemi

---

**Not:** Bu proje BTK AI Hackathon kapsamında eğitim amaçlı geliştirilmiştir ve sürekli güncellenmektedir. Son güncellemeler için [CHANGELOG](docs/CHANGELOG.md) dosyasını kontrol edin.

---

## 🏆 Proje Bilgileri

- **Proje Adı:** YBS Buddy
- **Versiyon:** 1.0.0
- **Geliştirme:** BTK AI Hackathon Projesi
- **Teknoloji:** Next.js 15 + React 19 + TypeScript + Firebase + Gemini API
- **Durum:** Production Ready ✅
