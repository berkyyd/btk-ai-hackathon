# YBS Buddy Projesi - Teknik Geliştirici Rehberi

**Oluşturulma Tarihi:** 26 Temmuz 2025  
**Güncelleme Tarihi:** 28 Temmuz 2025  
**Proje Türü:** Next.js + TypeScript + Firebase + Gemini API Web Uygulaması  
**Hedef Geliştirici:** Full-stack Geliştiriciler ve Kod İnceleyiciler  

---

## 🏗️ Proje Mimarisi ve Teknik Yapı

YBS Buddy, modern web geliştirme standartlarına uygun olarak Next.js App Router + TypeScript + Firebase + Gemini API teknoloji yığını ile geliştirilmiştir. Proje, Clean Code prensiplerine uygun modüler bir yapıya sahiptir.

### 🎯 Teknik Hedefler
- **Performans:** Next.js App Router ile hızlı sayfa yükleme ve SEO optimizasyonu
- **Tip Güvenliği:** TypeScript ile compile-time hata kontrolü
- **Backend Entegrasyonu:** Firebase Firestore ile real-time veri yönetimi
- **AI Entegrasyonu:** Gemini API ile akıllı içerik üretimi
- **Kod Kalitesi:** ESLint + Prettier ile standart kod yazımı
- **Responsive Tasarım:** Tailwind CSS ile mobil-first yaklaşım
- **Modülerlik:** Component-based mimari ile yeniden kullanılabilir kod

> **💡 Yeni Geliştiriciler İçin Açıklama:** Bu proje, modern web uygulamaları geliştirirken kullanılan en güncel araçları bir araya getiriyor. Next.js, React tabanlı bir framework olup hem frontend hem de backend işlevlerini sunar. Firebase, Google'ın sunduğu backend-as-a-service platformudur. Gemini API, Google'ın yapay zeka modeli ile akıllı içerik üretimi sağlar.

---

## 📁 Kod Yapısı ve Teknik Organizasyon

### 🗂️ Source Code Organizasyonu

#### `src/` - Ana Kaynak Kod Dizini
**Mimari Yaklaşım:** Next.js App Router + Component-based React mimarisi  
**Organizasyon Prensibi:** Separation of Concerns (SoC) + Feature-based organization  
**İçeriği:**
- `app/` - Next.js App Router sayfaları ve API routes
- `components/` - Reusable UI components (Card, Header, Footer)
- `contexts/` - React Context API ile global state management
- `config/` - Firebase ve diğer servis konfigürasyonları
- `utils/` - Utility fonksiyonları ve API client'ları
- `types/` - TypeScript tip tanımları
- `constants/` - Uygulama sabitleri

> **💡 Yeni Geliştiriciler İçin Açıklama:** `src` klasörü, uygulamanızın tüm kodlarının bulunduğu ana klasördür. Next.js App Router, sayfa yönlendirmelerini dosya sistemi üzerinden yapar. `app` klasöründe her klasör bir route'u temsil eder. `contexts` klasörü, uygulama genelinde paylaşılan verileri (kullanıcı bilgisi gibi) yönetir.

#### `src/app/` - Next.js App Router Yapısı
**Mimari:** File-based routing  
**İçeriği:**
- `page.tsx` - Ana sayfa (`/`)
- `layout.tsx` - Root layout (Header, Footer, AuthProvider)
- `globals.css` - Global CSS stilleri
- `ders-notlari/` - Ders notları sayfası (`/ders-notlari`)
- `mufredat/` - Müfredat sayfası (`/mufredat`)
- `sinav-simulasyonu/` - Sınav simülasyonu sayfası (`/sinav-simulasyonu`)
- `login/` - Giriş sayfası (`/login`)
- `register/` - Kayıt sayfası (`/register`)
- `api/` - Backend API endpoints

> **💡 Yeni Geliştiriciler İçin Açıklama:** Next.js App Router'da her klasör bir URL path'ini temsil eder. `page.tsx` dosyası o route'un ana sayfasını, `layout.tsx` dosyası ise o route'un layout'unu tanımlar. `api` klasörü, backend endpoint'lerini içerir.

#### `src/app/api/` - Backend API Endpoints
**Mimari:** Next.js API Routes  
**İçeriği:**
- `auth/` - Kimlik doğrulama endpoint'leri
  - `login/route.ts` - Kullanıcı girişi
  - `register/route.ts` - Kullanıcı kaydı
