// API related types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export interface LoadingState {
  isLoading: boolean
  error?: string
  message?: string
}

export interface ApiState<T> extends LoadingState {
  data?: T
} 