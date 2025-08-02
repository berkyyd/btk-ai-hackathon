// Route paths
export const ROUTES = {
  HOME: '/',
  MUFEDAT: '/mufredat',
  DERS_NOTLARI: '/ders-notlari',
  NOT_ALANI: '/not-alani',
  SINAV_SIMULASYONU: '/sinav-simulasyonu',
  KISISEL_TAKIP: '/kisisel-takip',
  PROFILIM: '/profile'
} as const

// Class options for filtering
export const CLASS_OPTIONS = [
  { value: 'Tümü', label: 'Tümü' },
  { value: '1', label: '1. Sınıf' },
  { value: '2', label: '2. Sınıf' },
  { value: '3', label: '3. Sınıf' },
  { value: '4', label: '4. Sınıf' }
] as const

// Semester options for filtering
export const SEMESTER_OPTIONS = [
  { value: 'Tümü', label: 'Tümü' },
  { value: 'Güz', label: 'Güz' },
  { value: 'Bahar', label: 'Bahar' }
] as const

// Course type options for filtering
export const COURSE_TYPE_OPTIONS = [
  { value: 'Tümü', label: 'Tümü' },
  { value: 'Zorunlu', label: 'Zorunlu' },
  { value: 'Seçmeli', label: 'Seçmeli' }
] as const

// Exam type options
export const EXAM_TYPE_OPTIONS = [
  { value: 'Vize', label: 'Vize' },
  { value: 'Final', label: 'Final' },
  { value: 'Quiz', label: 'Quiz' }
] as const

// Exam format options
export const EXAM_FORMAT_OPTIONS = [
  { value: 'Test', label: 'Test' },
  { value: 'Boşluk Doldurma', label: 'Boşluk Doldurma' },
  { value: 'Doğru/Yanlış', label: 'Doğru/Yanlış' },
  { value: 'Klasik', label: 'Klasik' },
  { value: 'Karışık', label: 'Karışık' }
] as const

// Note types
export const NOTE_TYPES = {
  ACADEMICIAN: 'academician',
  STUDENT: 'student',
  SUMMARY: 'summary'
} as const

// Note type labels
export const NOTE_TYPE_LABELS = {
  [NOTE_TYPES.ACADEMICIAN]: '🎓 Akademisyen Notu',
  [NOTE_TYPES.STUDENT]: '👨‍🎓 Öğrenci Notu',
  [NOTE_TYPES.SUMMARY]: '📝 ÖZET'
} as const

// Note type colors
export const NOTE_TYPE_COLORS = {
  [NOTE_TYPES.ACADEMICIAN]: 'text-blue-600',
  [NOTE_TYPES.STUDENT]: 'text-green-600',
  [NOTE_TYPE_LABELS[NOTE_TYPES.SUMMARY]]: 'text-purple-600'
} as const

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout'
  },
  COURSES: {
    LIST: '/api/courses',
    DETAIL: '/api/courses/:id'
  },
  NOTES: {
    LIST: '/api/notes',
    DETAIL: '/api/notes/:id',
    PERSONAL: '/api/notes/personal',
    SUMMARIZE: '/api/notes/summarize'
  },
  QUIZ: {
    GENERATE: '/api/quiz/generate',
    EVALUATE: '/api/quiz/evaluate',
    REINFORCEMENT: '/api/quiz/reinforcement',
    SUBMIT: '/api/quiz/submit'
  },
  ANALYTICS: {
    WEAKNESS: '/api/analytics/weakness',
    QUIZ_ANALYSIS: '/api/analytics/quiz-analysis'
  },
  UPLOAD: {
    FILE: '/api/upload'
  },
  CHATBOT: {
    CHAT: '/api/chatbot'
  },
  PROFILE: {
    SUMMARIZED_NOTES: '/api/profile/summarized-notes'
  }
} as const

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.',
  SERVER_ERROR: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
  VALIDATION_ERROR: 'Geçersiz veri. Lütfen bilgilerinizi kontrol edin.',
  UNAUTHORIZED: 'Yetkisiz erişim. Lütfen giriş yapın.',
  NOT_FOUND: 'Aradığınız içerik bulunamadı.',
  UNKNOWN_ERROR: 'Beklenmeyen bir hata oluştu.',
  FIREBASE_ERROR: 'Veritabanı hatası. Lütfen daha sonra tekrar deneyin.',
  GEMINI_ERROR: 'AI servisi hatası. Lütfen daha sonra tekrar deneyin.'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'Başarıyla kaydedildi.',
  DELETE_SUCCESS: 'Başarıyla silindi.',
  UPDATE_SUCCESS: 'Başarıyla güncellendi.',
  LOGIN_SUCCESS: 'Başarıyla giriş yapıldı.',
  LOGOUT_SUCCESS: 'Başarıyla çıkış yapıldı.',
  NOTE_ADDED: 'Not başarıyla eklendi.',
  NOTE_UPDATED: 'Not başarıyla güncellendi.',
  SUMMARY_SAVED: 'Özet notu kaydedildi!',
  QUIZ_SUBMITTED: 'Sınav başarıyla tamamlandı.'
} as const

