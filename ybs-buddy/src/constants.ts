// Route paths
export const ROUTES = {
  HOME: '/',
  MUFEDAT: '/mufredat',
  DERS_NOTLARI: '/ders-notlari',
  NOT_ALANI: '/not-alani',
  SINAV_SIMULASYONU: '/sinav-simulasyonu'
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

// API endpoints (for future use)
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
    PERSONAL: '/api/notes/personal'
  },
  QUIZ: {
    GENERATE: '/api/quiz/generate',
    EVALUATE: '/api/quiz/evaluate',
    REINFORCEMENT: '/api/quiz/reinforcement'
  },
  ANALYTICS: {
    WEAKNESS: '/api/analytics/weakness'
  },
  UPLOAD: {
    FILE: '/api/upload'
  },
  SUMMARIZE: {
    NOTE: '/api/summarize'
  }
} as const

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.',
  SERVER_ERROR: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
  VALIDATION_ERROR: 'Geçersiz veri. Lütfen bilgilerinizi kontrol edin.',
  UNAUTHORIZED: 'Yetkisiz erişim. Lütfen giriş yapın.',
  NOT_FOUND: 'Aradığınız içerik bulunamadı.',
  UNKNOWN_ERROR: 'Beklenmeyen bir hata oluştu.'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'Başarıyla kaydedildi.',
  DELETE_SUCCESS: 'Başarıyla silindi.',
  UPDATE_SUCCESS: 'Başarıyla güncellendi.',
  LOGIN_SUCCESS: 'Başarıyla giriş yapıldı.',
  LOGOUT_SUCCESS: 'Başarıyla çıkış yapıldı.'
} as const

// Loading messages
export const LOADING_MESSAGES = {
  LOADING: 'Yükleniyor...',
  SAVING: 'Kaydediliyor...',
  DELETING: 'Siliniyor...',
  UPLOADING: 'Yükleniyor...',
  GENERATING: 'Oluşturuluyor...'
} as const

// Default values
export const DEFAULTS = {
  SELECT_CLASS: '1',
  SELECT_SEMESTER: 'Güz',
  SELECT_COURSE_TYPE: 'Tümü',
  SELECT_EXAM_TYPE: '',
  SELECT_EXAM_FORMAT: ''
} as const

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  PDF_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  PDF_MAX_SIZE_GEMINI: 5 * 1024 * 1024, // 5MB for Gemini API
  PDF_HEADER_CHECK_SIZE: 1024 // PDF header check size
} as const

// Quiz defaults
export const QUIZ_DEFAULTS = {
  DEFAULT_QUESTION_COUNT: 10,
  DEFAULT_TIME_LIMIT: 30, // minutes
  MIN_QUESTION_COUNT: 5,
  MAX_QUESTION_COUNT: 50,
  MIN_TIME_LIMIT: 5,
  MAX_TIME_LIMIT: 120
} as const

// Progress percentages
export const PROGRESS_PERCENTAGES = {
  UPLOAD_START: 0,
  UPLOAD_MIDDLE: 50,
  UPLOAD_COMPLETE: 100
} as const

// Time intervals (in milliseconds)
export const TIME_INTERVALS = {
  QUIZ_TIMER_UPDATE: 1000, // 1 second
  ERROR_DISPLAY_DELAY: 1000 // 1 second
} as const 