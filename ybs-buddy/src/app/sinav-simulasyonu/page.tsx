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
      <div style={{ marginTop: '72px' }}>
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
      </div>
    );
  }

  return (
    <div className='py-8 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50' style={{ marginTop: '72px' }}>
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
         <Card className='mb-8 card-glass max-w-4xl mx-auto border-2 border-primary-700/30'>
          <div className='flex justify-between items-center mb-6'>
            <div>
              <h3 className='text-2xl font-bold text-text-primary'>📝 Quiz Oluştur</h3>
              <p className='text-text-secondary text-sm'>Notlarınızdan yapay zeka ile özel sınav oluşturun</p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className='px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 border border-primary-500/30 shadow-lg hover:shadow-xl'
            >
              {showCreateForm ? '✕ İptal' : '➕ Yeni Quiz'}
            </button>
          </div>

          {showCreateForm && (
          <form onSubmit={handleCreateQuiz} className='space-y-6'>
            {/* Ders Seçimi - Kompakt */}
            <div className='bg-primary-900/10 p-4 rounded-lg border border-primary-700/30'>
              <h4 className='font-semibold text-lg mb-4 text-text-primary flex items-center'>
                🎓 Ders Seçimi
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
            </div>

            {/* Quiz Ayarları - Kompakt */}
            <div className='bg-secondary-900/10 p-4 rounded-lg border border-secondary-700/30'>
              <h4 className='font-semibold text-lg mb-4 text-text-primary flex items-center'>
                ⚙️ Quiz Ayarları
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
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
                    <option value='easy'>🟢 Kolay</option>
                    <option value='medium'>🟡 Orta</option>
                    <option value='hard'>🔴 Zor</option>
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
                    <option value='test'>📝 Test (Çoktan Seçmeli)</option>
                    <option value='classic'>✍️ Klasik (Açık Uçlu)</option>
                    <option value='mixed'>🎯 Karışık (Test, Klasik, D/Y, Boşluk)</option>
                </select>
                </div>
              </div>
            </div>
            
            {/* Not Seçimi - İyileştirilmiş */}
            <div className='bg-accent-900/10 p-4 rounded-lg border border-accent-700/30'>
              <h4 className='font-semibold text-lg mb-4 text-text-primary flex items-center'>
                📚 Not Seçimi
                <span className='ml-2 text-sm font-normal text-text-secondary'>
                  {(() => {
                  const academicianNotes = filteredNotes.filter(note => note.role === 'academician')
                  const studentNotes = filteredNotes.filter(note => note.role === 'student' || note.role === 'admin')
                  if (academicianNotes.length > 0) {
                      return `(${academicianNotes.length} akademisyen, ${studentNotes.length} öğrenci notu)`
                  } else {
                      return '(Herkese açık ve kişisel notlar)'
                  }
                })()}
                </span>
              </h4>
              
              <div className='max-h-80 overflow-y-auto border border-accent-700/30 rounded-lg p-3 bg-card-light'>
                {!newQuiz.courseId ? (
                  <div className='text-center py-8'>
                    <div className='text-4xl mb-2'>📖</div>
                    <p className='text-text-secondary'>Önce bir ders seçin</p>
                  </div>
                ) : !Array.isArray(filteredNotes) || filteredNotes.length === 0 ? (
                  <div className='text-center py-8'>
                    <div className='text-4xl mb-2'>📝</div>
                    <p className='text-text-secondary'>Bu derse ait not bulunmuyor</p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {filteredNotes.map((note) => (
                      <label key={note.id} className={`flex items-start space-x-3 cursor-pointer hover:bg-accent-900/10 p-3 rounded-lg transition-all duration-200 border ${
                        note.role === 'academician' ? 'bg-primary-900/20 border-primary-700/30' : 'border-accent-700/20'
                      } ${selectedNotes.includes(note.id) ? 'ring-2 ring-accent-500' : ''}`}>
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
                          className='mt-1 rounded border-accent-700/30 text-accent-600 focus:ring-accent-500 bg-card-light'
                        />
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 mb-1'>
                            <div className='font-medium text-sm text-text-primary truncate'>{note.title}</div>
                            {note.role === 'academician' && (
                              <span className='text-xs bg-primary-900/30 text-primary-300 px-2 py-1 rounded-full border border-primary-700/30 flex-shrink-0'>
                                🎓 Akademisyen
                              </span>
                            )}
                            {(note.role === 'student' || note.role === 'admin') && (
                              <span className='text-xs bg-secondary-900/30 text-secondary-300 px-2 py-1 rounded-full border border-secondary-700/30 flex-shrink-0'>
                                👨‍🎓 Öğrenci
                              </span>
                            )}
                          </div>
                          <div className='text-xs text-text-muted flex items-center gap-2'>
                            <span>{curriculumCourses.find(c => c.code === note.courseId)?.name || 'Bilinmeyen Ders'}</span>
                            <span>•</span>
                            <span>{note.classYear}. Sınıf {note.semester}</span>
                            {note.fileSize && (
                              <>
                                <span>•</span>
                                <span>{(note.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                              </>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedNotes.length > 0 && (
                <div className='mt-3 p-3 bg-accent-900/20 rounded-lg border border-accent-700/30'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-accent-300'>
                      ✅ {selectedNotes.length} not seçildi
                    </span>
                    <button
                      type='button'
                      onClick={() => setSelectedNotes([])}
                      className='text-xs text-accent-400 hover:text-accent-300 transition-colors'
                    >
                      Temizle
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Açıklama ve Butonlar */}
            <div className='bg-gradient-900/10 p-4 rounded-lg border border-gradient-700/30'>
              <h4 className='font-semibold text-lg mb-4 text-text-primary flex items-center'>
                📝 Açıklama
              </h4>
              <textarea
                value={newQuiz.description}
                onChange={(e) => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
                className='w-full px-4 py-3 border border-gradient-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gradient-500 bg-card-light text-text-primary resize-none'
                rows={3}
                placeholder='Quiz hakkında açıklama ekleyin (isteğe bağlı)...'
              />
            </div>
            
            <div className='flex justify-end space-x-4 pt-4'>
              <button
                type='button'
                onClick={() => setShowCreateForm(false)}
                className='px-6 py-3 border border-primary-700/30 text-text-secondary rounded-lg hover:bg-primary-900/20 transition-all duration-200 hover:border-primary-600'
              >
                ✕ İptal
              </button>
              <button
                type='submit'
                 disabled={creatingQuiz || selectedNotes.length === 0}
                 className='px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50 border border-green-500/30 shadow-lg hover:shadow-xl flex items-center gap-2'
               >
                 {creatingQuiz ? (
                   <>
                     <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                     Oluşturuluyor...
                   </>
                 ) : (
                   <>
                     <span>🚀</span>
                     Quiz Oluştur
                   </>
                 )}
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

      {/* Aktif Sınav - Modal Tasarım */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-5xl w-full mx-4 relative flex flex-col max-h-[95vh] border border-white/20">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200/60 sticky top-0 bg-white/80 backdrop-blur-sm z-10 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">📝</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 line-clamp-2">
                    {activeQuiz.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {curriculumCourses.find(c => c.code === activeQuiz.courseId)?.name || 'Bilinmeyen Ders'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                      <span className="text-blue-700 font-medium">Soru {currentQuestionIndex + 1} / {activeQuiz.totalQuestions}</span>
                    </div>
                    {quizStartTime && (
                      <div className="bg-green-100 px-3 py-1 rounded-full border border-green-200">
                        <span className="text-green-700 font-medium">⏱️ {formatTime(elapsedTime)}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className={`px-3 py-1 text-xs rounded-full border font-medium ${
                      activeQuiz.difficulty === 'easy' ? 'bg-green-100 text-green-700 border-green-200' :
                      activeQuiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {activeQuiz.difficulty === 'easy' ? '🟢 Kolay' : activeQuiz.difficulty === 'medium' ? '🟡 Orta' : '🔴 Zor'}
                    </span>
                  </div>
                </div>
                
                <button 
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-300" 
                  onClick={cancelQuiz}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {activeQuiz.questions[currentQuestionIndex] && (
                <div className="space-y-6">
                  {/* Soru Başlığı */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">{currentQuestionIndex + 1}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Soru</h3>
                  </div>
                  
                  {/* Soru Metni */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200/60 rounded-2xl p-6">
                    <p className="text-lg text-gray-800 leading-relaxed">
                      {activeQuiz.questions[currentQuestionIndex]?.question || 'Soru yükleniyor...'}
                    </p>
                  </div>
                  
                  {/* Cevap Seçenekleri */}
                  {activeQuiz.questions[currentQuestionIndex]?.type === 'multiple_choice' && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 mb-4">Cevap seçeneklerinden birini seçin:</h4>
                      <div className="grid gap-3">
                        {activeQuiz.questions[currentQuestionIndex]?.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-4 cursor-pointer p-4 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 bg-white">
                            <input
                              type="radio"
                              name={`question-${activeQuiz.questions[currentQuestionIndex]?.id}`}
                              value={option}
                              checked={userAnswers[activeQuiz.questions[currentQuestionIndex]?.id || ''] === option}
                              onChange={(e) => handleAnswer(activeQuiz.questions[currentQuestionIndex]?.id || '', e.target.value)}
                              className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-gray-800 font-medium">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeQuiz.questions[currentQuestionIndex]?.type === 'true_false' && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 mb-4">Doğru mu yanlış mı?</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center space-x-4 cursor-pointer p-4 rounded-xl border border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200 bg-white">
                          <input
                            type="radio"
                            name={`question-${activeQuiz.questions[currentQuestionIndex]?.id}`}
                            value="true"
                            checked={userAnswers[activeQuiz.questions[currentQuestionIndex]?.id || ''] === true}
                            onChange={() => handleAnswer(activeQuiz.questions[currentQuestionIndex]?.id || '', true)}
                            className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
                          />
                          <span className="text-gray-800 font-medium">✅ Doğru</span>
                        </label>
                        <label className="flex items-center space-x-4 cursor-pointer p-4 rounded-xl border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 bg-white">
                          <input
                            type="radio"
                            name={`question-${activeQuiz.questions[currentQuestionIndex]?.id}`}
                            value="false"
                            checked={userAnswers[activeQuiz.questions[currentQuestionIndex]?.id || ''] === false}
                            onChange={() => handleAnswer(activeQuiz.questions[currentQuestionIndex]?.id || '', false)}
                            className="w-5 h-5 text-red-600 border-gray-300 focus:ring-red-500"
                          />
                          <span className="text-gray-800 font-medium">❌ Yanlış</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {activeQuiz.questions[currentQuestionIndex]?.type === 'open_ended' && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 mb-4">Cevabınızı yazın:</h4>
                      <textarea
                        value={userAnswers[activeQuiz.questions[currentQuestionIndex]?.id || ''] as string || ''}
                        onChange={(e) => handleAnswer(activeQuiz.questions[currentQuestionIndex]?.id || '', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 resize-none"
                        rows={6}
                        placeholder="Cevabınızı buraya detaylı bir şekilde yazın..."
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex gap-3 border-t border-gray-200/60 px-8 py-6 bg-white/80 backdrop-blur-sm sticky bottom-0 rounded-b-3xl">
              <button
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                ← Önceki
              </button>
              
              <button
                onClick={cancelQuiz}
                className="flex-1 bg-red-100 text-red-700 font-semibold py-3 px-6 rounded-xl hover:bg-red-200 transition-all duration-300 border border-red-200 flex items-center justify-center gap-2"
              >
                🚫 İptal Et
              </button>
              
              {currentQuestionIndex === activeQuiz.totalQuestions - 1 ? (
                <button
                  onClick={() => finishQuiz()}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 border border-green-500/30 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  ✅ Sınavı Bitir
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 border border-blue-500/30 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Sonraki →
                </button>
              )}
            </div>
          </div>
        </div>
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

      {/* Quiz Listesi - İyileştirilmiş */}
      <Card className="card-glass max-w-6xl mx-auto border-2 border-primary-700/30">
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-bold text-text-primary mb-2'>
            📚 Mevcut Quizler
        </h2>
          <p className='text-text-secondary'>
            Oluşturduğunuz sınavlar ve geçmiş quizleriniz
          </p>
          <div className='mt-4 inline-flex items-center gap-2 bg-primary-900/20 px-4 py-2 rounded-full border border-primary-700/30'>
            <span className='text-primary-300 font-medium'>{quizzes.length}</span>
            <span className='text-text-secondary text-sm'>quiz bulundu</span>
          </div>
        </div>
        
        {loading ? (
          <div className='text-center py-12'>
            <div className='loading-spinner mb-4'></div>
            <p className='text-text-secondary'>Quizler yükleniyor...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className='text-center py-12'>
            <div className='text-6xl mb-4'>📝</div>
            <h3 className='text-xl font-semibold text-text-primary mb-2'>Henüz Quiz Yok</h3>
            <p className='text-text-secondary mb-6'>İlk quizinizi oluşturmak için yukarıdaki "Yeni Quiz" butonunu kullanın</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className='px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 border border-primary-500/30 shadow-lg hover:shadow-xl'
            >
              ➕ İlk Quizimi Oluştur
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {quizzes.map((quiz) => (
              <div key={quiz.id} className='card-glass border border-primary-700/30 rounded-xl p-6 hover:shadow-glow-blue transition-all duration-400 hover:scale-[1.02]'>
                <div className='flex justify-between items-start mb-4'>
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-bold text-lg text-text-primary line-clamp-2 mb-2'>{quiz.title}</h3>
                    <p className='text-sm text-text-secondary mb-3'>
                      {curriculumCourses.find(c => c.code === quiz.courseId)?.name || 'Bilinmeyen Ders'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full border flex-shrink-0 ${
                    quiz.difficulty === 'easy' ? 'bg-green-900/30 text-green-300 border-green-700/30' :
                    quiz.difficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700/30' :
                    'bg-red-900/30 text-red-300 border-red-700/30'
                  }`}>
                    {quiz.difficulty === 'easy' ? '🟢 Kolay' : quiz.difficulty === 'medium' ? '🟡 Orta' : '🔴 Zor'}
                  </span>
                </div>
                
                {quiz.description && (
                  <p className='text-sm text-text-secondary line-clamp-2 mb-4'>
                  {quiz.description}
                </p>
                )}
                
                <div className='grid grid-cols-3 gap-2 mb-4 text-xs'>
                  <div className='text-center p-2 bg-primary-900/20 rounded-lg border border-primary-700/20'>
                    <div className='font-semibold text-primary-300'>{quiz.totalQuestions}</div>
                    <div className='text-text-muted'>Soru</div>
                  </div>
                  <div className='text-center p-2 bg-secondary-900/20 rounded-lg border border-secondary-700/20'>
                    <div className='font-semibold text-secondary-300'>{quiz.timeLimit}</div>
                    <div className='text-text-muted'>Dakika</div>
                  </div>
                  <div className='text-center p-2 bg-accent-900/20 rounded-lg border border-accent-700/20'>
                    <div className='font-semibold text-accent-300'>
                      {new Date(quiz.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                    </div>
                    <div className='text-text-muted'>Tarih</div>
                  </div>
                </div>
                
                <button
                  onClick={() => startQuiz(quiz)}
                    className='w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 border border-green-500/30 shadow-lg hover:shadow-xl'
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