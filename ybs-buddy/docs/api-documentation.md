# YBS Buddy API Dokümantasyonu

## Genel Bilgiler

- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`
- **Authentication**: Firebase Auth (Bearer Token)

## Endpoints

### 1. Kullanıcı Kimlik Doğrulama

#### POST /api/auth/login
Kullanıcı girişi yapar.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "student"
    },
    "token": "firebase-jwt-token"
  }
}
```

#### POST /api/auth/register
Yeni kullanıcı kaydı yapar.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "displayName": "New User",
  "invitationCode": "INVITE123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user456",
      "email": "newuser@example.com",
      "displayName": "New User",
      "role": "student"
    }
  }
}
```

### 2. Dersler

#### GET /api/courses
Dersleri listeler.

**Query Parameters:**
- `classYear` (optional): Sınıf yılı (1, 2, 3, 4)
- `semester` (optional): Dönem (Güz, Bahar, Yaz)
- `courseType` (optional): Ders türü (zorunlu, seçmeli)

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "course123",
        "code": "YBS101",
        "name": "Yönetim Bilişim Sistemlerine Giriş",
        "type": "zorunlu",
        "ects": 3,
        "class": 1,
        "semester": "Güz"
      }
    ]
  }
}
```

### 3. Notlar

#### GET /api/notes
Notları listeler.

**Query Parameters:**
- `classYear` (optional): Sınıf yılı
- `semester` (optional): Dönem
- `courseId` (optional): Ders ID
- `search` (optional): Arama terimi

**Response:**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "note123",
        "title": "Ders Notu 1",
        "content": "Not içeriği...",
        "courseId": "course123",
        "class": 1,
        "semester": "Güz",
        "role": "student",
        "userId": "user123",
        "isPublic": true,
        "createdAt": "2024-01-01T00:00:00Z",
        "tags": ["önemli", "sınav"]
      }
    ]
  }
}
```

#### POST /api/notes
Yeni not oluşturur.

**Request Body:**
```json
{
  "title": "Yeni Not",
  "content": "Not içeriği...",
  "courseId": "course123",
  "class": 1,
  "semester": "Güz",
  "isPublic": true,
  "tags": ["önemli"]
}
```

#### PUT /api/notes?id={noteId}
Notu günceller.

**Request Body:**
```json
{
  "title": "Güncellenmiş Not",
  "content": "Güncellenmiş içerik...",
  "tags": ["güncellenmiş"],
  "isPublic": false
}
```

#### DELETE /api/notes?id={noteId}
Notu siler.

### 4. Sınavlar

#### POST /api/quiz/generate
Sınav oluşturur.

**Request Body:**
```json
{
  "courseId": "course123",
  "questionCount": 10,
  "questionTypes": ["multiple_choice", "true_false"],
  "selectedNotes": ["note123", "note456"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quiz": {
      "id": "quiz123",
      "title": "YBS101 Sınavı",
      "questions": [
        {
          "id": "q1",
          "question": "Soru metni?",
          "type": "multiple_choice",
          "options": ["A) Seçenek 1", "B) Seçenek 2", "C) Seçenek 3", "D) Seçenek 4"],
          "correctAnswer": "A) Seçenek 1"
        }
      ]
    }
  }
}
```

#### POST /api/quiz/submit
Sınav sonucunu gönderir.

**Request Body:**
```json
{
  "quizId": "quiz123",
  "answers": [
    {
      "questionId": "q1",
      "answer": "A) Seçenek 1"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result": {
      "id": "result123",
      "score": 8,
      "totalQuestions": 10,
      "correctAnswers": 8,
      "completedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### 5. Chatbot

#### POST /api/chatbot
Chatbot ile konuşur.

**Request Body:**
```json
{
  "question": "Merhaba, nasılsın?",
  "userId": "user123",
  "context": "general",
  "previousMessages": [
    {
      "id": "msg1",
      "content": "Önceki mesaj",
      "role": "user",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Merhaba! İyiyim, teşekkür ederim. Size nasıl yardımcı olabilirim?",
    "sources": ["müfredat", "notlar"],
    "confidence": 0.95
  }
}
```

### 6. Dosya Yükleme

#### POST /api/upload
PDF dosyası yükler ve işler.

**Request Body:**
```json
{
  "file": "base64-encoded-file",
  "extractedText": "PDF'den çıkarılan metin",
  "fileName": "ders-notu.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileUrl": "https://storage.googleapis.com/...",
    "processedContent": "İşlenmiş içerik...",
    "fileId": "file123"
  }
}
```

### 7. Analitik

#### GET /api/analytics/quiz-analysis
Sınav analizini getirir.

**Query Parameters:**
- `userId`: Kullanıcı ID

**Response:**
```json
{
  "success": true,
  "data": {
    "totalQuizzes": 5,
    "averageScore": 75.5,
    "weakAreas": ["YBS101", "YBS102"],
    "strongAreas": ["YBS103"],
    "progress": {
      "lastMonth": 80,
      "currentMonth": 85
    }
  }
}
```

## Hata Kodları

| Kod | Açıklama |
|-----|----------|
| 400 | Bad Request - Geçersiz istek |
| 401 | Unauthorized - Kimlik doğrulama gerekli |
| 403 | Forbidden - Yetki yok |
| 404 | Not Found - Kaynak bulunamadı |
| 500 | Internal Server Error - Sunucu hatası |

## Örnek Kullanım

```javascript
// Dersleri getir
const response = await fetch('/api/courses?classYear=1&semester=Güz');
const data = await response.json();

// Not oluştur
const noteResponse = await fetch('/api/notes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Yeni Not',
    content: 'Not içeriği...',
    courseId: 'course123'
  })
});
```

## Rate Limiting

- **Genel**: 100 istek/dakika
- **Dosya yükleme**: 10 istek/dakika
- **Chatbot**: 50 istek/dakika

## Güvenlik

- Tüm API endpoint'leri Firebase Auth ile korunur
- CORS ayarları yapılandırılmıştır
- Input validation tüm endpoint'lerde mevcuttur
- Rate limiting uygulanmıştır 