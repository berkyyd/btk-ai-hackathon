import { ClassType, SemesterType, CourseType } from './basic'

// UI Component types
export interface CardProps {
  children: React.ReactNode
  className?: string
}

export interface SelectProps {
  id: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
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

export interface FilterState {
  searchTerm: string
  selectedClass: ClassType
  selectedSemester: SemesterType
  selectedCourseType: CourseType
} 