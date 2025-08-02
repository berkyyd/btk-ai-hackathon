# YBS Buddy Erişilebilirlik Rehberi

## Genel Prensipler

Bu rehber, YBS Buddy uygulamasının tüm kullanıcılar için erişilebilir olmasını sağlamak amacıyla hazırlanmıştır. WCAG 2.1 AA standartlarına uygun olarak geliştirilmiştir.

## Temel Gereksinimler

### 1. Klavye Erişimi
- Tüm etkileşimli öğeler klavye ile erişilebilir olmalı
- Tab sırası mantıklı olmalı
- Focus göstergeleri görünür olmalı
- Escape tuşu modal'ları kapatmalı

### 2. Ekran Okuyucu Desteği
- Tüm görsel öğeler için alternatif metin sağlanmalı
- ARIA etiketleri doğru kullanılmalı
- Başlık hiyerarşisi mantıklı olmalı
- Form alanları etiketlenmiş olmalı

### 3. Renk Kontrastı
- Metin kontrast oranı en az 4.5:1 olmalı
- Büyük metin için en az 3:1 olmalı
- Renk tek başına bilgi aktarmamalı

### 4. Metin Boyutu
- Metin boyutu en az 16px olmalı
- Zoom desteği sağlanmalı
- Satır yüksekliği en az 1.5 olmalı

## Bileşen Standartları

### Butonlar
```tsx
// ✅ Doğru kullanım
<button
  aria-label="Notu sil"
  aria-describedby="delete-help"
  onClick={handleDelete}
>
  <TrashIcon aria-hidden="true" />
  Sil
</button>
<p id="delete-help">Bu işlem geri alınamaz</p>

// ❌ Yanlış kullanım
<div onClick={handleDelete} className="button">
  Sil
</div>
```

### Form Alanları
```tsx
// ✅ Doğru kullanım
<label htmlFor="email">Email Adresi</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-describedby="email-error"
/>
<div id="email-error" role="alert" aria-live="polite">
  Geçerli bir email adresi giriniz
</div>

// ❌ Yanlış kullanım
<input type="email" placeholder="Email" />
```

### Modal'lar
```tsx
// ✅ Doğru kullanım
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Modal Başlığı</h2>
  <button aria-label="Modal'ı kapat">×</button>
  <div>Modal içeriği</div>
</div>

// ❌ Yanlış kullanım
<div className="modal">
  <h2>Modal Başlığı</h2>
  <div>Modal içeriği</div>
</div>
```

### Navigasyon
```tsx
// ✅ Doğru kullanım
<nav aria-label="Ana navigasyon">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" href="/dashboard">Dashboard</a>
    </li>
  </ul>
</nav>

// ❌ Yanlış kullanım
<div className="nav">
  <a href="/dashboard">Dashboard</a>
</div>
```

## ARIA Etiketleri

### Temel ARIA Etiketleri
- `aria-label`: Öğe için açıklayıcı metin
- `aria-describedby`: Ek açıklama için referans
- `aria-hidden`: Ekran okuyucudan gizle
- `aria-live`: Dinamik içerik güncellemeleri
- `aria-expanded`: Genişletilmiş/daraltılmış durum
- `aria-pressed`: Basılmış durum (toggle butonlar)
- `aria-invalid`: Geçersiz form alanı
- `aria-required`: Zorunlu alan

### Durum ARIA Etiketleri
- `aria-busy`: Yükleme durumu
- `aria-current`: Mevcut öğe
- `aria-selected`: Seçili öğe
- `aria-checked`: İşaretli durum
- `aria-disabled`: Devre dışı durum

## Klavye Navigasyonu

### Tab Sırası
1. Header navigasyonu
2. Ana içerik alanı
3. Sidebar (varsa)
4. Footer

### Kısayol Tuşları
- `Ctrl + /`: Arama
- `Ctrl + N`: Yeni not
- `Ctrl + S`: Kaydet
- `Escape`: Modal kapat
- `Enter`: Seç/Onayla
- `Space`: Toggle

### Focus Yönetimi
```tsx
// Focus'u yakala ve yönet
useEffect(() => {
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      // Focus'u modal içinde tut
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };
  
  document.addEventListener('keydown', handleTabKey);
  return () => document.removeEventListener('keydown', handleTabKey);
}, []);
```

## Renk Kontrastı

### Kontrast Hesaplama
```css
/* ✅ Yeterli kontrast */
.text-primary {
  color: #1f2937; /* Koyu gri */
  background-color: #ffffff; /* Beyaz */
  /* Kontrast: 15.3:1 */
}

/* ❌ Yetersiz kontrast */
.text-light {
  color: #9ca3af; /* Açık gri */
  background-color: #ffffff; /* Beyaz */
  /* Kontrast: 2.4:1 */
}
```

### Renk Körlüğü Desteği
```tsx
// ✅ Renk + simge kullanımı
<div className="status">
  <span className="text-green-600">✓</span>
  <span>Başarılı</span>
</div>

// ❌ Sadece renk kullanımı
<div className="status text-green-600">Başarılı</div>
```

## Test Etme

### Manuel Testler
1. **Klavye Navigasyonu**
   - Tab ile tüm öğelere erişim
   - Shift+Tab ile geri navigasyon
   - Enter/Space ile etkileşim

2. **Ekran Okuyucu Testi**
   - NVDA (Windows)
   - VoiceOver (macOS)
   - JAWS (Windows)

3. **Zoom Testi**
   - %200 zoom'da kullanılabilirlik
   - %400 zoom'da kullanılabilirlik

4. **Renk Kontrast Testi**
   - WebAIM Contrast Checker
   - Chrome DevTools

### Otomatik Testler
```tsx
// Jest test örneği
test('button has proper accessibility attributes', () => {
  render(<AccessibleButton>Test Button</AccessibleButton>);
  
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveAttribute('aria-disabled');
});
```

## Performans

### Lazy Loading
```tsx
// Erişilebilir lazy loading
const LazyComponent = lazy(() => import('./Component'));

function App() {
  return (
    <Suspense fallback={
      <div role="status" aria-live="polite">
        Yükleniyor...
      </div>
    }>
      <LazyComponent />
    </Suspense>
  );
}
```

### Error Boundaries
```tsx
// Erişilebilir error boundary
class ErrorBoundary extends React.Component {
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" aria-live="assertive">
          <h2>Bir hata oluştu</h2>
          <button onClick={this.handleRetry}>
            Tekrar dene
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## Kaynaklar

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)

## İletişim

Erişilebilirlik sorunları için:
- GitHub Issues
- Email: accessibility@ybs-buddy.com
- Discord: #accessibility kanalı 