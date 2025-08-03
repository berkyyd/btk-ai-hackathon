import { test, expect } from '@playwright/test'

test.describe('Quiz Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sinav-simulasyonu')
  })

  test('should show quiz creation form', async ({ page }) => {
    await expect(page.getByText('Yeni Quiz Oluştur')).toBeVisible()
    await expect(page.getByLabel('Ders Seçin')).toBeVisible()
    await expect(page.getByLabel('Zorluk Seviyesi')).toBeVisible()
    await expect(page.getByLabel('Soru Sayısı')).toBeVisible()
    await expect(page.getByLabel('Süre (Dakika)')).toBeVisible()
    await expect(page.getByLabel('Sınav Formatı')).toBeVisible()
  })

  test('should validate quiz form fields', async ({ page }) => {
    const createButton = page.getByRole('button', { name: 'Quiz Oluştur' })
    await createButton.click()
    
    // Should show validation errors
    await expect(page.getByText(/lütfen bir ders seçin/i)).toBeVisible()
  })

  test('should create quiz successfully', async ({ page }) => {
    // Fill quiz form
    await page.getByLabel('Ders Seçin').selectOption('YBS101')
    await page.getByLabel('Zorluk Seviyesi').selectOption('medium')
    await page.getByLabel('Soru Sayısı').fill('5')
    await page.getByLabel('Süre (Dakika)').fill('10')
    await page.getByLabel('Sınav Formatı').selectOption('mixed')
    
    const createButton = page.getByRole('button', { name: 'Quiz Oluştur' })
    await createButton.click()
    
    // Should show loading state
    await expect(page.getByText(/oluşturuluyor/i)).toBeVisible()
  })

  test('should show quiz list', async ({ page }) => {
    await expect(page.getByText('Mevcut Quizler')).toBeVisible()
  })

  test('should start quiz', async ({ page }) => {
    // Mock quiz data
    await page.addInitScript(() => {
      window.localStorage.setItem('quizzes', JSON.stringify([{
        id: 'test-quiz',
        title: 'Test Quiz',
        description: 'Test Description',
        questions: [
          {
            id: '1',
            question: 'Test question?',
            type: 'multiple_choice',
            options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
            correctAnswer: 'A) Option 1'
          }
        ],
        totalQuestions: 1,
        timeLimit: 10,
        difficulty: 'medium',
        courseId: 'YBS101',
        createdAt: new Date().toISOString()
      }]))
    })
    
    await page.reload()
    
    // Start quiz
    await page.getByText('Başla').first().click()
    
    // Should show quiz interface
    await expect(page.getByText('Test question?')).toBeVisible()
    await expect(page.getByText('A) Option 1')).toBeVisible()
  })

  test('should answer quiz questions', async ({ page }) => {
    // Mock quiz data and start quiz
    await page.addInitScript(() => {
      window.localStorage.setItem('activeQuiz', JSON.stringify({
        id: 'test-quiz',
        title: 'Test Quiz',
        questions: [
          {
            id: '1',
            question: 'Test question?',
            type: 'multiple_choice',
            options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
            correctAnswer: 'A) Option 1'
          }
        ],
        totalQuestions: 1,
        timeLimit: 10
      }))
    })
    
    await page.reload()
    
    // Answer question
    await page.getByText('A) Option 1').click()
    
    // Should show next button or finish button
    await expect(page.getByRole('button', { name: /sonraki|bitir/i })).toBeVisible()
  })

  test('should finish quiz', async ({ page }) => {
    // Mock quiz data and start quiz
    await page.addInitScript(() => {
      window.localStorage.setItem('activeQuiz', JSON.stringify({
        id: 'test-quiz',
        title: 'Test Quiz',
        questions: [
          {
            id: '1',
            question: 'Test question?',
            type: 'multiple_choice',
            options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
            correctAnswer: 'A) Option 1'
          }
        ],
        totalQuestions: 1,
        timeLimit: 10
      }))
      window.localStorage.setItem('userAnswers', JSON.stringify({
        '1': 'A) Option 1'
      }))
    })
    
    await page.reload()
    
    // Finish quiz
    await page.getByRole('button', { name: 'Sınavı Bitir' }).click()
    
    // Should show results
    await expect(page.getByText('Sınav Sonuçları')).toBeVisible()
    await expect(page.getByText('Başarı Oranı')).toBeVisible()
  })

  test('should show quiz results', async ({ page }) => {
    // Mock quiz results
    await page.addInitScript(() => {
      window.localStorage.setItem('quizResults', JSON.stringify({
        quizId: 'test-quiz',
        score: 80,
        totalQuestions: 5,
        correctAnswers: 4,
        wrongAnswers: 1,
        timeSpent: 300,
        completedAt: new Date().toISOString(),
        answers: []
      }))
    })
    
    await page.reload()
    
    await expect(page.getByText('Sınav Sonuçları')).toBeVisible()
    await expect(page.getByText('80%')).toBeVisible()
    await expect(page.getByText('4')).toBeVisible() // Correct answers
    await expect(page.getByText('1')).toBeVisible() // Wrong answers
  })

  test('should cancel quiz', async ({ page }) => {
    // Mock active quiz
    await page.addInitScript(() => {
      window.localStorage.setItem('activeQuiz', JSON.stringify({
        id: 'test-quiz',
        title: 'Test Quiz',
        questions: [],
        totalQuestions: 1,
        timeLimit: 10
      }))
    })
    
    await page.reload()
    
    // Cancel quiz
    await page.getByRole('button', { name: 'İptal Et' }).click()
    
    // Should return to quiz list
    await expect(page.getByText('Mevcut Quizler')).toBeVisible()
  })

  test('should show timer during quiz', async ({ page }) => {
    // Mock active quiz with timer
    await page.addInitScript(() => {
      window.localStorage.setItem('activeQuiz', JSON.stringify({
        id: 'test-quiz',
        title: 'Test Quiz',
        questions: [],
        totalQuestions: 1,
        timeLimit: 10
      }))
      window.localStorage.setItem('quizStartTime', new Date().toISOString())
    })
    
    await page.reload()
    
    // Should show timer
    await expect(page.getByText(/geçen süre/i)).toBeVisible()
  })

  test('should filter quizzes by difficulty', async ({ page }) => {
    // Mock quizzes with different difficulties
    await page.addInitScript(() => {
      window.localStorage.setItem('quizzes', JSON.stringify([
        { id: '1', title: 'Easy Quiz', difficulty: 'easy' },
        { id: '2', title: 'Medium Quiz', difficulty: 'medium' },
        { id: '3', title: 'Hard Quiz', difficulty: 'hard' }
      ]))
    })
    
    await page.reload()
    
    // Filter by medium difficulty
    await page.getByLabel('Zorluk Filtresi').selectOption('medium')
    
    // Should only show medium difficulty quizzes
    await expect(page.getByText('Medium Quiz')).toBeVisible()
    await expect(page.getByText('Easy Quiz')).not.toBeVisible()
    await expect(page.getByText('Hard Quiz')).not.toBeVisible()
  })
}) 