import * as Sentry from '@sentry/nextjs';

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: Record<string, any>;
  userId?: string;
  context?: string;
}

export class AppError extends Error {
  public code: string;
  public details?: Record<string, any>;
  public userId?: string;
  public context?: string;

  constructor(info: ErrorInfo) {
    super(info.message);
    this.name = 'AppError';
    this.code = info.code || 'UNKNOWN_ERROR';
    this.details = info.details || {};
    if (info.userId !== undefined) this.userId = info.userId;
    if (info.context !== undefined) this.context = info.context;
  }
}

export const errorHandler = {
  // Hata yakalama ve loglama
  captureError(error: Error | AppError, context?: Record<string, any>) {
    // Sentry'ye gönder
    Sentry.captureException(error, {
      tags: {
        errorCode: error instanceof AppError ? error.code : 'UNKNOWN',
        context: error instanceof AppError ? error.context : context?.context,
      },
      extra: {
        ...context,
        ...(error instanceof AppError ? error.details : {}),
      },
    });

    // Console'a log (development'ta)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', {
        message: error.message,
        code: error instanceof AppError ? error.code : 'UNKNOWN',
        stack: error.stack,
        context,
      });
    }
  },

  // API hata yanıtı oluştur
  createApiError(error: Error | AppError): { success: false; error: string; code?: string } {
    const errorCode = error instanceof AppError ? error.code : 'INTERNAL_ERROR';
    const message = error.message || 'Bir hata oluştu';

    // Hata yakala
    this.captureError(error);

    return {
      success: false,
      error: message,
      code: errorCode,
    };
  },

  // Kullanıcı dostu hata mesajları
  getUserFriendlyMessage(error: Error | AppError): string {
    if (error instanceof AppError) {
      switch (error.code) {
        case 'AUTH_REQUIRED':
          return 'Bu işlem için giriş yapmanız gerekiyor.';
        case 'PERMISSION_DENIED':
          return 'Bu işlem için yetkiniz bulunmuyor.';
        case 'NOT_FOUND':
          return 'Aradığınız kaynak bulunamadı.';
        case 'VALIDATION_ERROR':
          return 'Girdiğiniz bilgiler hatalı. Lütfen kontrol edin.';
        case 'RATE_LIMIT_EXCEEDED':
          return 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.';
        case 'NETWORK_ERROR':
          return 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.';
        case 'FILE_TOO_LARGE':
          return 'Dosya boyutu çok büyük. Lütfen daha küçük bir dosya seçin.';
        case 'INVALID_FILE_TYPE':
          return 'Geçersiz dosya türü. Lütfen PDF dosyası seçin.';
        default:
          return error.message || 'Beklenmeyen bir hata oluştu.';
      }
    }

    return error.message || 'Beklenmeyen bir hata oluştu.';
  },

  // Hata kodları
  errorCodes: {
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    NETWORK_ERROR: 'NETWORK_ERROR',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  } as const,
};

// Global hata yakalayıcı
export const setupGlobalErrorHandler = () => {
  if (typeof window !== 'undefined') {
    // Client-side hata yakalama
    window.addEventListener('error', (event) => {
      errorHandler.captureError(event.error, {
        context: 'global-error-handler',
        url: window.location.href,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      errorHandler.captureError(new Error(event.reason), {
        context: 'unhandled-promise-rejection',
        url: window.location.href,
      });
    });
  }
};

// API route wrapper
export const withErrorHandler = (handler: Function) => {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      const apiError = errorHandler.createApiError(error as Error);
      return new Response(JSON.stringify(apiError), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}; 