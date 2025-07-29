'use client'

import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react'
import Card from '../../components/Card'
import { apiClient } from '../../utils/apiClient'

interface Course {
  id: string
  name: string
  code: string
  classYear: number
  semester: string
  courseType: string
  credits: number
  description: string
}

export default function MufredatPage() {
  const { user, role, loading: authLoading } = useAuth();
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filtreler
  const [filters, setFilters] = useState({
    classYear: '',
    semester: '',
    courseType: 'all'
  })

  // Dersleri yükle
  const loadCourses = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await apiClient.getCourses()
      
      console.log('API Response:', response)
      
      if (response.success) {
        const data = response.data as any
        console.log('Courses data:', data)
        if (data && data.courses) {
          setAllCourses(data.courses)
          filterCourses(data.courses)
        } else {
          console.log('No courses found in response')
          setAllCourses([])
          setCourses([])
        }
      } else {
        console.log('API Error:', response.error)
        setError(response.error || 'Dersler yüklenirken bir hata oluştu')
      }
    } catch (err) {
      setError('Bağlantı hatası')
    } finally {
      setLoading(false)
    }
  }

  // Client-side filtreleme
  const filterCourses = (coursesToFilter: Course[]) => {
    let filtered = coursesToFilter

    if (filters.classYear) {
      filtered = filtered.filter(course => course.classYear === parseInt(filters.classYear))
    }
    
    if (filters.semester) {
      filtered = filtered.filter(course => course.semester === filters.semester)
    }
    
    if (filters.courseType !== 'all') {
      filtered = filtered.filter(course => course.courseType === filters.courseType)
    }

    setCourses(filtered)
  }

  // İlk yükleme
  useEffect(() => {
    loadCourses()
  }, [])

  // Filtreler değiştiğinde client-side filtreleme yap
  useEffect(() => {
    if (allCourses.length > 0) {
      filterCourses(allCourses)
    }
  }, [filters, allCourses])

  // Filtre değişikliği
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Yeni ders ekleme
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    classYear: 1,
    semester: 'Güz',
    courseType: 'Zorunlu',
    credits: 3,
    description: ''
  })

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await apiClient.addCourse(newCourse)
      
      if (response.success) {
        setShowAddForm(false)
        setNewCourse({
          name: '',
          code: '',
          classYear: 1,
          semester: 'Güz',
          courseType: 'Zorunlu',
          credits: 3,
          description: ''
        })
        loadCourses() // Dersleri yeniden yükle
      } else {
        setError(response.error || 'Ders eklenirken bir hata oluştu')
      }
    } catch (err) {
      setError('Bağlantı hatası')
    }
  }

  return (
    <div className='py-8'>
      <section className='text-center mb-16 animate-fadeIn'>
        <h1 className='text-5xl font-extrabold text-text leading-tight mb-4'>
          YBS Müfredatı
        </h1>
        <p className='text-lg text-text-light max-w-3xl mx-auto leading-relaxed'>
          Bandırma Onyedi Eylül Üniversitesi YBS bölümü müfredatını interaktif olarak inceleyin.
        </p>
      </section>

      {/* Filtreler */}
      <Card className='mb-8'>
        <h3 className='text-xl font-bold text-text mb-4'>Filtreler</h3>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
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
            <label className='block text-sm font-medium text-text mb-2'>Ders Türü</label>
            <select
              value={filters.courseType}
              onChange={(e) => handleFilterChange('courseType', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>Tümü</option>
              <option value='Zorunlu'>Zorunlu</option>
              <option value='Seçmeli'>Seçmeli</option>
            </select>
          </div>
          
          {user && role === 'admin' && (
            <div className='flex items-end'>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className='w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors'
              >
                {showAddForm ? 'İptal' : 'Yeni Ders Ekle'}
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Yeni Ders Ekleme Formu */}
      {showAddForm && (
        <Card className='mb-8'>
          <h3 className='text-xl font-bold text-text mb-4'>Yeni Ders Ekle</h3>
          <form onSubmit={handleAddCourse} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-text mb-2'>Ders Adı</label>
                <input
                  type='text'
                  value={newCourse.name}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-text mb-2'>Ders Kodu</label>
                <input
                  type='text'
                  value={newCourse.code}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, code: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-text mb-2'>Sınıf</label>
                <select
                  value={newCourse.classYear}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, classYear: parseInt(e.target.value) }))}
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
                  value={newCourse.semester}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, semester: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='Güz'>Güz</option>
                  <option value='Bahar'>Bahar</option>
                </select>
              </div>
              
              <div>
                <label className='block text-sm font-medium text-text mb-2'>Ders Türü</label>
                <select
                  value={newCourse.courseType}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, courseType: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='Zorunlu'>Zorunlu</option>
                  <option value='Seçmeli'>Seçmeli</option>
                </select>
              </div>
              
              <div>
                <label className='block text-sm font-medium text-text mb-2'>Kredi</label>
                <input
                  type='number'
                  value={newCourse.credits}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  min='1'
                  max='6'
                />
              </div>
            </div>
            
            <div>
              <label className='block text-sm font-medium text-text mb-2'>Açıklama</label>
              <textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                rows={3}
              />
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
                Ders Ekle
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

      {/* Dersler Listesi */}
      <Card>
        <h2 className='text-3xl font-bold text-text mb-6 text-center border-b-2 border-primary pb-3'>
          Dersler ({courses.length})
        </h2>
        
        {loading ? (
          <div className='text-center py-8'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
            <p className='mt-2 text-text-light'>Dersler yükleniyor...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-text-light'>Henüz ders bulunmuyor.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {courses.map((course) => (
              <div key={course.id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='font-bold text-lg text-text'>{course.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    course.courseType === 'Zorunlu' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {course.courseType}
                  </span>
                </div>
                
                <p className='text-sm text-gray-600 mb-2'>{course.code}</p>
                
                <div className='flex justify-between text-sm text-gray-500 mb-2'>
                  <span>{course.classYear}. Sınıf</span>
                  <span>{course.semester}</span>
                  <span>{course.credits} Kredi</span>
                </div>
                
                {course.description && (
                  <p className='text-sm text-gray-600 line-clamp-2'>
                    {course.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
} 