- `courses/route.ts` - Ders CRUD işlemleri
- `notes/` - Not yönetimi
  - `route.ts` - Not CRUD işlemleri
  - `summarize/route.ts` - Gemini API ile not özetleme
- `quiz/generate/route.ts` - Gemini API ile quiz üretimi

> **💡 Yeni Geliştiriciler İçin Açıklama:** `api` klasörü, backend işlevlerini içerir. Her `route.ts` dosyası bir HTTP endpoint'ini temsil eder. Firebase ile entegre çalışır ve Gemini API'yi kullanarak akıllı içerik üretir.

#### `src/components/` - UI Components
**Mimari:** Reusable component pattern  
**İçeriği:**
- `Card.tsx` - Genel kart komponenti
- `Header.tsx` - Navigasyon ve kullanıcı durumu
- `Footer.tsx` - Alt bilgi komponenti

> **💡 Yeni Geliştiriciler İçin Açıklama:** `components` klasörü, uygulama genelinde kullanılan UI parçalarını içerir. Bu komponentler yeniden kullanılabilir ve farklı sayfalarda aynı görünümü sağlar.

#### `src/contexts/` - Global State Management
**Mimari:** React Context API  
**İçeriği:**
- `AuthContext.tsx` - Kullanıcı kimlik doğrulama durumu

> **💡 Yeni Geliştiriciler İçin Açıklama:** `contexts` klasörü, uygulama genelinde paylaşılan verileri yönetir. `AuthContext`, kullanıcının giriş durumunu tüm uygulamada takip eder.

#### `src/config/` - Servis Konfigürasyonları
**Mimari:** Centralized configuration  
**İçeriği:**
- `firebase.ts` - Firebase konfigürasyonu ve servisleri

> **💡 Yeni Geliştiriciler İçin Açıklama:** `config` klasörü, harici servislerin konfigürasyonlarını içerir. Firebase bağlantısı ve servisleri burada tanımlanır.

#### `src/utils/` - Utility Functions
**Mimari:** Helper functions ve API clients  
**İçeriği:**
- `apiClient.ts` - HTTP API istekleri için client
- `geminiService.ts` - Gemini API entegrasyonu
- `errorHandler.ts` - Hata yönetimi utilities

> **💡 Yeni Geliştiriciler İçin Açıklama:** `utils` klasörü, yardımcı fonksiyonları içerir. `apiClient`, backend API'lerine istek göndermek için kullanılır. `geminiService`, yapay zeka entegrasyonu için kullanılır.

#### `docs/` - Teknik Dokümantasyon
**Amaç:** Development guidelines ve project specifications  
**İçeriği:**
- `development_guidelines.md` - Geliştirme kuralları
- `TODO.md` - Development roadmap ve progress tracking
- `version1_prd.md` - Product requirements specification
- `proje_bilgileri.md` - Technical developer guide (bu dosya)

> **💡 Yeni Geliştiriciler İçin Açıklama:** `docs` klasörü, proje hakkında tüm yazılı dokümantasyonu içerir. PRD (Product Requirements Document), projenin gereksinimlerini tanımlar.

#### `public/` - Static Assets
**Build-time:** Next.js tarafından doğrudan serve edilir  
**İçeriği:**
- `vite.svg` - Default logo (placeholder)

> **💡 Yeni Geliştiriciler İçin Açıklama:** `public` klasörü, tarayıcıda doğrudan erişilebilen dosyaları içerir. Bu dosyalar, uygulamanız çalışırken değişmeyen dosyalardır.

#### `.next/` - Build Output
**Build Tool:** Next.js production build  
**Git Status:** Ignored (otomatik oluşturulur)

> **💡 Yeni Geliştiriciler İçin Açıklama:** `.next` klasörü, uygulamanızın çalışır hale getirilmiş versiyonunu içerir. Bu klasör, `npm run build` komutu çalıştırıldığında otomatik olarak oluşturulur.

#### `node_modules/` - Dependencies
**Package Manager:** npm  
**Git Status:** Ignored (otomatik oluşturulur)

> **💡 Yeni Geliştiriciler İçin Açıklama:** `node_modules` klasörü, projenizin ihtiyaç duyduğu tüm kütüphaneleri içerir. Bu klasör çok büyük olduğu için Git'e dahil edilmez.

### 📄 Configuration Files ve Build Setup

