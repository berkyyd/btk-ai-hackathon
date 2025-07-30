import { ClassType, SemesterType } from './basic'

// PDF extraction result interface
export interface ExtractedTextResult {
  success: boolean
  text?: string
  error?: string
  pageCount?: number
  fileSize?: number
}

// Note related types
export interface Note {
  id: string
  title: string
  content: string
  class: number
  semester: SemesterType
  courseId: string
  author: string
  createdAt: Date
  updatedAt: Date
  likes: number
  favorites: number
  tags?: string[]
  fileUrl?: string
  isPublic?: boolean
  // PDF specific properties
  isPDF?: boolean
  extractedText?: string
  pageCount?: number
  fileSize?: number
  originalFileName?: string
}

export interface PersonalNote {
  id: string
  title: string
  content: string
  userId: string
  folder?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface NoteFilter {
  searchTerm: string
  class: number
  semester: SemesterType
  courseId: string
} 