# Test Dokümantasyonu

Bu dokümantasyon YBS Buddy projesinin test stratejisini ve test yapısını açıklar.

## Test Türleri

### 1. Unit Testler
Bireysel fonksiyonların ve bileşenlerin test edilmesi.

**Konum:** `src/__tests__/unit/`

**Örnekler:**
- `utils/apiClient.test.ts` - API client fonksiyonları
- `utils/curriculumUtils.test.ts` - Müfredat yardımcı fonksiyonları
- `components/Header.test.tsx` - Header bileşeni
- `contexts/AuthContext.test.tsx` - Kimlik doğrulama context'i

### 2. Integration Testler
Birden fazla bileşenin birlikte çalışmasının test edilmesi.

**Konum:** `src/__tests__/integration/`

**Örnekler:**
- `api/courses.test.ts` - Courses API endpoint'leri
- `components/QuizForm.test.tsx` - Quiz form bileşeni ve API entegrasyonu

### 3. E2E (End-to-End) Testler
Kullanıcı senaryolarının tam akışının test edilmesi.

**Konum:** `e2e/`

**Örnekler:**
- `navigation.spec.ts` - Sayfa navigasyonu
- `authentication.spec.ts` - Kimlik doğrulama akışları
- `quiz.spec.ts` - Quiz oluşturma ve çözme akışları

## Test Komutları

### Unit ve Integration Testler
```bash
# Tüm testleri çalıştır
npm test

# Testleri watch modunda çalıştır
npm run test:watch

# Coverage raporu ile testleri çalıştır
npm run test:coverage

# Sadece unit testleri çalıştır
npm run test:unit

# Sadece integration testleri çalıştır
npm run test:integration
```

### E2E Testler
```bash
# Tüm E2E testleri çalıştır
npm run test:e2e

# E2E testleri UI modunda çalıştır
npm run test:e2e:ui

# E2E testleri headed modda çalıştır (browser görünür)
npm run test:e2e:headed
```

## Test Yapılandırması

### Jest Yapılandırması
- **Dosya:** `jest.config.js`
- **Setup:** `jest.setup.js`
- **Coverage hedefi:** %70 (branches, functions, lines, statements)

### Playwright Yapılandırması
- **Dosya:** `playwright.config.ts`
- **Desteklenen browserlar:** Chrome, Firefox, Safari
- **Mobile testler:** Pixel 5, iPhone 12

## Mock'lar

### Firebase Mock'ları
```javascript
// Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  updateProfile: jest.fn(),
}))

// Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
}))
```

### Next.js Mock'ları
```javascript
// Router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))
```

## Test Yazma Kuralları

### 1. Test İsimlendirme
```javascript
describe('ComponentName', () => {
  it('should do something when condition', () => {
    // test implementation
  })
})
```

### 2. Test Yapısı (AAA Pattern)
```javascript
it('should handle user login', async () => {
  // Arrange - Test verilerini hazırla
  const user = { email: 'test@example.com', password: 'password123' }
  
  // Act - Test edilecek aksiyonu gerçekleştir
  await login(user)
  
  // Assert - Sonuçları doğrula
  expect(isLoggedIn).toBe(true)
})
```

### 3. Async Testler
```javascript
it('should fetch data successfully', async () => {
  const result = await fetchData()
  expect(result.success).toBe(true)
})
```

### 4. Error Handling Testleri
```javascript
it('should handle API errors', async () => {
  mockApi.mockRejectedValue(new Error('Network error'))
  
  const result = await fetchData()
  expect(result.error).toBe('Network error')
})
```

## Coverage Hedefleri

- **Branches:** %70
- **Functions:** %70
- **Lines:** %70
- **Statements:** %70

## Test Verileri

### Mock Data
```javascript
const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User'
}

const mockQuiz = {
  id: 'quiz-1',
  title: 'Test Quiz',
  questions: [
    {
      id: '1',
      question: 'Test question?',
      type: 'multiple_choice',
      options: ['A) Option 1', 'B) Option 2'],
      correctAnswer: 'A) Option 1'
    }
  ],
  totalQuestions: 1,
  timeLimit: 30
}
```

## CI/CD Entegrasyonu

### GitHub Actions
```yaml
- name: Run Unit Tests
  run: npm run test:coverage

- name: Run E2E Tests
  run: npm run test:e2e
```

## Debugging

### Jest Debug
```bash
# Debug modunda test çalıştır
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright Debug
```bash
# Debug modunda E2E test çalıştır
npx playwright test --debug
```

## Best Practices

1. **Test Isolation:** Her test bağımsız olmalı
2. **Descriptive Names:** Test isimleri açıklayıcı olmalı
3. **Mock Everything:** External dependencies mock'lanmalı
4. **Fast Tests:** Testler hızlı çalışmalı
5. **Maintainable:** Testler kolay güncellenebilir olmalı

## Troubleshooting

### Yaygın Sorunlar

1. **Firebase Mock Sorunları**
   - Mock'ların doğru import edildiğinden emin olun
   - Test setup dosyasını kontrol edin

2. **Async Test Sorunları**
   - `waitFor` kullanın
   - Promise'ları doğru handle edin

3. **Component Render Sorunları**
   - Context provider'ları ekleyin
   - Router mock'larını kontrol edin

### Debug İpuçları

```javascript
// Console.log yerine debug kullanın
import { debug } from 'jest-environment-jsdom'
debug('Debug message')

// Test içinde breakpoint
debugger
``` 