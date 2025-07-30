import { ERROR_MESSAGES } from '../constants'

// Error types
export class ApiError extends Error {
  public statusCode: number
  public code?: string

  constructor(message: string, statusCode: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
  }
}

export class ValidationError extends Error {
  public field?: string

  constructor(message: string, field?: string) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

// Error handler functions
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 400:
        return ERROR_MESSAGES.VALIDATION_ERROR
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED
      case 404:
        return ERROR_MESSAGES.NOT_FOUND
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR
      default:
        return error.message || ERROR_MESSAGES.UNKNOWN_ERROR
    }
  }

  if (error instanceof ValidationError) {
    return error.message
  }

  if (error instanceof NetworkError) {
    return ERROR_MESSAGES.NETWORK_ERROR
  }

  if (error instanceof Error) {
    return error.message
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR
}

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return 'Şifre en az 6 karakter olmalıdır.'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Şifre en az bir büyük harf içermelidir.'
  }
  if (!/[a-z]/.test(password)) {
    return 'Şifre en az bir küçük harf içermelidir.'
  }
  if (!/\d/.test(password)) {
    return 'Şifre en az bir rakam içermelidir.'
  }
  return null
}

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} alanı zorunludur.`
  }
  return null
}

// Form validation
export const validateLoginForm = (form: { email: string; password: string }): Record<string, string> => {
  const errors: Record<string, string> = {}

  // Email validation
  const emailError = validateRequired(form.email, 'E-posta')
  if (emailError) {
    errors.email = emailError
  } else if (!validateEmail(form.email)) {
    errors.email = 'Geçerli bir e-posta adresi giriniz.'
  }

  // Password validation
  const passwordError = validateRequired(form.password, 'Şifre')
  if (passwordError) {
    errors.password = passwordError
  }

  return errors
}

export const validateRegisterForm = (form: {
  name: string
  email: string
  password: string
  confirmPassword: string
}): Record<string, string> => {
  const errors: Record<string, string> = {}

  // Name validation
  const nameError = validateRequired(form.name, 'Ad Soyad')
  if (nameError) {
    errors.name = nameError
  }

  // Email validation
  const emailError = validateRequired(form.email, 'E-posta')
  if (emailError) {
    errors.email = emailError
  } else if (!validateEmail(form.email)) {
    errors.email = 'Geçerli bir e-posta adresi giriniz.'
  }

  // Password validation
  const passwordError = validateRequired(form.password, 'Şifre')
  if (passwordError) {
    errors.password = passwordError
  } else {
    const passwordValidationError = validatePassword(form.password)
    if (passwordValidationError) {
      errors.password = passwordValidationError
    }
  }

  // Confirm password validation
  const confirmPasswordError = validateRequired(form.confirmPassword, 'Şifre Tekrarı')
  if (confirmPasswordError) {
    errors.confirmPassword = confirmPasswordError
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Şifreler eşleşmiyor.'
  }

  return errors
}

// Error logging (for development)
export const logError = (error: unknown, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'Error'}]:`, error)
  }
  // In production, you might want to send this to a logging service
}

// Retry mechanism for API calls
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        throw error
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  throw lastError
} 