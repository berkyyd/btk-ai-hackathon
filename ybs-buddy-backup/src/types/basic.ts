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