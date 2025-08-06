# YBS Buddy Teknik Dokümantasyonu

Bu dokümantasyon YBS Buddy projesinin teknik mimarisini ve yapısını açıklar.

## 🏗️ Sistem Mimarisi

### Genel Mimari
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Firebase      │    │   Firestore     │    │   Gemini AI     │
│   Auth          │    │   Database      │    │   API           │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Teknoloji Stack'i

#### Frontend
- **Framework:** Next.js 15.4.4
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Routing:** Next.js App Router

#### Backend
- **Runtime:** Node.js
- **Framework:** Next.js API Routes
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Storage:** Firebase Storage

#### External Services
- **AI:** Google Gemini API
- **PDF Processing:** PDF.js
- **Deployment:** Vercel/Netlify

## 📊 Veritabanı Şeması

### Firestore Collections

#### users
```typescript
interface User {
  uid: string;                    // Firebase Auth UID
  email: string;                  // Email adresi
  displayName: string;            // Kullanıcı adı
  role: 'student' | 'academician'; // Kullanıcı rolü
  createdAt: string;              // Oluşturulma tarihi
  bio: string;                    // Biyografi
  avatarUrl: string;              // Profil resmi URL'i
  lastLoginAt: string;            // Son giriş tarihi
  isActive: boolean;              // Hesap aktif mi?
}
```

#### notes
```typescript
interface Note {
  id: string;                     // Not ID'si
  title: string;                  // Not başlığı
  content: string;                // Not içeriği
  courseId: string;               // Ders ID'si
  class: number;                  // Sınıf (1-4)
  semester: string;               // Dönem (Güz/Bahar/Yaz)
  userId: string;                 // Kullanıcı ID'si
  createdAt: string;              // Oluşturulma tarihi
  updatedAt: string;              // Güncellenme tarihi
  tags: string[];                 // Etiketler
  isPublic: boolean;              // Herkese açık mı?
  likes: number;                  // Beğeni sayısı
  views: number;                  // Görüntülenme sayısı
  fileUrl?: string;               // PDF dosya URL'i
  extractedText?: string;         // PDF'den çıkarılan metin
}
```

#### quizResults
```typescript
interface QuizResult {
  id: string;                     // Quiz sonuç ID'si
  userId: string;                 // Kullanıcı ID'si
  quizId: string;                 // Quiz ID'si
  score: number;                  // Puan
  totalPoints: number;            // Toplam puan
  timeSpent: number;              // Geçen süre (saniye)
  completedAt: string;            // Tamamlanma tarihi
  answers: Answer[];              // Cevaplar
  questions: Question[];          // Sorular
}

interface Answer {
  questionId: string;             // Soru ID'si
  userAnswer: string;             // Kullanıcı cevabı
  isCorrect: boolean;             // Doğru mu?
  timeSpent: number;              // Soru için geçen süre
}

interface Question {
  id: string;                     // Soru ID'si
  question: string;               // Soru metni
  options: string[];              // Seçenekler
  correctAnswer: string;          // Doğru cevap
  explanation: string;            // Açıklama
}
```

#### courses
```typescript
interface Course {
  id: string;                     // Ders ID'si
  name: string;                   // Ders adı
  code: string;                   // Ders kodu
  credits: number;                // Kredi
  class: number;                  // Sınıf
  semester: string;               // Dönem
  description: string;            // Açıklama
  prerequisites: string[];        // Ön koşullar
  instructor: string;             // Öğretim üyesi
  isActive: boolean;              // Aktif mi?
}
```

#### invitationCodes
```typescript
interface InvitationCode {
  id: string;                     // Kod ID'si
  code: string;                   // Davet kodu
  targetRole: 'academician';      // Hedef rol
  createdBy: string;              // Oluşturan kullanıcı
  createdAt: string;              // Oluşturulma tarihi
  usedBy?: string;                // Kullanan kullanıcı
  usedAt?: string;                // Kullanılma tarihi
  isActive: boolean;              // Aktif mi?
  maxUses: number;                // Maksimum kullanım
  currentUses: number;            // Mevcut kullanım
}
```

#### explanations
```typescript
interface Explanation {
  id: string;                     // Açıklama ID'si
  answerId: string;               // Cevap ID'si
  userId: string;                 // Kullanıcı ID'si
  explanation: string;            // Açıklama metni
  createdAt: string;              // Oluşturulma tarihi
}
```

## 🧩 Component Yapısı

### Sayfa Komponentleri
```
src/app/
├── page.tsx                    # Ana sayfa
├── layout.tsx                  # Ana layout
├── login/
│   └── page.tsx               # Giriş sayfası
├── register/
│   └── page.tsx               # Kayıt sayfası
├── ders-notlari/
│   └── page.tsx               # Ders notları
├── sinav-simulasyonu/
│   └── page.tsx               # Sınav simülasyonu
├── kisisel-takip/
│   └── page.tsx               # Kişisel takip
├── mufredat/
│   └── page.tsx               # Müfredat
└── profile/
    └── page.tsx               # Profil
```

