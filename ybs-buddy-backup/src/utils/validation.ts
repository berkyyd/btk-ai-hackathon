import { AppError } from './errorHandler';

// Validation rules
export const validationRules = {
  // Email validation
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Geçerli bir email adresi giriniz.'
  },
  
  // Password validation
  password: {
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Şifre en az 6 karakter olmalı ve büyük harf, küçük harf ve rakam içermelidir.'
  },
  
  // Display name validation
  displayName: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/,
    message: 'Ad soyad sadece harf içermelidir ve 2-50 karakter arasında olmalıdır.'
  },
  
  // Note title validation
  noteTitle: {
    minLength: 1,
    maxLength: 200,
    message: 'Not başlığı 1-200 karakter arasında olmalıdır.'
  },
  
  // Note content validation
  noteContent: {
    minLength: 1,
    maxLength: 10000,
    message: 'Not içeriği 1-10000 karakter arasında olmalıdır.'
  },
  
  // File size validation (MB)
  fileSize: {
    maxSize: 10, // 10MB
    message: 'Dosya boyutu 10MB\'dan küçük olmalıdır.'
  },
  
  // File type validation
  fileType: {
    allowedTypes: ['application/pdf'],
    message: 'Sadece PDF dosyaları kabul edilir.'
  }
};

// Validation functions
export const validators = {
  // Email validation
  validateEmail(email: string): void {
    if (!email || typeof email !== 'string') {
      throw new AppError({
        message: 'Email adresi gereklidir.',
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (!validationRules.email.pattern.test(email)) {
      throw new AppError({
        message: validationRules.email.message,
        code: 'VALIDATION_ERROR'
      });
    }
  },
  
  // Password validation
  validatePassword(password: string): void {
    if (!password || typeof password !== 'string') {
      throw new AppError({
        message: 'Şifre gereklidir.',
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (password.length < validationRules.password.minLength) {
      throw new AppError({
        message: `Şifre en az ${validationRules.password.minLength} karakter olmalıdır.`,
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (!validationRules.password.pattern.test(password)) {
      throw new AppError({
        message: validationRules.password.message,
        code: 'VALIDATION_ERROR'
      });
    }
  },
  
  // Display name validation
  validateDisplayName(displayName: string): void {
    if (!displayName || typeof displayName !== 'string') {
      throw new AppError({
        message: 'Ad soyad gereklidir.',
        code: 'VALIDATION_ERROR'
      });
    }
    
    const trimmed = displayName.trim();
    
    if (trimmed.length < validationRules.displayName.minLength) {
      throw new AppError({
        message: `Ad soyad en az ${validationRules.displayName.minLength} karakter olmalıdır.`,
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (trimmed.length > validationRules.displayName.maxLength) {
      throw new AppError({
        message: `Ad soyad en fazla ${validationRules.displayName.maxLength} karakter olmalıdır.`,
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (!validationRules.displayName.pattern.test(trimmed)) {
      throw new AppError({
        message: validationRules.displayName.message,
        code: 'VALIDATION_ERROR'
      });
    }
  },
  
  // Note title validation
  validateNoteTitle(title: string): void {
    if (!title || typeof title !== 'string') {
      throw new AppError({
        message: 'Not başlığı gereklidir.',
        code: 'VALIDATION_ERROR'
      });
    }
    
    const trimmed = title.trim();
    
    if (trimmed.length < validationRules.noteTitle.minLength) {
      throw new AppError({
        message: `Not başlığı en az ${validationRules.noteTitle.minLength} karakter olmalıdır.`,
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (trimmed.length > validationRules.noteTitle.maxLength) {
      throw new AppError({
        message: `Not başlığı en fazla ${validationRules.noteTitle.maxLength} karakter olmalıdır.`,
        code: 'VALIDATION_ERROR'
      });
    }
  },
  
  // Note content validation
  validateNoteContent(content: string): void {
    if (!content || typeof content !== 'string') {
      throw new AppError({
        message: 'Not içeriği gereklidir.',
        code: 'VALIDATION_ERROR'
      });
    }
    
    const trimmed = content.trim();
    
    if (trimmed.length < validationRules.noteContent.minLength) {
      throw new AppError({
        message: `Not içeriği en az ${validationRules.noteContent.minLength} karakter olmalıdır.`,
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (trimmed.length > validationRules.noteContent.maxLength) {
      throw new AppError({
        message: `Not içeriği en fazla ${validationRules.noteContent.maxLength} karakter olmalıdır.`,
        code: 'VALIDATION_ERROR'
      });
    }
  },
  
  // File validation
  validateFile(file: File): void {
    if (!file) {
      throw new AppError({
        message: 'Dosya gereklidir.',
        code: 'VALIDATION_ERROR'
      });
    }
    
    // File size validation
    const maxSizeInBytes = validationRules.fileSize.maxSize * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      throw new AppError({
        message: validationRules.fileSize.message,
        code: 'FILE_TOO_LARGE'
      });
    }
    
    // File type validation
    if (!validationRules.fileType.allowedTypes.includes(file.type)) {
      throw new AppError({
        message: validationRules.fileType.message,
        code: 'INVALID_FILE_TYPE'
      });
    }
  },
  
  // Course ID validation
  validateCourseId(courseId: string): void {
    if (!courseId || typeof courseId !== 'string') {
      throw new AppError({
        message: 'Ders ID gereklidir.',
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (courseId.trim().length === 0) {
      throw new AppError({
        message: 'Geçerli bir ders ID giriniz.',
        code: 'VALIDATION_ERROR'
      });
    }
  },
  
  // User ID validation
  validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string') {
      throw new AppError({
        message: 'Kullanıcı ID gereklidir.',
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (userId.trim().length === 0) {
      throw new AppError({
        message: 'Geçerli bir kullanıcı ID giriniz.',
        code: 'VALIDATION_ERROR'
      });
    }
  },
  
  // Invitation code validation
  validateInvitationCode(code: string): void {
    if (!code || typeof code !== 'string') {
      throw new AppError({
        message: 'Davet kodu gereklidir.',
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (code.trim().length < 6) {
      throw new AppError({
        message: 'Davet kodu en az 6 karakter olmalıdır.',
        code: 'VALIDATION_ERROR'
      });
    }
  }
};

// Sanitization functions
export const sanitizers = {
  // HTML sanitization
  sanitizeHtml(html: string): string {
    // Basit HTML tag'lerini kaldır
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  },
  
  // Text sanitization
  sanitizeText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Birden fazla boşluğu tek boşluğa çevir
      .replace(/[<>]/g, ''); // HTML tag karakterlerini kaldır
  },
  
  // Email sanitization
  sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  },
  
  // Display name sanitization
  sanitizeDisplayName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ') // Birden fazla boşluğu tek boşluğa çevir
      .replace(/[^\wğüşıöçĞÜŞİÖÇ\s]/g, ''); // Sadece harf ve boşluk bırak
  }
};

// Validation middleware
export const withValidation = (validatorNames: Array<keyof typeof validators>) => {
  return (handler: Function) => {
    return async (req: Request, ...args: any[]) => {
      try {
        const body = await req.json();
        
        // Validators'ları çalıştır
        validatorNames.forEach(validatorName => {
          const validator = validators[validatorName];
          if (typeof validator === 'function') {
            validator(body);
          }
        });
        
        return await handler(req, ...args);
      } catch (error) {
        if (error instanceof AppError) {
          return new Response(JSON.stringify({
            success: false,
            error: error.message,
            code: error.code
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        throw error;
      }
    };
  };
}; 