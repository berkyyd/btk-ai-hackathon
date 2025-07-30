# YBS Buddy Projesi - Yapılacaklar Listesi

Bu belge, projenin geliştirme adımlarını ve ilerlemesini takip etmek için kullanılır. Proje, PRD'de belirtilen hedeflere ulaşmak için 3 ana faza ayrılmıştır. Tamamlanan her adımın yanındaki kutu işaretlenecektir.

---

### Başlangıç ve Kurulum (Tamamlandı)

- [x] Proje iskelesinin Next.js ile oluşturulması (`create-next-app`)
- [x] Temel bağımlılıkların yüklenmesi (`npm install`)
- [x] Tailwind CSS kurulumu ve yapılandırılması
- [x] Prettier ve ESLint kurulumu ve yapılandırması
- [x] Başlangıç kodlarının temizlenmesi (boilerplate removal)
- [x] Geliştirme sunucusunun başarıyla çalıştırılması (`npm run dev`)
- [x] Next.js App Router yapılandırması

---

### Faz 1: Proje Yapısı ve Temel Komponentler

- [x] Proje klasör yapısının oluşturulması (`components`, `pages`, `layouts`, `utils`, `app`)
- [x] Next.js App Router ile temel yönlendirme (`routing`) yapısının oluşturulması
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

- [x] **Next.js API Routes Kurulumu**
  - [x] Next.js projesine API Routes eklenmesi
  - [x] `/api` klasörü altında endpoint'lerin organize edilmesi
  - [x] CORS ve güvenlik middleware'lerinin yapılandırılması
  - [x] Error handling ve validation mekanizmalarının eklenmesi

- [x] **Firebase Kurulumu ve Yapılandırması**
  - [x] Firebase projesinin oluşturulması
  - [x] Firestore veritabanının yapılandırılması
  - [x] Firebase Authentication kurulumu
  - [x] Firebase Security Rules yapılandırması

- [x] **Authentication Service (Kimlik Doğrulama Servisi)**
  - [x] Firebase Auth entegrasyonu
  - [x] `/api/auth/register` endpoint'i oluşturulması
  - [x] `/api/auth/login` endpoint'i oluşturulması
  - [x] JWT token yönetimi ve doğrulama
  - [ ] Şifre sıfırlama fonksiyonalitesi

- [x] **Content Service (İçerik Yönetim Servisi)**
  - [x] `/api/courses` - Müfredat CRUD işlemleri
  - [x] `/api/notes` - Ders notları yönetimi
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

- [x] **Quiz & Analytics Service (Sınav ve Analiz Servisi)**
  - [x] `/api/quiz/generate` - Gemini API ile dinamik sınav üretimi (Mock)
  - [ ] `/api/quiz/evaluate` - Akıllı değerlendirme sistemi
  - [x] Test, klasik, doğru/yanlış soru formatları
  - [ ] Firestore'da `userMistakes` koleksiyonu ile hata kaydı
  - [ ] `/api/analytics/weakness` - Zayıflık analizi ve raporlama
  - [ ] `/api/quiz/reinforcement` - Kişiselleştirilmiş pekiştirme sınavı
  - [ ] `/api/guidance/generate` - Akademik yönlendirme içerik üretimi

---

### Faz 6: Chatbot (Tamamlandı ✅)

- [x] Öğrencilerin derslerle ilgili doğal dilde sorularına yanıt ver.
- [x] Soruları Firebase'den çekilen notlara göre cevapla.
- [x] Bilgiyi veremiyorsa "Bu konuda yeterli bilgiye ulaşamadım." şeklinde kibarca belirt.
- [x] Gelecekte Gemini'ye fine-tune edilebilecek yapıda geliştir.
- [x] Chat geçmişini yönet ve yanıtları sade, anlaşılır şekilde üret.
- [x] LangChain'in retriever + QA zincirini (RetrievalQA chain) kullan.

- [x] Firebase veritabanından veri çekeceksin.
- [x] LangChain üzerinden bir retriever oluşturulup chatbot bu retriever ile çalışacak.
- [x] Kullanıcıların en çok sorduğu sorular kaydedilecek.
- [x] Geri bildirim almak için "Bu cevap yardımcı oldu mu?" sorusu sona eklenecek.

**Eklenen Özellikler:**
- [x] Modern ve kullanıcı dostu chat arayüzü
- [x] Gerçek zamanlı mesaj gönderme ve alma
- [x] Kaynak gösterimi (hangi notlardan bilgi alındığı)
- [x] Geri bildirim sistemi (yardımcı/yardımcı değil)
- [x] Chat geçmişi kaydetme
- [x] Gelişmiş arama algoritması (kelime bazlı skorlama)
- [x] Örnek notlar oluşturma sistemi
- [x] Responsive tasarım ve animasyonlar

### Faz 7: Frontend-Backend Entegrasyonu

- [x] **API Entegrasyonu**
  - [x] Frontend'de API client kurulumu (Axios/Fetch)
  - [x] Authentication state management (Context API/Redux)
  - [x] Müfredat sayfasının backend ile entegrasyonu ✅
  - [x] Ders notları sayfasının backend ile entegrasyonu ✅
  - [x] Sınav simülasyonu sayfasının backend ile entegrasyonu ✅
  - [x] Loading states ve error handling

- [ ] **Kullanıcı Deneyimi İyileştirmeleri**
  - [ ] Form validasyonları ve error mesajları
  - [ ] Loading spinners ve skeleton screens
  - [ ] Toast notifications ve success/error mesajları
  - [ ] Responsive tasarım optimizasyonları
  - [ ] Accessibility (erişilebilirlik) iyileştirmeleri

---

### Faz 8: Test ve Optimizasyon

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

### Faz 9: Deployment ve Production

## bu kısımlar çok önemli değil çünkü projeyi yayına almayacağız. vercel vb. platform kullanacağız.

- [ ] **Production Deployment**
  - [ ] Vercel deployment yapılandırması
  - [ ] Environment variables yönetimi
  - [ ] Domain yapılandırması
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
