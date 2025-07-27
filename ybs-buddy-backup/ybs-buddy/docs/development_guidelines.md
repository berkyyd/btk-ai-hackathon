# Geliştirme Kılavuzu

## 📋 **Clean Code Prensipleri**

Projemizde yazacağımız kodun kalitesini, sürdürülebilirliğini ve ekip içindeki iş birliğini artırmak adına aşağıdaki **temiz kod (clean code)** prensiplerine uymaya özen göstereceğiz. Özellikle 10 günlük yarışma süremiz ve hızlı bir MVP (Minimum Viable Product) geliştirme hedefimiz göz önünde bulundurularak, prensiplerin pragmatik bir şekilde uygulanmasına odaklanılacaktır.

---

### 1. **DRY (Don't Repeat Yourself - Kendini Tekrar Etme)**
* Kod tekrarından kesinlikle kaçınılacak. Ortak kullanılan kod blokları, fonksiyonlar, yardımcı metotlar veya tekrar kullanılabilir komponentler halinde ayrıştırılacak. Bu, kodun bakımını kolaylaştırır ve hata potansiyelini azaltır.

### 2. **KISS (Keep It Simple, Stupid - Basit Tut, Aptalca)**
* Çözümler her zaman en basit ve en anlaşılır şekilde tasarlanacak. Gereksiz karmaşıklıktan ve aşırı mühendislikten kaçınılacak. En kolay uygulanabilir ve anlaşılır yolu tercih etmek, özellikle kısıtlı sürede hızlı ilerleme için hayati önem taşır.

### 3. **SOLID Prensipleri (Odaklanma: Tek Sorumluluk Prensibi)**
* **Tek Sorumluluk Prensibi (Single Responsibility Principle - SRP)** öncelikli olarak uygulanacak. Her fonksiyon, komponent veya modül yalnızca tek bir görevi yerine getirecek şekilde tasarlanacak. Bu, kodun daha yönetilebilir ve test edilebilir olmasını sağlar.
* Diğer SOLID prensipleri (Açık/Kapalı Prensip, Liskov Yerine Geçme, Arayüz Ayırma, Bağımlılık Ters Çevirme) ise mümkün olduğunca göz önünde bulundurulacak ancak **aşırı soyutlama yaparak projenin ilerlemesini yavaşlatmaktan kaçınılacak.**

### 4. **YAGNI (You Aren't Gonna Need It - Buna İhtiyacın Olmayacak)**
* Şu an için gereksiz olan veya gelecek senaryolar için varsayılan hiçbir özellik veya kod parçacığı eklenmeyecek. Sadece PRD'de belirtilen ve mevcut MVP için kesinlikle gerekli olan işlevselliklere odaklanılacak. Bu, 10 günlük sürede hedefe ulaşmak için kritik bir prensiptir.

### 5. **Okunabilirlik ve Modülerlik (Readable & Modular)**
* Kodun kolayca okunabilir ve anlaşılır olması sağlanacak. Fonksiyonlar kısa tutulacak, büyük dosyalar mantıksal olarak küçük modüllere veya dosyalara ayrılacak. Bu, ekip üyelerinin birbirlerinin kodunu hızlıca anlamasına ve hata ayıklama sürecinin verimli olmasına yardımcı olur.

### 6. **Anlamlı İsimlendirme (Meaningful Naming)**
* Değişkenler, fonksiyonlar, sınıflar ve dosya adları, ne iş yaptıklarını veya neyi temsil ettiklerini açıkça ifade edecek şekilde isimlendirilecek. Kısaltmalardan kaçınılacak ve kodun amacını isimden anlamak mümkün olacak.

### 7. **Magic Number Yerine Sabit Kullanımı (Use Constants Over Magic Numbers)**
* Kod içinde doğrudan sayısal veya string sabitler (magic numbers/strings) kullanmaktan kaçınılacak. Bunun yerine, bu değerler anlamlı isimlerle tanımlanmış sabitler (constants) olarak atanacak. Bu, kodun okunabilirliğini ve bakımını artırır.

### 8. **Otomatik Kod Biçimlendirme ve Linting (Automated Formatting & Linting)**
* **ESLint** ve **Prettier** gibi araçlar kullanılarak kod standartları ve biçimlendirme kuralları otomatik olarak uygulanacak. Bu, tüm ekip üyelerinin kod yazım stilini tutarlı tutar, manuel inceleme ihtiyacını azaltır ve kod inceleme sürecini hızlandırır. Bu araçlar, geliştirme sürecinin başından itibaren kurulup aktif olarak kullanılacaktır.

