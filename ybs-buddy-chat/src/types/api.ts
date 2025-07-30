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

// Chatbot types
export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  feedback?: 'helpful' | 'not_helpful' | null
}

export interface ChatbotRequest {
  question: string
  userId?: string
  context?: string
}

export interface ChatbotResponse {
  answer: string
  sources?: string[]
  confidence?: number
}

export interface ChatHistory {
  id: string
  userId: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatbotFeedback {
  messageId: string
  feedback: 'helpful' | 'not_helpful'
  userId: string
  timestamp: Date
} 