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
import { doc, getDoc, deleteDoc } from 'firebase/firestore/lite';
import { db } from '../../config/firebase';
import LoginPrompt from '../../components/LoginPrompt'
import { getAllCourses, getCoursesByClassAndSemester, getClassAndSemesterOptions, CurriculumCourse } from '../../utils/curriculumUtils'

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
    search: ''
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
            semester: note.semester || 'Güz'
          }));
          setAllNotes(notesWithClass)
          
          // Notlardaki kullanıcı ID'lerini topla ve kullanıcı bilgilerini yükle
          const userIds = [...new Set(notesWithClass.map((note: Note) => note.userId).filter((id: string | undefined) => id))];
          if (userIds.length > 0) {
            await loadUsers(userIds as string[]);
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

  // İlk yükleme
  useEffect(() => {
    loadCourses()
    loadCurriculumCourses()
    loadNotes()
    
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
  }, [filters, allNotes, showMySummaries])

  // Client-side filtering logic
  const filterNotes = (notesToFilter: Note[]) => {
    let filtered = notesToFilter

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
        note.content.toLowerCase().includes(searchLower)
      )
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
        role: role || 'student',
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
    setError(error)
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-text-light">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
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
    );
  }

  return (
    <div className='py-8'>
      <section className='text-center mb-16 animate-fadeIn'>
        <h1 className='text-5xl font-extrabold text-text leading-tight mb-4 text-gradient'>
          Ders Notları
        </h1>
        <p className='text-lg text-text-light max-w-3xl mx-auto leading-relaxed'>
          Paylaşılan ders notlarına kolayca erişin ve kendi notlarınızı ekleyin.
        </p>
        
        {/* Notlar-Özetler Toggle Butonu */}
        {user && (
          <div className='flex justify-center mt-6'>
            <div className='flex bg-background-hover rounded-lg p-1'>
              <button
                onClick={() => {
                  setShowMySummaries(false)
                }}
                className={`px-6 py-2 rounded-md transition-all duration-300 font-medium ${
                  !showMySummaries
                    ? 'bg-background-card text-text shadow-sm' 
                    : 'text-text-light hover:text-text'
                }`}
              >
                📚 Notlar
              </button>
              <button
                onClick={() => {
                  setShowMySummaries(true)
                }}
                className={`px-6 py-2 rounded-md transition-all duration-300 font-medium ${
                  showMySummaries
                    ? 'bg-background-card text-text shadow-sm' 
                    : 'text-text-light hover:text-text'
                }`}
              >
                📝 Özetler
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Filtreler */}
      <Card className='mb-8'>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          <div>
            <label className='block text-sm font-medium text-text mb-2'>Sınıf</label>
            <select
              value={curriculumFilters.selectedClass}
              onChange={(e) => handleCurriculumFilterChange('selectedClass', parseInt(e.target.value))}
              className='w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-text-accent bg-background-card text-text hover:border-border-accent transition-all duration-300'
            >
              <option value={1}>1. Sınıf</option>
              <option value={2}>2. Sınıf</option>
              <option value={3}>3. Sınıf</option>
              <option value={4}>4. Sınıf</option>
            </select>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-text mb-2'>Dönem</label>
            <select
              value={curriculumFilters.selectedSemester}
              onChange={(e) => handleCurriculumFilterChange('selectedSemester', e.target.value)}
              className='w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-text-accent bg-background-card text-text hover:border-border-accent transition-all duration-300'
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
            <label className='block text-sm font-medium text-text mb-2'>Ders</label>
            <select
              value={curriculumFilters.selectedCourse}
              onChange={(e) => handleCurriculumFilterChange('selectedCourse', e.target.value)}
              className='w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-text-accent bg-background-card text-text hover:border-border-accent transition-all duration-300'
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
            <label className='block text-sm font-medium text-text mb-2'>Arama</label>
            <input
              type='text'
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder='Not başlığı veya içeriği...'
              className='w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-text-accent bg-background-card text-text hover:border-border-accent transition-all duration-300'
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
                className='w-full px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-all duration-300 hover-lift'
              >
                {showAddForm ? 'İptal' : 'Yeni Not Ekle'}
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Yeni Not Ekleme Formu */}
      {showAddForm && (
        <Card className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-xl font-bold text-text'>Yeni Not Ekle</h3>
            {role === 'academician' && (
              <span className='text-text-accent font-semibold text-sm bg-background-hover px-3 py-1 rounded-full'>
                🎓 Akademisyen olarak not ekliyorsunuz
              </span>
            )}
          </div>
          <form onSubmit={handleAddNote} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-text mb-2'>Not Başlığı</label>
                <input
                  type='text'
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  className='w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-text-accent bg-background-card text-text hover:border-border-accent transition-all duration-300'
                  required
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-text mb-2'>Ders Seçimi</label>
                <select
                  value={newNote.courseId}
                  onChange={(e) => setNewNote(prev => ({ ...prev, courseId: e.target.value }))}
                  className='w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-text-accent bg-background-card text-text hover:border-border-accent transition-all duration-300'
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
                  <div className='text-amber-400 text-xs mt-1 p-2 bg-amber-900/20 rounded border border-amber-400/30'>
                    <p className='font-medium mb-1'>⚠️ Henüz ders bulunmuyor</p>
                    <p>Müfredat dersleri yükleniyor veya profil sayfasından ders eklemeniz gerekiyor.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className='block text-sm font-medium text-text mb-2'>Not İçeriği</label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                className='w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-text-accent bg-background-card text-text hover:border-border-accent transition-all duration-300'
                rows={6}
                placeholder='Notunuzu buraya yazın...'
                required
              />
            </div>
            
            <div>
              <label className='block text-sm font-medium text-text mb-2'>PDF Dosyası (Opsiyonel)</label>
              <FileUpload
                onFileProcessed={handleFileProcessed}
                onError={handleFileError}
              />
            </div>

            {/* PDF İçeriği Görüntüleme */}
            {uploadedFile && (
              <div className='border border-border-light rounded-lg p-4 bg-background-hover'>
                <div className='mb-3'>
                  <h4 className='font-medium text-text'>PDF Metni: {uploadedFile.name}</h4>
                </div>
                <div className='max-h-60 overflow-y-auto'>
                  <pre className='text-sm text-text-light whitespace-pre-wrap'>{extractedText}</pre>
                </div>
              </div>
            )}
            
            <div className='flex items-center space-x-2'>
              <input
                type='checkbox'
                id='isPublic'
                checked={newNote.isPublic}
                onChange={(e) => setNewNote(prev => ({ ...prev, isPublic: e.target.checked }))}
                className='w-4 h-4 text-text-accent bg-background-card border-border-light rounded focus:ring-text-accent'
              />
              <label htmlFor='isPublic' className='text-sm font-medium text-text'>
                Herkese Açık
              </label>
              <span className='text-xs text-text-muted ml-2'>
                {newNote.isPublic ? 'Bu not tüm kullanıcılar tarafından görülebilir' : 'Bu not sadece siz tarafından görülebilir'}
              </span>
            </div>
            
            <div className='flex justify-end space-x-4'>
              <button
                type='button'
                onClick={() => setShowAddForm(false)}
                className='px-4 py-2 border border-border-light text-text rounded-md hover:bg-background-hover transition-all duration-300 hover-lift'
              >
                İptal
              </button>
              <button
                type='submit'
                disabled={courses.length === 0 && curriculumCourses.length === 0}
                className='px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover-lift'
              >
                {courses.length === 0 && curriculumCourses.length === 0 ? 'Ders Bekleniyor...' : 'Not Ekle'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Hata Mesajı */}
      {error && (
        <div className='mb-8 bg-red-900/20 border border-red-400/30 text-red-400 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      {/* Notlar Listesi */}
      <Card>
        <h2 className='text-3xl font-bold text-text mb-6 text-center border-b-2 border-text-accent pb-3'>
          Notlar ({notes.length})
        </h2>
        
        {loading ? (
          <div className='text-center py-8'>
            <div className='loading-spinner'></div>
            <p className='mt-2 text-text-light'>Notlar yükleniyor...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-text-light'>Henüz not bulunmuyor.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {notes.map((note) => (
              <div 
                key={note.id} 
                className={`border rounded-lg p-4 hover:shadow-hover-glow transition-all duration-300 cursor-pointer hover-lift ${
                  note.role === 'academician' 
                    ? 'border-primary-400 bg-primary-900/20 shadow-lg' 
                    : 'border-border-light bg-background-card'
                }`}
                onClick={() => handleNoteClick(note)}
              >
                {/* Akademisyen/Öğrenci/Özet notu etiketi */}
                <div className='flex items-center gap-2 mb-2'>
                  <span className={`font-semibold text-sm ${
                    note.title.startsWith('Özet:')
                      ? 'text-secondary-400'
                      : note.role === 'academician' 
                        ? 'text-primary-400' 
                        : 'text-secondary-400'
                  }`}>
                    {note.title.startsWith('Özet:') 
                      ? '📝 ÖZET' 
                      : note.role === 'academician' 
                        ? '🎓 Akademisyen Notu' 
                        : '👨‍🎓 Öğrenci Notu'
                    }
                  </span>
                </div>
                
                {/* Not başlığı */}
                <div className='flex justify-between items-start mb-3'>
                  <h3 className={`font-bold text-lg line-clamp-2 ${
                    note.role === 'academician' ? 'text-primary-300' : 'text-text'
                  }`}>
                    {note.title}
                  </h3>
                  
                  {/* Kilit simgesi - özel notlar için */}
                  {!note.isPublic && (
                    <span className='text-text-muted text-lg' title='Özel Not'>🔒</span>
                  )}
                </div>
                
                {/* Kullanıcı adı */}
                <div className='flex items-center gap-2 mb-3'>
                  <span className='text-xs text-text-muted'>👤</span>
                  <span className='text-sm text-text-light'>
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
                  <p className='text-base font-semibold text-text'>
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
                <div className='flex justify-between text-sm text-text-muted mb-3'>
                  <span>📅 {note.class}. Sınıf</span>
                  <span>📖 {note.semester}</span>
                  <span>📝 {formatDate((note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt))}</span>
                </div>
                
                {/* PDF bilgisi */}
                {note.isPDF && (
                  <div className='flex items-center gap-2 text-primary-400 text-xs mb-2'>
                    <span>📄</span>
                    <span>PDF: {note.originalFileName}</span>
                  </div>
                )}
                
                {/* Etiketler */}
                {note.tags && note.tags.length > 0 && (
                  <div className='flex flex-wrap gap-1 mb-3'>
                    {note.tags.map(tag => (
                      <span key={tag} className='px-2 py-1 bg-primary-900/30 text-primary-300 text-xs rounded'>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Alt bilgiler */}
                <div className='flex justify-between items-center text-sm text-text-muted'>
                  <div className='flex space-x-4'>
                    <span>❤️ {note.likes}</span>
                    <span>⭐ {note.favorites}</span>
                  </div>
                  
                  <div className='flex items-center gap-2'>
                    <span className='text-text-accent text-xs'>Detaylar için tıklayın</span>
                    {note.userId === user?.uid && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id, note.title);
                        }}
                        className='text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-900/20 transition-all duration-300'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
          <div className="bg-background-card rounded-lg shadow-dark-card max-w-2xl w-full relative flex flex-col max-h-[90vh] border border-border-light">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-light px-6 py-4 sticky top-0 bg-background-card z-10 rounded-t-lg">
              <div className="flex items-center gap-3">
                {selectedNote.title.startsWith('Özet:') ? (
                  <span className="text-secondary-400 font-semibold text-sm bg-secondary-900/20 px-3 py-1 rounded-full">
                    📝 ÖZET
                  </span>
                ) : selectedNote.role === 'academician' && (
                  <span className="text-primary-400 font-semibold text-sm bg-primary-900/20 px-3 py-1 rounded-full">
                    🎓 Akademisyen Notu
                  </span>
                )}
                <h2 className={`text-2xl font-bold truncate mr-4 ${
                  selectedNote.role === 'academician' ? 'text-primary-300' : 'text-text'
                }`}>
                  {selectedNote.title}
                </h2>
              </div>
              <button className="text-text-muted hover:text-text text-2xl transition-all duration-300" onClick={() => setShowNoteModal(false)}>&times;</button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {isEditing && editingNote ? (
                // Düzenleme modu
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Not Başlığı</label>
                    <input
                      type="text"
                      value={editingNote.title}
                      onChange={(e) => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-text-accent bg-background-card text-text"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Not İçeriği</label>
                    <textarea
                      value={editingNote.content}
                      onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-text-accent bg-background-card text-text"
                      rows={8}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Etiketler</label>
                    <div className="flex flex-wrap gap-2">
                      {['SQL', 'Veritabanı', 'Yapay Zeka', 'Programlama', 'Web', 'Mobil'].map(tag => (
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
                          className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                            editingNote.tags?.includes(tag)
                              ? 'bg-text-accent text-white'
                              : 'bg-background-hover text-text hover:bg-background-card'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="editIsPublic"
                      checked={editingNote.isPublic}
                      onChange={(e) => setEditingNote(prev => prev ? { ...prev, isPublic: e.target.checked } : null)}
                      className="w-4 h-4 text-text-accent bg-background-card border-border-light rounded focus:ring-text-accent"
                    />
                    <label htmlFor="editIsPublic" className="text-sm font-medium text-text">
                      Herkese Açık
                    </label>
                  </div>
                </div>
              ) : (
                // Görüntüleme modu
                <>
                  <div className="flex flex-wrap gap-2 text-sm text-text-light">
                    <span>📚 {(() => {
                      // Önce API'den gelen derslerde ara
                      const apiCourse = courses.find(c => c.id === selectedNote.courseId);
                      if (apiCourse) return apiCourse.name;
                      
                      // Müfredat derslerinde ara
                      const curriculumCourse = curriculumCourses.find(c => c.code === selectedNote.courseId);
                      if (curriculumCourse) return curriculumCourse.name;
                      
                      // Eğer courseId boşsa ve müfredat filtresinde seçili ders varsa onu göster
                      if (!selectedNote.courseId && curriculumFilters.selectedCourse) {
                        const selectedCourse = curriculumCourses.find(c => c.code === curriculumFilters.selectedCourse);
                        if (selectedCourse) return selectedCourse.name;
                      }
                      
                      return 'Bilinmeyen Ders';
                    })()}</span>
                    <span>📅 {selectedNote.class}. Sınıf</span>
                    <span>📖 {selectedNote.semester}</span>
                    <span>📝 {formatDate(typeof selectedNote.createdAt === 'string' ? selectedNote.createdAt : selectedNote.createdAt?.toString?.() || '')} </span>
                    <span className={`px-2 py-1 rounded ${selectedNote.isPublic ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>{selectedNote.isPublic ? 'Herkese Açık' : 'Özel'}</span>
                  </div>
                  
                  {selectedNote.tags && selectedNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedNote.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-primary-900/30 text-primary-300 text-sm rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  {selectedNote.isPDF && (
                    <div className="bg-primary-900/20 border border-primary-400/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-primary-300 mb-2">
                        <span>📄</span>
                        <span className="font-medium">PDF Dosyası: {selectedNote.originalFileName}</span>
                        {selectedNote.fileSize && (
                          <span className="text-sm">({(selectedNote.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                        )}
                      </div>
                      {selectedNote.extractedText && (
                        <div className="mt-3">
                          <h4 className="font-medium text-primary-300 mb-2">PDF İçeriği:</h4>
                          <div className="bg-background-card rounded p-3 max-h-40 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm text-text-light">{selectedNote.extractedText}</pre>
                          </div>
                        </div>
                      )}
                      {selectedNote.fileUrl && (
                        <div className="mt-3">
                          <a href={selectedNote.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm transition-all duration-300">
                            <span>🔗</span>
                            <span>PDF'i İndir</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="border-t border-border-light pt-4">
                    <h3 className="font-semibold text-lg mb-2 text-text">Not İçeriği</h3>
                    <div className="bg-background-hover rounded-lg p-4 max-h-60 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-text-light">{selectedNote.content}</pre>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-text-muted">
                    <div className="flex space-x-4">
                      <span>❤️ {selectedNote.likes} beğeni</span>
                      <span>⭐ {selectedNote.favorites} favori</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 border-t border-border-light px-6 py-4 bg-background-card sticky bottom-0 rounded-b-lg z-10">
              {isEditing ? (
                // Düzenleme modunda butonlar
                <>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-all duration-300 flex-1" onClick={handleSaveEdit}>Kaydet</button>
                  <button className="bg-background-hover text-text px-4 py-2 rounded hover:bg-background-card transition-all duration-300 flex-1" onClick={handleCancelEdit}>İptal</button>
                </>
              ) : (
                // Görüntüleme modunda butonlar
                <>
                  <button className="bg-text-accent text-white px-4 py-2 rounded hover:bg-secondary-700 transition-all duration-300 flex-1" onClick={() => setShowSummaryModal(true)}>ÖZETLE</button>
                  {user && selectedNote?.userId === user.uid && (
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-all duration-300 flex-1" onClick={() => handleEditNote(selectedNote)}>DÜZENLE</button>
                  )}
                  <button className="bg-background-hover text-text px-4 py-2 rounded hover:bg-background-card transition-all duration-300 flex-1" onClick={() => setShowNoteModal(false)}>Kapat</button>
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