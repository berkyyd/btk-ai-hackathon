import { ClassType, SemesterType } from './basic'

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
  // Role alanı eklendi
  role?: 'student' | 'academician' | 'admin'
  // Kullanıcı ID'si ve isPublic alanları eklendi
  userId?: string
  isPublic?: boolean
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