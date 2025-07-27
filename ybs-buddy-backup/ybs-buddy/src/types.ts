// Basic types
export type ClassType = '1' | '2' | '3' | '4' | 'Tümü'
export type SemesterType = 'Güz' | 'Bahar' | 'Tümü'
export type CourseType = 'Zorunlu' | 'Seçmeli' | 'Tümü'
export type ExamType = 'Vize' | 'Final' | 'Quiz'
export type ExamFormat = 'Test' | 'Boşluk Doldurma' | 'Doğru/Yanlış' | 'Klasik' | 'Karışık'

// Option types
export interface Option {
  value: string
  label: string
}

// Course related types
export interface Course {
  id: string
  name: string
  class: ClassType
  semester: SemesterType
  type: CourseType
  description?: string
  credits?: number
  instructor?: string
}

export interface CourseFilter {
  class: ClassType
  semester: SemesterType
  type: CourseType
}

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

// Quiz related types
export interface Quiz {
  id: string
  title: string
  course: string
  examType: ExamType
  examFormat: ExamFormat
  questions: Question[]
  timeLimit?: number
  totalPoints: number
  createdAt: Date
}

export interface Question {
  id: string
  text: string
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'essay'
  options?: string[]
  correctAnswer?: string | string[]
  points: number
  explanation?: string
}

export interface QuizResult {
  id: string
  quizId: string
  userId: string
  score: number
  totalPoints: number
  answers: Answer[]
  completedAt: Date
  timeSpent: number
}

export interface Answer {
  questionId: string
  userAnswer: string | string[]
  isCorrect: boolean
  points: number
}

// User related types
export interface User {
  id: string
  email: string
  name: string
  class?: ClassType
  createdAt: Date
  lastLoginAt?: Date
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

// API response types
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

// Form types
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

export interface QuizForm {
  course: string
  examType: ExamType
  examFormat: ExamFormat
}

// Component prop types
export interface CardProps {
  children: React.ReactNode
  className?: string
}

export interface SelectProps {
  id: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  label: string
  className?: string
}

export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  loading?: boolean
}

// Loading and error states
export interface LoadingState {
  isLoading: boolean
  error?: string
  message?: string
}

export interface ApiState<T> extends LoadingState {
  data?: T
}

// Filter types
export interface FilterState {
  searchTerm: string
  selectedClass: ClassType
  selectedSemester: SemesterType
  selectedCourseType: CourseType
}

export interface QuizFilterState {
  selectedCourse: string
  selectedExamType: ExamType
  selectedExamFormat: ExamFormat
} 