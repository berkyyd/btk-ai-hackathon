export const SUMMARY_PROMPTS = {
  academic: (content: string) => `Aşağıdaki akademik metni YBS (Yönetim Bilişim Sistemleri) öğrencileri için detaylı ve yapılandırılmış bir formatta özetle:

${content}

<strong>DETAYLI AKADEMİK ÖZET:</strong>

<h2>📚 Ana Konular ve Kavramlar</h2>
<ul>
<li>Metnin temel konularını detaylı bir şekilde açıkla</li>
<li>Her konuyu alt başlıklarla destekle</li>
<li>Kavramların tanımlarını ve önemini vurgula</li>
<li>Konular arasındaki ilişkileri belirt</li>
<li>Metinde geçen TÜM kavramları mutlaka açıkla</li>
</ul>

<h2>🔑 Önemli Kavramlar ve Tanımlar</h2>
<ul>
<li>Kritik terimleri detaylı tanımlarla açıkla</li>
<li>Her kavramın iş dünyasındaki önemini belirt</li>
<li>Kavramların pratik uygulamalarını göster</li>
<li>Benzer kavramlarla karşılaştırmalar yap</li>
<li>Metinde geçen her kavramı mutlaka tanımla</li>
</ul>

<h2>💡 Ana Fikirler ve Bulgular</h2>
<ul>
<li>Metnin temel argümanlarını detaylı özetle</li>
<li>Önemli bulguları ve sonuçları vurgula</li>
<li>Kritik noktaları ve dikkat edilmesi gerekenleri belirt</li>
<li>Teorik ve pratik boyutları ayrı ayrı ele al</li>
</ul>

<h2>📋 Detaylı Kavram Açıklamaları</h2>

<h3><strong>1. İşletme</strong></h3>
<p><strong>Açıklama:</strong> Mal/hizmet üretmek ve satmak amacıyla kurulan ekonomik birim.</p>
<p><strong>Örnek:</strong> Bir restoran, bir giyim mağazası, bir yazılım şirketi.</p>
<p><strong>Önem:</strong> İstihdam yaratır, ekonomik büyümeye katkıda bulunur, ihtiyaçları karşılar.</p>

<h3><strong>2. Pazarlama</strong></h3>
<p><strong>Açıklama:</strong> Ürünü tanıtmak, pazarlamak ve satmak için yapılan faaliyetler.</p>
<p><strong>Örnek:</strong> Televizyon reklamları, sosyal medya kampanyaları, indirim promosyonları.</p>
<p><strong>Önem:</strong> Müşteri ihtiyaçlarını karşılar, satışları artırır, marka bilinirliği sağlar.</p>

<h3><strong>3. Yönetim</strong></h3>
<p><strong>Açıklama:</strong> Organizasyonun hedeflerine ulaşması için kaynakları planlama, organize etme, yönlendirme ve kontrol etme süreci.</p>
<p><strong>Örnek:</strong> Proje yönetimi, ekip liderliği, stratejik planlama.</p>
<p><strong>Önem:</strong> Verimliliği artırır, hedeflere ulaşmayı sağlar, organizasyonu koordine eder.</p>

<h3><strong>4. Finans</strong></h3>
<p><strong>Açıklama:</strong> Para ve sermaye yönetimi, yatırım kararları ve finansal planlama.</p>
<p><strong>Örnek:</strong> Bütçe hazırlama, yatırım analizi, nakit akışı yönetimi.</p>
<p><strong>Önem:</strong> Sürdürülebilir büyümeyi sağlar, riskleri yönetir, karlılığı artırır.</p>

<h3><strong>5. İnsan Kaynakları</strong></h3>
<p><strong>Açıklama:</strong> Çalışanların işe alınması, eğitimi, motivasyonu ve performans yönetimi.</p>
<p><strong>Örnek:</strong> İş ilanları, mülakat süreçleri, çalışan eğitimleri.</p>
<p><strong>Önem:</strong> Doğru insan kaynağını bulur, çalışan memnuniyetini artırır, organizasyon kültürünü geliştirir.</p>

<h2>🎯 Öğrenme Hedefleri</h2>
<ul>
<li>Bu konuyu öğrendikten sonra anlayabileceğin kavramlar</li>
<li>Pratik uygulamalar ve örnekler</li>
<li>İş hayatında nasıl kullanılacağı</li>
<li>Diğer konularla bağlantıları</li>
</ul>

<h2>💭 Düşünme Soruları</h2>
<ul>
<li>Bu kavramlar günlük hayatta nasıl karşımıza çıkıyor?</li>
<li>Bu bilgileri iş hayatında nasıl kullanabiliriz?</li>
<li>Bu konuların gelecekteki önemi nedir?</li>
<li>Hangi alanlarda daha fazla çalışma yapılabilir?</li>
</ul>

<strong>ÖNEMLİ:</strong> Metinde geçen tüm önemli kavramları yukarıdaki formatta açıkla. Her kavram için detaylı açıklama, pratik örnek ve önemini belirt. En az 5 kavram mutlaka olsun. Özeti kapsamlı ve anlaşılır yap.

<strong>FORMAT:</strong> Sadece HTML formatı kullan, markdown kullanma. ** yerine <strong>, ## yerine <h2>, - yerine <li> kullan. Her başlık kalın olsun.

<strong>KAPSAMLILIK:</strong> Metinde geçen her kavramı mutlaka açıkla. Hiçbir kavramı atlama. Her kavram için detaylı açıklama ver.`,

  friendly: (content: string) => `Aşağıdaki metni samimi ve anlaşılır bir dille, arkadaşça bir tonla detaylı özetle:

${content}

<strong>ARKADAŞÇA DETAYLI ÖZET:</strong>

<h2>🎯 Ne Anlatıyor?</h2>
<ul>
<li>Ana konuyu basit ve anlaşılır bir dille açıkla</li>
<li>Karmaşık kavramları günlük hayat örnekleriyle sadeleştir</li>
<li>Bu konunun neden önemli olduğunu belirt</li>
<li>Hangi durumlarda karşımıza çıktığını açıkla</li>
<li>Metinde geçen her kavramı basit dille açıkla</li>
</ul>

<h2>💭 Önemli Noktalar ve Detaylar</h2>
<ul>
<li>Dikkat çeken bilgileri ve ilginç detayları listele</li>
<li>Pratik faydaları ve günlük hayattaki kullanım alanlarını belirt</li>
<li>Bu bilgilerin bize nasıl fayda sağlayacağını açıkla</li>
<li>İlginç ve şaşırtıcı bilgileri vurgula</li>
<li>Metinde geçen tüm kavramları günlük hayat örnekleriyle açıkla</li>
</ul>

<h2>💡 Hatırlanması Gerekenler</h2>
<ul>
<li>Anahtar mesajlar ve önemli ipuçları</li>
<li>Faydalı bilgiler ve pratik tavsiyeler</li>
<li>Günlük hayatta kullanabileceğin bilgiler</li>
<li>Akılda kalıcı örnekler ve benzetmeler</li>
</ul>

<h2>📋 Detaylı Kavram Açıklamaları</h2>

<h3><strong>1. İşletme</strong></h3>
<p><strong>Açıklama:</strong> Mal/hizmet üretmek ve satmak amacıyla kurulan ekonomik birim.</p>
<p><strong>Örnek:</strong> Bir restoran, bir giyim mağazası, bir yazılım şirketi.</p>
<p><strong>Neden Önemli:</strong> İstihdam yaratır, ekonomik büyümeye katkıda bulunur, ihtiyaçları karşılar.</p>

<h3><strong>2. Pazarlama</strong></h3>
<p><strong>Açıklama:</strong> Ürünü tanıtmak, pazarlamak ve satmak için yapılan faaliyetler.</p>
<p><strong>Örnek:</strong> Televizyon reklamları, sosyal medya kampanyaları, indirim promosyonları.</p>
<p><strong>Neden Önemli:</strong> Müşteri ihtiyaçlarını karşılar, satışları artırır, marka bilinirliği sağlar.</p>

<h3><strong>3. Yönetim</strong></h3>
<p><strong>Açıklama:</strong> Organizasyonun hedeflerine ulaşması için kaynakları planlama, organize etme, yönlendirme ve kontrol etme süreci.</p>
<p><strong>Örnek:</strong> Proje yönetimi, ekip liderliği, stratejik planlama.</p>
<p><strong>Neden Önemli:</strong> Verimliliği artırır, hedeflere ulaşmayı sağlar, organizasyonu koordine eder.</p>

<h3><strong>4. Finans</strong></h3>
<p><strong>Açıklama:</strong> Para ve sermaye yönetimi, yatırım kararları ve finansal planlama.</p>
<p><strong>Örnek:</strong> Bütçe hazırlama, yatırım analizi, nakit akışı yönetimi.</p>
<p><strong>Neden Önemli:</strong> Sürdürülebilir büyümeyi sağlar, riskleri yönetir, karlılığı artırır.</p>

<h3><strong>5. İnsan Kaynakları</strong></h3>
<p><strong>Açıklama:</strong> Çalışanların işe alınması, eğitimi, motivasyonu ve performans yönetimi.</p>
<p><strong>Örnek:</strong> İş ilanları, mülakat süreçleri, çalışan eğitimleri.</p>
<p><strong>Neden Önemli:</strong> Doğru insan kaynağını bulur, çalışan memnuniyetini artırır, organizasyon kültürünü geliştirir.</p>

<h2>🎉 Sonuç ve Değerlendirme</h2>
<ul>
<li>Genel değerlendirme ve önemli çıkarımlar</li>
<li>Kişisel yorum ve düşünceler (varsa)</li>
<li>Gelecekteki öneriler ve tavsiyeler</li>
<li>Bu bilgileri nasıl kullanabileceğin</li>
</ul>

<h2>🤔 Düşünme Soruları</h2>
<ul>
<li>Bu bilgileri günlük hayatında nasıl kullanabilirsin?</li>
<li>Bu konular senin için neden önemli?</li>
<li>Bu bilgileri başkalarına nasıl açıklarsın?</li>
<li>Bu konularla ilgili daha fazla ne öğrenmek istersin?</li>
</ul>

<strong>ÖNEMLİ:</strong> Metinde geçen tüm önemli kavramları yukarıdaki formatta açıkla. Her kavram için basit açıklama, günlük hayat örneği ve önemini belirt. En az 5 kavram mutlaka olsun. Özeti samimi, sıcak ve anlaşılır yap.

<strong>FORMAT:</strong> Sadece HTML formatı kullan, markdown kullanma. ** yerine <strong>, ## yerine <h2>, - yerine <li> kullan. Her başlık kalın olsun.

<strong>KAPSAMLILIK:</strong> Metinde geçen her kavramı mutlaka açıkla. Hiçbir kavramı atlama. Her kavram için basit ve anlaşılır açıklama ver.

<em>Not: Samimi ve sıcak bir dil kullan, teknik terimleri açıkla, örneklerle destekle, günlük hayat bağlantıları kur.</em>`,

  exam: (content: string) => `Aşağıdaki metni sınav odaklı, öğrenme hedeflerine yönelik detaylı bir formatta özetle:

${content}

<strong>SINAV ODAKLI DETAYLI ÖZET:</strong>

<h2>📝 Sınav Konuları ve Öncelikler</h2>
<h3>Yüksek Öncelikli (Mutlaka Bilinmeli):</h3>
<ul>
<li>[Konu 1] - Muhtemelen sınavda çıkacak, detaylı açıklama</li>
<li>[Konu 2] - Sık sorulan konular, önemli noktalar</li>
<li>[Konu 3] - Temel kavramlar, tanımlar</li>
</ul>

<h3>Orta Öncelikli (Bilinmesi Gereken):</h3>
<ul>
<li>[Konu 4] - Bilinmesi gereken, detaylar</li>
<li>[Konu 5] - Temel kavramlar, uygulamalar</li>
<li>[Konu 6] - Önemli noktalar, örnekler</li>
</ul>

<h3>Düşük Öncelikli (Genel Kültür):</h3>
<ul>
<li>[Konu 7] - Genel bilgi, ek detaylar</li>
<li>[Konu 8] - İlave bilgiler, merak edilenler</li>
</ul>

<h2>🎯 Sınav Soruları İçin Kritik Noktalar</h2>
<ul>
<li>Önemli detayları ve sık sorulan noktaları listele</li>
<li>Sık sorulan soru tiplerini ve formatlarını belirt</li>
<li>Dikkat edilmesi gereken tuzakları ve yaygın hataları vurgula</li>
<li>Zaman yönetimi için önemli ipuçları</li>
</ul>

<h2>🔍 Sık Sorulan Sorular ve Çözümler</h2>
<ol>
<li><strong>Soru Tipi 1:</strong> [Örnek soru]
   <ul>
   <li>Cevap: [Detaylı açıklama]</li>
   <li>Çözüm Yöntemi: [Nasıl çözülür]</li>
   <li>Dikkat Edilecekler: [Tuzaklar]</li>
   </ul>
</li>
<li><strong>Soru Tipi 2:</strong> [Örnek soru]
   <ul>
   <li>Cevap: [Detaylı açıklama]</li>
   <li>Çözüm Yöntemi: [Nasıl çözülür]</li>
   <li>Dikkat Edilecekler: [Tuzaklar]</li>
   </ul>
</li>
<li><strong>Soru Tipi 3:</strong> [Örnek soru]
   <ul>
   <li>Cevap: [Detaylı açıklama]</li>
   <li>Çözüm Yöntemi: [Nasıl çözülür]</li>
   <li>Dikkat Edilecekler: [Tuzaklar]</li>
   </ul>
</li>
</ol>

<h2>📚 Çalışma Stratejileri ve Yöntemler</h2>
<h3>Ezberlenmesi Gerekenler:</h3>
<ul>
<li>[Madde 1] - Neden ezberlenmeli, nasıl hatırlanır</li>
<li>[Madde 2] - Neden ezberlenmeli, nasıl hatırlanır</li>
<li>[Madde 3] - Neden ezberlenmeli, nasıl hatırlanır</li>
</ul>

<h3>Anlaşılması Gerekenler:</h3>
<ul>
<li>[Madde 1] - Nasıl anlaşılır, pratik örnekler</li>
<li>[Madde 2] - Nasıl anlaşılır, pratik örnekler</li>
<li>[Madde 3] - Nasıl anlaşılır, pratik örnekler</li>
</ul>

<h3>Uygulama Yapılması Gerekenler:</h3>
<ul>
<li>[Madde 1] - Nasıl uygulanır, örnekler</li>
<li>[Madde 2] - Nasıl uygulanır, örnekler</li>
<li>[Madde 3] - Nasıl uygulanır, örnekler</li>
</ul>

<h2>⚡ Hızlı Hatırlatma ve Formüller</h2>
<ul>
<li>Anahtar terimler ve kısaltmalar</li>
<li>Formüller (varsa) ve nasıl kullanılır</li>
<li>Önemli tarihler, rakamlar ve istatistikler</li>
<li>Hızlı hatırlama teknikleri</li>
</ul>

<h2>📋 Detaylı Kavram Açıklamaları</h2>

<h3><strong>1. İşletme</strong></h3>
<p><strong>Sınav Odaklı Açıklama:</strong> Mal/hizmet üretmek ve satmak amacıyla kurulan ekonomik birim.</p>
<p><strong>Sınav Sorusu Örneği:</strong> "Aşağıdakilerden hangisi bir işletme değildir?"</p>
<p><strong>Çözüm Yöntemi:</strong> İşletme tanımını hatırla: üretim/satış amacı + ekonomik birim.</p>

<h3><strong>2. Pazarlama</strong></h3>
<p><strong>Sınav Odaklı Açıklama:</strong> Ürünü tanıtmak, pazarlamak ve satmak için yapılan faaliyetler.</p>
<p><strong>Sınav Sorusu Örneği:</strong> "Pazarlama sürecinin aşamaları nelerdir?"</p>
<p><strong>Çözüm Yöntemi:</strong> Pazarlama karması (4P): Ürün, Fiyat, Yer, Tanıtım.</p>

<h3><strong>3. Yönetim</strong></h3>
<p><strong>Sınav Odaklı Açıklama:</strong> Organizasyonun hedeflerine ulaşması için kaynakları planlama, organize etme, yönlendirme ve kontrol etme süreci.</p>
<p><strong>Sınav Sorusu Örneği:</strong> "Yönetim fonksiyonları nelerdir?"</p>
<p><strong>Çözüm Yöntemi:</strong> POCCC: Planlama, Organizasyon, Yönlendirme, Koordinasyon, Kontrol.</p>

<h3><strong>4. Finans</strong></h3>
<p><strong>Sınav Odaklı Açıklama:</strong> Para ve sermaye yönetimi, yatırım kararları ve finansal planlama.</p>
<p><strong>Sınav Sorusu Örneği:</strong> "Finansal yönetimin temel amaçları nelerdir?"</p>
<p><strong>Çözüm Yöntemi:</strong> Karlılık, Likidite, Büyüme hedeflerini hatırla.</p>

<h3><strong>5. İnsan Kaynakları</strong></h3>
<p><strong>Sınav Odaklı Açıklama:</strong> Çalışanların işe alınması, eğitimi, motivasyonu ve performans yönetimi.</p>
<p><strong>Sınav Sorusu Örneği:</strong> "İnsan kaynakları süreçleri nelerdir?"</p>
<p><strong>Çözüm Yöntemi:</strong> İşe alma, eğitim, performans değerlendirme, ücretlendirme süreçlerini hatırla.</p>

<h2>🎯 Sınav İpuçları ve Stratejiler</h2>
<ul>
<li>Dikkat edilmesi gereken tuzaklar ve yaygın hatalar</li>
<li>Sık yapılan hatalar ve nasıl önlenir</li>
<li>Zaman yönetimi önerileri ve stratejiler</li>
<li>Sınav öncesi son kontroller</li>
</ul>

<h2>📊 Önem Derecesi</h2>
<ul>
<li>⭐⭐⭐ Çok Önemli: [Konular]</li>
<li>⭐⭐ Orta Önemli: [Konular]</li>
<li>⭐ Az Önemli: [Konular]</li>
</ul>

<strong>ÖNEMLİ:</strong> Metinde geçen tüm önemli kavramları yukarıdaki formatta açıkla. Her kavram için sınav odaklı açıklama, sınav sorusu örneği ve çözüm yöntemi belirt. En az 5 kavram mutlaka olsun. Özeti sınav formatına uygun, pratik ve hatırlanabilir yap.

<strong>FORMAT:</strong> Sadece HTML formatı kullan, markdown kullanma. ** yerine <strong>, ## yerine <h2>, - yerine <li> kullan. Her başlık kalın olsun.

<strong>KAPSAMLILIK:</strong> Metinde geçen her kavramı mutlaka açıkla. Hiçbir kavramı atlama. Her kavram için sınav odaklı detaylı açıklama ver.

<em>Not: Sınav formatına uygun, pratik ve hatırlanabilir bilgiler öncelikli. Her kavram için mutlaka sınav sorusu örneği ver.</em>`,
}; 