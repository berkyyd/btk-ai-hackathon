import { API_ENDPOINTS, ERROR_MESSAGES } from '../constants.ts'
import { ApiError, NetworkError, logError } from './errorHandler.ts'
import type { ApiResponse } from '../types.ts'

// API base URL - environment variable'dan alınacak
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Default headers
const getDefaultHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
})

// Auth token'ı localStorage'dan al
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken')
}

// Auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken()
  return {
    ...getDefaultHeaders(),
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// API client class
class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const headers = options.headers || getAuthHeaders()

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new ApiError(
          response.statusText || ERROR_MESSAGES.SERVER_ERROR,
          response.status
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      if (error instanceof TypeError) {
        throw new NetworkError(ERROR_MESSAGES.NETWORK_ERROR)
      }

      logError(error, 'ApiClient.request')
      throw new ApiError(ERROR_MESSAGES.UNKNOWN_ERROR, 500)
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // File upload
  async upload<T>(endpoint: string, file: File): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    const url = `${this.baseURL}${endpoint}`
    const headers = { ...getAuthHeaders() }
    delete (headers as Record<string, string>)['Content-Type'] // FormData için Content-Type'ı kaldır

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!response.ok) {
        throw new ApiError(
          response.statusText || ERROR_MESSAGES.SERVER_ERROR,
          response.status
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      logError(error, 'ApiClient.upload')
      throw new ApiError(ERROR_MESSAGES.UNKNOWN_ERROR, 500)
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient()

// Convenience methods for specific endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
  
  register: (userData: { name: string; email: string; password: string }) =>
    apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData),
  
  logout: () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),
}

export const coursesAPI = {
  getAll: () => apiClient.get(API_ENDPOINTS.COURSES.LIST),
  getById: (id: string) => apiClient.get(API_ENDPOINTS.COURSES.DETAIL.replace(':id', id)),
}

export const notesAPI = {
  getAll: () => apiClient.get(API_ENDPOINTS.NOTES.LIST),
  getById: (id: string) => apiClient.get(API_ENDPOINTS.NOTES.DETAIL.replace(':id', id)),
  getPersonal: () => apiClient.get(API_ENDPOINTS.NOTES.PERSONAL),
  create: (noteData: unknown) => apiClient.post(API_ENDPOINTS.NOTES.LIST, noteData),
  update: (id: string, noteData: unknown) => 
    apiClient.put(API_ENDPOINTS.NOTES.DETAIL.replace(':id', id), noteData),
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.NOTES.DETAIL.replace(':id', id)),
}

export const quizAPI = {
  generate: (quizData: unknown) => apiClient.post(API_ENDPOINTS.QUIZ.GENERATE, quizData),
  evaluate: (evaluationData: unknown) => apiClient.post(API_ENDPOINTS.QUIZ.EVALUATE, evaluationData),
  reinforcement: (reinforcementData: unknown) => 
    apiClient.post(API_ENDPOINTS.QUIZ.REINFORCEMENT, reinforcementData),
}

export const analyticsAPI = {
  getWeakness: () => apiClient.get(API_ENDPOINTS.ANALYTICS.WEAKNESS),
}

export const uploadAPI = {
  uploadFile: (file: File) => apiClient.upload(API_ENDPOINTS.UPLOAD.FILE, file),
}

export const summarizeAPI = {
  summarizeNote: (noteData: unknown) => apiClient.post(API_ENDPOINTS.SUMMARIZE.NOTE, noteData),
} 