### UI Komponentleri
```
src/components/
├── Card.tsx                   # Kart komponenti
├── Header.tsx                 # Üst menü
├── Footer.tsx                 # Alt menü
├── LoginPrompt.tsx            # Giriş uyarısı
├── FileUpload.tsx             # Dosya yükleme
├── QuizForm.tsx               # Quiz formu
├── QuizAnalysis.tsx           # Quiz analizi
├── ChatIcon.tsx               # Chat ikonu
├── ChatWindow.tsx             # Chat penceresi
├── SummaryModal.tsx           # Özet modal
├── Toast.tsx                  # Bildirim
└── ToastContainer.tsx         # Bildirim konteynerı
```

### Context Komponentleri
```
src/contexts/
├── AuthContext.tsx            # Kimlik doğrulama
└── ThemeContext.tsx           # Tema yönetimi
```

## 🔧 API Yapısı

### API Routes
```
src/app/api/
├── auth/
│   ├── login/
│   │   └── route.ts           # Giriş API
│   └── register/
│       └── route.ts           # Kayıt API
├── notes/
│   ├── route.ts               # Not CRUD
│   ├── personal/
│   │   ├── index.ts           # Kişisel notlar
│   │   ├── folders.ts         # Klasör yönetimi
│   │   ├── realtime.ts        # Gerçek zamanlı
│   │   ├── route.ts           # Kişisel not API
│   │   └── search.ts          # Arama API
│   └── summarize/
│       └── route.ts           # Özet API
├── quiz/
│   ├── generate/
│   │   └── route.ts           # Quiz oluşturma
│   ├── submit/
│   │   └── route.ts           # Quiz gönderme
│   ├── evaluate.ts            # Quiz değerlendirme
│   ├── reinforcement.ts       # Güçlendirme
│   └── userMistakes.ts        # Kullanıcı hataları
├── chatbot/
│   └── route.ts               # Chatbot API
├── courses/
│   └── route.ts               # Ders API
├── curriculum/
│   └── route.ts               # Müfredat API
├── upload/
│   └── route.ts               # Dosya yükleme
├── users/
│   └── route.ts               # Kullanıcı API
└── analytics/
    ├── quiz-analysis/
    │   └── route.ts           # Quiz analizi
    ├── upsonic-analysis/      # Ses analizi
    └── weakness.ts            # Zayıflık analizi
```

## 🔐 Güvenlik

### Authentication Flow
1. **Kullanıcı girişi** → Firebase Auth
2. **Token doğrulama** → JWT middleware
3. **Rol kontrolü** → Context API
4. **API erişimi** → Route protection

### Authorization Rules
```typescript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcı kendi verilerine erişebilir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Notlar - sahibi düzenleyebilir, herkes okuyabilir
    match /notes/{noteId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.role == 'academician');
    }
    
    // Quiz sonuçları - sadece sahibi erişebilir
    match /quizResults/{resultId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## 📈 Performance

### Optimization Strategies
1. **Code Splitting:** Next.js otomatik code splitting
2. **Image Optimization:** Next.js Image komponenti
3. **Caching:** Firebase cache stratejileri
4. **Lazy Loading:** Dinamik import'lar
5. **Bundle Analysis:** Webpack bundle analyzer

### Performance Metrics
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **First Input Delay:** < 100ms

## 🧪 Testing

### Test Yapısı
```
src/__tests__/
├── unit/                      # Birim testler
│   ├── utils/
│   ├── components/
│   └── contexts/
├── integration/               # Entegrasyon testler
│   ├── api/
│   └── components/
└── e2e/                      # End-to-end testler
    ├── navigation.spec.ts
    ├── authentication.spec.ts
    └── quiz.spec.ts
```

### Test Coverage
- **Unit Tests:** %80+
- **Integration Tests:** %70+
- **E2E Tests:** %60+

## 🚀 Deployment

### Build Process
```bash
# Development
npm run dev

# Production Build
npm run build

# Production Start
npm start

# Linting
npm run lint

# Type Checking
npm run type-check
```

### Environment Variables
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Gemini AI
GEMINI_API_KEY=
GEMINI_SUMMARY_API_KEY=

# App Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
```

## 📊 Monitoring

### Error Tracking
- **Sentry:** Production hata takibi
- **Firebase Analytics:** Kullanıcı davranışları
- **Custom Logging:** API log'ları

### Performance Monitoring
- **Vercel Analytics:** Web vitals
- **Firebase Performance:** App performance
- **Custom Metrics:** Business metrics

## 🔧 Development

### Development Tools
- **ESLint:** Code linting
- **Prettier:** Code formatting
- **TypeScript:** Type checking
- **Jest:** Unit testing
- **Playwright:** E2E testing

### Code Standards
- **Conventional Commits:** Git commit messages
- **Semantic Versioning:** Version management
- **Code Review:** Pull request reviews
- **Documentation:** JSDoc comments

---

**Son Güncelleme:** 2024-01-15  
**Versiyon:** 1.0.0  
**Teknik Dokümantasyon:** YBS Buddy Geliştirme Ekibi 