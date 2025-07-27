# YBS Buddy Projesi - Yapılacaklar Listesi

Bu belge, projenin geliştirme adımlarını ve ilerlemesini takip etmek için kullanılır. Proje, PRD'de belirtilen hedeflere ulaşmak için 3 ana faza ayrılmıştır. Tamamlanan her adımın yanındaki kutu işaretlenecektir.

---

### Başlangıç ve Kurulum (Tamamlandı)

- [x] Proje iskelesinin Vite ile oluşturulması (`react-ts`)
- [x] Temel bağımlılıkların yüklenmesi (`npm install`)
- [x] Tailwind CSS kurulumu ve yapılandırılması
- [x] Prettier ve ESLint kurulumu ve yapılandırması
- [x] Başlangıç kodlarının temizlenmesi (boilerplate removal)
- [x] Geliştirme sunucusunun başarıyla çalıştırılması (`npm run dev`)
- [x] Tailwind CSS v4 PostCSS hatasının düzeltilmesi

---

### Faz 1: Proje Yapısı ve Temel Komponentler

- [x] Proje klasör yapısının oluşturulması (`components`, `pages`, `layouts`, `utils`, `routes`)
- [x] React Router DOM kurulumu ve temel yönlendirme (`routing`) yapısının oluşturulması
- [x] Ana `layout` (yerleşim) komponentinin oluşturulması (Header, Footer, Main Content Alanı)
- [x] Temel `Header` ve `Footer` komponentlerinin oluşturulması
- [x] Ana Sayfa (`Home`) için boş bir sayfa komponentinin oluşturulması ve yönlendirilmesi

---

### Faz 2: Ana Özelliklerin Arayüz Geliştirmesi (UI)

- [x] Ana Sayfa (`Home`) içeriğinin PRD'ye göre temel hatlarıyla oluşturulması
- [x] Müfredat Görüntüleyici (`Mufredat`) sayfasının oluşturulması ve arayüzünün tasarlanması
- [x] Ders Notları (`DersNotlari`) sayfasının statik arayüzünün tasarlanması
- [x] Sınav Simülasyonu (`SinavSimulasyonu`) sayfasının sihirbaz arayüzünün tasarlanması

---

### Faz 3: Backend Altyapısı ve Temel Servisler (PRD Uyumlu)

- [ ] **Next.js API Routes Kurulumu**
  - [ ] Next.js projesine API Routes eklenmesi
  - [ ] `/api` klasörü altında endpoint'lerin organize edilmesi
  - [ ] CORS ve güvenlik middleware'lerinin yapılandırılması
  - [ ] Error handling ve validation mekanizmalarının eklenmesi

- [ ] **Firebase Kurulumu ve Yapılandırması**
  - [ ] Firebase projesinin oluşturulması
  - [ ] Firestore veritabanının yapılandırılması
  - [ ] Firebase Authentication kurulumu
  - [ ] Firebase Security Rules yapılandırması

- [ ] **Authentication Service (Kimlik Doğrulama Servisi)**
  - [ ] Firebase Auth entegrasyonu
  - [ ] `/api/auth/register` endpoint'i oluşturulması
  - [ ] `/api/auth/login` endpoint'i oluşturulması
  - [ ] JWT token yönetimi ve doğrulama
  - [ ] Şifre sıfırlama fonksiyonalitesi

- [ ] **Content Service (İçerik Yönetim Servisi)**
  - [ ] `/api/courses` - Müfredat CRUD işlemleri
  - [ ] `/api/notes` - Ders notları yönetimi
  - [ ] `/api/upload` - Dosya upload sistemi
  - [ ] `/api/summarize` - Gemini API ile not özetleme
  - [ ] Beğeni ve favori sistemi için Firestore entegrasyonu

---

### Faz 4: Kişisel Not Alma Sistemi (PRD Uyumlu)

