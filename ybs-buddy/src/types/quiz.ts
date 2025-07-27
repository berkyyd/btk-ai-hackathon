import { ExamType, ExamFormat } from './basic'

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

export interface QuizForm {
  course: string
  examType: ExamType
  examFormat: ExamFormat
}

export interface QuizFilterState {
  selectedCourse: string
  selectedExamType: ExamType
  selectedExamFormat: ExamFormat
} 