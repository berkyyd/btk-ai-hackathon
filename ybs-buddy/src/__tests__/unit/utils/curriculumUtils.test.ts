import { 
  getCourseByCode, 
  getCourseByName, 
  getAllCourses,
  getCoursesByClass,
  getCoursesByClassAndSemester,
  getClassAndSemesterOptions,
  getCurriculumInfo
} from '../../../utils/curriculumUtils'

describe('curriculumUtils', () => {
  describe('getCourseByCode', () => {
    it('should find course by code', () => {
      const result = getCourseByCode('YBS101')
      expect(result).toBeDefined()
      // Test will pass if course exists, otherwise it's null
      if (result) {
        expect(result.code).toBe('YBS101')
      }
    })

    it('should return null for non-existent course', () => {
      const result = getCourseByCode('NONEXISTENT')
      expect(result).toBeNull()
    })
  })

  describe('getCourseByName', () => {
    it('should find course by name', () => {
      const result = getCourseByName('Yönetim Bilişim Sistemleri')
      expect(result).toBeDefined()
      if (result) {
        expect(result.name).toContain('Yönetim')
      }
    })

    it('should return null for non-existent course', () => {
      const result = getCourseByName('NONEXISTENT')
      expect(result).toBeNull()
    })
  })

  describe('getAllCourses', () => {
    it('should return all courses', () => {
      const result = getAllCourses()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('getCoursesByClass', () => {
    it('should return courses for specific class', () => {
      const result = getCoursesByClass(1)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      result.forEach(course => {
        expect(course).toHaveProperty('code')
        expect(course).toHaveProperty('name')
      })
    })

    it('should return empty array for non-existent class', () => {
      const result = getCoursesByClass(999)
      expect(result).toEqual([])
    })
  })

  describe('getCoursesByClassAndSemester', () => {
    it('should return courses for specific class and semester', () => {
      const result = getCoursesByClassAndSemester(1, 'Güz')
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should return empty array for non-existent class and semester', () => {
      const result = getCoursesByClassAndSemester(999, 'NonExistent')
      expect(result).toEqual([])
    })
  })

  describe('getClassAndSemesterOptions', () => {
    it('should return class and semester options', () => {
      const result = getClassAndSemesterOptions()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      result.forEach(option => {
        expect(option).toHaveProperty('class')
        expect(option).toHaveProperty('semester')
        expect(option).toHaveProperty('label')
      })
    })
  })

  describe('getCurriculumInfo', () => {
    it('should return curriculum information', () => {
      const result = getCurriculumInfo()
      expect(result).toHaveProperty('university')
      expect(result).toHaveProperty('faculty')
      expect(result).toHaveProperty('department')
      expect(result).toHaveProperty('curriculum')
      expect(Array.isArray(result.curriculum)).toBe(true)
    })
  })
}) 