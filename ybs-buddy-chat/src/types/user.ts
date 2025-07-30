import { ClassType } from './basic'

// User related types
export interface User {
  id: string
  email: string
  name: string
  class?: ClassType
  createdAt: Date
  lastLoginAt?: Date
  summarizedNotes?: SummarizedNote[];
}

export interface SummarizedNote {
  noteId: string;
  title: string;
  summarizedContent: string;
  category: string;
  createdAt: Date;
}

export interface UserMistake {
  id: string
  userId: string
  course: string
  topic: string
  questionId: string
  userAnswer: string
  correctAnswer: string
  createdAt: Date
}

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  class?: ClassType
} 