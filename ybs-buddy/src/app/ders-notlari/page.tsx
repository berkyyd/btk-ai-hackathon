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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import LoginPrompt from '../../components/LoginPrompt'

export default function DersNotlariPage() {
  const { user, role, loading: authLoading } = useAuth();
  const [allNotes, setAllNotes] = useState<Note[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [users, setUsers] = useState<{[key: string]: {displayName: string}}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')



  // Filtreler
  const [filters, setFilters] = useState({
    classYear: '',
    semester: '',
    courseId: '',
    search: ''
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


  // Notları yükle
  const loadNotes = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await apiClient.getNotes() // Parametre göndermiyoruz
      
      console.log('Notes API Response:', response)
      const apiData: any = response.data;
      if (
        response.success &&
        apiData &&
        Array.isArray(apiData.data)
      ) {
        const notesWithClass = apiData.data.map((note: any) => ({
          ...note,
          class: note.classYear // classYear'dan class'a kopyala
        }))
        setAllNotes(notesWithClass)
        filterNotes(notesWithClass)
        
        // Kullanıcı bilgilerini yükle
        const userIds = notesWithClass.map((note: Note) => note.userId || 'anonymous')
        await loadUsers(userIds)
      } else {
        setAllNotes([])
        setNotes([])
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

  // Kullanıcı bilgilerini yükle
  const loadUsers = async (userIds: string[]) => {
    try {
      const uniqueUserIds = [...new Set(userIds)]
      const usersData: {[key: string]: {displayName: string}} = {}
      
      for (const userId of uniqueUserIds) {
        if (userId && userId !== 'anonymous') {
          const userDoc = await getDoc(doc(db, 'users', userId))
          if (userDoc.exists()) {
            usersData[userId] = {
              displayName: userDoc.data().displayName || 'Bilinmeyen Kullanıcı'
            }
          } else {
            usersData[userId] = { displayName: 'Bilinmeyen Kullanıcı' }
          }
        } else {
          usersData[userId] = { displayName: 'Anonim Kullanıcı' }
        }
      }
      
      setUsers(usersData)
    } catch (err) {
      console.error('Users load error:', err)
    }
  }

  // İlk yükleme
  useEffect(() => {
    loadCourses()
    loadNotes()
  }, [])

  // Filtreler değiştiğinde notları yeniden filtrele
  useEffect(() => {
    if (allNotes.length > 0) {
      filterNotes(allNotes)
    }
  }, [filters, allNotes])

  // Client-side filtering logic
  const filterNotes = (notesToFilter: Note[]) => {
    let filtered = notesToFilter

    // Kullanıcı sadece kendi notlarını ve herkese açık notları görebilsin
    if (user) {
      filtered = filtered.filter(note => 
        note.isPublic || note.userId === user.uid
      )
    } else {
      // Giriş yapmamış kullanıcılar sadece herkese açık notları görebilir
      filtered = filtered.filter(note => note.isPublic)
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

  // Yeni not ekleme
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiClient.addNote({
        ...newNote,
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
      console.log('Saving note:', editingNote.id, {
        title: editingNote.title,
        content: editingNote.content,
        tags: editingNote.tags || [],
        isPublic: editingNote.isPublic || false
      })

      const response = await apiClient.updateNote(editingNote.id, {
        title: editingNote.title,
        content: editingNote.content,
        tags: editingNote.tags || [],
        isPublic: editingNote.isPublic || false
      })

      console.log('Update response:', response)

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
    // setSummaryLoading(true); // This state is removed, so this line is removed.
    // setSummaryError(''); // This state is removed, so this line is removed.
    // setSummaryResult(null); // This state is removed, so this line is removed.
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
    // setSummaryLoading(true); // This state is removed, so this line is removed.
    // setSummaryError(''); // This state is removed, so this line is removed.
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

  

  // Giriş kontrolü
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
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
        <h1 className='text-5xl font-extrabold text-text leading-tight mb-4'>
          Ders Notları
        </h1>
        <p className='text-lg text-text-light max-w-3xl mx-auto leading-relaxed'>
          Paylaşılan ders notlarına kolayca erişin ve kendi notlarınızı ekleyin.
        </p>
      </section>

      {/* Filtreler */}
      <Card className='mb-8'>
        <h3 className='text-xl font-bold text-text mb-4'>Filtreler</h3>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          <div>
            <label className='block text-sm font-medium text-text mb-2'>Sınıf</label>
            <select
              value={filters.classYear}
              onChange={(e) => handleFilterChange('classYear', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Tümü</option>
              <option value='1'>1. Sınıf</option>
              <option value='2'>2. Sınıf</option>
              <option value='3'>3. Sınıf</option>
              <option value='4'>4. Sınıf</option>
            </select>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-text mb-2'>Dönem</label>
            <select
              value={filters.semester}
              onChange={(e) => handleFilterChange('semester', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Tümü</option>
              <option value='Güz'>Güz</option>
              <option value='Bahar'>Bahar</option>
            </select>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-text mb-2'>Ders</label>
            <select
              value={filters.courseId}
              onChange={(e) => handleFilterChange('courseId', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Tümü</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
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
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          
          {user && (
            <div className='flex items-end'>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className='w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors'
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
              <span className='text-blue-600 font-semibold text-sm bg-blue-100 px-3 py-1 rounded-full'>
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-text mb-2'>Ders</label>
                <select
                  value={newNote.courseId}
                  onChange={(e) => setNewNote(prev => ({ ...prev, courseId: e.target.value }))}
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
                <label className='block text-sm font-medium text-text mb-2'>Sınıf</label>
                <select
                  value={newNote.class}
                  onChange={(e) => setNewNote(prev => ({ ...prev, class: parseInt(e.target.value) }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                  value={newNote.semester}
                  onChange={(e) => setNewNote(prev => ({ ...prev, semester: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='Güz'>Güz</option>
                  <option value='Bahar'>Bahar</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className='block text-sm font-medium text-text mb-2'>Not İçeriği</label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                rows={6}
                placeholder='Notunuzu buraya yazın...'
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
              <div className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
                <div className='mb-3'>
                  <h4 className='font-medium text-text'>PDF Metni: {uploadedFile.name}</h4>
                </div>
                <div className='max-h-60 overflow-y-auto'>
                  <pre className='text-sm text-gray-700 whitespace-pre-wrap'>{extractedText}</pre>
                </div>
              </div>
            )}
            
            <div>
              <label className='block text-sm font-medium text-text mb-2'>Etiketler</label>
              <div className='flex flex-wrap gap-2'>
                {['SQL', 'Veritabanı', 'Yapay Zeka', 'Programlama', 'Web', 'Mobil'].map(tag => (
                  <button
                    key={tag}
                    type='button'
                    onClick={() => handleTagChange(tag, !newNote.tags.includes(tag))}
                    className={`px-3 py-1 rounded-full text-sm ${
                      newNote.tags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            <div className='flex items-center space-x-2'>
              <input
                type='checkbox'
                id='isPublic'
                checked={newNote.isPublic}
                onChange={(e) => setNewNote(prev => ({ ...prev, isPublic: e.target.checked }))}
                className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
              />
              <label htmlFor='isPublic' className='text-sm font-medium text-text'>
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
                className='px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors'
              >
                İptal
              </button>
              <button
                type='submit'
                className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
              >
                Not Ekle
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Hata Mesajı */}
      {error && (
        <div className='mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      {/* Notlar Listesi */}
      <Card>
        <h2 className='text-3xl font-bold text-text mb-6 text-center border-b-2 border-primary pb-3'>
          Notlar ({notes.length})
        </h2>
        
        {loading ? (
          <div className='text-center py-8'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
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
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                  note.role === 'academician' 
                    ? 'border-blue-400 bg-blue-50 shadow-lg' 
                    : 'border-gray-200'
                }`}
                onClick={() => handleNoteClick(note)}
              >
                {/* Akademisyen notu etiketi */}
                {note.role === 'academician' && (
                  <div className='flex items-center gap-2 mb-2'>
                    <span className='text-blue-600 font-semibold text-sm'>🎓 Akademisyen Notu</span>
                  </div>
                )}
                
                <div className='flex justify-between items-start mb-2'>
                  <h3 className={`font-bold text-lg line-clamp-2 ${
                    note.role === 'academician' ? 'text-blue-800' : 'text-text'
                  }`}>
                    {note.title}
                  </h3>
                  
                  {/* Kilit simgesi - özel notlar için */}
                  {!note.isPublic && (
                    <span className='text-gray-500 text-lg' title='Özel Not'>🔒</span>
                  )}
                </div>
                
                {/* Kullanıcı adı */}
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-xs text-gray-500'>👤</span>
                  <span className='text-xs text-gray-600'>
                    {users[note.userId || 'anonymous']?.displayName || 'Bilinmeyen Kullanıcı'}
                  </span>
                </div>
                
                <p className='text-sm text-gray-600 mb-2'>
                  {courses.find(c => c.id === note.courseId)?.name || 'Bilinmeyen Ders'}
                </p>
                
                <p className='text-sm text-gray-600 line-clamp-3 mb-3'>
                  {note.content}
                </p>
                
                {note.isPDF && (
                  <div className='flex items-center gap-2 text-blue-600 text-xs mb-2'>
                    <span>📄</span>
                    <span>PDF: {note.originalFileName}</span>
                  </div>
                )}
                
                <div className='flex justify-between text-sm text-gray-500 mb-3'>
                  <span>{note.class}. Sınıf</span>
                  <span>{note.semester}</span>
                  <span>{formatDate((note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt))}</span>
                </div>
                
                {note.tags && note.tags.length > 0 && (
                  <div className='flex flex-wrap gap-1 mb-3'>
                    {note.tags.map(tag => (
                      <span key={tag} className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded'>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className='flex justify-between items-center text-sm text-gray-500'>
                  <div className='flex space-x-4'>
                    <span>❤️ {note.likes}</span>
                    <span>⭐ {note.favorites}</span>
                  </div>
                  
                  <span className='text-blue-500 text-xs'>Detaylar için tıklayın</span>
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Not detayları modalı */}
      {showNoteModal && selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full relative flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10 rounded-t-lg">
              <div className="flex items-center gap-3">
                {selectedNote.role === 'academician' && (
                  <span className="text-blue-600 font-semibold text-sm bg-blue-100 px-3 py-1 rounded-full">
                    🎓 Akademisyen Notu
                  </span>
                )}
                <h2 className={`text-2xl font-bold truncate mr-4 ${
                  selectedNote.role === 'academician' ? 'text-blue-800' : ''
                }`}>
                  {selectedNote.title}
                </h2>
              </div>
              <button className="text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setShowNoteModal(false)}>&times;</button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {isEditing && editingNote ? (
                // Düzenleme modu
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Not Başlığı</label>
                    <input
                      type="text"
                      value={editingNote.title}
                      onChange={(e) => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Not İçeriği</label>
                    <textarea
                      value={editingNote.content}
                      onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={8}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Etiketler</label>
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
                          className={`px-3 py-1 rounded-full text-sm ${
                            editingNote.tags?.includes(tag)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="editIsPublic" className="text-sm font-medium text-gray-700">
                      Herkese Açık
                    </label>
                  </div>
                </div>
              ) : (
                // Görüntüleme modu
                <>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span>📚 {courses.find(c => c.id === selectedNote.courseId)?.name || 'Bilinmeyen Ders'}</span>
                    <span>📅 {selectedNote.class}. Sınıf</span>
                    <span>📖 {selectedNote.semester}</span>
                    <span>📝 {formatDate(typeof selectedNote.createdAt === 'string' ? selectedNote.createdAt : selectedNote.createdAt?.toString?.() || '')} </span>
                    <span className={`px-2 py-1 rounded ${selectedNote.isPublic ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{selectedNote.isPublic ? 'Herkese Açık' : 'Özel'}</span>
                  </div>
                  
                  {selectedNote.tags && selectedNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedNote.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  {selectedNote.isPDF && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-800 mb-2">
                        <span>📄</span>
                        <span className="font-medium">PDF Dosyası: {selectedNote.originalFileName}</span>
                        {selectedNote.fileSize && (
                          <span className="text-sm">({(selectedNote.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                        )}
                      </div>
                      {selectedNote.extractedText && (
                        <div className="mt-3">
                          <h4 className="font-medium text-blue-800 mb-2">PDF İçeriği:</h4>
                          <div className="bg-white rounded p-3 max-h-40 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm text-gray-700">{selectedNote.extractedText}</pre>
                          </div>
                        </div>
                      )}
                      {selectedNote.fileUrl && (
                        <div className="mt-3">
                          <a href={selectedNote.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                            <span>🔗</span>
                            <span>PDF'i İndir</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-2">Not İçeriği</h3>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed">{selectedNote.content}</pre>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex space-x-4">
                      <span>❤️ {selectedNote.likes} beğeni</span>
                      <span>⭐ {selectedNote.favorites} favori</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 border-t px-6 py-4 bg-white sticky bottom-0 rounded-b-lg z-10">
              {isEditing ? (
                // Düzenleme modunda butonlar
                <>
                  <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex-1" onClick={handleSaveEdit}>Kaydet</button>
                  <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 flex-1" onClick={handleCancelEdit}>İptal</button>
                </>
              ) : (
                // Görüntüleme modunda butonlar
                <>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1" onClick={() => setShowSummaryModal(true)}>ÖZETLE</button>
                  {user && selectedNote?.userId === user.uid && (
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex-1" onClick={() => handleEditNote(selectedNote)}>DÜZENLE</button>
                  )}
                  <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 flex-1" onClick={() => setShowNoteModal(false)}>Kapat</button>
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
      />
      
     </div>
  )
}