#### `package.json` - Project Configuration
**Purpose:** NPM package configuration ve dependency management  
**Key Sections:**
- `scripts`: Development, build, preview commands
- `dependencies`: Runtime dependencies (Next.js, React, Firebase)
- `devDependencies`: Development tools (TypeScript, ESLint)

> **💡 Yeni Geliştiriciler İçin Açıklama:** `package.json` dosyası, projenizin kimlik kartı gibidir. Bu dosyada projenizin adı, versiyonu, hangi kütüphaneleri kullandığı ve hangi komutları çalıştırabileceği yazılıdır.

#### `tailwind.config.cjs` - Tailwind CSS Configuration
**Purpose:** Utility-first CSS framework customization  
**Key Features:**
- Custom color palette definitions
- Responsive breakpoint configurations
- Component-specific style overrides

> **💡 Yeni Geliştiriciler İçin Açıklama:** `tailwind.config.cjs` dosyası, Tailwind CSS'in nasıl çalışacağını belirler. Tailwind CSS, CSS yazmak yerine hazır sınıflar kullanmanızı sağlayan bir framework'tür.

#### `next.config.ts` - Next.js Configuration
**Purpose:** Next.js framework configuration  
**Key Settings:**
- App Router configuration
- Build optimization settings
- Environment variables setup

> **💡 Yeni Geliştiriciler İçin Açıklama:** `next.config.ts` dosyası, Next.js'in nasıl çalışacağını belirler. App Router, sayfa yönlendirmelerini dosya sistemi üzerinden yapar.

#### `eslint.config.js` - ESLint Configuration
**Purpose:** Code quality ve linting rules  
**Key Features:**
- TypeScript-specific linting rules
- React hooks rules
- Import/export validation

> **💡 Yeni Geliştiriciler İçin Açıklama:** `eslint.config.js` dosyası, kod kalitesi kurallarını tanımlar. ESLint, kodunuzdaki potansiyel hataları ve kötü alışkanlıkları tespit eden bir araçtır.

#### `tsconfig.json` - TypeScript Configuration
**Purpose:** TypeScript compiler options  
**Key Features:**
- Strict type checking enabled
- ES2020 target
- React JSX support

> **💡 Yeni Geliştiriciler İçin Açıklama:** `tsconfig.json` dosyası, TypeScript derleyicisinin nasıl çalışacağını belirler. TypeScript, JavaScript'e tip güvenliği ekleyen bir dildir.

#### `.env.local` - Environment Variables
**Purpose:** Sensitive configuration data  
**Key Variables:**
- `NEXT_PUBLIC_FIREBASE_*` - Firebase configuration
- `GEMINI_API_KEY` - Gemini API key

