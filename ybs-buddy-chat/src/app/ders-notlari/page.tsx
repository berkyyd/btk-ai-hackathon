'use client'

import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react'
import Card from '../../components/Card'
import { apiClient } from '../../utils/apiClient'
import { Note } from '../../types/note'
import { Course } from '../../types/course'

export default function DersNotlariPage() {
  const { user, role, loading: authLoading } = useAuth();
  const [allNotes, setAllNotes] = useState<Note[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Not düzenleme state'i
  const [isEditing, setIsEditing] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)



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



  // Notları yükle
  const loadNotes = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await apiClient.getNotes() // Parametre göndermiyoruz
      
      console.log('Notes API Response:', response)
      if (response.success && response.data) {
        const data = response.data as any
        console.log('Notes data:', data)
        if (data && data.notes) {
          setAllNotes(data.notes) // Tüm notları sakla
          filterNotes(data.notes) // Hemen filtrele
        } else {
          console.log('No notes found in response')
          setAllNotes([])
          setNotes([])
        }
      } else {
        console.log('API Error:', response.error)
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

  

  if (authLoading) return <div>Yükleniyor...</div>;
  if (!user) return <div>Lütfen giriş yapınız.</div>;

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
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  note.role === 'academician' 
                    ? 'border-blue-400 bg-blue-50 shadow-lg' 
                    : 'border-gray-200'
                }`}
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
                    {note.author || 'Bilinmeyen Kullanıcı'}
                  </span>
                </div>
                
                <p className='text-sm text-gray-600 mb-2'>
                  {courses.find(c => c.id === note.courseId)?.name || 'Bilinmeyen Ders'}
                </p>
                
                <p className='text-sm text-gray-600 line-clamp-3 mb-3'>
                  {note.content}
                </p>
                
                <div className='flex justify-between text-sm text-gray-500 mb-3'>
                  <span>{note.class}. Sınıf</span>
                  <span>{note.semester}</span>
                  <span>{formatDate((note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt))}</span>
                </div>
                
                {note.tags?.length > 0 && (
                  <div className='flex flex-wrap gap-1 mb-3'>
                    {(note.tags || []).map(tag => (
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
                  
                  <button className='text-blue-500 hover:text-blue-700'>
                    Detaylar
                  </button>
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      
     </div>
  )
}