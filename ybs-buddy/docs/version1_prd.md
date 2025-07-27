
# Ürün Gereksinim Dokümanı (PRD): YBS Buddy

**Sürüm:** 1.0
**Tarih:** 26 Temmuz 2025
**Yazar:** Gemini

---

## 0. Önbilgi

Düşündüğümüz projeyi Gemini ile tartışarak benimsedik ve hangi aşamasında neler olması gerektiğini derinlemesine tartıştık. Bu tartışmalar sonucunda bağlam penceresindeki bilgiler ışığında bir prd.md dosyası oluşturmasını istedik ve bunu da birinci versiyonda yapacağımızı belirttik. Ekte yer alan tüm bilgiler, tartıştığımız konumuzun özetleştirilmiş ürün gereksinim dokümanıdır. Versiyon, proje geliştikçe ilerlenecektir.

## 1. Özet

YBS Buddy, özellikle Bandırma Onyedi Eylül Üniversitesi (BANÜ) Yönetim Bilişim Sistemleri (YBS) bölümü öğrencileri için tasarlanmış, kapsamlı bir akademik destek ve kariyer gelişim platformudur. Uygulama, öğrencilerin ders materyallerine kolayca erişmelerini, kişisel notlarını organize etmelerini, sınavlara hazırlanmalarını ve bölümle ilgili kariyer olanaklarını keşfetmelerini sağlayarak akademik başarılarını artırmayı hedefler. Proje şu anda modern bir kullanıcı arayüzüne sahip, fonksiyonel bir ön yüz (frontend) prototipidir. Frontend tarafında görülmesi gereken aksiyonlar göz önüne geldikten sonra backend geliştirilecektir.

---

## 2. Hedef Kitle

- **Birincil Kullanıcılar:** Bandırma Onyedi Eylül Üniversitesi'ndeki 1, 2, 3, ve 4. sınıf YBS öğrencileri.
- **İkincil Kullanıcılar:** Diğer üniversitelerdeki YBS öğrencileri (gelecekteki genişleme potansiyeli).

---

## 3. Projenin Hedefleri

- **Akademik Başarıyı Artırmak:** Öğrencilerin ders materyallerine, müfredata ve sınav hazırlık araçlarına tek bir yerden erişimini sağlayarak not ortalamalarını yükseltmelerine yardımcı olmak.
- **Kaynakları Merkezileştirmek:** Ders notları, müfredat bilgileri ve kişisel çalışma materyallerini tek bir platformda birleştirmek.
- **Modern Bir Öğrenme Deneyimi Sunmak:** Temiz, sezgisel ve mobil uyumlu bir arayüz ile öğrencilerin öğrenme sürecini daha verimli ve keyifli hale getirmek.
- **Kariyer Farkındalığı Yaratmak:** YBS bölümünün ne olduğu, mezunların hangi alanlarda çalışabileceği ve hangi teknolojilere odaklanıldığı konusunda bilgilendirme yapmak.
- **Veri Gizliliğini Sağlamak:** Özellikle kişisel notlar gibi hassas verileri, sunucuya göndermeden doğrudan kullanıcının tarayıcısında güvenli bir şekilde saklamak.

---

## 4. Mevcut Özellikler ve Fonksiyonlar

### 4.1. Ana Sayfa (Home)
- **Amaç:** YBS bölümünü ve YBS Buddy uygulamasını tanıtmak.
- **Fonksiyonlar:**
  - YBS disiplininin tanımı ve temel amacı hakkında bilgilendirici metinler.
  - YBS mezunlarının çalışabileceği kariyer alanları ve pozisyonlar (Sistem Analisti, Veri Bilimci, Dijital Dönüşüm Lideri vb.).
  - Bölümde odaklanılan temel teknoloji alanları (Yapay Zeka, Siber Güvenlik, Veri Bilimi vb.).
  - Uygulamanın diğer modüllerine (Müfredat, Ders Notları, Not Alanı, Sınav Simülasyonu) yönlendiren kartlar.

### 4.2. Müfredat Görüntüleyici (Mufredat)
- **Amaç:** Öğrencilere güncel ders müfredatını interaktif bir şekilde sunmak.
- **Fonksiyonlar:**
  - Sınıf (1-4) ve dönem (Güz/Bahar) bazında filtreleme.
  - Ders türüne göre filtreleme (Tümü, Zorunlu, Seçmeli).
  - Seçilen filtrelere göre ders listesini dinamik olarak gösterme.
  - Her ders için temel bilgileri (ders tipi, dönemi) içeren detay kartları.
  - Eğer ders içerikleri  {Akademi Girişi ile} yapılmışsa müfredattaki dersin ders içeriğini görüntüleyebilecek.  