> **💡 Yeni Geliştiriciler İçin Açıklama:** `.env.local` dosyası, hassas bilgileri (API key'ler gibi) güvenli bir şekilde saklar. Bu dosya Git'e dahil edilmez.

#### `.gitignore` - Git Ignore Rules
**Purpose:** Version control exclusions  
**Ignored Items:**
- `node_modules/` - Dependencies
- `.next/` - Build outputs
- `*.log` - Log files
- `.env.local` - Environment files

> **💡 Yeni Geliştiriciler İçin Açıklama:** `.gitignore` dosyası, Git'in hangi dosyaları takip etmeyeceğini belirler. Bu dosya, gereksiz veya büyük dosyaların Git repository'sine eklenmesini engeller.

---

## 🛠️ Technology Stack ve Development Tools

### Core Technologies
- **Next.js 14:** Full-stack React framework with App Router
- **React 18:** Component-based UI library with hooks
- **TypeScript 5:** Static type checking ve compile-time error detection
- **Tailwind CSS 4:** Utility-first CSS framework
- **Firebase 10:** Backend-as-a-Service (Firestore, Auth, Storage)

> **💡 Yeni Geliştiriciler İçin Açıklama:** Next.js, React tabanlı bir framework olup hem frontend hem de backend işlevlerini sunar. Firebase, Google'ın sunduğu backend-as-a-service platformudur. Firestore, NoSQL veritabanıdır. Auth, kimlik doğrulama servisidir.

### AI Integration
- **Google Gemini API:** AI-powered content generation
- **Custom Prompts:** Turkish language optimization
- **Fallback System:** Mock data when API unavailable

> **💡 Yeni Geliştiriciler İçin Açıklama:** Gemini API, Google'ın yapay zeka modeli ile akıllı içerik üretimi sağlar. Quiz soruları ve not özetleri bu API ile oluşturulur. Fallback sistemi, API kullanılamadığında mock veri döndürür.

### Development Tools
- **ESLint:** Code linting ve quality enforcement
- **Prettier:** Automatic code formatting
- **PostCSS:** CSS processing pipeline
- **Firebase CLI:** Firebase development tools

> **💡 Yeni Geliştiriciler İçin Açıklama:** ESLint, kod kalitesi kurallarını zorlar. Prettier, kodunuzu otomatik olarak düzenler. Firebase CLI, Firebase servislerini yönetmek için kullanılır.

### Build & Deployment
- **NPM:** Package management
- **Next.js Dev Server:** Hot module replacement (HMR)
- **TypeScript Compiler:** Strict type checking
- **Vercel:** Deployment platform (planned)

> **💡 Yeni Geliştiriciler İçin Açıklama:** NPM, JavaScript paketlerini yönetmek için kullanılan bir araçtır. Next.js Dev Server, kodunuzu değiştirdiğinizde otomatik olarak sayfayı yeniler. Vercel, Next.js uygulamalarını deploy etmek için optimize edilmiş bir platformdur.

---

## 🎯 Application Features ve Technical Implementation

### Current Features (Full-stack Implementation)
1. **Authentication System (`/login`, `/register`):** Firebase Auth ile kullanıcı girişi
2. **Home Page (`/`):** YBS bölümü tanıtımı ve navigasyon
3. **Curriculum Viewer (`/mufredat`):** Firebase Firestore ile dinamik ders yönetimi
4. **Course Notes (`/ders-notlari`):** Not paylaşım platformu ve Gemini API özetleme
5. **Exam Simulation (`/sinav-simulasyonu`):** Gemini API ile dinamik quiz üretimi

> **💡 Yeni Geliştiriciler İçin Açıklama:** Uygulama artık tam bir full-stack uygulamasıdır. Backend işlevleri Firebase ile sağlanır. Yapay zeka entegrasyonu Gemini API ile gerçekleştirilir.

### Backend API Endpoints
1. **Authentication:** `/api/auth/login`, `/api/auth/register`
2. **Courses:** `/api/courses` (GET, POST)
3. **Notes:** `/api/notes` (GET, POST), `/api/notes/summarize`
4. **Quiz:** `/api/quiz/generate`

> **💡 Yeni Geliştiriciler İçin Açıklama:** API endpoint'leri Next.js API Routes kullanılarak oluşturulmuştur. Her endpoint Firebase ile entegre çalışır ve gerekli yerlerde Gemini API kullanır.

### Technical Implementation Status
- **Frontend:** ✅ Complete (Next.js App Router + TypeScript + Tailwind)
- **Backend:** ✅ Complete (Next.js API Routes + Firebase)
- **Database:** ✅ Complete (Firebase Firestore)
- **Authentication:** ✅ Complete (Firebase Auth)
- **AI Integration:** ✅ Complete (Gemini API)
- **State Management:** ✅ Complete (React Context API)
- **Real-time Updates:** ✅ Complete (Firebase Firestore)

> **💡 Yeni Geliştiriciler İçin Açıklama:** Uygulama tamamen fonksiyonel durumdadır. Tüm temel özellikler implement edilmiştir. Backend, frontend ve yapay zeka entegrasyonu tamamlanmıştır.

---

## 🚀 Development Setup ve Build Process

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **NPM:** v8.0.0 or higher
- **Git:** For version control
- **Firebase Account:** For backend services
- **Google AI Studio:** For Gemini API key

### Environment Setup
```bash
# 1. Clone repository
git clone <repository-url>
cd ybs-buddy

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Edit .env.local with your Firebase and Gemini API keys

# 4. Start development server
npm run dev

# 5. Open browser
# http://localhost:3000
```

> **💡 Yeni Geliştiriciler İçin Açıklama:** Bu adımlar, projeyi bilgisayarınızda çalıştırmak için gereklidir. Firebase ve Gemini API key'lerini `.env.local` dosyasına eklemeniz gerekir. Development server 3000 portunda çalışır.

### Available Scripts
- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality check

> **💡 Yeni Geliştiriciler İçin Açıklama:** Bu komutlar, projeyi farklı amaçlar için çalıştırmanızı sağlar. `dev` komutu geliştirme için, `build` komutu üretim için, `start` komutu üretim sunucusunu başlatmak için, `lint` komutu ise kod kalitesini kontrol etmek için kullanılır.

### Build Process
1. **Development:** Next.js dev server with hot module replacement
2. **Production:** Optimized build with code splitting
3. **Deployment:** Vercel platform (planned)

> **💡 Yeni Geliştiriciler İçin Açıklama:** Development aşamasında kodunuzu değiştirdiğinizde sayfa otomatik olarak yenilenir. Production build'de kod optimize edilir ve küçük parçalara bölünür (code splitting).

---

## 📚 Technical Documentation ve Resources

### Project Documentation
- `docs/development_guidelines.md` - Development guidelines
- `docs/TODO.md` - Development roadmap ve progress tracking
- `docs/version1_prd.md` - Product requirements specification
- `docs/proje_bilgileri.md` - Technical developer guide (bu dosya)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs) - Official Next.js docs
- [React Documentation](https://react.dev/) - Official React docs
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript guide
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility-first CSS
- [Firebase Documentation](https://firebase.google.com/docs) - Backend services
- [Google AI Studio](https://makersuite.google.com/) - Gemini API

---

## 🤝 Development Guidelines

### Code Quality Standards
- **Clean Code Principles:** DRY, KISS, Single Responsibility
- **TypeScript:** Strict type checking enabled
- **ESLint:** Enforced code quality rules
- **Prettier:** Consistent code formatting
- **Firebase Best Practices:** Security rules and data modeling

> **💡 Yeni Geliştiriciler İçin Açıklama:** Clean Code prensipleri, kodun daha okunabilir ve sürdürülebilir olmasını sağlayan kurallardır. Firebase Best Practices, güvenlik kuralları ve veri modelleme konularını kapsar.

### AI-Assisted Development
- **Google Gemini API:** AI-powered content generation
- **Custom Prompts:** Turkish language optimization
- **Code Review:** Manual verification of AI-generated code
- **Testing:** Validation of AI-suggested solutions
- **Documentation:** Turkish language preference for comments

> **💡 Yeni Geliştiriciler İçin Açıklama:** AI-assisted development, yapay zeka yardımıyla kod yazma anlamına gelir. Google Gemini API, kod önerileri ve içerik üretimi sunar. Ancak AI'dan gelen kodları mutlaka manuel olarak kontrol etmek ve test etmek gerekir.

### Git Workflow
- **Branch Strategy:** Feature-based branching
- **Commit Messages:** Conventional commits format
- **Code Review:** Required before merge
- **Documentation:** Updated with code changes

> **💡 Yeni Geliştiriciler İçin Açıklama:** Git, kod versiyonlarını yönetmek için kullanılan bir araçtır. Feature-based branching, her yeni özellik için ayrı bir dal (branch) oluşturmak anlamına gelir. Conventional commits, commit mesajlarının standart bir formatta yazılması anlamına gelir.

---

## 🔍 Code Analysis ve Review Process

### Before Starting Development
1. **Read this document** - Understand project structure
2. **Review existing code** - Familiarize with patterns
3. **Check TODO.md** - Understand current priorities
4. **Follow clean code principles** - Maintain code quality
5. **Set up environment** - Configure Firebase and Gemini API

> **💡 Yeni Geliştiriciler İçin Açıklama:** Geliştirmeye başlamadan önce bu adımları takip etmek önemlidir. Bu dokümanı okumak, projenin yapısını anlamanızı sağlar. Mevcut kodu incelemek, projenin kodlama stilini öğrenmenizi sağlar. TODO.md dosyası, hangi özelliklerin öncelikli olduğunu gösterir.

### Code Review Checklist
- [ ] TypeScript types properly defined
- [ ] ESLint rules followed
- [ ] Prettier formatting applied
- [ ] Component reusability considered
- [ ] Performance implications evaluated
- [ ] Firebase security rules checked
- [ ] API error handling implemented
- [ ] Documentation updated if needed

> **💡 Yeni Geliştiriciler İçin Açıklama:** Code review checklist, kodunuzu kontrol ederken dikkat etmeniz gereken noktaları listeler. Firebase security rules, veritabanı güvenlik kurallarını kontrol etmek anlamına gelir. API error handling, hata yönetiminin doğru yapıldığını kontrol etmek anlamına gelir.

---

## 🔧 Firebase Configuration

### Firestore Collections
- `users` - Kullanıcı bilgileri
- `courses` - Ders bilgileri
- `notes` - Not bilgileri
- `quizzes` - Quiz bilgileri (planned)

### Security Rules
- Authentication required for write operations
- Users can only access their own data
- Public read access for shared content

> **💡 Yeni Geliştiriciler İçin Açıklama:** Firestore, NoSQL veritabanıdır ve koleksiyonlar (collections) kullanır. Security rules, veritabanı güvenlik kurallarını tanımlar. Authentication required, kimlik doğrulama gerektiği anlamına gelir.

---

## 🤖 Gemini API Integration

### 📁 Gemini Service Yapısı

**Ana Dosya:** `src/utils/geminiService.ts`  
**Amaç:** Google Gemini API ile yapay zeka entegrasyonu  
**Mimari:** Singleton pattern ile merkezi AI servisi

> **💡 Yeni Geliştiriciler İçin Açıklama:** Gemini API entegrasyonu için tüm prompt'lar ve AI işlemleri `src/utils/geminiService.ts` dosyasında yönetilir. Bu dosya, yapay zeka ile içerik üretimi için merkezi bir nokta sağlar.

### 🏗️ GeminiService Class Yapısı

```typescript
class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  // Ana API istek metodu
  private async makeRequest(prompt: string): Promise<string> {
    // Gemini API'ye istek gönderme
  }

  // Quiz soruları oluşturma
  async generateQuizQuestions(courseName: string, difficulty: string, questionCount: number): Promise<any[]> {
    // Quiz prompt'u ve işleme
  }

  // Not özetleme
  async summarizeNote(content: string): Promise<string> {
    // Özetleme prompt'u ve işleme
  }

  // Akademik yönlendirme
  async generateAcademicGuidance(userPerformance: any): Promise<string> {
    // Yönlendirme prompt'u ve işleme
  }
}
```

### 📝 Prompt Yazım Kuralları

**A) Türkçe Dil Tercihi:**
```typescript
// ✅ DOĞRU - Türkçe prompt
const prompt = `
${courseName} dersi için ${difficulty} zorlukta ${questionCount} adet sınav sorusu oluştur.
`;

// ❌ YANLIŞ - İngilizce prompt
const prompt = `
Generate ${questionCount} exam questions for ${courseName} course.
`;
```

**B) Teknik Terimler İçin İngilizce Kullanımı:**
```typescript
// ✅ DOĞRU - JSON formatı İngilizce, açıklamalar Türkçe
const prompt = `
JSON formatında döndür:
{
  "id": "unique_id",
  "question": "soru metni",
  "type": "multiple_choice",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correctAnswer": "A"
}
`;
```

**C) Yapılandırılmış Prompt Şablonları:**
```typescript
// Quiz soruları için şablon
const quizPrompt = `
${courseName} dersi için ${difficulty} zorlukta ${questionCount} adet sınav sorusu oluştur.

