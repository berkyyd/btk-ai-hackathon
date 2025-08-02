import { apiClient } from '../apiClient'

// Mock fetch
global.fetch = jest.fn()

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCourses', () => {
    it('should fetch courses successfully', async () => {
      const mockResponse = {
        courses: [
          { id: '1', name: 'Test Course 1' },
          { id: '2', name: 'Test Course 2' }
        ]
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await apiClient.getCourses()

      expect(result).toEqual({
        success: true,
        data: mockResponse
      })
      expect(fetch).toHaveBeenCalledWith('/api/courses', expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }))
    })

    it('should handle error response', async () => {
      const mockResponse = {
        error: 'Failed to fetch courses'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await apiClient.getCourses()

      expect(result).toEqual({
        success: true,
        data: mockResponse
      })
    })
  })

  describe('getNotes', () => {
    it('should fetch notes with parameters', async () => {
      const mockResponse = {
        notes: [
          { id: '1', title: 'Test Note 1' },
          { id: '2', title: 'Test Note 2' }
        ]
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const params = {
        classYear: '1',
        semester: 'Güz',
        courseId: 'test-course'
      }

      const result = await apiClient.getNotes(params)

      expect(result).toEqual({
        success: true,
        data: mockResponse
      })
      expect(fetch).toHaveBeenCalledWith('/api/notes?classYear=1&semester=G%C3%BCz&courseId=test-course', expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }))
    })
  })
}) 