### 4.3. Ders Notları (DersNotlari)
- **Amaç:** Öğrenciler ve öğretim görevlileri tarafından paylaşılan ders notlarına erişim sağlamak.
- **Fonksiyonlar (UI/UX Tasarımı):**
  - Sınıf, dönem ve ders bazında notları filtreleme.
  - Not başlığı veya içeriğine göre metin tabanlı arama.
  - Notları favorilere ekleme, beğenme ve paylaşma.
  - Notları görüntüleme ve indirme butonları.
  - **Not:** Bu bölüm şu anda statiktir ve not verileri mevcut değildir. Fonksiyonellik için arka yüz (backend) gereklidir.

### 4.4. Akıllı Not Tutma Sistemi (NotAlani)
**Amaç:** Öğrencilerin kişisel ders notlarını güvenli ve organize bir şekilde oluşturup saklamalarını sağlamak.

**Fonksiyonlar:**
  **- Veri Saklama:** Tüm notlar, kullanıcının Firebase Firestore üzerinde güvenli bir şekilde saklanır. Bu sayede notlara farklı cihazlardan erişim mümkün olur ve veri kaybı riski ortadan kalkar.
  **- Zengin Metin Editörü:** Kalın, italik, altı çizili metin, listeler, alıntılar gibi formatlama seçenekleri sunan Notion benzeri bir editör.
  - **Organizasyon:**
    - Notları klasörlere ayırma (Kişisel, Ders Notları, Proje vb.).
    - Notlara etiket (tag) ekleme ve etiketlere göre filtreleme.
  - **Kullanıcı Deneyimi:** Tam ekran, dikkat dağıtmayan bir yazma modu.


### 4.5. Sınav Simülasyonu (SinavSimulasyonu)
- **Amaç:** Öğrencilerin gerçek sınav koşullarına benzer bir ortamda kendilerini test etmelerini sağlamak.
- **Fonksiyonlar:**
  - **Sınav Oluşturma Sihirbazı:**
    1.  **Ders Seçimi:** Sınıf ve metin araması ile ders seçme.
    2.  **Sınav Türü Seçimi:** Vize, Final veya Quiz.
    3.  **Sınav Formatı Seçimi:** Test, Boşluk Doldurma, Doğru/Yanlış, Klasik veya Karışık.
  - **Not:** Simülasyon başlatma özelliği mevcuttur ancak soru bankası ve sınav mantığı için arka yüz (backend) entegrasyonu gereklidir.

## 5. Fonksiyonel Olmayan Gereksinimler

- **Performans:** Hızlı sayfa yükleme süreleri ve akıcı bir kullanıcı deneyimi (Vite sayesinde büyük ölçüde sağlanmıştır).
- **Kullanılabilirlik:** Sezgisel, anlaşılır ve modern bir kullanıcı arayüzü (Tailwind CSS ile sağlanmıştır).
- **Güvenlik:** Kişisel notlar için yerel depolama kullanımı. Arka yüz geliştirildiğinde kullanıcı verilerinin güvenli bir şekilde yönetilmesi.
- **Uyumluluk:** Tüm modern web tarayıcılarında (Chrome, Firefox, Safari, Edge) ve farklı ekran boyutlarında (mobil, tablet, masaüstü) sorunsuz çalışma.

## 6. Teknik Gereksinimler / Tech Stack ve Mimari Yaklaşım

Bu projenin hızlı geliştirme, performans, ölçeklenebilirlik ve **Gemini** entegrasyonu hedefleri doğrultusunda aşağıdaki teknoloji yığını (tech stack) benimsenmiştir. Proje, özellikle 10 günlük yarışma süresi ve hızlı MVP (Minimum Viable Product) çıkarabilme ihtiyacı göz önünde bulundurularak, bilindik ve entegrasyonu kolay framework'ler ile yapılandırılacaktır.

### 6.1. Frontend (Mevcut - Uyumlu)

* **Framework:** **React 18**
    * **Neden:** Komponent tabanlı yapısı, geniş geliştirici topluluğu desteği, hızlı ve dinamik kullanıcı arayüzleri oluşturma yeteneği sayesinde verimli bir geliştirme süreci sağlar. Modern web uygulamaları için endüstri standardı bir seçenektir.
* **CSS Framework:** **Tailwind CSS**
    * **Neden:** Utility-first yaklaşımı sayesinde hızlı ve özelleştirilebilir arayüz tasarımı imkanı sunar. CSS yazma süresini minimize ederek tasarıma odaklanmayı kolaylaştırır.
* **Derleyici/Paketleyici:** **Vite**
    * **Neden:** Ultra hızlı geliştirme sunucusu ve derleme yetenekleri ile geliştirme deneyimini optimize eder.
