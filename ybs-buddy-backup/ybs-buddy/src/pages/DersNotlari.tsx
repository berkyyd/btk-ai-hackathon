import { useState } from 'react'
import Card from '../components/Card.tsx'

function DersNotlari() {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedClass, setSelectedClass] = useState<string>('Tümü')
  const [selectedSemester, setSelectedSemester] = useState<string>('Tümü')
  const [selectedCourse, setSelectedCourse] = useState<string>('Tümü')

  // Statik veriler kaldırıldı - Backend entegrasyonu gerekiyor
  // const notes: any[] = []
  // const filteredNotes: any[] = []

  return (
    <div className='py-8'>
      <h1 className='text-4xl font-bold text-text mb-8 text-center'>
        Ders Notları
      </h1>

      {/* Filtreleme ve Arama Alanı */}
      <Card className='p-6 mb-8'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          <div className='md:col-span-4'>
            <label
              htmlFor='search-term'
              className='block text-text text-sm font-bold mb-2'
            >
              Arama:
            </label>
            <input
              type='text'
              id='search-term'
              className='w-full py-2 px-3 bg-background border border-gray-300 rounded-md text-text placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              placeholder='Not başlığı veya içeriği ara...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor='class-filter'
              className='block text-text text-sm font-bold mb-2'
            >
              Sınıf:
            </label>
            <select
              id='class-filter'
              className='w-full py-2 px-3 bg-background border border-gray-300 rounded-md text-text
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value='Tümü'>Tümü</option>
              <option value='1'>1. Sınıf</option>
              <option value='2'>2. Sınıf</option>
              <option value='3'>3. Sınıf</option>
              <option value='4'>4. Sınıf</option>
            </select>
          </div>

          <div>
            <label
              htmlFor='semester-filter'
              className='block text-text text-sm font-bold mb-2'
            >
              Dönem:
            </label>
            <select
              id='semester-filter'
              className='w-full py-2 px-3 bg-background border border-gray-300 rounded-md text-text
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value='Tümü'>Tümü</option>
              <option value='Güz'>Güz</option>
              <option value='Bahar'>Bahar</option>
            </select>
          </div>

          <div>
            <label
              htmlFor='course-filter'
              className='block text-text text-sm font-bold mb-2'
            >
              Ders:
            </label>
            <select
              id='course-filter'
              className='w-full py-2 px-3 bg-background border border-gray-300 rounded-md text-text
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value='Tümü'>Tümü</option>
              <option value="YBS\'ye Giriş">YBS\'ye Giriş</option>
              <option value='İşletme Matematiği'>İşletme Matematiği</option>
              <option value='Programlamaya Giriş'>Programlamaya Giriş</option>
              <option value='Veri Yapıları'>Veri Yapıları</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Not Listesi */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <p className='text-center text-text-light col-span-full'>
          Backend entegrasyonu sonrası ders notları yüklenecek.
        </p>
      </div>
    </div>
  )
}

export default DersNotlari
