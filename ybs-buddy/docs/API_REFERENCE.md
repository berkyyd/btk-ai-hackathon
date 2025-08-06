# API Reference

Bu dokümantasyon YBS Buddy projesinin tüm API endpoint'lerini açıklar.

## 🔐 Authentication Endpoints

### POST /api/auth/login
Kullanıcı girişi yapar.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "user123",
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "student"
    },
    "token": "jwt_token_here"
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

### POST /api/auth/register
Yeni kullanıcı kaydı oluşturur.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "displayName": "New User",
  "invitationCode": "ACADEMIC123" // Opsiyonel
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "newuser123",
      "email": "newuser@example.com",
      "displayName": "New User",
      "role": "student"
    }
  }
}
```

## 📝 Notes Endpoints

### GET /api/notes
Tüm notları getirir.

**Query Parameters:**
- `courseId` (string): Kurs ID'si ile filtreleme
- `class` (number): Sınıf ile filtreleme
- `semester` (string): Dönem ile filtreleme
- `search` (string): Arama terimi

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "note123",
        "title": "Matematik Notları",
        "content": "Kalkülüs konuları...",
        "courseId": "math101",
        "class": 1,
        "semester": "Güz",
        "userId": "user123",
        "createdAt": "2024-01-15T10:30:00Z",
        "tags": ["kalkülüs", "matematik"],
        "isPublic": true
      }
    ]
  }
}
```

### POST /api/notes
Yeni not oluşturur.

**Request Body:**
```json
{
  "title": "Yeni Not",
  "content": "Not içeriği...",
  "courseId": "math101",
  "class": 1,
  "semester": "Güz",
  "tags": ["matematik"],
  "isPublic": true
}
```

### PUT /api/notes/:id
Notu günceller.

**Request Body:**
```json
{
  "title": "Güncellenmiş Not",
  "content": "Güncellenmiş içerik...",
  "tags": ["matematik", "kalkülüs"]
}
```

### DELETE /api/notes/:id
Notu siler.

## 🎯 Quiz Endpoints

### POST /api/quiz/generate
Quiz oluşturur.

**Request Body:**
```json
{
  "courseId": "math101",
  "topic": "Kalkülüs",
  "questionCount": 10,
  "difficulty": "medium"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "quiz": {
      "id": "quiz123",
      "questions": [
        {
          "id": "q1",
          "question": "Türev nedir?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "explanation": "Türev, fonksiyonun değişim oranıdır."
        }
      ],
      "totalPoints": 10,
      "timeLimit": 600
    }
  }
}
```

### POST /api/quiz/submit
Quiz cevaplarını gönderir.

**Request Body:**
```json
{
  "quizId": "quiz123",
  "answers": [
    {
      "questionId": "q1",
      "userAnswer": "A",
      "timeSpent": 30
    }
  ]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "score": 8,
    "totalPoints": 10,
    "timeSpent": 300,
    "correctAnswers": 8,
    "wrongAnswers": 2
  }
}
```

## 🤖 Chatbot Endpoints

### POST /api/chatbot
Chatbot ile konuşur.

**Request Body:**
```json
{
  "message": "Merhaba, matematik konusunda yardım alabilir miyim?",
  "context": {
    "userId": "user123",
    "courseId": "math101",
    "previousMessages": []
  }
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "message": "Merhaba! Matematik konusunda size nasıl yardımcı olabilirim?",
    "suggestions": [
      "Kalkülüs konuları",
      "Türev hesaplama",
      "İntegral çözümleri"
    ]
  }
}
```

## 📚 Courses Endpoints

### GET /api/courses
Tüm kursları getirir.

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "math101",
        "name": "Matematik I",
        "code": "MATH101",
        "credits": 3,
        "class": 1,
        "semester": "Güz",
        "description": "Kalkülüs temelleri"
      }
    ]
  }
}
```

## 📊 Analytics Endpoints

### GET /api/analytics/quiz-analysis
Quiz analizlerini getirir.

**Query Parameters:**
- `userId` (string): Kullanıcı ID'si
- `timeRange` (string): Zaman aralığı (week, month, year)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "totalQuizzes": 15,
    "averageScore": 75.5,
    "bestSubject": "Matematik",
    "weakestSubject": "Fizik",
    "improvementRate": 12.5,
    "studyTime": 1200
  }
}
```

## 📁 Upload Endpoints

### POST /api/upload
Dosya yükler.

**Request Body (FormData):**
```
file: [PDF dosyası]
courseId: "math101"
title: "Ders Notları"
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "fileUrl": "https://storage.googleapis.com/...",
    "extractedText": "PDF'den çıkarılan metin...",
    "noteId": "note123"
  }
}
```

## 📝 Summarize Endpoints

### POST /api/notes/summarize
Not özeti oluşturur.

**Request Body:**
```json
{
  "content": "Uzun not içeriği...",
  "promptType": "academic",
  "maxLength": 500
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "summary": "Özetlenmiş içerik...",
    "keyPoints": ["Anahtar nokta 1", "Anahtar nokta 2"],
    "wordCount": 150
  }
}
```

## 🔧 Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "additional error details"
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Kimlik doğrulama gerekli
- `INVALID_INPUT`: Geçersiz girdi
- `NOT_FOUND`: Kaynak bulunamadı
- `PERMISSION_DENIED`: Yetki yok
- `RATE_LIMIT_EXCEEDED`: Rate limit aşıldı
- `INTERNAL_ERROR`: Sunucu hatası

## 🔒 Authentication

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Token Format
JWT token'lar 24 saat geçerlidir ve şu bilgileri içerir:
- `userId`: Kullanıcı ID'si
- `email`: Kullanıcı email'i
- `role`: Kullanıcı rolü (student/academician)
- `iat`: Token oluşturma zamanı
- `exp`: Token son kullanma zamanı

## 📈 Rate Limiting

- **Authentication endpoints**: 5 requests/minute
- **Quiz endpoints**: 10 requests/minute
- **Chatbot endpoints**: 20 requests/minute
- **Other endpoints**: 100 requests/minute

## 🌐 Base URL

**Development:**
```
http://localhost:3000/api
```

**Production:**
```
https://your-domain.com/api
``` 