* **Language:** **TypeScript**
    * **Neden:** Tip güvenliği, daha iyi IDE desteği ve hata ayıklama kolaylığı sağlar.

### 6.2. Backend (PRD Uyumlu - Güncellenmiş)

* **Framework:** **Next.js (API Routes)**
    * **Neden:** Frontend ile kusursuz entegrasyon, sunucu tarafı mantıkların (örneğin Gemini API entegrasyonu, veri işleme) hızlıca geliştirilmesine olanak tanır. Mikroservis karmaşıklığından kaçınarak monolitik yaklaşım benimsenmiştir.
* **Veritabanı:** **Firebase (Firestore)**
    * **Neden:** Gerçek zamanlı veri senkronizasyonu, kolay ölçeklenebilirlik ve hızlı kurulum imkanları sunarak backend veri ihtiyaçlarını karşılamak için idealdir. Özellikle 10 günlük süre kısıtlamasında backend kurulum ve yönetim yükünü minimize eder.
* **Authentication:** **Firebase Auth**
    * **Neden:** Hazır kimlik doğrulama sistemi, JWT token yönetimi ve güvenlik özellikleri.
* **Real-time:** **Firebase Realtime Database**
    * **Neden:** Gerçek zamanlı veri senkronizasyonu için.
* **File Storage:** **Firebase Storage**
    * **Neden:** Dosya upload/download işlemleri için.

### 6.3. Mimari Yaklaşım (Güncellenmiş)

**Monolitik Next.js API Routes Yaklaşımı:**
- **Avantajlar:** Hızlı geliştirme, basit deployment, 10 günlük süre için optimize
- **API Endpoints:** `/api/auth/*`, `/api/courses/*`, `/api/notes/*`, `/api/quiz/*`
- **Veritabanı:** Firestore koleksiyonları (SQL tabloları yerine)
- **Authentication:** Firebase Auth ile JWT token yönetimi
- **File Upload:** Firebase Storage entegrasyonu

**Tespit Edilen Uyumsuzluklar ve Çözümler:**
- ❌ **Mikroservis mimarisi** → ✅ **Monolitik yaklaşım** (10 günlük süre için)
- ❌ **Express.js API Gateway** → ✅ **Next.js API Routes** (PRD uyumlu)
- ❌ **SQL tabloları** → ✅ **Firestore koleksiyonları** (NoSQL yaklaşımı)

**Clean Code Prensipleri:**
- ✅ **DRY:** Tekrar kullanılabilir komponentler ve utilities
- ✅ **KISS:** Basit ve anlaşılır kod yapısı
- ✅ **SOLID:** Tek sorumluluk prensibi
- ✅ **YAGNI:** Sadece gerekli özellikler
- ✅ **Type Safety:** TypeScript ile tip güvenliği
- ✅ **Error Handling:** Kapsamlı hata yönetimi
- ✅ **Constants:** Merkezi sabit yönetimi

    ## 7. Geliştirme Yaklaşımı

Bu projenin geliştirme sürecinde, 10 günlük kısıtlı süremiz ve hızlıca işlevsel bir MVP (Minimum Viable Product) ortaya çıkarma hedefimiz doğrultusunda **Özellik Odaklı Geliştirme (Feature-Driven Development - FDD)** yaklaşımı benimsenecektir.

FDD, projenin temelini oluşturan "özellikler" etrafında organize olan yinelemeli bir yazılım geliştirme metodolojisidir. Bu yaklaşım, aşağıdaki avantajları sunarak projemizin hedeflerine ulaşmasında kritik rol oynayacaktır:

* **Özellik Merkezli Planlama:** Geliştirme süreci, PRD'de tanımlanan kullanıcıya değer katan özellikler etrafında şekillenecektir.
* **Hızlı İlerleme:** Her bir özelliğin küçük, yönetilebilir adımlarla tamamlanması, projenin genel ilerlemesini hızlandırır.
* **Şeffaflık:** Özellik bazlı ilerleme takibi, projenin durumu hakkında sürekli ve net bir görünürlük sağlar.
* **KISS ve YAGNI ile Uyum:** FDD, gereksiz karmaşıklıktan kaçınarak ve sadece ihtiyaç duyulan özelliklere odaklanarak "Basit Tut" (KISS) ve "Buna İhtiyacın Olmayacak" (YAGNI) prensipleriyle doğal bir uyum içindedir.

Bu yaklaşım, temiz kod prensipleriyle (DRY, Tek Sorumluluk, Anlamlı İsimlendirme vb.) desteklenerek, hem hızlı hem de yüksek kaliteli bir ürün ortaya koymamızı sağlayacaktır.