Sorular şu formatlarda olmalı:
1. Çoktan seçmeli (multiple_choice): 4 seçenekli
2. Doğru/Yanlış (true_false): true/false cevap
3. Açık uçlu (open_ended): kısa cevap

Her soru için şu bilgileri ver:
- id: benzersiz ID
- question: soru metni
- type: "multiple_choice", "true_false", veya "open_ended"
- options: çoktan seçmeli için ["A) ...", "B) ...", "C) ...", "D) ..."]
- correctAnswer: doğru cevap
- explanation: açıklama
- difficulty: "${difficulty}"

JSON formatında döndür, sadece soru array'ini ver.
`;
```

### 🔧 Yeni Prompt Ekleme Süreci

**1. GeminiService'e Yeni Metod Ekleme:**
```typescript
// Yeni AI özelliği eklemek için
async generateStudyPlan(courseName: string, topics: string[], timeAvailable: number): Promise<string> {
  const prompt = `
    ${courseName} dersi için ${timeAvailable} saatlik çalışma planı oluştur:
    
    Konular: ${topics.join(', ')}
    
    Plan şu formatta olsun:
    - Günlük hedefler
    - Konu öncelikleri
    - Çalışma teknikleri
    - Tekrar stratejileri
    - Değerlendirme yöntemleri
  `;

  try {
    return await this.makeRequest(prompt);
  } catch (error) {
    console.error('Study plan generation failed:', error);
    return 'Çalışma planı oluşturulamadı.';
  }
}
```

