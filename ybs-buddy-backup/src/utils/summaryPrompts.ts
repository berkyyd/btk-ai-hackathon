export const SUMMARY_PROMPTS = {
  academic: (content: string) => `Aşağıdaki akademik metni YBS (Yönetim Bilişim Sistemleri) öğrencileri için detaylı ve yapılandırılmış bir formatta özetle:

${content}

**ÖZET FORMATI:**

## 📚 Ana Konular
- Metnin temel konularını madde halinde listele
- Her konuyu kısa açıklamalarla destekle

## 🔑 Önemli Kavramlar
- Kritik terimleri ve tanımlarını belirt
- Her kavramı kısa açıklamalarla destekle

## 💡 Ana Fikirler ve Bulgular
- Metnin temel argümanlarını özetle
- Önemli bulguları vurgula
- Kritik noktaları belirt

## 📋 Genel Özet Tablosu
| Kavram | Açıklama | Örnek |
|--------|----------|-------|
| [Ana Kavram 1] | [Detaylı açıklama] | [Pratik örnek] |
| [Ana Kavram 2] | [Detaylı açıklama] | [Pratik örnek] |
| [Ana Kavram 3] | [Detaylı açıklama] | [Pratik örnek] |

**ÖNEMLİ:** Metinde geçen tüm önemli kavramları tabloya dahil et. Eğer bir kavramın tanımı yoksa, o kavramı da araştır ve uygun bir tanım ekle. En az 3-5 kavram mutlaka olsun.`,

  friendly: (content: string) => `Aşağıdaki metni samimi ve anlaşılır bir dille, arkadaşça bir tonla özetle:

${content}

**ARKADAŞÇA ÖZET:**

## 🎯 Ne Anlatıyor?
- Ana konuyu basit bir dille açıkla
- Karmaşık kavramları sadeleştir

## 💭 Önemli Noktalar
- Dikkat çeken bilgileri listele
- İlginç detayları vurgula
- Pratik faydaları belirt

## 💡 Hatırlanması Gerekenler
- Anahtar mesajlar
- Önemli ipuçları
- Faydalı bilgiler

## 📋 Genel Özet Tablosu
| Kavram | Açıklama | Örnek |
|--------|----------|-------|
| [Ana Kavram 1] | [Basit açıklama] | [Günlük hayat örneği] |
| [Ana Kavram 2] | [Basit açıklama] | [Günlük hayat örneği] |
| [Ana Kavram 3] | [Basit açıklama] | [Günlük hayat örneği] |

## 🎉 Sonuç
- Genel değerlendirme
- Kişisel yorum (varsa)
- Öneriler

**ÖNEMLİ:** Metinde geçen tüm önemli kavramları tabloya dahil et. Eğer bir kavramın tanımı yoksa, o kavramı da araştır ve basit bir açıklama ekle. En az 3-5 kavram mutlaka olsun.

*Not: Samimi ve sıcak bir dil kullan, teknik terimleri açıkla, örneklerle destekle.*`,

  exam: (content: string) => `Aşağıdaki metni sınav odaklı, öğrenme hedeflerine yönelik bir formatta özetle:

${content}

**SINAV ODAKLI ÖZET:**

## 📝 Sınav Konuları
### Yüksek Öncelikli:
- [Konu 1] - Muhtemelen sınavda çıkacak
- [Konu 2] - Sık sorulan konular

### Orta Öncelikli:
- [Konu 3] - Bilinmesi gereken
- [Konu 4] - Temel kavramlar

## 🎯 Sınav Soruları İçin Kritik Noktalar
- Önemli detayları listele
- Sık sorulan soru tiplerini belirt
- Dikkat edilmesi gereken noktaları vurgula

## 🔍 Sık Sorulan Sorular
1. **Soru Tipi 1:** [Örnek soru]
   - Cevap: [Açıklama]
   
2. **Soru Tipi 2:** [Örnek soru]
   - Cevap: [Açıklama]

## 📚 Çalışma Stratejileri
### Ezberlenmesi Gerekenler:
- [Madde 1]
- [Madde 2]

### Anlaşılması Gerekenler:
- [Madde 1]
- [Madde 2]

## ⚡ Hızlı Hatırlatma
- Anahtar terimler
- Formüller (varsa)
- Önemli tarihler/rakamlar

## 📋 Genel Özet Tablosu
| Kavram | Açıklama | Sınav Örneği |
|--------|----------|--------------|
| [Ana Kavram 1] | [Sınav odaklı açıklama] | [Sınav sorusu örneği] |
| [Ana Kavram 2] | [Sınav odaklı açıklama] | [Sınav sorusu örneği] |
| [Ana Kavram 3] | [Sınav odaklı açıklama] | [Sınav sorusu örneği] |

## 🎯 Sınav İpuçları
- Dikkat edilmesi gereken tuzaklar
- Sık yapılan hatalar
- Zaman yönetimi önerileri

**ÖNEMLİ:** Metinde geçen tüm önemli kavramları tabloya dahil et. Eğer bir kavramın tanımı yoksa, o kavramı da araştır ve sınav odaklı bir açıklama ekle. En az 3-5 kavram mutlaka olsun.

*Not: Sınav formatına uygun, pratik ve hatırlanabilir bilgiler öncelikli.*`,
}; 