### 9. **Hata Yönetimi (Error Handling)**
* Uygulamanın sağlamlığını ve kullanıcı deneyimini artırmak için **etkili hata yönetimi** prensipleri benimsenecektir. Beklenmedik durumlar ve hatalar uygun şekilde yakalanacak, kullanıcıya anlaşılır geri bildirimler sunulacak ve uygulama çöküşleri minimize edilecektir. Hata loglama mekanizmaları (gerekliyse) düşünülerek, sorunların tespiti ve çözümü kolaylaştırılacaktır.

### 10. **Yapay Zeka Destekli Geliştirme (AI-Assisted Development)**
* Projede **Google Gemini CLI** etkin bir şekilde kullanılacaktır. Gemini'den alınan çıktıların kullanımı ve beklentiler, aşağıda detaylandırılan prensiplere uygun olarak yönetilecektir. Bu, yapay zeka tarafından üretilen kodun da projenin genel kalite ve tutarlılık standartlarına uymasını sağlayacaktır.

---

## 🤖 **Google Gemini CLI Kullanım Kılavuzu**

### **Temel Prensipler**

#### **1. Dil Tercihi**
* **Türkçe kullanımı:** Gemini ile iletişim kurarken Türkçe dilini tercih edin. Bu, projenin hedef kitlesi ve dokümantasyon tutarlılığı açısından önemlidir.
* **Teknik terimler:** Gerekli durumlarda İngilizce teknik terimler kullanılabilir, ancak açıklamalar Türkçe olmalıdır.

#### **2. Kod Kalitesi**
* **Clean code prensipleri:** Gemini'den alınan kodların DRY, KISS, SOLID prensiplerine uygun olmasını sağlayın.
* **TypeScript kullanımı:** Tüm yeni kodlar TypeScript ile yazılmalı ve tip güvenliği sağlanmalıdır.
* **Anlamlı isimlendirme:** Değişken, fonksiyon ve komponent isimleri açıklayıcı olmalıdır.

#### **3. Test ve Doğrulama**
* **Kod incelemesi:** Gemini'den alınan kodları her zaman inceleyin ve gerekirse düzenleyin.
* **Fonksiyonellik testi:** Üretilen kodun beklenen işlevselliği sağladığını doğrulayın.
* **Hata kontrolü:** Kodun hata durumlarını uygun şekilde ele aldığından emin olun.

#### **4. Refactoring ve Optimizasyon**
* **Performans optimizasyonu:** Gereksiz render'ları ve hesaplamaları minimize edin.
* **Kod tekrarını azaltma:** Benzer işlevsellikler için ortak komponentler ve utility fonksiyonlar oluşturun.
* **Okunabilirlik:** Karmaşık kod bloklarını daha küçük, anlaşılır parçalara bölün.

#### **5. Dokümantasyon**
* **Yorum satırları:** Karmaşık iş mantığı için açıklayıcı yorumlar ekleyin.
* **README güncellemeleri:** Yeni özellikler için dokümantasyon güncelleyin.
* **API dokümantasyonu:** Backend endpoint'leri için açık dokümantasyon sağlayın.

### **Kullanım Senaryoları**

#### **1. Yeni Komponent Oluşturma**
```
Prompt: "React TypeScript ile bir Button komponenti oluştur. Primary, secondary, danger variant'ları olsun. Loading state'i desteklesin."
```

#### **2. API Entegrasyonu**
```
Prompt: "Firebase Firestore ile kullanıcı notları CRUD işlemleri için API fonksiyonları oluştur."
```

#### **3. Hata Yönetimi**
```
Prompt: "API çağrıları için kapsamlı error handling utility fonksiyonları oluştur."
```

#### **4. Form Validasyonu**
```
Prompt: "React Hook Form ile email ve şifre validasyonu olan login formu oluştur."
```

### **Kalite Kontrol Checklist**

- [ ] Kod TypeScript ile yazılmış mı?
- [ ] ESLint ve Prettier kurallarına uygun mu?
- [ ] Anlamlı değişken ve fonksiyon isimleri kullanılmış mı?
- [ ] Hata durumları ele alınmış mı?
- [ ] Performans optimizasyonu yapılmış mı?
- [ ] Dokümantasyon güncellenmiş mi?
- [ ] Test edilmiş mi?

### **Önemli Notlar**

* **Gemini'ye güvenmeyin:** Her zaman üretilen kodu inceleyin ve gerekirse düzenleyin.
* **İnsan kontrolü:** AI'ın ürettiği kodlar insan kontrolünden geçmelidir.
* **Sürekli öğrenme:** Gemini'den öğrendiğiniz yeni yaklaşımları projeye entegre edin.
* **Tutarlılık:** Tüm ekip üyeleri aynı prensipleri takip etmelidir. 