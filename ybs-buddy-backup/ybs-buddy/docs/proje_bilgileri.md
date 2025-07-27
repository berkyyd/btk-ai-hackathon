# YBS Buddy Projesi - Teknik Geliştirici Rehberi

**Oluşturulma Tarihi:** 26 Temmuz 2025  
**Proje Türü:** React + TypeScript + Tailwind CSS Web Uygulaması  
**Hedef Geliştirici:** Frontend Geliştiriciler ve Kod İnceleyiciler  

---

## 🏗️ Proje Mimarisi ve Teknik Yapı

YBS Buddy, modern web geliştirme standartlarına uygun olarak React + TypeScript + Vite teknoloji yığını ile geliştirilmiştir. Proje, Clean Code prensiplerine uygun modüler bir yapıya sahiptir.

### 🎯 Teknik Hedefler
- **Performans:** Vite ile hızlı geliştirme ve derleme
- **Tip Güvenliği:** TypeScript ile compile-time hata kontrolü
- **Kod Kalitesi:** ESLint + Prettier ile standart kod yazımı
- **Responsive Tasarım:** Tailwind CSS ile mobil-first yaklaşım
- **Modülerlik:** Component-based mimari ile yeniden kullanılabilir kod

> **💡 Yeni Geliştiriciler İçin Açıklama:** Bu proje, web uygulamaları geliştirirken kullanılan modern araçları bir araya getiriyor. React, kullanıcı arayüzü oluşturmak için kullanılan bir kütüphanedir. TypeScript, JavaScript'e tip güvenliği ekler (yani kod yazarken hataları daha erken yakalayabilirsiniz). Vite, projeyi hızlıca çalıştırmak ve derlemek için kullanılan bir araçtır. Clean Code prensipleri, kodun daha okunabilir ve sürdürülebilir olmasını sağlayan kurallardır.

---

## 📁 Kod Yapısı ve Teknik Organizasyon

### 🗂️ Source Code Organizasyonu

#### `src/` - Ana Kaynak Kod Dizini
**Mimari Yaklaşım:** Component-based React mimarisi  
**Organizasyon Prensibi:** Separation of Concerns (SoC)  
**İçeriği:**
- `components/` - Reusable UI components (Card, Header, Footer)
- `layouts/` - Page layout components (MainLayout)
- `pages/` - Route-specific page components (Home, Mufredat, DersNotlari, SinavSimulasyonu)
- `App.tsx` - Root component ve routing configuration
- `main.tsx` - Application entry point ve React.StrictMode
- `index.css` - Global styles ve Tailwind CSS imports
- `vite-env.d.ts` - Vite environment type definitions

> **💡 Yeni Geliştiriciler İçin Açıklama:** `src` klasörü, uygulamanızın tüm kodlarının bulunduğu ana klasördür. Component-based mimari, uygulamayı küçük, yeniden kullanılabilir parçalara (component) böler. Separation of Concerns (SoC), her dosyanın tek bir sorumluluğu olması anlamına gelir. `components` klasöründe başka sayfalarda da kullanabileceğiniz parçalar, `pages` klasöründe ise her sayfa için özel kodlar bulunur. `App.tsx` uygulamanın ana giriş noktasıdır.

#### `docs/` - Teknik Dokümantasyon
**Amaç:** Development guidelines ve project specifications  
**İçeriği:**
- `clean_code_principles.md` - DRY, KISS, SOLID prensipleri
- `gemini_cli_guidelines.md` - AI-assisted development guidelines
- `TODO.md` - Development roadmap ve progress tracking
- `version1_prd.md` - Product requirements specification
- `proje_bilgileri.md` - Technical developer guide (bu dosya)

