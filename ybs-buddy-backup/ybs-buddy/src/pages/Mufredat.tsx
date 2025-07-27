import { useState } from 'react'
import Card from '../components/Card.tsx'
import { CLASS_OPTIONS, SEMESTER_OPTIONS, COURSE_TYPE_OPTIONS, DEFAULTS } from '../constants.ts'
import type { ClassType, SemesterType, CourseType } from '../types.ts'

function Mufredat() {
  const [selectedClass, setSelectedClass] = useState<ClassType>(DEFAULTS.SELECT_CLASS as ClassType)
  const [selectedSemester, setSelectedSemester] = useState<SemesterType>(DEFAULTS.SELECT_SEMESTER as SemesterType)
  const [selectedCourseType, setSelectedCourseType] = useState<CourseType>(DEFAULTS.SELECT_COURSE_TYPE as CourseType)

  // Statik veriler kaldırıldı - Backend entegrasyonu gerekiyor
  // const courses: any[] = []
  // const filteredCourses: any[] = []

  return (
    <div className='py-8'>
      <h1 className='text-4xl font-bold text-text mb-8 text-center'>
        Müfredat Görüntüleyici
      </h1>

      {/* Filtreleme Alanı */}
      <Card className='mb-8 p-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
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
              onChange={(e) => setSelectedClass(e.target.value as ClassType)}
            >
              {CLASS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              onChange={(e) => setSelectedSemester(e.target.value as SemesterType)}
            >
              {SEMESTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor='course-type-filter'
              className='block text-text text-sm font-bold mb-2'
            >
              Ders Türü:
            </label>
            <select
              id='course-type-filter'
              className='w-full py-2 px-3 bg-background border border-gray-300 rounded-md text-text
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              value={selectedCourseType}
              onChange={(e) => setSelectedCourseType(e.target.value as CourseType)}
            >
              {COURSE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Ders Listesi */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <p className='text-center text-text-light col-span-full'>
          Backend entegrasyonu sonrası ders listesi yüklenecek.
        </p>
      </div>
    </div>
  )
}

export default Mufredat
