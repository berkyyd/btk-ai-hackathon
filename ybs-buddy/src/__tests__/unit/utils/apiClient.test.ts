import { apiClient } from '../../../utils/apiClient'

// Mock fetch
global.fetch = jest.fn()

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCourses', () => {
    it('should fetch courses successfully', async () => {
      const mockCourses = [
        { id: '1', name: 'Veri Tabanı', code: 'YBS101' },
        { id: '2', name: 'Programlama', code: 'YBS102' }
      ]

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: mockCourses })
      })

      const result = await apiClient.getCourses()

      expect(result.success).toBe(true)
      expect(result.data?.courses).toEqual(mockCourses)
      expect(fetch).toHaveBeenCalledWith('/api/courses', expect.objectContaining({
        headers: { 'Content-Type': 'application/json' }
      }))
    })

    it('should handle API errors', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' })
      })

      const result = await apiClient.getCourses()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Server error')
    })

    it('should handle network errors', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const result = await apiClient.getCourses()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Bağlantı hatası')
    })
  })

  describe('getNotes', () => {
    it('should fetch notes successfully', async () => {
      const mockNotes = [
        { id: '1', title: 'Note 1', content: 'Content 1' },
        { id: '2', title: 'Note 2', content: 'Content 2' }
      ]

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notes: mockNotes })
      })

      const result = await apiClient.getNotes()

      expect(result.success).toBe(true)
      expect(result.data?.notes).toEqual(mockNotes)
      expect(fetch).toHaveBeenCalledWith('/api/notes', expect.objectContaining({
        headers: { 'Content-Type': 'application/json' }
      }))
    })
  })

  describe('addNote', () => {
    it('should add note successfully', async () => {
      const newNote = {
        title: 'Test Note',
        content: 'Test Content',
        courseId: 'YBS101'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ noteId: '123' })
      })

      const result = await apiClient.addNote(newNote)

      expect(result.success).toBe(true)
      expect(result.data?.noteId).toBe('123')
      expect(fetch).toHaveBeenCalledWith('/api/notes', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      }))
    })
  })

  describe('submitQuiz', () => {
    it('should submit quiz successfully', async () => {
      const quizData = {
        userId: 'user123',
        quizId: 'quiz123',
        score: 85,
        totalPoints: 10,
        answers: [],
        completedAt: '2024-01-01T00:00:00Z',
        timeSpent: 1200
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      const result = await apiClient.submitQuiz(quizData)

      expect(result.success).toBe(true)
      expect(fetch).toHaveBeenCalledWith('/api/quiz/submit', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData)
      }))
    })
  })

  describe('generateQuiz', () => {
    it('should generate quiz successfully', async () => {
      const quizRequest = {
        courseId: 'YBS101',
        difficulty: 'medium' as const,
        questionCount: 10,
        timeLimit: 30,
        examFormat: 'mixed' as const
      }

      const mockQuestions = [
        { id: '1', question: 'Test question?', type: 'multiple_choice' }
      ]

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          questions: mockQuestions,
          totalQuestions: 10
        })
      })

      const result = await apiClient.generateQuiz(quizRequest)

      expect(result.success).toBe(true)
      expect(result.data?.questions).toEqual(mockQuestions)
      expect(fetch).toHaveBeenCalledWith('/api/quiz/generate', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizRequest)
      }))
    })
  })
}) 