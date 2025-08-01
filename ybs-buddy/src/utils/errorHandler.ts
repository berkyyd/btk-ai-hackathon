// Error handling utilities
export interface AppError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  isUserFriendly?: boolean;
}

export class ApiError extends Error {
  public code: string;
  public details?: Record<string, unknown>;
  public isUserFriendly: boolean;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', details?: Record<string, unknown>, isUserFriendly: boolean = false) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.isUserFriendly = isUserFriendly;
  }
}

// Error codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  FIREBASE_ERROR: 'FIREBASE_ERROR',
  GEMINI_ERROR: 'GEMINI_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

// User-friendly error messages
export const USER_FRIENDLY_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Geçersiz veri. Lütfen bilgilerinizi kontrol edin.',
  [ERROR_CODES.UNAUTHORIZED]: 'Yetkisiz erişim. Lütfen giriş yapın.',
  [ERROR_CODES.NOT_FOUND]: 'Aradığınız içerik bulunamadı.',
  [ERROR_CODES.SERVER_ERROR]: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
  [ERROR_CODES.FIREBASE_ERROR]: 'Veritabanı hatası. Lütfen daha sonra tekrar deneyin.',
  [ERROR_CODES.GEMINI_ERROR]: 'AI servisi hatası. Lütfen daha sonra tekrar deneyin.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'Beklenmeyen bir hata oluştu.'
} as const;

// Error handler function
export function handleError(error: unknown): AppError {
  // Firebase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const firebaseError = error as { code: string; message: string };
    
    switch (firebaseError.code) {
      case 'permission-denied':
        return {
          message: USER_FRIENDLY_MESSAGES[ERROR_CODES.UNAUTHORIZED],
          code: ERROR_CODES.UNAUTHORIZED,
          isUserFriendly: true
        };
      case 'not-found':
        return {
          message: USER_FRIENDLY_MESSAGES[ERROR_CODES.NOT_FOUND],
          code: ERROR_CODES.NOT_FOUND,
          isUserFriendly: true
        };
      default:
        return {
          message: USER_FRIENDLY_MESSAGES[ERROR_CODES.FIREBASE_ERROR],
          code: ERROR_CODES.FIREBASE_ERROR,
          details: { originalError: firebaseError },
          isUserFriendly: true
        };
    }
  }

  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: USER_FRIENDLY_MESSAGES[ERROR_CODES.NETWORK_ERROR],
      code: ERROR_CODES.NETWORK_ERROR,
      isUserFriendly: true
    };
  }

  // API errors
  if (error instanceof ApiError) {
    return {
      message: error.isUserFriendly ? error.message : USER_FRIENDLY_MESSAGES[error.code as keyof typeof USER_FRIENDLY_MESSAGES] || USER_FRIENDLY_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
      code: error.code,
      details: error.details,
      isUserFriendly: error.isUserFriendly
    };
  }

  // Generic errors
  if (error instanceof Error) {
    return {
      message: USER_FRIENDLY_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
      code: ERROR_CODES.UNKNOWN_ERROR,
      details: { originalError: error.message },
      isUserFriendly: true
    };
  }

  // Unknown errors
  return {
    message: USER_FRIENDLY_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
    code: ERROR_CODES.UNKNOWN_ERROR,
    details: { originalError: String(error) },
    isUserFriendly: true
  };
}

// Async error wrapper
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const appError = handleError(error);
    
    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', {
        message: appError.message,
        code: appError.code,
        details: appError.details,
        originalError: error
      });
    }
    
    // Re-throw as ApiError if not user-friendly
    if (!appError.isUserFriendly) {
      throw new ApiError(appError.message, appError.code, appError.details);
    }
    
    // Return fallback value if provided
    if (fallback !== undefined) {
      return fallback;
    }
    
    // Re-throw the error
    throw new ApiError(appError.message, appError.code, appError.details, true);
  }
}

// Validation error helper
export function createValidationError(field: string, message: string): ApiError {
  return new ApiError(
    `${field}: ${message}`,
    ERROR_CODES.VALIDATION_ERROR,
    { field, message },
    true
  );
}

// Network error helper
export function createNetworkError(): ApiError {
  return new ApiError(
    USER_FRIENDLY_MESSAGES[ERROR_CODES.NETWORK_ERROR],
    ERROR_CODES.NETWORK_ERROR,
    undefined,
    true
  );
} 