**2. API Endpoint Oluşturma:**
```typescript
// src/app/api/ai/study-plan/route.ts
export async function POST(request: NextRequest) {
  try {
    const { courseName, topics, timeAvailable } = await request.json();
    
    const studyPlan = await geminiService.generateStudyPlan(courseName, topics, timeAvailable);
    
    return NextResponse.json({
      success: true,
      data: { studyPlan }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Çalışma planı oluşturulamadı' },
      { status: 500 }
    );
  }
}
```

### 📊 Mevcut AI Servisleri

**1. Quiz Üretimi (`generateQuizQuestions`):**
- **Kullanım:** Sınav simülasyonu sayfasında
- **Parametreler:** `courseName`, `difficulty`, `questionCount`
- **Çıktı:** JSON formatında soru array'i
- **API Endpoint:** `/api/quiz/generate`

**2. Not Özetleme (`summarizeNote`):**
- **Kullanım:** Ders notları sayfasında
- **Parametreler:** `content` (not içeriği)
- **Çıktı:** Özetlenmiş metin
- **API Endpoint:** `/api/notes/summarize`

**3. Akademik Yönlendirme (`generateAcademicGuidance`):**
- **Kullanım:** Kullanıcı performansına göre öneriler
- **Parametreler:** `userPerformance` (kullanıcı performans verisi)
- **Çıktı:** Kişiselleştirilmiş öneriler
- **API Endpoint:** `/api/ai/guidance`