- [ ] **Notetaking Service (Kişisel Not Alma Servisi)**
  - [ ] `/api/notes/personal` - Kişisel notlar CRUD işlemleri
  - [ ] Firestore'da kullanıcıya özel notlar koleksiyonu
  - [ ] Rich text editör entegrasyonu (Notion benzeri)
  - [ ] Klasör ve etiketleme (tag) sistemi
  - [ ] Firebase Realtime Database ile gerçek zamanlı senkronizasyon
  - [ ] Not arama ve filtreleme özellikleri

---

### Faz 5: Akıllı Sınav ve Analiz Sistemi (PRD Uyumlu)

- [ ] **Quiz & Analytics Service (Sınav ve Analiz Servisi)**
  - [ ] `/api/quiz/generate` - Gemini API ile dinamik sınav üretimi
  - [ ] `/api/quiz/evaluate` - Akıllı değerlendirme sistemi
  - [ ] Test, klasik, doğru/yanlış soru formatları
  - [ ] Firestore'da `userMistakes` koleksiyonu ile hata kaydı
  - [ ] `/api/analytics/weakness` - Zayıflık analizi ve raporlama
  - [ ] `/api/quiz/reinforcement` - Kişiselleştirilmiş pekiştirme sınavı
  - [ ] `/api/guidance/generate` - Akademik yönlendirme içerik üretimi

---

### Faz 6: Frontend-Backend Entegrasyonu

- [ ] **API Entegrasyonu**
  - [ ] Frontend'de API client kurulumu (Axios/Fetch)
  - [ ] Authentication state management (Redux/Context)
  - [ ] Müfredat sayfasının backend ile entegrasyonu
  - [ ] Ders notları sayfasının backend ile entegrasyonu
  - [ ] Sınav simülasyonu sayfasının backend ile entegrasyonu
  - [ ] Loading states ve error handling

- [ ] **Kullanıcı Deneyimi İyileştirmeleri**
  - [ ] Form validasyonları ve error mesajları
  - [ ] Loading spinners ve skeleton screens
  - [ ] Toast notifications ve success/error mesajları
  - [ ] Responsive tasarım optimizasyonları
  - [ ] Accessibility (erişilebilirlik) iyileştirmeleri

---

### Faz 7: Test ve Optimizasyon

- [ ] **Test Süreçleri**
  - [ ] Unit testlerin yazılması (Jest/Vitest)
  - [ ] Integration testlerin yazılması
  - [ ] E2E testlerin yazılması (Playwright/Cypress)
  - [ ] API endpoint'lerinin test edilmesi

- [ ] **Performans Optimizasyonu**
  - [ ] Code splitting ve lazy loading
  - [ ] Image optimization
  - [ ] Bundle size analizi ve optimizasyonu
  - [ ] Database query optimizasyonu
  - [ ] Caching stratejileri (Redis)

---

### Faz 8: Deployment ve Production

## bu kısımlar çok önemli değil çünkü projeyi yayına almayacağız. vercel vb. platform kullanacağız.

- [ ] **Production Deployment**
  - [ ] Docker containerization
  - [ ] CI/CD pipeline kurulumu (GitHub Actions)
  - [ ] Environment variables yönetimi
  - [ ] SSL sertifikası ve domain yapılandırması
  - [ ] Monitoring ve logging sistemi

- [ ] **Güvenlik ve Compliance**
  - [ ] Security audit ve penetration testing
  - [ ] GDPR compliance kontrolü
  - [ ] Data backup ve recovery stratejisi
  - [ ] Rate limiting ve DDoS koruması

---

### Gelecek Vizyonu: Chatbot Service

- [ ] **Chatbot Service Planlaması**
  - [ ] Natural Language Processing (NLP) entegrasyonu
  - [ ] Kullanıcı intent recognition sistemi
  - [ ] Mikroservisler arası iletişim için chatbot API
  - [ ] "Bana yarınki 'Veri Tabanı' sınavımla ilgili aldığım notları hatırlat" gibi komutlar
  - [ ] Kişiselleştirilmiş öğrenme asistanı özellikleri