// Loading messages
export const LOADING_MESSAGES = {
  LOADING_NOTES: 'Notlar yükleniyor...',
  LOADING_COURSES: 'Dersler yükleniyor...',
  LOADING_QUIZ: 'Sınav hazırlanıyor...',
  SUBMITTING_QUIZ: 'Sınav gönderiliyor...',
  GENERATING_SUMMARY: 'Özet oluşturuluyor...',
  SAVING_NOTE: 'Not kaydediliyor...',
  UPLOADING_FILE: 'Dosya yükleniyor...'
} as const

// Validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'Bu alan zorunludur.',
  INVALID_EMAIL: 'Geçerli bir e-posta adresi giriniz.',
  PASSWORD_TOO_SHORT: 'Şifre en az 6 karakter olmalıdır.',
  PASSWORDS_DONT_MATCH: 'Şifreler eşleşmiyor.',
  INVALID_INVITATION_CODE: 'Geçersiz davet kodu.',
  FILE_TOO_LARGE: 'Dosya boyutu çok büyük.',
  INVALID_FILE_TYPE: 'Geçersiz dosya türü.',
  MIN_TITLE_LENGTH: 'Başlık en az 3 karakter olmalıdır.',
  MIN_CONTENT_LENGTH: 'İçerik en az 10 karakter olmalıdır.'
} as const

// File upload constants
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf'],
  MAX_FILE_NAME_LENGTH: 100
} as const

// Quiz constants
export const QUIZ = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 50,
  DEFAULT_TIME_LIMIT: 30 * 60, // 30 minutes in seconds
  PASSING_SCORE: 60
} as const

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  DEFAULT_PAGE: 1
} as const

// UI constants
export const UI = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  ANIMATION_DURATION: 300,
  MOBILE_BREAKPOINT: 768
} as const

// Development constants
export const DEV = {
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
} as const

// File size limits for upload
export const FILE_SIZE_LIMITS = {
  PDF: 10 * 1024 * 1024, // 10MB
  IMAGE: 5 * 1024 * 1024, // 5MB
  TEXT: 1 * 1024 * 1024,  // 1MB
  PDF_MAX_SIZE: 10 * 1024 * 1024 // 10MB
} as const

// Progress percentages for upload
export const PROGRESS_PERCENTAGES = {
  START: 0,
  UPLOADING: 25,
  PROCESSING: 50,
  ANALYZING: 75,
  COMPLETE: 100,
  UPLOAD_START: 0,
  UPLOAD_MIDDLE: 50,
  UPLOAD_COMPLETE: 100
} as const

// Quiz defaults
export const QUIZ_DEFAULTS = {
  TIME_LIMIT: 30 * 60, // 30 minutes
  QUESTIONS_COUNT: 10,
  PASSING_SCORE: 60,
  MAX_ATTEMPTS: 3,
  DEFAULT_QUESTION_COUNT: 10,
  DEFAULT_TIME_LIMIT: 30 * 60,
  MIN_QUESTION_COUNT: 5,
  MAX_QUESTION_COUNT: 50,
  MIN_TIME_LIMIT: 5 * 60, // 5 minutes
  MAX_TIME_LIMIT: 120 * 60 // 2 hours
} as const 