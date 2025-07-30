'use client'

import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react'
import Card from '../../components/Card'
import { apiClient } from '../../utils/apiClient'
import { Note } from '../../types/note'
import { Course } from '../../types/course'
import FileUpload from '../../components/FileUpload'

export default function DersNotlariPage() {
  const { user, role, loading: authLoading } = useAuth();
  const [allNotes, setAllNotes] = useState<Note[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [courses, setCourses] = useState<Course[]>([])
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
  })

  // PDF yükleme state'i
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState('')

  // Not detayları modal state'i
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [showNoteModal, setShowNoteModal] = useState(false)



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
        fileSize: uploadedFile?.size || null
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
          <h3 className='text-xl font-bold text-text mb-4'>Yeni Not Ekle</h3>
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
                  <h4 className='font-medium text-text'>PDF İçeriği: {uploadedFile.name}</h4>
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
                className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer'
                onClick={() => handleNoteClick(note)}
              >
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='font-bold text-lg text-text line-clamp-2'>{note.title}</h3>
                  
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

      {/* Not Detayları Modal */}
      {showNoteModal && selectedNote && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-start mb-4'>
              <h2 className='text-2xl font-bold text-text'>{selectedNote.title}</h2>
              <button
                onClick={() => setShowNoteModal(false)}
                className='text-gray-500 hover:text-gray-700 text-xl'
              >
                ✕
              </button>
            </div>
            
            <div className='space-y-4'>
              <div className='flex flex-wrap gap-2 text-sm text-gray-600'>
                <span>📚 {courses.find(c => c.id === selectedNote.courseId)?.name || 'Bilinmeyen Ders'}</span>
                <span>📅 {selectedNote.class}. Sınıf</span>
                <span>📖 {selectedNote.semester}</span>
                <span>📝 {formatDate(selectedNote.createdAt.toString())}</span>
                <span className={`px-2 py-1 rounded ${
                  selectedNote.isPublic 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedNote.isPublic ? 'Herkese Açık' : 'Özel'}
                </span>
              </div>
              
              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {selectedNote.tags.map(tag => (
                    <span key={tag} className='px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full'>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {selectedNote.isPDF && (
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                  <div className='flex items-center gap-2 text-blue-800 mb-2'>
                    <span>📄</span>
                    <span className='font-medium'>PDF Dosyası: {selectedNote.originalFileName}</span>
                    {selectedNote.fileSize && (
                      <span className='text-sm'>({(selectedNote.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                    )}
                  </div>
                  
                  {selectedNote.extractedText && (
                    <div className='mt-3'>
                      <h4 className='font-medium text-blue-800 mb-2'>PDF İçeriği:</h4>
                      <div className='bg-white rounded p-3 max-h-60 overflow-y-auto'>
                        <pre className='whitespace-pre-wrap text-sm text-gray-700'>{selectedNote.extractedText}</pre>
                      </div>
                    </div>
                  )}
                  
                  {selectedNote.fileUrl && (
                    <div className='mt-3'>
                      <a 
                        href={selectedNote.fileUrl} 
                        target='_blank' 
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm'
                      >
                        <span>🔗</span>
                        <span>PDF'i İndir</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              <div className='border-t pt-4'>
                <h3 className='font-semibold text-lg mb-2'>Not İçeriği</h3>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <pre className='whitespace-pre-wrap text-sm leading-relaxed'>{selectedNote.content}</pre>
                </div>
              </div>
              
              <div className='flex justify-between items-center text-sm text-gray-500'>
                <div className='flex space-x-4'>
                  <span>❤️ {selectedNote.likes} beğeni</span>
                  <span>⭐ {selectedNote.favorites} favori</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
     </div>
  )
}