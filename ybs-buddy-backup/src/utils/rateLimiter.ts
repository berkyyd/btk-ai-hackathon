interface RateLimitConfig {
  windowMs: number; // Zaman penceresi (ms)
  maxRequests: number; // Maksimum istek sayısı
  message?: string; // Hata mesajı
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  // IP adresini al
  private getClientIP(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const remoteAddr = req.headers.get('x-remote-ip');
    
    return forwarded?.split(',')[0] || realIP || remoteAddr || 'unknown';
  }

  // Rate limit kontrolü
  isAllowed(req: Request): { allowed: boolean; remaining: number; resetTime: number } {
    const clientIP = this.getClientIP(req);
    const now = Date.now();
    
    // Temizlik: Süresi dolmuş kayıtları sil
    this.cleanup();
    
    // Mevcut kayıt kontrolü
    const record = this.store[clientIP];
    
    if (!record) {
      // İlk istek
      this.store[clientIP] = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }
    
    // Zaman penceresi kontrolü
    if (now > record.resetTime) {
      // Yeni zaman penceresi
      this.store[clientIP] = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }
    
    // Limit kontrolü
    if (record.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      };
    }
    
    // İsteği kabul et
    record.count++;
    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime
    };
  }

  // Süresi dolmuş kayıtları temizle
  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      const record = this.store[key];
      if (record && record.resetTime < now) {
        delete this.store[key];
      }
    });
  }

  // Hata yanıtı oluştur
  createErrorResponse(): Response {
    return new Response(
      JSON.stringify({
        success: false,
        error: this.config.message || 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED'
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(this.config.windowMs / 1000).toString()
        }
      }
    );
  }
}

// Önceden tanımlanmış rate limit konfigürasyonları
export const rateLimitConfigs = {
  // Genel API istekleri
  general: {
    windowMs: 60 * 1000, // 1 dakika
    maxRequests: 100,
    message: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.'
  },
  
  // Dosya yükleme
  upload: {
    windowMs: 60 * 1000, // 1 dakika
    maxRequests: 10,
    message: 'Çok fazla dosya yükleme isteği. Lütfen biraz bekleyin.'
  },
  
  // Chatbot
  chatbot: {
    windowMs: 60 * 1000, // 1 dakika
    maxRequests: 50,
    message: 'Çok fazla chatbot isteği. Lütfen biraz bekleyin.'
  },
  
  // Kimlik doğrulama
  auth: {
    windowMs: 15 * 60 * 1000, // 15 dakika
    maxRequests: 5,
    message: 'Çok fazla giriş denemesi. Lütfen 15 dakika bekleyin.'
  }
};

// Rate limiter instance'ları
export const rateLimiters = {
  general: new RateLimiter(rateLimitConfigs.general),
  upload: new RateLimiter(rateLimitConfigs.upload),
  chatbot: new RateLimiter(rateLimitConfigs.chatbot),
  auth: new RateLimiter(rateLimitConfigs.auth)
};

// Rate limiting middleware
export const withRateLimit = (type: keyof typeof rateLimiters) => {
  return (handler: Function) => {
    return async (req: Request, ...args: any[]) => {
      const limiter = rateLimiters[type];
      const result = limiter.isAllowed(req);
      
      if (!result.allowed) {
        return limiter.createErrorResponse();
      }
      
      // Rate limit bilgilerini response header'larına ekle
      const response = await handler(req, ...args);
      
      if (response instanceof Response) {
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
        response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
      }
      
      return response;
    };
  };
}; 