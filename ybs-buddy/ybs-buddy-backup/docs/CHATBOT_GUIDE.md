# YBS Buddy Chatbot Kullanım Kılavuzu

## Genel Bakış

YBS Buddy Chatbot, öğrencilerin derslerle ilgili sorularını yanıtlamak için tasarlanmış akıllı bir asistan sistemidir. Chatbot, Firebase'deki notları kullanarak Gemini AI ile entegre çalışır ve öğrencilere kişiselleştirilmiş yanıtlar verir.

## Özellikler

### 🤖 Akıllı Soru-Cevap Sistemi
- Doğal dil işleme ile soru anlama
- Firebase'den ilgili notları otomatik bulma
- Gemini AI ile akıllı cevap üretimi
- Kaynak gösterimi (hangi notlardan bilgi alındığı)

### 💬 Modern Chat Arayüzü
- Gerçek zamanlı mesajlaşma
- Responsive tasarım
- Mesaj zaman damgaları
- Loading animasyonları
- Otomatik kaydırma

### 📊 Geri Bildirim Sistemi
- "Yardımcı" / "Yardımcı Değil" butonları
- Kullanıcı geri bildirimlerini kaydetme
- Chatbot performansını iyileştirme

### 🔍 Gelişmiş Arama
- Kelime bazlı arama algoritması
- Başlık ve içerik araması
- Skorlama sistemi ile en uygun sonuçları getirme

## Kullanım

### 1. Chatbot'u Açma
- Sağ alt köşedeki mavi chat ikonuna tıklayın
- Chatbot penceresi açılacaktır

### 2. Soru Sorma
- Mesaj kutusuna sorunuzu yazın
- Enter tuşuna basın veya gönder butonuna tıklayın
- Chatbot yanıtınızı verecektir

### 3. Örnek Sorular
```
- "Veri tabanı nedir?"
- "SQL komutları nelerdir?"
- "Sistem analizi nasıl yapılır?"
- "Ağ teknolojileri hakkında bilgi ver"
- "VTYS'nin avantajları nelerdir?"
- "UML diyagramları ne işe yarar?"
```

### 4. Geri Bildirim Verme
- Her chatbot yanıtının altında "👍 Yardımcı" ve "👎 Yardımcı Değil" butonları bulunur
- Yanıtın size yardımcı olup olmadığını belirtin
- Geri bildirimler sistemi iyileştirmek için kullanılır

## Teknik Detaylar

### API Endpoints

#### POST /api/chatbot
Soru gönderme ve yanıt alma
```json
{
  "question": "Veri tabanı nedir?",
  "userId": "user123",
  "context": "optional context"
}
```

#### PUT /api/chatbot
Geri bildirim gönderme
```json
{
  "messageId": "msg123",
  "feedback": "helpful",
  "userId": "user123"
}
```

#### GET /api/chatbot?action=create-sample-notes
Örnek notları oluşturma (geliştirme amaçlı)

### Veritabanı Koleksiyonları

#### notes
- `title`: Not başlığı
- `content`: Not içeriği
- `course`: Ders adı
- `createdAt`: Oluşturulma tarihi
- `updatedAt`: Güncellenme tarihi

#### chatHistory
- `userId`: Kullanıcı ID'si
- `messages`: Mesaj dizisi
- `createdAt`: Oluşturulma tarihi
- `updatedAt`: Güncellenme tarihi

#### chatFeedback
- `messageId`: Mesaj ID'si
- `feedback`: Geri bildirim türü
- `userId`: Kullanıcı ID'si
- `timestamp`: Zaman damgası

## Geliştirme

### Yeni Özellik Ekleme

1. **Yeni API endpoint'i ekleme:**
   - `src/app/api/chatbot/route.ts` dosyasını düzenleyin
   - Gerekli tip tanımlarını `src/types/api.ts` dosyasına ekleyin

2. **UI bileşeni güncelleme:**
   - `src/components/ChatWindow.tsx` dosyasını düzenleyin
   - Yeni özellikleri ekleyin

3. **Firebase entegrasyonu:**
   - `src/utils/firebaseUtils.ts` dosyasına yeni fonksiyonlar ekleyin

### Test Etme

1. **Örnek notları oluşturma:**
   ```bash
   curl -X GET "http://localhost:3000/api/chatbot?action=create-sample-notes"
   ```

2. **Chatbot'u test etme:**
   - Tarayıcıda `http://localhost:3000` adresine gidin
   - Sağ alt köşedeki chat ikonuna tıklayın
   - Örnek sorular sorun

### Performans Optimizasyonu

- Arama algoritması kelime bazlı skorlama kullanır
- Firebase sorguları optimize edilmiştir
- Gemini API çağrıları cache'lenebilir
- Chat geçmişi kullanıcı bazında saklanır

## Gelecek Geliştirmeler

- [ ] Sesli soru sorma özelliği
- [ ] Çoklu dil desteği
- [ ] Görsel içerik analizi
- [ ] Kişiselleştirilmiş öğrenme önerileri
- [ ] Sınav tarihi hatırlatmaları
- [ ] Grup sohbeti özelliği
- [ ] Dosya paylaşımı
- [ ] Gelişmiş analitik raporları

## Sorun Giderme

### Chatbot Yanıt Vermiyor
1. Firebase bağlantısını kontrol edin
2. Gemini API anahtarının doğru olduğundan emin olun
3. Console'da hata mesajlarını kontrol edin

### Arama Sonuçları İyi Değil
1. Firebase'de yeterli not olduğundan emin olun
2. Arama terimlerini daha spesifik yapın
3. Örnek notları yeniden oluşturun

### Performans Sorunları
1. Firebase sorgularını optimize edin
2. Gemini API çağrılarını cache'leyin
3. Chat geçmişini temizleyin

## İletişim

Herhangi bir sorun veya öneri için lütfen geliştirme ekibiyle iletişime geçin. 