### 🛡️ Hata Yönetimi ve Fallback Sistemi

**A) API Hata Durumları:**
```typescript
try {
  const response = await this.makeRequest(prompt);
  return JSON.parse(response);
} catch (error) {
  console.error('Quiz generation failed:', error);
  // Fallback: Mock sorular döndür
  return this.generateMockQuestions(courseName, difficulty, questionCount);
}
```

**B) Mock Data Fallback:**
```typescript
private generateMockQuestions(courseName: string, difficulty: string, count: number): any[] {
  const questions: any[] = [];
  const questionTypes = ['multiple_choice', 'true_false', 'open_ended'];
  
  for (let i = 1; i <= count; i++) {
    const questionType = questionTypes[i % questionTypes.length];
    
    let question: any = {
      id: `q_${i}`,
      question: `${courseName} dersi için ${difficulty} zorlukta ${i}. soru`,
      type: questionType,
      difficulty: difficulty,
      explanation: 'Bu sorunun açıklaması burada yer alacak',
    };

    if (questionType === 'multiple_choice') {
      question.options = [
        'A) Birinci seçenek',
        'B) İkinci seçenek', 
        'C) Üçüncü seçenek',
        'D) Dördüncü seçenek'
      ];
      question.correctAnswer = 'A';
    }
    
    questions.push(question);
  }
  
  return questions;
}
```

### 🔑 Environment Variables

**Gerekli API Key:**
```bash
# .env.local dosyasında
GEMINI_API_KEY=your_gemini_api_key_here
```

**API Key Kontrolü:**
```typescript
constructor() {
  this.apiKey = process.env.GEMINI_API_KEY || '';
  if (!this.apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not set');
  }
}
```

### 📈 Performance ve Optimizasyon

**A) Prompt Optimizasyonu:**
- Kısa ve net prompt'lar kullanın
- Gereksiz detaylardan kaçının
- JSON formatında çıktı isteyin

**B) Error Handling:**
- Her AI işlemi için try-catch kullanın
- Fallback sistemini mutlaka implement edin
- Kullanıcı dostu hata mesajları verin

**C) Rate Limiting:**
- API çağrılarını sınırlayın
- Caching mekanizması ekleyin
- Kullanıcı deneyimini koruyun

> **💡 Yeni Geliştiriciler İçin Açıklama:** Gemini API entegrasyonu için tüm prompt'ları `src/utils/geminiService.ts` dosyasında yönetin. Yeni AI özelliği eklemek istediğinizde önce bu dosyaya metod ekleyin, sonra API endpoint'i oluşturun. Prompt yazarken Türkçe dilini tercih edin ve yapılandırılmış şablonlar kullanın. Hata durumları için mutlaka fallback sistemi implement edin.

---

*Bu doküman, geliştiricilerin projeyi incelemeden önce teknik detayları anlaması için hazırlanmıştır. Kod yapısı ve mimari kararlar hakkında bilgi sağlar. Son güncelleme: 28 Temmuz 2025.* 