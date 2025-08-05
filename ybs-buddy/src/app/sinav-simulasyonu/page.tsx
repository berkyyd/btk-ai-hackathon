'use client'

import { useState, useEffect } from 'react'
import Card from '../../components/Card'
import { apiClient } from '../../utils/apiClient'
import { useAuth } from '../../contexts/AuthContext'
import LoginPrompt from '../../components/LoginPrompt'
import { getAllCourses, getCoursesByClassAndSemester, getClassAndSemesterOptions, CurriculumCourse } from '../../utils/curriculumUtils'

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
  questions: Question[] // Soru metinlerini ve doğru cevapları saklamak için
}



interface Note {
  id: string
  title: string
  content: string
  courseId: string
  classYear: number
  semester: string
  tags?: string[]
  isPublic: boolean
  likes: number
  favorites: number
  createdAt: string | Date
  updatedAt: string | Date
  userId?: string
  fileUrl?: string
  isPDF?: boolean
  extractedText?: string
  pageCount?: number
  fileSize?: number
  originalFileName?: string
  role?: 'student' | 'academician' | 'admin'
}

export default function SinavSimulasyonuPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])

  const [notes, setNotes] = useState<Note[]>([])
  const [curriculumCourses, setCurriculumCourses] = useState<CurriculumCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Quiz oluşturma
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creatingQuiz, setCreatingQuiz] = useState(false)
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    courseId: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    questionCount: 10,
    timeLimit: 30,
    examFormat: 'mixed' as 'test' | 'classic' | 'mixed'
  })

  // Müfredat filtreleri
  const [curriculumFilters, setCurriculumFilters] = useState({
    selectedClass: 1,
    selectedSemester: 'Güz',
    selectedCourse: ''
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
    
    if (selectedNotes.length === 0) {
      setError('Lütfen en az bir not seçin')
      return
    }
    
    try {
      setCreatingQuiz(true)
      
      // Seçilen notların içeriklerini al
      const selectedNoteContents = notes
        .filter(note => selectedNotes.includes(note.id))
        .map(note => ({
          id: note.id,
          title: note.title,
          content: note.content,
          courseId: note.courseId
        }))
      
      const response = await apiClient.generateQuiz({
        courseId: newQuiz.courseId,
        difficulty: newQuiz.difficulty,
        questionCount: newQuiz.questionCount,
        timeLimit: newQuiz.timeLimit,
        examFormat: newQuiz.examFormat,
        selectedNotes: selectedNoteContents // Seçilen notları gönder
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
        setActiveQuiz(quiz)
        setQuizStartTime(new Date()) // Sınav başlangıç zamanını set et
        setCurrentQuestionIndex(0)
        setUserAnswers({})
        setQuizResults(null)
        setElapsedTime(0)
        setShowCreateForm(false)
        setSelectedNotes([]) // Seçilen notları temizle
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
        setError(response.error || 'Quiz oluşturulamadı')
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
    if (!activeQuiz) {
      console.error('Cannot finish quiz: missing activeQuiz')
      return
    }
    
    if (!quizStartTime) {
      console.error('Cannot finish quiz: missing quizStartTime')
      return
    }

    const endTime = new Date()
    const timeSpent = Math.floor((endTime.getTime() - quizStartTime.getTime()) / 1000)
    
    let correctAnswers = 0
    const answers = activeQuiz.questions.map(question => {
      const userAnswer = userAnswers[question.id]
      
      const isCorrect = (() => {
        if (!userAnswer) return false;
        
        if (question.type === 'true_false') {
          // Boolean değerleri string'e çevir ve karşılaştır
          const userAnsStr = String(userAnswer).toLowerCase();
          const correctAnsStr = String(question.correctAnswer).toLowerCase();
          return userAnsStr === correctAnsStr;
        } else if (question.type === 'multiple_choice') {
          // Çoktan seçmeli sorularda harf eşleşmesi ara
          const userAnsStr = String(userAnswer).trim();
          const correctAnsStr = String(question.correctAnswer).trim();
          
          // Kullanıcı cevabından harfi çıkar (örn: "B) Metin" -> "B")
          const userLetter = userAnsStr.match(/^[A-D]\)/)?.[0]?.replace(')', '') || userAnsStr;
          const correctLetter = correctAnsStr.match(/^[A-D]\)/)?.[0]?.replace(')', '') || correctAnsStr;
          
          return userLetter === correctLetter;
        } else if (question.type === 'open_ended') {
          // Açık uçlu sorularda daha esnek karşılaştırma
          const userAnsStr = String(userAnswer).toLowerCase().trim();
          const correctAnsStr = String(question.correctAnswer).toLowerCase().trim();
          return userAnsStr === correctAnsStr;
        }
        return false; // Bilinmeyen soru tipi
      })();
      
      if (isCorrect) correctAnswers++
      
      return {
        questionId: question.id,
        userAnswer: userAnswer || '',
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
      answers,
      questions: activeQuiz.questions // Soru metinlerini ve doğru cevapları sakla
    }

    setQuizResults(result)
    setActiveQuiz(null)

    // Quiz sonucunu sunucuya kaydet
    if (user) {
      try {
        await apiClient.submitQuiz({
          userId: user.uid,
          quizId: result.quizId,
          score: result.score,
          totalPoints: result.totalQuestions,
          answers: result.answers,
          completedAt: result.completedAt,
          timeSpent: result.timeSpent,
          questions: activeQuiz.questions
        })
      } catch (error) {
        console.error('Quiz submit error:', error)
        // Hata olsa bile sınav sonucu gösterilmeye devam eder
      }
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


  // Müfredat derslerini yükle
  const loadCurriculumCourses = () => {
    const allCurriculumCourses = getAllCourses()
    setCurriculumCourses(allCurriculumCourses)
  }

  // Notları yükle
  const loadNotes = async () => {
    try {
      const response = await apiClient.getNotes()
      if (response.success && response.data) {
        const apiData = response.data as any;
        // Eğer data bir array değilse, data.data'yı kontrol et
        if (Array.isArray(apiData)) {
          setNotes(apiData)
        } else if (apiData.data && Array.isArray(apiData.data)) {
          setNotes(apiData.data)
        } else {
          setNotes([])
        }
      }
    } catch (error) {
      console.error('Notes load error:', error)
      setNotes([]) // Hata durumunda boş array
    }
  }

  // İlk yükleme
  useEffect(() => {
    loadCurriculumCourses()
    loadNotes()
    setLoading(false)
    
    // URL parametrelerini kontrol et
    const urlParams = new URLSearchParams(window.location.search)
    const classParam = urlParams.get('class')
    const semesterParam = urlParams.get('semester')
    const courseParam = urlParams.get('course')
    
    if (classParam || semesterParam || courseParam) {
      // URL parametrelerini filtreye uygula
      if (classParam) {
        setCurriculumFilters(prev => ({ ...prev, selectedClass: parseInt(classParam) }))
      }
      if (semesterParam) {
        const semesterOptions = getClassAndSemesterOptions()
        const matchingSemester = semesterOptions.find(option => 
          option.class === (classParam ? parseInt(classParam) : 1) && 
          option.semester.toLowerCase().includes(semesterParam.toLowerCase())
        )
        if (matchingSemester) {
          setCurriculumFilters(prev => ({ ...prev, selectedSemester: matchingSemester.semester }))
        }
      }
      if (courseParam) {
        setCurriculumFilters(prev => ({ ...prev, selectedCourse: courseParam }))
        // Seçilen dersi quiz formuna uygula
        const selectedCourse = getCoursesByClassAndSemester(
          classParam ? parseInt(classParam) : 1, 
                        semesterParam || 'Güz'
        ).find(course => course.code === courseParam)
        
        if (selectedCourse) {
          setNewQuiz(prev => ({
            ...prev,
            title: `${selectedCourse.name} Quiz`,
            courseId: selectedCourse.code
          }))
        }
      }
    }
  }, [])

  // Ders seçimi değiştiğinde notları filtrele
  useEffect(() => {
    if (newQuiz.courseId && Array.isArray(notes)) {
      // Önce akademisyen notlarını bul (admin notları hariç)
      const academicianNotes = notes.filter(note => 
        note.courseId === newQuiz.courseId && note.role === 'academician'
      )
      
      // Akademisyen notu varsa onları göster, ama favori notları da ekle
      if (academicianNotes.length > 0) {
        // Akademisyen notları + kullanıcının favori notları (aynı ders için)
        const userFavoriteNotes = notes.filter(note => 
          note.courseId === newQuiz.courseId && 
          note.userId === user?.uid && 
          (note.role === 'student' || note.role === 'admin') // Öğrenci ve admin notları
        )
        
        // Akademisyen notları + favori öğrenci/admin notları
        const allAvailableNotes = [...academicianNotes, ...userFavoriteNotes]
        setFilteredNotes(allAvailableNotes)
      } else {
        // Akademisyen notu yoksa herkese açık notlar ve kullanıcının kendi notlarını göster
        const availableNotes = notes.filter(note => 
          note.courseId === newQuiz.courseId && 
          (note.isPublic || note.userId === user?.uid)
        )
        setFilteredNotes(availableNotes)
      }
      
      // Ders değiştiğinde seçili notları temizle
      setSelectedNotes([])
    } else {
      setFilteredNotes([])
      setSelectedNotes([])
    }
  }, [newQuiz.courseId, notes, user?.uid])

  // Müfredat filtresi değişikliği
  const handleCurriculumFilterChange = (key: string, value: any) => {
    const newCurriculumFilters = {
      ...curriculumFilters,
      [key]: value
    }
    
    setCurriculumFilters(newCurriculumFilters)
    
    // Seçilen müfredat dersini otomatik olarak quiz formuna uygula
    if (key === 'selectedCourse' && value) {
      const selectedCourse = getCoursesByClassAndSemester(newCurriculumFilters.selectedClass, newCurriculumFilters.selectedSemester)
        .find(course => course.code === value)
      if (selectedCourse) {
        setNewQuiz(prev => ({
          ...prev,
          title: `${selectedCourse.name} Quiz`,
          courseId: selectedCourse.code
        }))
      }
    }
  }

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

  // Giriş kontrolü
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-text-secondary">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPrompt
        title="Sınav Simülasyonu Sayfasına Erişim"
        description="Sınav simülasyonları oluşturmak ve gerçek sınav deneyimi yaşamak için giriş yapmanız gerekiyor."
        features={[
          "Kişiselleştirilmiş sınav oluşturma",
          "Not bazlı soru üretimi",
          "Gerçek zamanlı sınav deneyimi",
          "Detaylı sonuç analizi",
          "Geçmiş sınav raporları"
        ]}
      />
    );
  }

  return (
    <div className='py-8 min-h-screen'>
      <section className='text-center mb-16 animate-fadeIn'>
        <h1 className='text-5xl font-extrabold text-text-primary leading-tight mb-4'>
          Sınav Simülasyonu
        </h1>
        <p className='text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed'>
          Gerçek sınav deneyimi yaşayın ve bilgilerinizi test edin.
        </p>
      </section>

      {/* Quiz Oluşturma Formu */}
      {user && (
        <Card className='mb-8 card-glass'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-xl font-bold text-text-primary'>Quiz Oluştur</h3>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className='px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors border border-primary-500/30'
            >
              {showCreateForm ? 'İptal' : 'Yeni Quiz'}
            </button>
          </div>

          {showCreateForm && (
          <form onSubmit={handleCreateQuiz} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <label className='block text-sm font-medium text-text-secondary mb-2'>Sınıf</label>
                <select
                  value={curriculumFilters.selectedClass}
                  onChange={(e) => handleCurriculumFilterChange('selectedClass', parseInt(e.target.value))}
                  className='w-full px-3 py-2 border border-primary-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary'
                >
                  <option value={1}>1. Sınıf</option>
                  <option value={2}>2. Sınıf</option>
                  <option value={3}>3. Sınıf</option>
                  <option value={4}>4. Sınıf</option>
                </select>
              </div>
              
              <div>
                <label className='block text-sm font-medium text-text-secondary mb-2'>Dönem</label>
                <select
                  value={curriculumFilters.selectedSemester}
                  onChange={(e) => handleCurriculumFilterChange('selectedSemester', e.target.value)}
                  className='w-full px-3 py-2 border border-primary-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary'
                >
                  {getClassAndSemesterOptions()
                    .filter(option => option.class === curriculumFilters.selectedClass)
                    .map(option => (
                      <option key={option.label} value={option.semester}>
                        {option.semester.includes('Güz') ? 'Güz' : 'Bahar'}
                      </option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className='block text-sm font-medium text-text-secondary mb-2'>Ders</label>
                <select
                  value={curriculumFilters.selectedCourse}
                  onChange={(e) => {
                    handleCurriculumFilterChange('selectedCourse', e.target.value)
                    // Seçilen müfredat dersini quiz'e uygula
                    if (e.target.value) {
                      const selectedCourse = getCoursesByClassAndSemester(curriculumFilters.selectedClass, curriculumFilters.selectedSemester)
                        .find(course => course.code === e.target.value)
                      if (selectedCourse) {
                        setNewQuiz(prev => ({
                          ...prev,
                          title: `${selectedCourse.name} Quiz`,
                          courseId: selectedCourse.code
                        }))
                      }
                    }
                  }}
                  className='w-full px-3 py-2 border border-primary-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary'
                >
                  <option value=''>Ders Seçin</option>
                  {getCoursesByClassAndSemester(curriculumFilters.selectedClass, curriculumFilters.selectedSemester).map(course => (
                    <option key={course.code} value={course.code}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              

            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-text-secondary mb-2'>Quiz Başlığı</label>
                <input
                  type='text'
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                  className='w-full px-3 py-2 border border-primary-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary'
                  placeholder='Örn: Veri Tabanı Final Sınavı'
                  required
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-text-secondary mb-2'>Zorluk Seviyesi</label>
                <select
                  value={newQuiz.difficulty}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className='w-full px-3 py-2 border border-primary-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary'
                >
                  <option value='easy'>Kolay</option>
                  <option value='medium'>Orta</option>
                  <option value='hard'>Zor</option>
                </select>
              </div>
              
              <div>
                <label className='block text-sm font-medium text-text-secondary mb-2'>Soru Sayısı</label>
                <input
                  type='number'
                  value={newQuiz.questionCount || ''}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 10 }))}
                  className='w-full px-3 py-2 border border-primary-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary'
                  min='5'
                  max='50'
                  required
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-text-secondary mb-2'>Süre (Dakika)</label>
                <input
                  type='number'
                  value={newQuiz.timeLimit || ''}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                  className='w-full px-3 py-2 border border-primary-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary'
                  min='5'
                  max='120'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-text-secondary mb-2'>Sınav Türü</label>
                <select
                  value={newQuiz.examFormat}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, examFormat: e.target.value as any }))}
                  className='w-full px-3 py-2 border border-primary-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary'
                  required
                >
                  <option value='test'>Test (Çoktan Seçmeli)</option>
                  <option value='classic'>Klasik (Açık Uçlu)</option>
                  <option value='mixed'>Karışık (Test, Klasik, D/Y, Boşluk Doldurma)</option>
                </select>
              </div>
            </div>
            
            {/* Not Seçimi */}
            <div>
              <label className='block text-sm font-medium text-text-secondary mb-2'>
                Not Seçimi {(() => {
                  const academicianNotes = filteredNotes.filter(note => note.role === 'academician')
                  const studentNotes = filteredNotes.filter(note => note.role === 'student' || note.role === 'admin')
                  if (academicianNotes.length > 0) {
                    return `(Akademisyen Notları + Favori Öğrenci Notları - ${academicianNotes.length} akademisyen, ${studentNotes.length} öğrenci)`
                  } else {
                    return '(Herkese Açık ve Kişisel Notlar)'
                  }
                })()}
              </label>
              <div className='max-h-60 overflow-y-auto border border-primary-700/30 rounded-md p-2 bg-card-light'>
                {!newQuiz.courseId ? (
                  <p className='text-text-muted text-sm'>Önce bir ders seçin</p>
                ) : !Array.isArray(filteredNotes) || filteredNotes.length === 0 ? (
                  <p className='text-text-muted text-sm'>Bu derse ait not bulunmuyor.</p>
                ) : (
                  <div className='space-y-2'>
                    {filteredNotes.map((note) => (
                      <label key={note.id} className={`flex items-center space-x-2 cursor-pointer hover:bg-primary-900/20 p-2 rounded transition-colors ${
                        note.role === 'academician' ? 'bg-primary-900/20 border border-primary-700/30' : ''
                      }`}>
                        <input
                          type='checkbox'
                          checked={selectedNotes.includes(note.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedNotes(prev => [...prev, note.id])
                            } else {
                              setSelectedNotes(prev => prev.filter(id => id !== note.id))
                            }
                          }}
                          className='rounded border-primary-700/30 text-primary-600 focus:ring-primary-500 bg-card-light'
                        />
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <div className='font-medium text-sm text-text-primary'>{note.title}</div>
                            {note.role === 'academician' && (
                              <span className='text-xs bg-primary-900/30 text-primary-300 px-2 py-1 rounded border border-primary-700/30'>
                                🎓 Akademisyen
                              </span>
                            )}
                            {(note.role === 'student' || note.role === 'admin') && (
                              <span className='text-xs bg-secondary-900/30 text-secondary-300 px-2 py-1 rounded border border-secondary-700/30'>
                                👨‍🎓 Favori Öğrenci Notu
                              </span>
                            )}
                          </div>
                          <div className='text-xs text-text-muted'>
                            {curriculumCourses.find(c => c.code === note.courseId)?.name || 'Bilinmeyen Ders'} - 
                            {note.classYear}. Sınıf {note.semester}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {selectedNotes.length > 0 && (
                <p className='text-sm text-primary-400 mt-2'>
                  {selectedNotes.length} not seçildi
                </p>
              )}
            </div>
            
            <div>
              <label className='block text-sm font-medium text-text-secondary mb-2'>Açıklama</label>
              <textarea
                value={newQuiz.description}
                onChange={(e) => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
                className='w-full px-3 py-2 border border-primary-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary'
                rows={3}
                placeholder='Quiz hakkında açıklama...'
              />
            </div>
            
            <div className='flex justify-end space-x-4'>
              <button
                type='button'
                onClick={() => setShowCreateForm(false)}
                className='px-4 py-2 border border-primary-700/30 text-text-secondary rounded-md hover:bg-primary-900/20 transition-colors'
              >
                İptal
              </button>
              <button
                type='submit'
                disabled={creatingQuiz}
                className='px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors disabled:opacity-50 border border-secondary-500/30'
              >
                {creatingQuiz ? 'Oluşturuluyor...' : 'Quiz Oluştur'}
              </button>
            </div>
          </form>
        )}
      </Card>
    )}

      
      {error && (
        <div className='mb-8 bg-red-900/20 border border-red-700/30 text-red-300 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      {/* Aktif Sınav */}
      {activeQuiz && (
        <Card className='mb-8 card-glass'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-xl font-bold text-text-primary'>{activeQuiz.title}</h3>
            <div className='flex items-center space-x-4'>
              <span className='text-sm text-text-secondary'>
                Soru {currentQuestionIndex + 1} / {activeQuiz.totalQuestions}
              </span>
              {quizStartTime && (
                <span className='text-sm text-text-secondary'>
                  Süre: {formatTime(elapsedTime)}
                </span>
              )}
            </div>
          </div>

          {activeQuiz.questions[currentQuestionIndex] && (
            <div className='space-y-4'>
              <div className='bg-primary-900/10 p-4 rounded-lg border border-primary-700/30'>
                <h4 className='font-semibold text-lg mb-4 text-text-primary'>
                  {activeQuiz.questions[currentQuestionIndex]?.question || 'Soru yükleniyor...'}
                </h4>
                
                {activeQuiz.questions[currentQuestionIndex]?.type === 'multiple_choice' && (
                  <div className='space-y-2'>
                    {activeQuiz.questions[currentQuestionIndex]?.options?.map((option, index) => (
                      <label key={index} className='flex items-center space-x-2 cursor-pointer'>
                        <input
                          type='radio'
                          name={`question-${activeQuiz.questions[currentQuestionIndex]?.id}`}
                          value={option}
                          checked={userAnswers[activeQuiz.questions[currentQuestionIndex]?.id || ''] === option}
                          onChange={(e) => handleAnswer(activeQuiz.questions[currentQuestionIndex]?.id || '', e.target.value)}
                          className='text-blue-600'
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {activeQuiz.questions[currentQuestionIndex]?.type === 'true_false' && (
                  <div className='space-y-2'>
                    <label className='flex items-center space-x-2 cursor-pointer'>
                      <input
                        type='radio'
                        name={`question-${activeQuiz.questions[currentQuestionIndex]?.id}`}
                        value='true'
                        checked={userAnswers[activeQuiz.questions[currentQuestionIndex]?.id || ''] === true}
                        onChange={() => handleAnswer(activeQuiz.questions[currentQuestionIndex]?.id || '', true)}
                        className='text-blue-600'
                      />
                      <span>Doğru</span>
                    </label>
                    <label className='flex items-center space-x-2 cursor-pointer'>
                      <input
                        type='radio'
                        name={`question-${activeQuiz.questions[currentQuestionIndex]?.id}`}
                        value='false'
                        checked={userAnswers[activeQuiz.questions[currentQuestionIndex]?.id || ''] === false}
                        onChange={() => handleAnswer(activeQuiz.questions[currentQuestionIndex]?.id || '', false)}
                        className='text-blue-600'
                      />
                      <span>Yanlış</span>
                    </label>
                  </div>
                )}

                {activeQuiz.questions[currentQuestionIndex]?.type === 'open_ended' && (
                  <textarea
                    value={userAnswers[activeQuiz.questions[currentQuestionIndex]?.id || ''] as string || ''}
                    onChange={(e) => handleAnswer(activeQuiz.questions[currentQuestionIndex]?.id || '', e.target.value)}
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
                      onClick={() => {
                        finishQuiz()
                      }}
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
      <Card className="card-glass">
        <h2 className='text-3xl font-bold text-text-primary mb-6 text-center border-b-2 border-primary-500 pb-3'>
          Mevcut Quizler ({quizzes.length})
        </h2>
        
        {loading ? (
          <div className='text-center py-8'>
            <div className='loading-spinner'></div>
            <p className='mt-2 text-text-secondary'>Yükleniyor...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-text-secondary'>Henüz quiz bulunmuyor. Yeni bir quiz oluşturun!</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {quizzes.map((quiz) => (
              <div key={quiz.id} className='card-glass border border-primary-700/30 rounded-lg p-4 hover:shadow-glow-blue transition-all duration-400'>
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='font-bold text-lg text-text-primary line-clamp-2'>{quiz.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded border ${
                    quiz.difficulty === 'easy' ? 'bg-green-900/30 text-green-300 border-green-700/30' :
                    quiz.difficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700/30' :
                    'bg-red-900/30 text-red-300 border-red-700/30'
                  }`}>
                    {quiz.difficulty === 'easy' ? 'Kolay' : quiz.difficulty === 'medium' ? 'Orta' : 'Zor'}
                  </span>
                </div>
                
                <p className='text-sm text-text-secondary mb-2'>
                  {curriculumCourses.find(c => c.code === quiz.courseId)?.name || 'Bilinmeyen Ders'}
                </p>
                
                <p className='text-sm text-text-secondary line-clamp-2 mb-3'>
                  {quiz.description}
                </p>
                
                <div className='flex justify-between text-sm text-text-muted mb-3'>
                  <span>{quiz.totalQuestions} Soru</span>
                  <span>{quiz.timeLimit} Dakika</span>
                  <span>{new Date(quiz.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
                
                <button
                  onClick={() => startQuiz(quiz)}
                  className='w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors border border-primary-500/30'
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