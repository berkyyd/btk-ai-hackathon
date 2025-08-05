'use client'

import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react'
import Card from '../../components/Card'
import { apiClient } from '../../utils/apiClient'
import { Note } from '../../types/note'
import { Course } from '../../types/course'
import FileUpload from '../../components/FileUpload'
import { SUMMARY_PROMPTS } from '../../utils/summaryPrompts';
import SummaryModal from '../../components/SummaryModal';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import LoginPrompt from '../../components/LoginPrompt'
import { getAllCourses, getCoursesByClassAndSemester, getClassAndSemesterOptions, CurriculumCourse } from '../../utils/curriculumUtils'
import { downloadNoteAsPDF } from '../../utils/pdfUtils'

export default function DersNotlariPage() {
  const { user, role, loading: authLoading } = useAuth();
  const [allNotes, setAllNotes] = useState<Note[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [curriculumCourses, setCurriculumCourses] = useState<CurriculumCourse[]>([])
  const [users, setUsers] = useState<{[key: string]: {displayName: string}}>({})
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [error, setError] = useState('')

  // Filtreler
  const [filters, setFilters] = useState({
    classYear: '',
    semester: '',
    courseId: '',
    search: '',
    role: '' // Akademisyen-öğrenci filtresi
  })

  // Müfredat filtreleri
  const [curriculumFilters, setCurriculumFilters] = useState({
    selectedClass: 1,
    selectedSemester: 'Güz',
    selectedCourse: ''
  })

  // Yeni not ekleme
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    courseId: '',
    class: 1,
    semester: 'Güz',
    tags: [] as string[],
    role: role || 'student', // Kullanıcının rolünü kullan
    isPublic: true, // Varsayılan olarak herkese açık
  })

  // PDF yükleme state'i
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState('')

  // Not detayları modal state'i
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  
  // Not düzenleme state'i
  const [isEditing, setIsEditing] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  // Notlar-Özetlerim toggle state'i
  const [showMySummaries, setShowMySummaries] = useState(false)
  
  // Favoriler state'i
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFavorites, setShowFavorites] = useState(false)

  // Notları yükle
  const loadNotes = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await apiClient.getNotes()
      
      if (response.success) {
        const apiData: any = response.data;
        if (apiData && apiData.data) {
          const notesWithClass = apiData.data.map((note: any) => ({
            ...note,
            class: note.class || 1,
            semester: note.semester || 'Güz',
            role: note.role || 'student' // Varsayılan rol olarak 'student' ayarla
          }));
          setAllNotes(notesWithClass)
          
          // Notlardaki kullanıcı ID'lerini topla ve kullanıcı bilgilerini yükle
          const userIds = [...new Set(notesWithClass.map(note => note.userId).filter(id => id))];
          if (userIds.length > 0) {
            await loadUsers(userIds);
          }
        } else {
          setAllNotes([])
        }
      } else {
        setError(response.error || 'Notlar yüklenirken bir hata oluştu')
      }
    } catch (err) {
      setError('Bağlantı hatası')
    } finally {
      setLoading(false)
    }
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

  // Müfredat derslerini yükle
  const loadCurriculumCourses = () => {
    const allCurriculumCourses = getAllCourses()
    setCurriculumCourses(allCurriculumCourses)
  }

  // Kullanıcı bilgilerini yükle
  const loadUsers = async (userIds: string[]) => {
    try {
      setUsersLoading(true)
      const uniqueUserIds = [...new Set(userIds)].filter(id => id && id !== 'anonymous')
      const usersData: {[key: string]: {displayName: string}} = {}
      
      // Anonim kullanıcı için varsayılan değer
      usersData['anonymous'] = { displayName: 'Anonim Kullanıcı' }
      
      // Mevcut kullanıcı verilerini koru
      setUsers(prev => ({ ...prev, ...usersData }))
      
      for (const userId of uniqueUserIds) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const displayName = userData.displayName || userData.email || 'Bilinmeyen Kullanıcı'
            
            setUsers(prev => ({
              ...prev,
              [userId]: { displayName }
            }))
          } else {
            setUsers(prev => ({
              ...prev,
              [userId]: { displayName: 'Bilinmeyen Kullanıcı' }
            }))
          }
        } catch (userError) {
          console.error(`User ${userId} load error:`, userError)
          setUsers(prev => ({
            ...prev,
            [userId]: { displayName: 'Bilinmeyen Kullanıcı' }
          }))
        }
      }
    } catch (err) {
      console.error('Users load error:', err)
    } finally {
      setUsersLoading(false)
    }
  }

  // Favorileri yükle
  const loadFavorites = async () => {
    if (!user) return
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        setFavorites(userData.favorites || [])
      }
    } catch (err) {
      console.error('Favoriler yükleme hatası:', err)
    }
  }

  // Favori ekleme/çıkarma
  const toggleFavorite = async (noteId: string) => {
    if (!user) return
    try {
      const newFavorites = favorites.includes(noteId)
        ? favorites.filter(id => id !== noteId)
        : [...favorites, noteId]
      
      setFavorites(newFavorites)
      
      // Firestore'da güncelle
      await updateDoc(doc(db, 'users', user.uid), {
        favorites: newFavorites
      })
    } catch (err) {
      console.error('Favori güncelleme hatası:', err)
    }
  }

  // İlk yükleme
  useEffect(() => {
    loadCourses()
    loadCurriculumCourses()
    loadNotes()
    loadFavorites()
    
    // URL parametrelerini kontrol et
    const urlParams = new URLSearchParams(window.location.search)
    const classParam = urlParams.get('class')
    const semesterParam = urlParams.get('semester')
    const courseParam = urlParams.get('course')
    
    if (classParam || semesterParam || courseParam) {
      // URL parametrelerini filtreye uygula
      if (classParam) {
        setCurriculumFilters(prev => ({ ...prev, selectedClass: parseInt(classParam) }))
        setFilters(prev => ({ ...prev, classYear: classParam }))
      }
      if (semesterParam) {
        const semesterOptions = getClassAndSemesterOptions()
        const matchingSemester = semesterOptions.find(option => 
          option.class === (classParam ? parseInt(classParam) : 1) && 
          option.semester.toLowerCase().includes(semesterParam.toLowerCase())
        )
        if (matchingSemester) {
          setCurriculumFilters(prev => ({ ...prev, selectedSemester: matchingSemester.semester }))
          setFilters(prev => ({ ...prev, semester: semesterParam }))
        }
      }
      if (courseParam) {
        setCurriculumFilters(prev => ({ ...prev, selectedCourse: courseParam }))
        setFilters(prev => ({ ...prev, courseId: courseParam }))
      }
    }
  }, [])

  // Filtreler değiştiğinde notları yeniden filtrele
  useEffect(() => {
    if (allNotes.length > 0) {
      filterNotes(allNotes)
    }
  }, [filters, allNotes, showMySummaries, showFavorites])

  // Client-side filtering logic
  const filterNotes = (notesToFilter: Note[]) => {
    let filtered = notesToFilter

    // Favoriler filtresi
    if (showFavorites && user) {
      filtered = filtered.filter(note => favorites.includes(note.id))
    }
    
    // Kullanıcının kendi özetlerini gösterme filtresi
    if (showMySummaries && user) {
      const beforeFilter = filtered.length
      filtered = filtered.filter(note => 
        note.userId === user.uid && note.title.startsWith('Özet:')
      )
    } else {
      // Normal notlar görünümünde özet notları hariç tut
      filtered = filtered.filter(note => !note.title.startsWith('Özet:'))
      
      // Kullanıcı sadece kendi notlarını ve herkese açık notları görebilsin
      if (user) {
        filtered = filtered.filter(note => 
          note.isPublic || note.userId === user.uid
        )
      } else {
        // Giriş yapmamış kullanıcılar sadece herkese açık notları görebilir
        filtered = filtered.filter(note => note.isPublic)
      }
    }

    if (filters.classYear) {
      filtered = filtered.filter(note => note.class === parseInt(filters.classYear))
    }
    if (filters.semester) {
      filtered = filtered.filter(note => note.semester === filters.semester)
    }
    if (filters.courseId) {
      filtered = filtered.filter(note => note.courseId === filters.courseId)
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        // Kullanıcı adı ile arama
        (users[note.userId || 'anonymous']?.displayName || '').toLowerCase().includes(searchLower)
      )
    }
    
    // Rol filtresi (Akademisyen-Öğrenci)
    if (filters.role) {
      filtered = filtered.filter(note => {
        // Eğer notun role alanı yoksa, varsayılan olarak 'student' kabul et
        const noteRole = note.role || 'student'
        return noteRole === filters.role
      })
    }
    
    // Akademisyen notlarını önce göster
    filtered.sort((a, b) => {
      if (a.role === 'academician' && b.role !== 'academician') return -1
      if (a.role !== 'academician' && b.role === 'academician') return 1
      return 0
    })
    
    setNotes(filtered)
  }

  // Filtre değişikliği
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Müfredat filtresi değişikliği
  const handleCurriculumFilterChange = (key: string, value: any) => {
    const newCurriculumFilters = {
      ...curriculumFilters,
      [key]: value
    }
    
    setCurriculumFilters(newCurriculumFilters)
    
    // Müfredat filtresini otomatik olarak ana filtreye uygula
    setFilters(prev => ({
      ...prev,
      classYear: newCurriculumFilters.selectedClass.toString(),
      semester: newCurriculumFilters.selectedSemester.includes('Güz') ? 'Güz' : 'Bahar',
      courseId: newCurriculumFilters.selectedCourse
    }))
    
    // Yeni not formunu müfredat filtreleriyle güncelle
    setNewNote(prev => ({
      ...prev,
      class: newCurriculumFilters.selectedClass,
      semester: newCurriculumFilters.selectedSemester.includes('Güz') ? 'Güz' : 'Bahar',
      courseId: newCurriculumFilters.selectedCourse
    }))
  }

  // Yeni not ekleme
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Kullanıcının seçtiği ders ID'sini kullan
      if (!newNote.courseId) {
        setError('Lütfen bir ders seçin');
        return;
      }
      
      const response = await apiClient.addNote({
        ...newNote,
        courseId: newNote.courseId, // Kullanıcının seçtiği ders ID'sini kullan
        originalFileName: uploadedFile?.name || null,
        isPDF: !!uploadedFile,
        extractedText: extractedText || null,
        fileSize: uploadedFile?.size || null,
        role: role || 'student', // Kullanıcının rolünü kullan
        userId: user?.uid || 'anonymous'
      });
      
      if (response.success) {
        setShowAddForm(false)
        setNewNote({
          title: '',
          content: '',
          courseId: '',
          class: 1,
          semester: 'Güz',
          tags: [],
          role: role || 'student',
          isPublic: true,
        })
        // PDF state'ini temizle
        setUploadedFile(null)
        setExtractedText('')
        loadNotes() // Notları yeniden yükle
      } else {
        setError(response.error || 'Not eklenirken bir hata oluştu')
      }
    } catch (err) {
      setError('Bağlantı hatası')
    }
  }

  // Tag ekleme/çıkarma
  const handleTagChange = (tag: string, add: boolean) => {
    if (add) {
      setNewNote(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    } else {
      setNewNote(prev => ({
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      }))
    }
  }

  // PDF işleme fonksiyonları
  const handleFileProcessed = (file: File, text: string, fileUrl?: string) => {
    setUploadedFile(file)
    setExtractedText(text)
    // PDF içeriğini not içeriğine otomatik ekle
    setNewNote(prev => ({
      ...prev,
      content: prev.content + (prev.content ? '\n\n' : '') + text,
      fileUrl: fileUrl || null
    }))
    setError('')
  }

  const handleFileError = (error: string) => {
    // API key yapılandırma hatası için özel mesaj
    if (error.includes('API anahtarı yapılandırılmamış') || error.includes('Gemini API key')) {
      setError('PDF işleme için Gemini API anahtarı yapılandırılmamış. Lütfen .env dosyasında NEXT_PUBLIC_GEMINI_SUMMARY_API_KEY değişkenini ayarlayın.')
    } else {
      setError(error)
    }
    setUploadedFile(null)
    setExtractedText('')
  }

  // Not detaylarını aç
  const handleNoteClick = (note: Note) => {
    setSelectedNote(note)
    setShowNoteModal(true)
  }

  // Not düzenlemeye başla
  const handleEditNote = (note: Note) => {
    setEditingNote({ ...note })
    setIsEditing(true)
  }

  // Not düzenlemeyi iptal et
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingNote(null)
  }

  // Not düzenlemeyi kaydet
  const handleSaveEdit = async () => {
    if (!editingNote) return

    try {
      const response = await apiClient.updateNote(editingNote.id, {
        title: editingNote.title,
        content: editingNote.content,
        tags: editingNote.tags || [],
        isPublic: editingNote.isPublic || false
      })

      if (response.success) {
        // Notları yeniden yükle
        loadNotes()
        setIsEditing(false)
        setEditingNote(null)
        setShowNoteModal(false)
      } else {
        setError(response.error || 'Not güncellenirken bir hata oluştu')
      }
    } catch (err) {
      console.error('Save edit error:', err)
      setError('Bağlantı hatası')
    }
  }

  // Tarih formatla
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Özetleme API çağrısı
  const handleSummarize = async () => {
    if (!selectedNote) return;
    try {
      const res = await fetch('/api/notes/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: selectedNote.content,
          summaryType: 'academic', // Assuming a default or user-selected type
        }),
      });
      const data = await res.json();
      if (data.success && data.summary) {
        // setSummaryResult(data.summary); // This state is removed, so this line is removed.
      } else {
        // setSummaryError(data.error || 'Özetleme başarısız.'); // This state is removed, so this line is removed.
      }
    } catch (err) {
      // setSummaryError('Sunucu hatası.'); // This state is removed, so this line is removed.
    } finally {
      // setSummaryLoading(false); // This state is removed, so this line is removed.
    }
  };

  // Profilde özet kaydet
  const handleSaveSummary = async () => {
    if (!user || !selectedNote) return;
    try {
      const res = await fetch('/api/profile/summarized-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          noteId: selectedNote.id,
          originalTitle: selectedNote.title,
          summary: selectedNote.content, // Assuming summary is the content for now
          summaryType: 'academic', // Assuming a default or user-selected type
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowSummaryModal(false);
        alert('Özet profiline kaydedildi!');
      } else {
        // setSummaryError(data.error || 'Kayıt başarısız.'); // This state is removed, so this line is removed.
      }
    } catch (err) {
      // setSummaryError('Sunucu hatası.'); // This state is removed, so this line is removed.
    } finally {
      // setSummaryLoading(false); // This state is removed, so this line is removed.
    }
  };

  const handleDeleteNote = async (noteId: string, noteTitle: string) => {
    if (!confirm(`"${noteTitle}" notunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'notes', noteId));
      alert('Not başarıyla silindi!');
      loadNotes(); // Notları yeniden yükle
    } catch (error) {
      console.error('Not silme hatası:', error);
      alert('Not silinirken hata oluştu.');
    }
  };

  // Giriş kontrolü
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ marginTop: '72px' }}>
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
          title="Ders Notları Sayfasına Erişim"
          description="Paylaşılan ders notlarını görüntülemek ve kendi notlarınızı eklemek için giriş yapmanız gerekiyor."
          features={[
            "Akademisyen ve öğrenci notları",
            "PDF dosya desteği",
            "Not arama ve filtreleme",
            "Kişisel not oluşturma",
            "Not düzenleme ve özetleme"
          ]}
        />
      </div>
    );
  }

  return (
    <div className='py-8 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50' style={{ marginTop: '72px' }}>
      <section className='text-center mb-16 animate-fadeIn'>
        <h1 className='text-5xl font-extrabold text-text-primary leading-tight mb-4'>
          Ders Notları
        </h1>
        <p className='text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed'>
          Paylaşılan ders notlarına kolayca erişin ve kendi notlarınızı ekleyin.
        </p>
        
        {/* Notlar-Özetler-Favoriler Toggle Butonu */}
        {user && (
          <div className='flex justify-center mt-6'>
            <div className='flex bg-gray-50/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200 shadow-sm'>
              <button
                onClick={() => {
                  setShowMySummaries(false)
                  setShowFavorites(false)
                }}
                className={`px-6 py-3 rounded-lg transition-all duration-300 font-semibold text-sm ${
                  !showMySummaries && !showFavorites
                    ? 'bg-primary-500 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                📚 Notlar
              </button>
              <button
                onClick={() => {
                  setShowMySummaries(true)
                  setShowFavorites(false)
                }}
                className={`px-6 py-3 rounded-lg transition-all duration-300 font-semibold text-sm ${
                  showMySummaries
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                📝 Özetler
              </button>
              <button
                onClick={() => {
                  setShowMySummaries(false)
                  setShowFavorites(true)
                }}
                className={`px-6 py-3 rounded-lg transition-all duration-300 font-semibold text-sm ${
                  showFavorites
                    ? 'bg-amber-500 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                ⭐ Favoriler
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Filtreler */}
              <Card className='mb-8 bg-gray-50/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm max-w-5xl mx-auto'>
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Sınıf</label>
            <select
              value={curriculumFilters.selectedClass}
              onChange={(e) => handleCurriculumFilterChange('selectedClass', parseInt(e.target.value))}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-800 transition-colors'
            >
              <option value={1}>1. Sınıf</option>
              <option value={2}>2. Sınıf</option>
              <option value={3}>3. Sınıf</option>
              <option value={4}>4. Sınıf</option>
            </select>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Dönem</label>
            <select
              value={curriculumFilters.selectedSemester}
              onChange={(e) => handleCurriculumFilterChange('selectedSemester', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-800 transition-colors'
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
            <label className='block text-sm font-medium text-gray-700 mb-2'>Ders</label>
            <select
              value={curriculumFilters.selectedCourse}
              onChange={(e) => handleCurriculumFilterChange('selectedCourse', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-800 transition-colors'
            >
              <option value=''>Tüm Dersler</option>
              {getCoursesByClassAndSemester(curriculumFilters.selectedClass, curriculumFilters.selectedSemester).map(course => (
                <option key={course.code} value={course.code}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Rol Filtresi</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-800 transition-colors'
            >
              <option value=''>Tüm Roller</option>
              <option value='academician'>🎓 Akademisyen</option>
              <option value='student'>👨‍🎓 Öğrenci</option>
            </select>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Arama</label>
            <input
              type='text'
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder='Not başlığı, içeriği veya yazar adı...'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-800 transition-colors'
            />
          </div>
          
          {user && (
            <div className='flex items-end space-x-2'>
              <button
                onClick={() => {
                  if (!showAddForm) {
                    // Form açılırken müfredat filtrelerini form alanlarına uygula
                    setNewNote(prev => ({
                      ...prev,
                      class: curriculumFilters.selectedClass,
                      semester: curriculumFilters.selectedSemester.includes('Güz') ? 'Güz' : 'Bahar',
                      courseId: curriculumFilters.selectedCourse
                    }))
                  }
                  setShowAddForm(!showAddForm)
                }}
                className='w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors border border-primary-500/30 font-medium'
              >
                {showAddForm ? 'İptal' : 'Yeni Not Ekle'}
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Yeni Not Ekleme Formu */}
      {showAddForm && (
        <Card className='mb-8 bg-gray-50/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm max-w-4xl mx-auto'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-xl font-bold text-gray-800'>Yeni Not Ekle</h3>
            {role === 'academician' && (
              <span className='text-primary-600 font-semibold text-sm bg-primary-100 px-3 py-1 rounded-full border border-primary-200'>
                🎓 Akademisyen olarak not ekliyorsunuz
              </span>
            )}
          </div>
          <form onSubmit={handleAddNote} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Not Başlığı</label>
                <input
                  type='text'
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-800 transition-colors'
                  required
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Ders Seçimi</label>
                <select
                  value={newNote.courseId}
                  onChange={(e) => setNewNote(prev => ({ ...prev, courseId: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-800 transition-colors'
                  required
                >
                  <option value=''>Ders Seçin</option>
                  {/* Mevcut filtreye göre müfredat derslerini göster */}
                  {getCoursesByClassAndSemester(curriculumFilters.selectedClass, curriculumFilters.selectedSemester).map(course => (
                    <option key={course.code} value={course.code}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                  {/* Sonra API'den gelen dersleri göster */}
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                {courses.length === 0 && curriculumCourses.length === 0 && (
                  <div className='text-amber-600 text-xs mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200'>
                    <p className='font-medium mb-1'>⚠️ Henüz ders bulunmuyor</p>
                    <p>Müfredat dersleri yükleniyor veya profil sayfasından ders eklemeniz gerekiyor.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Not İçeriği</label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-800 transition-colors'
                rows={6}
                placeholder='Notunuzu buraya yazın...'
                required
              />
            </div>
            
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>PDF Dosyası (Opsiyonel)</label>
              <FileUpload
                onFileProcessed={handleFileProcessed}
                onError={handleFileError}
              />
            </div>

            {/* PDF İçeriği Görüntüleme */}
            {uploadedFile && (
              <div className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
                <div className='mb-3'>
                  <h4 className='font-medium text-gray-800'>PDF Metni: {uploadedFile.name}</h4>
                </div>
                <div className='max-h-60 overflow-y-auto'>
                  <pre className='text-sm text-gray-600 whitespace-pre-wrap'>{extractedText}</pre>
                </div>
              </div>
            )}
            

            
            <div className='flex items-center space-x-2'>
              <input
                type='checkbox'
                id='isPublic'
                checked={newNote.isPublic}
                onChange={(e) => setNewNote(prev => ({ ...prev, isPublic: e.target.checked }))}
                className='w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500'
              />
              <label htmlFor='isPublic' className='text-sm font-medium text-gray-700'>
                Herkese Açık
              </label>
              <span className='text-xs text-gray-500 ml-2'>
                {newNote.isPublic ? 'Bu not tüm kullanıcılar tarafından görülebilir' : 'Bu not sadece siz tarafından görülebilir'}
              </span>
            </div>
            
            <div className='flex justify-end space-x-4'>
              <button
                type='button'
                onClick={() => setShowAddForm(false)}
                className='px-4 py-2 border border-primary-700/30 text-text-secondary rounded-md hover:bg-primary-900/20 transition-colors'
              >
                İptal
              </button>
              <button
                type='submit'
                disabled={courses.length === 0 && curriculumCourses.length === 0}
                className='px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-primary-500/30'
              >
                {courses.length === 0 && curriculumCourses.length === 0 ? 'Ders Bekleniyor...' : 'Not Ekle'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Hata Mesajı */}
      {error && (
        <div className='mb-8 bg-red-900/20 border border-red-700/30 text-red-300 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      {/* Notlar Listesi */}
      <Card className="card-glass">
        <h2 className='text-3xl font-bold text-text-primary mb-6 text-center border-b-2 border-primary-500 pb-3'>
          {showFavorites ? '⭐ Favoriler' : showMySummaries ? '📝 Özetler' : '📚 Notlar'} ({notes.length})
        </h2>
        
        {loading ? (
          <div className='text-center py-8'>
            <div className='loading-spinner'></div>
            <p className='mt-2 text-text-secondary'>Notlar yükleniyor...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-text-secondary'>
              {showFavorites 
                ? 'Henüz favori notunuz bulunmuyor. Notları favorilere ekleyebilirsiniz.' 
                : showMySummaries 
                  ? 'Henüz özet notunuz bulunmuyor.' 
                  : 'Henüz not bulunmuyor.'
              }
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto'>
            {notes.map((note) => (
              <div 
                key={note.id} 
                className={`bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer ${
                  note.role === 'academician' 
                    ? 'ring-2 ring-primary-200 shadow-md' 
                    : 'shadow-sm'
                }`}
                onClick={() => handleNoteClick(note)}
              >
                {/* Akademisyen/Öğrenci/Özet notu etiketi */}
                <div className='flex items-center justify-between mb-3'>
                  <span className={`font-semibold text-xs px-3 py-1 rounded-full ${
                    note.title.startsWith('Özet:')
                      ? 'bg-secondary-100 text-secondary-700'
                      : (note.role || 'student') === 'academician' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    {note.title.startsWith('Özet:') 
                      ? '📝 ÖZET' 
                      : (note.role || 'student') === 'academician' 
                        ? '🎓 Akademisyen' 
                        : '👨‍🎓 Öğrenci'
                    }
                  </span>
                  
                  {/* Favori göstergesi */}
                  {user && favorites.includes(note.id) && (
                    <span className='text-amber-500 text-lg' title='Favori Not'>⭐</span>
                  )}
                </div>
               
                {/* Not başlığı */}
                <div className='flex justify-between items-start mb-3'>
                  <h3 className={`font-bold text-lg line-clamp-2 leading-tight ${
                    note.role === 'academician' ? 'text-primary-700' : 'text-gray-800'
                  }`}>
                    {note.title}
                  </h3>
                  
                  {/* Kilit simgesi - özel notlar için */}
                  {!note.isPublic && (
                    <span className='text-gray-400 text-lg ml-2' title='Özel Not'>🔒</span>
                  )}
                </div>
                
                {/* Kullanıcı adı */}
                <div className='flex items-center gap-2 mb-3'>
                  <span className='text-xs text-gray-500'>👤</span>
                  <span className='text-sm text-gray-600 font-medium'>
                    {(() => {
                      const userId = note.userId || 'anonymous';
                      const userData = users[userId];
                      
                      if (userData && userData.displayName) {
                        return userData.displayName;
                      }
                      
                      // Eğer kullanıcı verisi henüz yüklenmemişse, loading göster
                      if (usersLoading) {
                        return 'Yükleniyor...';
                      }
                      
                      return 'Bilinmeyen Kullanıcı';
                    })()}
                  </span>
                </div>
                
                {/* Ders adı - belirgin */}
                <div className='mb-3'>
                  <p className='text-sm font-semibold text-gray-700'>
                    📚 {(() => {
                      // Önce müfredat derslerinde ara
                      const curriculumCourse = curriculumCourses.find(c => c.code === note.courseId);
                      if (curriculumCourse) return curriculumCourse.name;
                      
                      // Sonra API'den gelen derslerde ara
                      const apiCourse = courses.find(c => c.id === note.courseId);
                      if (apiCourse) return apiCourse.name;
                      
                      // Eğer courseId boşsa ve müfredat filtresinde seçili ders varsa onu göster
                      if (!note.courseId && curriculumFilters.selectedCourse) {
                        const selectedCourse = curriculumCourses.find(c => c.code === curriculumFilters.selectedCourse);
                        if (selectedCourse) return selectedCourse.name;
                      }
                      
                      return 'Bilinmeyen Ders';
                    })()}
                  </p>
                </div>
               
                {/* Sınıf, Dönem, Tarih bilgileri */}
                <div className='flex justify-between text-xs text-gray-500 mb-3'>
                  <span>📅 {note.class}. Sınıf</span>
                  <span>📖 {note.semester}</span>
                  <span>📝 {formatDate((note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt))}</span>
                </div>
                
                {/* PDF bilgisi */}
                {note.isPDF && (
                  <div className='flex items-center gap-2 text-blue-600 text-xs mb-2 bg-blue-50 px-2 py-1 rounded-md'>
                    <span>📄</span>
                    <span>PDF: {note.originalFileName}</span>
                  </div>
                )}
                
                {/* Etiketler */}
                {note.tags && note.tags.length > 0 && (
                  <div className='flex flex-wrap gap-1 mb-3'>
                    {note.tags.map(tag => (
                      <span key={tag} className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200'>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Alt bilgiler */}
                <div className='flex justify-between items-center text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100'>
                  <div className='flex items-center gap-2'>
                    {/* Favori Butonu - Sol alt köşe */}
                    {user && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(note.id);
                        }}
                        className={`text-lg transition-colors ${
                          favorites.includes(note.id)
                            ? 'text-amber-500 hover:text-amber-600'
                            : 'text-gray-400 hover:text-amber-500'
                        }`}
                        title={favorites.includes(note.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                      >
                        {favorites.includes(note.id) ? '⭐' : '☆'}
                      </button>
                    )}
                  </div>
                  
                  <div className='flex items-center gap-2'>
                    <span className='text-gray-400 text-xs'>Detaylar için tıklayın</span>
                    
                    {/* PDF İndirme Butonu */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const courseName = (() => {
                          const curriculumCourse = curriculumCourses.find(c => c.code === note.courseId);
                          if (curriculumCourse) return curriculumCourse.name;
                          const apiCourse = courses.find(c => c.id === note.courseId);
                          if (apiCourse) return apiCourse.name;
                          return 'Bilinmeyen Ders';
                        })();
                        
                        const userName = users[note.userId || 'anonymous']?.displayName || 'Bilinmeyen Kullanıcı';
                        
                        downloadNoteAsPDF(note, courseName, userName);
                      }}
                      className='text-blue-600 hover:text-blue-700 text-xs px-2 py-1 rounded-md hover:bg-blue-50 transition-colors'
                      title='PDF İndir'
                    >
                      📄 PDF
                    </button>
                    
                    {note.userId === user?.uid && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id, note.title);
                        }}
                        className='text-red-500 hover:text-red-600 text-xs px-2 py-1 rounded-md hover:bg-red-50 transition-colors'
                        title='Notu Sil'
                      >
                        🗑️ Sil
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Not detayları modalı */}
      {showNoteModal && selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-4xl w-full mx-4 relative flex flex-col max-h-[90vh] border border-white/20">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200/60 sticky top-0 bg-white/80 backdrop-blur-sm z-10 rounded-t-3xl">
              <div className="flex items-center gap-4">
                {selectedNote.title.startsWith('Özet:') ? (
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">📝</span>
                  </div>
                ) : selectedNote.role === 'academician' ? (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">🎓</span>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">👨‍🎓</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {selectedNote.title.startsWith('Özet:') ? (
                      <span className="text-green-600 font-semibold text-sm bg-green-100 px-3 py-1 rounded-full border border-green-200">
                        📝 ÖZET
                      </span>
                    ) : selectedNote.role === 'academician' ? (
                      <span className="text-blue-600 font-semibold text-sm bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                        🎓 Akademisyen Notu
                      </span>
                    ) : (
                      <span className="text-gray-600 font-semibold text-sm bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                        👨‍🎓 Öğrenci Notu
                      </span>
                    )}
                    
                    {!selectedNote.isPublic && (
                      <span className="text-amber-600 font-semibold text-sm bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                        🔒 Özel
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 line-clamp-2">
                    {selectedNote.title}
                  </h2>
                </div>
              </div>
              
              <button 
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-300" 
                onClick={() => setShowNoteModal(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {isEditing && editingNote ? (
                // Düzenleme modu
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Not Başlığı</label>
                    <input
                      type="text"
                      value={editingNote.title}
                      onChange={(e) => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Not İçeriği</label>
                    <textarea
                      value={editingNote.content}
                      onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-300"
                      rows={12}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Etiketler</label>
                    <div className="flex flex-wrap gap-2">
                      {['SQL', 'Veritabanı', 'Yapay Zeka', 'Programlama', 'Web', 'Mobil', 'Algoritma', 'Veri Yapıları'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (editingNote) {
                              const newTags = editingNote.tags?.includes(tag)
                                ? editingNote.tags.filter(t => t !== tag)
                                : [...(editingNote.tags || []), tag];
                              setEditingNote({ ...editingNote, tags: newTags });
                            }
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                            editingNote.tags?.includes(tag)
                              ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="editIsPublic"
                      checked={editingNote.isPublic}
                      onChange={(e) => setEditingNote(prev => prev ? { ...prev, isPublic: e.target.checked } : null)}
                      className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="editIsPublic" className="text-sm font-medium text-gray-700">
                      Herkese Açık
                    </label>
                    <span className="text-xs text-gray-500">
                      {editingNote.isPublic ? 'Bu not tüm kullanıcılar tarafından görülebilir' : 'Bu not sadece siz tarafından görülebilir'}
                    </span>
                  </div>
                </div>
              ) : (
                // Görüntüleme modu
                <>
                  {/* Not Bilgileri */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200/60">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">📚</span>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Ders</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {(() => {
                            const apiCourse = courses.find(c => c.id === selectedNote.courseId);
                            if (apiCourse) return apiCourse.name;
                            const curriculumCourse = curriculumCourses.find(c => c.code === selectedNote.courseId);
                            if (curriculumCourse) return curriculumCourse.name;
                            if (!selectedNote.courseId && curriculumFilters.selectedCourse) {
                              const selectedCourse = curriculumCourses.find(c => c.code === curriculumFilters.selectedCourse);
                              if (selectedCourse) return selectedCourse.name;
                            }
                            return 'Bilinmeyen Ders';
                          })()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">📅</span>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Sınıf</p>
                        <p className="text-sm font-semibold text-gray-800">{selectedNote.class}. Sınıf</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600">📖</span>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Dönem</p>
                        <p className="text-sm font-semibold text-gray-800">{selectedNote.semester}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600">📝</span>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Tarih</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {formatDate(typeof selectedNote.createdAt === 'string' ? selectedNote.createdAt : selectedNote.createdAt?.toString?.() || '')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Kullanıcı Bilgisi */}
                  <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-semibold">
                        {(() => {
                          const userId = selectedNote.userId || 'anonymous';
                          const userData = users[userId];
                          return userData?.displayName?.charAt(0) || 'A';
                        })()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Yazar</p>
                      <p className="text-base font-semibold text-gray-800">
                        {(() => {
                          const userId = selectedNote.userId || 'anonymous';
                          const userData = users[userId];
                          return userData?.displayName || 'Bilinmeyen Kullanıcı';
                        })()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Etiketler */}
                  {selectedNote.tags && selectedNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedNote.tags.map(tag => (
                        <span key={tag} className="px-3 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-xl border border-blue-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* PDF Bilgisi */}
                  {selectedNote.isPDF && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white text-xl">📄</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">PDF Dosyası</h4>
                          <p className="text-sm text-gray-600">{selectedNote.originalFileName}</p>
                          {selectedNote.fileSize && (
                            <p className="text-xs text-gray-500">({(selectedNote.fileSize / 1024 / 1024).toFixed(2)} MB)</p>
                          )}
                        </div>
                      </div>
                      
                      {selectedNote.extractedText && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-700 mb-2">PDF İçeriği:</h5>
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 max-h-40 overflow-y-auto border border-gray-200/60">
                            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{selectedNote.extractedText}</pre>
                          </div>
                        </div>
                      )}
                      
                      {selectedNote.fileUrl && (
                        <a 
                          href={selectedNote.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          <span>🔗</span>
                          <span>PDF'i İndir</span>
                        </a>
                      )}
                    </div>
                  )}
                  
                  {/* Not İçeriği */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60">
                    <h3 className="font-bold text-xl mb-4 text-gray-800 flex items-center gap-2">
                      <span className="text-blue-600">📝</span>
                      Not İçeriği
                    </h3>
                    <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-6 max-h-80 overflow-y-auto border border-gray-200/60">
                      <div 
                        className="text-base leading-relaxed text-gray-700 prose prose-gray max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                      />
                    </div>
                  </div>
                  
                  {/* İstatistikler */}
                  <div className="flex justify-between items-center text-sm text-gray-500 bg-gray-50/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60">
                    <div className="flex space-x-6">
                      <span className="flex items-center gap-1">
                        <span className="text-red-500">❤️</span>
                        <span>{selectedNote.likes || 0} beğeni</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-amber-500">⭐</span>
                        <span>{selectedNote.favorites || 0} favori</span>
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex gap-3 border-t border-gray-200/60 px-8 py-6 bg-white/80 backdrop-blur-sm sticky bottom-0 rounded-b-3xl">
              {isEditing ? (
                // Düzenleme modunda butonlar
                <>
                  <button 
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl" 
                    onClick={handleSaveEdit}
                  >
                    💾 Kaydet
                  </button>
                  <button 
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-200" 
                    onClick={handleCancelEdit}
                  >
                    ❌ İptal
                  </button>
                </>
              ) : (
                // Görüntüleme modunda butonlar
                <>
                  {/* Özetleme butonu - sadece normal notlar için göster */}
                  {!selectedNote.title.startsWith('Özet:') && (
                    <button 
                      className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl" 
                      onClick={() => setShowSummaryModal(true)}
                    >
                      📝 ÖZETLE
                    </button>
                  )}
                  
                  {/* PDF İndirme Butonu */}
                  <button 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl" 
                    onClick={() => {
                      if (selectedNote) {
                        const courseName = (() => {
                          const curriculumCourse = curriculumCourses.find(c => c.code === selectedNote.courseId);
                          if (curriculumCourse) return curriculumCourse.name;
                          const apiCourse = courses.find(c => c.id === selectedNote.courseId);
                          if (apiCourse) return apiCourse.name;
                          return 'Bilinmeyen Ders';
                        })();
                        
                        const userName = users[selectedNote.userId || 'anonymous']?.displayName || 'Bilinmeyen Kullanıcı';
                        
                        downloadNoteAsPDF(selectedNote, courseName, userName);
                      }
                    }}
                    title="PDF İndir"
                  >
                    📄 PDF İNDİR
                  </button>
                  
                  {/* Düzenleme butonu - sadece kullanıcının kendi notları için */}
                  {user && selectedNote?.userId === user.uid && (
                    <button 
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl" 
                      onClick={() => handleEditNote(selectedNote)}
                    >
                      ✏️ DÜZENLE
                    </button>
                  )}
                  
                  <button 
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-200" 
                    onClick={() => setShowNoteModal(false)}
                  >
                    ❌ Kapat
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

             {/* Modüler Özetleme Modalı */}
       <SummaryModal
         open={showSummaryModal}
         onClose={() => setShowSummaryModal(false)}
         note={selectedNote}
         user={user}
         onSaved={() => {
           // Özet kaydedildikten sonra notları yeniden yükle
           loadNotes()
         }}
       />
      
     </div>
  )
}