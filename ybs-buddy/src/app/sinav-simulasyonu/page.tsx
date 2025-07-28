'use client'

import { useState, useEffect } from 'react'
import Card from '../../components/Card'
import { apiClient } from '../../utils/apiClient'
import { useAuth } from '../../contexts/AuthContext'

interface Question {
  id: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'open_ended'
  options?: string[]
  correctAnswer?: string | boolean
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
  courseId?: string
  topic?: string
}

interface Quiz {
  id: string
  title: string
  description: string
  questions: Question[]
  totalQuestions: number
  timeLimit?: number // dakika cinsinden
  difficulty: 'easy' | 'medium' | 'hard'
  courseId?: string
  createdAt: string
}

interface QuizResult {
  quizId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  timeSpent: number // saniye cinsinden
  completedAt: string
  answers: {
    questionId: string
    userAnswer: string | boolean
    isCorrect: boolean
  }[]
}

interface Course {
  id: string
  name: string
  code: string
}

export default function SinavSimulasyonuPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Quiz oluşturma
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creatingQuiz, setCreatingQuiz] = useState(false)
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    courseId: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    questionCount: 10,
    timeLimit: 30,
    examFormat: 'mixed' as 'test' | 'classic' | 'mixed'
  })

  // Aktif sınav
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string | boolean}>({})
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null)
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const { user, role, loading: authLoading } = useAuth();

  // Quiz oluştur
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setCreatingQuiz(true)
      
      const response = await apiClient.generateQuiz({
        courseId: newQuiz.courseId,
        difficulty: newQuiz.difficulty,
        questionCount: newQuiz.questionCount,
        timeLimit: newQuiz.timeLimit,
        examFormat: newQuiz.examFormat
      })
      
      if (response.success && response.data) {
        const quizData = response.data as any
        const quiz: Quiz = {
          id: Date.now().toString(), // Geçici ID
          title: newQuiz.title,
          description: newQuiz.description,
          questions: quizData.questions || [],
          totalQuestions: quizData.questions?.length || 0,
          timeLimit: newQuiz.timeLimit,
          difficulty: newQuiz.difficulty,
          courseId: newQuiz.courseId,
          createdAt: new Date().toISOString()
        }
        
        setQuizzes(prev => [quiz, ...prev])
        setShowCreateForm(false)
        setNewQuiz({
          title: '',
          description: '',
          courseId: '',
          difficulty: 'medium',
          questionCount: 10,
          timeLimit: 30,
          examFormat: 'mixed'
        })
      } else {
        setError(response.error || 'Quiz oluşturulurken bir hata oluştu')
      }
    } catch (err) {
      setError('Bağlantı hatası')
    } finally {
      setCreatingQuiz(false)
    }
  }

  // Sınavı başlat
  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz)
    setCurrentQuestionIndex(0)
    setUserAnswers({})
    setQuizStartTime(new Date())
    setQuizResults(null)
    setElapsedTime(0)
  }

  // Cevap kaydet
  const handleAnswer = (questionId: string, answer: string | boolean) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  // Sonraki soru
  const nextQuestion = () => {
    if (activeQuiz && currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  // Önceki soru
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  // Sınavı bitir
  const finishQuiz = async () => {
    if (!activeQuiz || !quizStartTime) return

    const endTime = new Date()
    const timeSpent = Math.floor((endTime.getTime() - quizStartTime.getTime()) / 1000)
    
    let correctAnswers = 0
    const answers = activeQuiz.questions.map(question => {
      const userAnswer = userAnswers[question.id]
      const isCorrect = (() => {
        if (question.type === 'true_false') {
          console.log(`Question ID: ${question.id}, Type: ${question.type}, User Answer: ${userAnswer}, Correct Answer: ${question.correctAnswer}`);
          return String(userAnswer) === String(question.correctAnswer);
        } else if (question.type === 'multiple_choice' || question.type === 'open_ended') {
          const userAnsTrimmed = String(userAnswer).toLowerCase().trim();
          const correctAnsTrimmed = String(question.correctAnswer).toLowerCase().trim();
          console.log(`Question ID: ${question.id}, Type: ${question.type}, User Answer (trimmed): '${userAnsTrimmed}', Correct Answer (trimmed): '${correctAnsTrimmed}'`);
          return userAnsTrimmed === correctAnsTrimmed;
        }
        return false; // Bilinmeyen soru tipi
      })();
      if (isCorrect) correctAnswers++
      
      return {
        questionId: question.id,
        userAnswer,
        isCorrect
      }
    })

    const result: QuizResult = {
      quizId: activeQuiz.id,
      score: Math.round((correctAnswers / activeQuiz.totalQuestions) * 100),
      totalQuestions: activeQuiz.totalQuestions,
      correctAnswers,
      wrongAnswers: activeQuiz.totalQuestions - correctAnswers,
      timeSpent,
      completedAt: endTime.toISOString(),
      answers
    }

    setQuizResults(result)
    setActiveQuiz(null)

    // Quiz sonucunu sunucuya kaydet
    if (user) {
      await apiClient.submitQuiz({
        userId: user.uid,
        quizId: result.quizId,
        score: result.score,
        totalPoints: result.totalQuestions,
        answers: result.answers,
        completedAt: result.completedAt,
        timeSpent: result.timeSpent,
        questions: activeQuiz.questions // yeni eklendi
      })
    }
  }

  // Sınavı iptal et
  const cancelQuiz = () => {
    setActiveQuiz(null)
    setCurrentQuestionIndex(0)
    setUserAnswers({})
    setQuizStartTime(null)
    setQuizResults(null)
  }

  // Dersleri yükle
  const loadCourses = async () => {
    try {
      const response = await apiClient.getCourses()
      if (response.success && response.data) {
        const data = response.data as any
        setCourses(data.courses || [])
      }
    } catch (err) {
      console.error('Courses load error:', err)
    }
  }

  // İlk yükleme
  useEffect(() => {
    loadCourses()
    setLoading(false)
  }, [])

  // Zamanlayıcı (sınav sırasında)
  useEffect(() => {
    if (!activeQuiz || !quizStartTime) return

    const timer = setInterval(() => {
      const now = new Date()
      const timeSpent = Math.floor((now.getTime() - quizStartTime.getTime()) / 1000)
      setElapsedTime(timeSpent)
      const timeLimit = activeQuiz.timeLimit ? activeQuiz.timeLimit * 60 : 0
      
      if (timeLimit && timeSpent >= timeLimit) {
        finishQuiz()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [activeQuiz, quizStartTime])

  // Zorluk seviyesi rengi
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Süre formatla
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (authLoading) return <div>Yükleniyor...</div>;
  if (!user) return <div>Lütfen giriş yapınız.</div>;

  return (
    <div className='py-8'>
      <section className='text-center mb-16 animate-fadeIn'>
        <h1 className='text-5xl font-extrabold text-text leading-tight mb-4'>
          Sınav Simülasyonu
        </h1>
        <p className='text-lg text-text-light max-w-3xl mx-auto leading-relaxed'>
          Gerçek sınav deneyimi yaşayın ve bilgilerinizi test edin.
        </p>
      </section>

      {/* Quiz Oluşturma Formu */}
      {user && (
        <Card className='mb-8'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-xl font-bold text-text'>Quiz Oluştur</h3>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
            >
              {showCreateForm ? 'İptal' : 'Yeni Quiz'}
            </button>
          </div>

          {showCreateForm && (
          <form onSubmit={handleCreateQuiz} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-text mb-2'>Quiz Başlığı</label>
                <input
                  type='text'
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Örn: Veri Tabanı Final Sınavı'
                  required
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-text mb-2'>Ders</label>
                <select
                  value={newQuiz.courseId}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, courseId: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                >
                  <option value=''>Ders Seçin</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className='block text-sm font-medium text-text mb-2'>Zorluk Seviyesi</label>
                <select
                  value={newQuiz.difficulty}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='easy'>Kolay</option>
                  <option value='medium'>Orta</option>
                  <option value='hard'>Zor</option>
                </select>
              </div>
              
              <div>
                <label className='block text-sm font-medium text-text mb-2'>Soru Sayısı</label>
                <input
                  type='number'
                  value={newQuiz.questionCount || ''}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 10 }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  min='5'
                  max='50'
                  required
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-text mb-2'>Süre (Dakika)</label>
                <input
                  type='number'
                  value={newQuiz.timeLimit || ''}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  min='5'
                  max='120'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-text mb-2'>Sınav Türü</label>
                <select
                  value={newQuiz.examFormat}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, examFormat: e.target.value as any }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                >
                  <option value='test'>Test (Çoktan Seçmeli)</option>
                  <option value='classic'>Klasik (Açık Uçlu)</option>
                  <option value='mixed'>Karışık (Test, Klasik, D/Y, Boşluk Doldurma)</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className='block text-sm font-medium text-text mb-2'>Açıklama</label>
              <textarea
                value={newQuiz.description}
                onChange={(e) => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                rows={3}
                placeholder='Quiz hakkında açıklama...'
              />
            </div>
            
            <div className='flex justify-end space-x-4'>
              <button
                type='button'
                onClick={() => setShowCreateForm(false)}
                className='px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors'
              >
                İptal
              </button>
              <button
                type='submit'
                disabled={creatingQuiz}
                className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50'
              >
                {creatingQuiz ? 'Oluşturuluyor...' : 'Quiz Oluştur'}
              </button>
            </div>
          </form>
        )}
      </Card>
    )}

      
      {error && (
        <div className='mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      {/* Aktif Sınav */}
      {activeQuiz && (
        <Card className='mb-8'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-xl font-bold text-text'>{activeQuiz.title}</h3>
            <div className='flex items-center space-x-4'>
              <span className='text-sm text-gray-600'>
                Soru {currentQuestionIndex + 1} / {activeQuiz.totalQuestions}
              </span>
              {quizStartTime && (
                <span className='text-sm text-gray-600'>
                  Süre: {formatTime(elapsedTime)}
                </span>
              )}
            </div>
          </div>

          {activeQuiz.questions[currentQuestionIndex] && (
            <div className='space-y-4'>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h4 className='font-semibold text-lg mb-4'>
                  {activeQuiz.questions[currentQuestionIndex].question}
                </h4>
                
                {activeQuiz.questions[currentQuestionIndex].type === 'multiple_choice' && (
                  <div className='space-y-2'>
                    {activeQuiz.questions[currentQuestionIndex].options?.map((option, index) => (
                      <label key={index} className='flex items-center space-x-2 cursor-pointer'>
                        <input
                          type='radio'
                          name={`question-${activeQuiz.questions[currentQuestionIndex].id}`}
                          value={option}
                          checked={userAnswers[activeQuiz.questions[currentQuestionIndex].id] === option}
                          onChange={(e) => handleAnswer(activeQuiz.questions[currentQuestionIndex].id, e.target.value)}
                          className='text-blue-600'
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {activeQuiz.questions[currentQuestionIndex].type === 'true_false' && (
                  <div className='space-y-2'>
                    <label className='flex items-center space-x-2 cursor-pointer'>
                      <input
                        type='radio'
                        name={`question-${activeQuiz.questions[currentQuestionIndex].id}`}
                        value='true'
                        checked={userAnswers[activeQuiz.questions[currentQuestionIndex].id] === true}
                        onChange={() => handleAnswer(activeQuiz.questions[currentQuestionIndex].id, true)}
                        className='text-blue-600'
                      />
                      <span>Doğru</span>
                    </label>
                    <label className='flex items-center space-x-2 cursor-pointer'>
                      <input
                        type='radio'
                        name={`question-${activeQuiz.questions[currentQuestionIndex].id}`}
                        value='false'
                        checked={userAnswers[activeQuiz.questions[currentQuestionIndex].id] === false}
                        onChange={() => handleAnswer(activeQuiz.questions[currentQuestionIndex].id, false)}
                        className='text-blue-600'
                      />
                      <span>Yanlış</span>
                    </label>
                  </div>
                )}

                {activeQuiz.questions[currentQuestionIndex].type === 'open_ended' && (
                  <textarea
                    value={userAnswers[activeQuiz.questions[currentQuestionIndex].id] as string || ''}
                    onChange={(e) => handleAnswer(activeQuiz.questions[currentQuestionIndex].id, e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    rows={4}
                    placeholder='Cevabınızı buraya yazın...'
                  />
                )}
              </div>

              <div className='flex justify-between'>
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className='px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50'
                >
                  Önceki
                </button>
                
                <div className='flex space-x-2'>
                  <button
                    onClick={cancelQuiz}
                    className='px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors'
                  >
                    İptal Et
                  </button>
                  
                  {currentQuestionIndex === activeQuiz.totalQuestions - 1 ? (
                    <button
                      onClick={finishQuiz}
                      className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors'
                    >
                      Sınavı Bitir
                    </button>
                  ) : (
                    <button
                      onClick={nextQuestion}
                      className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
                    >
                      Sonraki
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Sınav Sonuçları */}
      {quizResults && (
        <Card className='mb-8'>
          <h3 className='text-xl font-bold text-text mb-4 text-center'>Sınav Sonuçları</h3>
          
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            <div className='text-center p-4 bg-blue-50 rounded-lg'>
              <div className='text-2xl font-bold text-blue-600'>{quizResults.score}%</div>
              <div className='text-sm text-gray-600'>Başarı Oranı</div>
            </div>
            <div className='text-center p-4 bg-green-50 rounded-lg'>
              <div className='text-2xl font-bold text-green-600'>{quizResults.correctAnswers}</div>
              <div className='text-sm text-gray-600'>Doğru Cevap</div>
            </div>
            <div className='text-center p-4 bg-red-50 rounded-lg'>
              <div className='text-2xl font-bold text-red-600'>{quizResults.wrongAnswers}</div>
              <div className='text-sm text-gray-600'>Yanlış Cevap</div>
            </div>
            <div className='text-center p-4 bg-yellow-50 rounded-lg'>
              <div className='text-2xl font-bold text-yellow-600'>{formatTime(quizResults.timeSpent)}</div>
              <div className='text-sm text-gray-600'>Geçen Süre</div>
            </div>
          </div>

          <div className='text-center'>
            <button
              onClick={() => setQuizResults(null)}
              className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
            >
              Tamam
            </button>
          </div>
        </Card>
      )}

      {/* Quiz Listesi */}
      <Card>
        <h2 className='text-3xl font-bold text-text mb-6 text-center border-b-2 border-primary pb-3'>
          Mevcut Quizler ({quizzes.length})
        </h2>
        
        {loading ? (
          <div className='text-center py-8'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
            <p className='mt-2 text-text-light'>Yükleniyor...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-text-light'>Henüz quiz bulunmuyor. Yeni bir quiz oluşturun!</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {quizzes.map((quiz) => (
              <div key={quiz.id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='font-bold text-lg text-text line-clamp-2'>{quiz.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty === 'easy' ? 'Kolay' : quiz.difficulty === 'medium' ? 'Orta' : 'Zor'}
                  </span>
                </div>
                
                <p className='text-sm text-gray-600 mb-2'>
                  {courses.find(c => c.id === quiz.courseId)?.name || 'Bilinmeyen Ders'}
                </p>
                
                <p className='text-sm text-gray-600 line-clamp-2 mb-3'>
                  {quiz.description}
                </p>
                
                <div className='flex justify-between text-sm text-gray-500 mb-3'>
                  <span>{quiz.totalQuestions} Soru</span>
                  <span>{quiz.timeLimit} Dakika</span>
                  <span>{new Date(quiz.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
                
                <button
                  onClick={() => startQuiz(quiz)}
                  className='w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
                >
                  Sınavı Başlat
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}