> **💡 Yeni Geliştiriciler İçin Açıklama:** `docs` klasörü, proje hakkında tüm yazılı dokümantasyonu içerir. DRY (Don't Repeat Yourself), KISS (Keep It Simple), SOLID gibi prensipler, temiz kod yazmanın kurallarıdır. AI-assisted development, yapay zeka yardımıyla kod yazma anlamına gelir. Bu dosyalar, projeyi anlamak ve geliştirmek için kritik öneme sahiptir.

#### `public/` - Static Assets
**Build-time:** Vite tarafından doğrudan serve edilir  
**İçeriği:**
- `vite.svg` - Default Vite logo (placeholder)

> **💡 Yeni Geliştiriciler İçin Açıklama:** `public` klasörü, tarayıcıda doğrudan erişilebilen dosyaları içerir. Bu dosyalar, uygulamanız çalışırken değişmeyen dosyalardır (resimler, ikonlar, favicon gibi). Vite, bu dosyaları otomatik olarak sunar.

#### `dist/` - Build Output
**Build Tool:** Vite production build  
**Git Status:** Ignored (otomatik oluşturulur)

> **💡 Yeni Geliştiriciler İçin Açıklama:** `dist` klasörü, uygulamanızın çalışır hale getirilmiş versiyonunu içerir. Bu klasör, `npm run build` komutu çalıştırıldığında otomatik olarak oluşturulur. Git'e dahil edilmez çünkü her build'de yeniden oluşturulur.

#### `node_modules/` - Dependencies
**Package Manager:** npm  
**Git Status:** Ignored (otomatik oluşturulur)

> **💡 Yeni Geliştiriciler İçin Açıklama:** `node_modules` klasörü, projenizin ihtiyaç duyduğu tüm kütüphaneleri (React, TypeScript, Tailwind CSS gibi) içerir. Bu klasör çok büyük olduğu için Git'e dahil edilmez. `npm install` komutu ile otomatik olarak oluşturulur.

### 📄 Configuration Files ve Build Setup

#### `package.json` - Project Configuration
**Purpose:** NPM package configuration ve dependency management  
**Key Sections:**
- `scripts`: Development, build, preview commands
- `dependencies`: Runtime dependencies (React, React Router)
- `devDependencies`: Development tools (TypeScript, Vite, ESLint)

> **💡 Yeni Geliştiriciler İçin Açıklama:** `package.json` dosyası, projenizin kimlik kartı gibidir. Bu dosyada projenizin adı, versiyonu, hangi kütüphaneleri kullandığı ve hangi komutları çalıştırabileceği yazılıdır. `dependencies` bölümünde uygulamanızın çalışması için gerekli kütüphaneler, `devDependencies` bölümünde ise sadece geliştirme sırasında kullanılan araçlar bulunur.

#### `tailwind.config.js` - Tailwind CSS Configuration
**Purpose:** Utility-first CSS framework customization  
**Key Features:**
- Custom color palette definitions
- Responsive breakpoint configurations
- Component-specific style overrides

> **💡 Yeni Geliştiriciler İçin Açıklama:** `tailwind.config.js` dosyası, Tailwind CSS'in nasıl çalışacağını belirler. Tailwind CSS, CSS yazmak yerine hazır sınıflar kullanmanızı sağlayan bir framework'tür. Bu dosyada renk paletini, ekran boyutlarını ve özel stilleri tanımlayabilirsiniz. Utility-first yaklaşım, her stil için ayrı CSS sınıfları kullanmak anlamına gelir.

#### `postcss.config.js` - PostCSS Configuration
**Purpose:** CSS processing pipeline setup  
**Plugins:**
- `tailwindcss`: Utility classes processing
- `autoprefixer`: Vendor prefix automation

> **💡 Yeni Geliştiriciler İçin Açıklama:** `postcss.config.js` dosyası, CSS'inizi işlemek için kullanılan araçları tanımlar. PostCSS, CSS'inizi dönüştüren ve optimize eden bir araçtır. `tailwindcss` eklentisi, Tailwind CSS sınıflarını gerçek CSS'e dönüştürür. `autoprefixer` eklentisi ise farklı tarayıcılar için gerekli CSS öneklerini otomatik olarak ekler.

#### `vite.config.ts` - Vite Build Configuration
**Purpose:** Development server ve production build setup  
**Key Settings:**
- Root directory configuration
- Development server port (5173)
- Build optimization settings

> **💡 Yeni Geliştiriciler İçin Açıklama:** `vite.config.ts` dosyası, Vite'ın nasıl çalışacağını belirler. Vite, projenizi hızlıca çalıştırmak ve derlemek için kullanılan bir araçtır. Bu dosyada hangi klasörün ana klasör olduğunu, hangi portta çalışacağını ve derleme ayarlarını tanımlayabilirsiniz. Development server, kodunuzu değiştirdiğinizde otomatik olarak sayfayı yeniler.

#### `eslint.config.js` - ESLint Configuration
**Purpose:** Code quality ve linting rules  
**Key Features:**
- TypeScript-specific linting rules
- React hooks rules
- Import/export validation

> **💡 Yeni Geliştiriciler İçin Açıklama:** `eslint.config.js` dosyası, kod kalitesi kurallarını tanımlar. ESLint, kodunuzdaki potansiyel hataları ve kötü alışkanlıkları tespit eden bir araçtır. Bu dosyada hangi kuralların uygulanacağını belirleyebilirsiniz. Örneğin, kullanılmayan değişkenleri tespit eder, import/export hatalarını bulur ve kod standartlarını zorlar.

#### `.prettierrc.json` - Prettier Configuration
**Purpose:** Code formatting standards  
**Key Settings:**
- Line length: 80 characters
- Tab width: 2 spaces
- Semicolon enforcement

> **💡 Yeni Geliştiriciler İçin Açıklama:** `.prettierrc.json` dosyası, kodunuzun nasıl biçimlendirileceğini belirler. Prettier, kodunuzu otomatik olarak düzenleyen bir araçtır. Bu dosyada satır uzunluğu, girinti miktarı ve noktalama kuralları gibi ayarları tanımlayabilirsiniz. Bu sayede tüm geliştiriciler aynı kod stilini kullanır.

#### `tsconfig.json` - TypeScript Configuration
**Purpose:** TypeScript compiler options  
**Key Features:**
- Strict type checking enabled
- ES2020 target
- React JSX support

> **💡 Yeni Geliştiriciler İçin Açıklama:** `tsconfig.json` dosyası, TypeScript derleyicisinin nasıl çalışacağını belirler. TypeScript, JavaScript'e tip güvenliği ekleyen bir dildir. Bu dosyada hangi JavaScript versiyonunu hedeflediğinizi, tip kontrolünün ne kadar sıkı olacağını ve React JSX desteğini tanımlayabilirsiniz. Strict type checking, tip hatalarını daha erken yakalamanızı sağlar.

#### `index.html` - Entry Point
**Purpose:** Application bootstrap file  
**Key Elements:**
- Meta tags for SEO
- Root div for React mounting
- Title configuration

> **💡 Yeni Geliştiriciler İçin Açıklama:** `index.html` dosyası, uygulamanızın başlangıç noktasıdır. Bu dosya, tarayıcıya hangi HTML'i göstereceğini söyler. React uygulamanız, bu dosyadaki bir div'e bağlanır. Meta etiketleri, arama motorları için bilgi sağlar. Title, tarayıcı sekmesinde görünen başlıktır.

#### `.gitignore` - Git Ignore Rules
**Purpose:** Version control exclusions  
**Ignored Items:**
- `node_modules/` - Dependencies
- `dist/` - Build outputs
- `*.log` - Log files
- Environment files

> **💡 Yeni Geliştiriciler İçin Açıklama:** `.gitignore` dosyası, Git'in hangi dosyaları takip etmeyeceğini belirler. Bu dosya, gereksiz veya büyük dosyaların Git repository'sine eklenmesini engeller. `node_modules` klasörü çok büyük olduğu için, `dist` klasörü her build'de yeniden oluşturulduğu için ve log dosyaları geçici olduğu için bunlar Git'e dahil edilmez.

---

## 🛠️ Technology Stack ve Development Tools

### Core Technologies
- **React 18:** Component-based UI library with hooks
- **TypeScript 5:** Static type checking ve compile-time error detection
- **Tailwind CSS 4:** Utility-first CSS framework
- **Vite 5:** Fast build tool ve development server

> **💡 Yeni Geliştiriciler İçin Açıklama:** React, kullanıcı arayüzü oluşturmak için kullanılan en popüler JavaScript kütüphanesidir. Component-based yaklaşım, uygulamayı küçük, yeniden kullanılabilir parçalara böler. TypeScript, JavaScript'e tip güvenliği ekler ve hataları daha erken yakalamanızı sağlar. Tailwind CSS, CSS yazmak yerine hazır sınıflar kullanmanızı sağlar. Vite, projeyi hızlıca çalıştırmak ve derlemek için kullanılan modern bir araçtır.

### Development Tools
- **ESLint:** Code linting ve quality enforcement
- **Prettier:** Automatic code formatting
- **PostCSS:** CSS processing pipeline
- **React Router DOM:** Client-side routing

> **💡 Yeni Geliştiriciler İçin Açıklama:** ESLint, kod kalitesi kurallarını zorlar ve potansiyel hataları tespit eder. Prettier, kodunuzu otomatik olarak düzenler. PostCSS, CSS'inizi işler ve optimize eder. React Router DOM, sayfalar arası geçişi yönetir (SPA - Single Page Application).

### Build & Deployment
- **NPM:** Package management
- **Vite Dev Server:** Hot module replacement (HMR)
- **TypeScript Compiler:** Strict type checking

> **💡 Yeni Geliştiriciler İçin Açıklama:** NPM, JavaScript paketlerini yönetmek için kullanılan bir araçtır. Vite Dev Server, kodunuzu değiştirdiğinizde otomatik olarak sayfayı yeniler (Hot Module Replacement). TypeScript Compiler, TypeScript kodunuzu JavaScript'e dönüştürür ve tip hatalarını kontrol eder.

---

## 🎯 Application Features ve Technical Implementation

### Current Features (Frontend Only)
1. **Home Page (`/`):** Static content with YBS department information
2. **Curriculum Viewer (`/mufredat`):** Interactive course filtering system
3. **Course Notes (`/ders-notlari`):** Static UI for note sharing platform
4. **Exam Simulation (`/sinav-simulasyonu`):** Wizard-based exam creation interface

> **💡 Yeni Geliştiriciler İçin Açıklama:** Şu anda uygulamanın sadece ön yüzü (frontend) tamamlanmış durumda. Bu, kullanıcıların görebileceği arayüzün hazır olduğu anlamına gelir. Ancak veri saklama, kullanıcı girişi gibi işlevler henüz çalışmıyor çünkü arka yüz (backend) henüz geliştirilmemiş.

### Planned Features (Backend Integration Required)
1. **Smart Note Taking:** Personal note system with rich text editor
2. **Firebase Integration:** Real-time data storage and synchronization
3. **User Authentication:** Secure user management system

> **💡 Yeni Geliştiriciler İçin Açıklama:** Bu özellikler, arka yüz geliştirildikten sonra eklenebilecek. Firebase, Google'ın sunduğu bir veritabanı ve kimlik doğrulama hizmetidir. Real-time data storage, verilerin gerçek zamanlı olarak güncellenmesi anlamına gelir.

### Technical Implementation Status
- **Frontend:** ✅ Complete (React + TypeScript + Tailwind)
- **Routing:** ✅ Complete (React Router DOM)
- **State Management:** ⏳ Local state only (no global state management yet)
- **Backend:** ❌ Not implemented (Firebase planned)
- **Database:** ❌ Not implemented (Firestore planned)

> **💡 Yeni Geliştiriciler İçin Açıklama:** Frontend tamamlanmış durumda. Routing, sayfalar arası geçişi sağlar. State Management, uygulama verilerinin nasıl yönetileceğini belirler. Şu anda sadece yerel durum (local state) kullanılıyor, global durum yönetimi henüz eklenmemiş. Backend ve Database henüz geliştirilmemiş.

---

## 🚀 Development Setup ve Build Process

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **NPM:** v8.0.0 or higher
- **Git:** For version control

### Development Environment Setup
```bash
# 1. Clone repository
git clone <repository-url>
cd ybs-buddy

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# http://localhost:5173
```

> **💡 Yeni Geliştiriciler İçin Açıklama:** Bu adımlar, projeyi bilgisayarınızda çalıştırmak için gereklidir. `git clone` komutu, projeyi GitHub'dan indirir. `npm install` komutu, projenin ihtiyaç duyduğu kütüphaneleri yükler. `npm run dev` komutu, geliştirme sunucusunu başlatır. HMR (Hot Module Replacement), kodunuzu değiştirdiğinizde sayfanın otomatik olarak yenilenmesi anlamına gelir.

### Available Scripts
- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality check

> **💡 Yeni Geliştiriciler İçin Açıklama:** Bu komutlar, projeyi farklı amaçlar için çalıştırmanızı sağlar. `dev` komutu geliştirme için, `build` komutu üretim için, `preview` komutu üretim versiyonunu test etmek için, `lint` komutu ise kod kalitesini kontrol etmek için kullanılır.

### Build Process
1. **Development:** Vite dev server with hot module replacement
2. **Production:** Optimized build with code splitting
3. **Preview:** Local testing of production build

> **💡 Yeni Geliştiriciler İçin Açıklama:** Development aşamasında kodunuzu değiştirdiğinizde sayfa otomatik olarak yenilenir. Production build'de kod optimize edilir ve küçük parçalara bölünür (code splitting). Preview aşamasında üretim versiyonunu yerel olarak test edebilirsiniz.

---

## 📚 Technical Documentation ve Resources

### Project Documentation
- `docs/clean_code_principles.md` - DRY, KISS, SOLID principles
- `docs/gemini_cli_guidelines.md` - AI-assisted development guidelines
- `docs/TODO.md` - Development roadmap ve progress tracking
- `docs/version1_prd.md` - Product requirements specification

### External Resources
- [React Documentation](https://react.dev/) - Official React docs
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript guide
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility-first CSS
- [Vite Documentation](https://vitejs.dev/guide/) - Build tool guide

---

## 🤝 Development Guidelines

### Code Quality Standards
- **Clean Code Principles:** DRY, KISS, Single Responsibility
- **TypeScript:** Strict type checking enabled
- **ESLint:** Enforced code quality rules
- **Prettier:** Consistent code formatting

> **💡 Yeni Geliştiriciler İçin Açıklama:** Clean Code prensipleri, kodun daha okunabilir ve sürdürülebilir olmasını sağlayan kurallardır. DRY (Don't Repeat Yourself), aynı kodu tekrar yazmaktan kaçınmak anlamına gelir. KISS (Keep It Simple), çözümleri basit tutmak anlamına gelir. Single Responsibility, her fonksiyonun tek bir görevi olması anlamına gelir.

### AI-Assisted Development
- **Google Gemini CLI:** AI-powered code generation
- **Code Review:** Manual verification of AI-generated code
- **Testing:** Validation of AI-suggested solutions
- **Documentation:** Turkish language preference for comments

> **💡 Yeni Geliştiriciler İçin Açıklama:** AI-assisted development, yapay zeka yardımıyla kod yazma anlamına gelir. Google Gemini CLI, kod önerileri sunan bir araçtır. Ancak AI'dan gelen kodları mutlaka manuel olarak kontrol etmek ve test etmek gerekir. Yorumlar Türkçe yazılır.

### Git Workflow
- **Branch Strategy:** Feature-based branching
- **Commit Messages:** Conventional commits format
- **Code Review:** Required before merge
- **Documentation:** Updated with code changes

> **💡 Yeni Geliştiriciler İçin Açıklama:** Git, kod versiyonlarını yönetmek için kullanılan bir araçtır. Feature-based branching, her yeni özellik için ayrı bir dal (branch) oluşturmak anlamına gelir. Conventional commits, commit mesajlarının standart bir formatta yazılması anlamına gelir. Code review, kodun başka bir geliştirici tarafından kontrol edilmesi anlamına gelir.

---

## 🔍 Code Analysis ve Review Process

### Before Starting Development
1. **Read this document** - Understand project structure
2. **Review existing code** - Familiarize with patterns
3. **Check TODO.md** - Understand current priorities
4. **Follow clean code principles** - Maintain code quality

> **💡 Yeni Geliştiriciler İçin Açıklama:** Geliştirmeye başlamadan önce bu adımları takip etmek önemlidir. Bu dokümanı okumak, projenin yapısını anlamanızı sağlar. Mevcut kodu incelemek, projenin kodlama stilini öğrenmenizi sağlar. TODO.md dosyası, hangi özelliklerin öncelikli olduğunu gösterir.

### Code Review Checklist
- [ ] TypeScript types properly defined
- [ ] ESLint rules followed
- [ ] Prettier formatting applied
- [ ] Component reusability considered
- [ ] Performance implications evaluated
- [ ] Documentation updated if needed

> **💡 Yeni Geliştiriciler İçin Açıklama:** Code review checklist, kodunuzu kontrol ederken dikkat etmeniz gereken noktaları listeler. TypeScript tiplerinin doğru tanımlanması, ESLint kurallarına uyulması, Prettier ile biçimlendirme, component'lerin yeniden kullanılabilir olması, performans etkilerinin değerlendirilmesi ve dokümantasyonun güncellenmesi önemlidir.

---

*Bu doküman, geliştiricilerin projeyi incelemeden önce teknik detayları anlaması için hazırlanmıştır. Kod yapısı ve mimari kararlar hakkında bilgi sağlar.* 