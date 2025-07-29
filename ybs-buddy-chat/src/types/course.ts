import { ClassType, SemesterType, CourseType } from './basic'

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