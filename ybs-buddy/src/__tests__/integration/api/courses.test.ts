import { NextRequest } from 'next/server'
import { GET, POST } from '../../../app/api/courses/route'
import { collection, getDocs, addDoc } from 'firebase/firestore'

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
}))

const mockCollection = collection as jest.MockedFunction<typeof collection>
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>

describe('Courses API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/courses', () => {
    it('should return courses successfully', async () => {
      const mockCourses = [
        { id: '1', name: 'Veri Tabanı', code: 'YBS101', classYear: 1 },
        { id: '2', name: 'Programlama', code: 'YBS102', classYear: 1 }
      ]

      const mockQuerySnapshot = {
        forEach: (callback: (doc: any) => void) => {
          mockCourses.forEach((course, index) => {
            callback({
              id: course.id,
              data: () => course
            })
          })
        }
      }

      mockCollection.mockReturnValue('courses' as any)
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any)

      const request = new NextRequest('http://localhost:3000/api/courses')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.courses).toEqual(mockCourses)
      expect(data.total).toBe(2)
    })

    it('should handle Firestore errors', async () => {
      mockCollection.mockReturnValue('courses' as any)
      mockGetDocs.mockRejectedValue(new Error('Firestore error'))

      const request = new NextRequest('http://localhost:3000/api/courses')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Dersler yüklenirken bir hata oluştu')
    })
  })

  describe('POST /api/courses', () => {
    it('should create course successfully', async () => {
      const newCourse = {
        name: 'Test Course',
        code: 'TEST101',
        classYear: 1,
        semester: 'Güz',
        courseType: 'Zorunlu',
        credits: 3,
        description: 'Test description'
      }

      mockCollection.mockReturnValue('courses' as any)
      mockAddDoc.mockResolvedValue({ id: 'new-course-id' } as any)

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCourse)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.courseId).toBe('new-course-id')
      expect(data.message).toBe('Ders başarıyla eklendi')
    })

    it('should validate required fields', async () => {
      const invalidCourse = {
        name: 'Test Course',
        // Missing required fields
      }

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidCourse)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Tüm zorunlu alanlar doldurulmalıdır')
    })

    it('should handle Firestore errors during creation', async () => {
      const newCourse = {
        name: 'Test Course',
        code: 'TEST101',
        classYear: 1,
        semester: 'Güz',
        courseType: 'Zorunlu',
        credits: 3,
        description: 'Test description'
      }

      mockCollection.mockReturnValue('courses' as any)
      mockAddDoc.mockRejectedValue(new Error('Firestore error'))

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCourse)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Ders eklenirken bir hata oluştu')
    })
  })
}) 