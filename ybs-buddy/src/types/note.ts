import { ClassType, SemesterType } from './basic'

// Note related types
export interface Note {
  id: string
  title: string
  content: string
  class: ClassType
  semester: SemesterType
  course: string
  author: string
  createdAt: Date
  updatedAt: Date
  likes: number
  favorites: number
  tags?: string[]
  fileUrl?: string
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
  class: ClassType
  semester: SemesterType
  course: string
} 