'use client'

import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react'
import Card from '../../components/Card'
import LoginPrompt from '../../components/LoginPrompt'
import curriculumData from '../../data/curriculum.json';

interface CurriculumCourse {
  code: string;
  name: string;
  type: string;
  ects: number;
}

interface CurriculumSemester {
  class: number;
  semester: string;
  courses: CurriculumCourse[];
  elective_courses?: CurriculumCourse[] | undefined;
}

interface CurriculumData {
  university: string;
  department: string;
  curriculum: CurriculumSemester[];
}

export default function MufredatPage() {
  const { user, role, loading: authLoading } = useAuth();
  const [curriculum, setCurriculum] = useState<CurriculumSemester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtreleme state'leri
  const [filters, setFilters] = useState({
    selectedClass: 0, // 0 = Tümü
    selectedSemester: '', // Boş = Tümü
    selectedType: '' // Boş = Tümü
  });

  useEffect(() => {
    setLoading(true);
    try {
      // Statik JSON dosyasından müfredat verisini al
      setCurriculum(curriculumData.curriculum || []);
    } catch (err) {
      setError('Müfredat yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtreleme fonksiyonu
  const filteredCurriculum = curriculum.filter(semester => {
    if (filters.selectedClass !== 0 && semester.class !== filters.selectedClass) {
      return false;
    }
    if (filters.selectedSemester) {
      // Semester değerini kontrol et (örn: "Güz (1. Yarıyıl)" -> "Güz" kontrolü)
      const semesterName = semester.semester.includes('Güz') ? 'Güz' : 'Bahar';
      if (semesterName !== filters.selectedSemester) {
        return false;
      }
    }
    return true;
  }).map(semester => ({
    ...semester,
    courses: semester.courses.filter(course => {
      if (filters.selectedType && course.type !== filters.selectedType) {
        return false;
      }
      return true;
    }),
    elective_courses: semester.elective_courses ? semester.elective_courses.filter(course => {
      if (filters.selectedType && course.type !== filters.selectedType) {
        return false;
      }
      return true;
    }) : undefined
  })).filter(semester => semester.courses.length > 0 || (semester.elective_courses && semester.elective_courses.length > 0));



  // Sınıf seçenekleri
  const classOptions = [
    { value: 0, label: 'Tüm Sınıflar' },
    { value: 1, label: '1. Sınıf' },
    { value: 2, label: '2. Sınıf' },
    { value: 3, label: '3. Sınıf' },
    { value: 4, label: '4. Sınıf' }
  ];

  // Dönem seçenekleri
  const semesterOptions = [
    { value: '', label: 'Tüm Dönemler' },
    { value: 'Güz', label: 'Güz' },
    { value: 'Bahar', label: 'Bahar' }
  ];

  // Tür seçenekleri
  const typeOptions = [
    { value: '', label: 'Tüm Türler' },
    { value: 'Zorunlu', label: 'Zorunlu' },
    { value: 'Seçmeli', label: 'Seçmeli' }
  ];

  // Filtre değişikliği
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Seçmeli ders sayısını hesaplayan fonksiyon
  const getElectiveCourseCount = (semester: CurriculumSemester): number => {
    // elective_courses undefined olabilir, bu durumda 0 döndür
    if (!semester.elective_courses) {
      return 0;
    }
    
    // Sınıf ve dönem bazında seçmeli ders sayısını belirle
    if (semester.class === 2) {
      return 1; // 2. sınıf: 1 seçmeli ders
    } else if (semester.class === 3) {
      return 2; // 3. sınıf: 2 seçmeli ders
    } else if (semester.class === 4) {
      return 3; // 4. sınıf: 3 seçmeli ders
    }
    return 0;
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
        title="Müfredat Sayfasına Erişim"
        description="YBS bölümü müfredatını incelemek ve ders bilgilerini görmek için giriş yapmanız gerekiyor."
        features={[
          "Tüm derslerin detaylı bilgileri",
          "Sınıf ve dönem bazında filtreleme",
          "Zorunlu ve seçmeli ders ayrımı",
          "AKTS kredi bilgileri",
          "Ders açıklamaları ve kodları"
        ]}
      />
    );
  }

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Müfredat</h1>
        <p className="text-gray-600">YBS Bölümü Ders Programı</p>
      </div>

      {/* Filtreleme Bölümü */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Filtreleme</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sınıf</label>
            <select
              value={filters.selectedClass}
              onChange={(e) => handleFilterChange('selectedClass', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {classOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dönem</label>
            <select
              value={filters.selectedSemester}
              onChange={(e) => handleFilterChange('selectedSemester', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {semesterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tür</label>
            <select
              value={filters.selectedType}
              onChange={(e) => handleFilterChange('selectedType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Müfredat Listesi */}
      {filteredCurriculum.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">Seçilen filtrelere uygun ders bulunamadı.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredCurriculum.map((semester, index) => (
            <Card key={index} className="overflow-hidden">
                             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                 <h2 className="text-xl font-bold text-gray-800">
                   {semester.class}. Sınıf - {semester.semester.includes('Güz') ? 'Güz' : 'Bahar'}
                 </h2>
               </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ders Kodu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ders Adı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        AKTS
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tür
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                                         {semester.courses.map((course, courseIndex) => {
                       // Genel seçmeli ders satırlarını atla (örn: "Seçmeli Ders 5. Yarıyıl")
                       if (course.name.includes('Seçmeli Ders') && course.name.includes('Yarıyıl')) {
                         return null;
                       }
                       
                       // Staj kontrolü
                       const isStaj = course.name.toLowerCase().includes('staj');
                       
                       return (
                         <tr key={course.code + courseIndex} className="hover:bg-gray-50 transition-colors">
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                             {course.code}
                           </td>
                           <td className="px-6 py-4 text-sm text-gray-900">
                             {course.name}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                             {course.ects}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-right">
                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                               isStaj 
                                 ? 'bg-orange-100 text-orange-800' 
                                 : course.type === 'Zorunlu' 
                                   ? 'bg-green-100 text-green-800' 
                                   : 'bg-blue-100 text-blue-800'
                             }`}>
                               {isStaj ? 'Staj' : course.type}
                             </span>
                           </td>
                         </tr>
                       );
                     })}
                     
                     {/* Seçmeli dersler bölümü */}
                     {semester.elective_courses && semester.elective_courses.length > 0 && (
                       <>
                         <tr className="bg-blue-50">
                           <td colSpan={4} className="px-6 py-3">
                             <div className="flex items-center justify-between">
                               <span className="text-sm font-semibold text-blue-800">
                                 Bu dönem {getElectiveCourseCount(semester)} adet seçmeli ders alabilirsiniz:
                               </span>
                             </div>
                           </td>
                         </tr>
                         {semester.elective_courses
                           .filter(course => !course.name.includes('Üniversite Seçmeli Dersler'))
                           .map((course, courseIndex) => (
                             <tr key={`elective-${course.code}-${courseIndex}`} className="hover:bg-blue-50 transition-colors bg-blue-25">
                               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">
                                 {course.code}
                               </td>
                               <td className="px-6 py-4 text-sm text-blue-900">
                                 {course.name}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                                 {course.ects}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-right">
                                 <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                   Seçmeli
                                 </span>
                               </td>
                             </tr>
                           ))}
                         
                         {/* USD Dersler bölümü */}
                         {semester.elective_courses.some(course => course.name.includes('Üniversite Seçmeli Dersler')) && (
                           <>
                             <tr className="bg-purple-50">
                               <td colSpan={4} className="px-6 py-3">
                                 <div className="flex items-center justify-between">
                                   <span className="text-sm font-semibold text-purple-800">
                                     USD (Üniversite Seçmeli Dersler):
                                   </span>
                                 </div>
                               </td>
                             </tr>
                             {semester.elective_courses
                               .filter(course => course.name.includes('Üniversite Seçmeli Dersler'))
                               .map((course, courseIndex) => (
                                 <tr key={`usd-${course.code}-${courseIndex}`} className="hover:bg-purple-50 transition-colors bg-purple-25">
                                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-900">
                                     {course.code}
                                   </td>
                                   <td className="px-6 py-4 text-sm text-purple-900">
                                     {course.name}
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-900">
                                     {course.ects}
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-right">
                                     <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                       USD
                                     </span>
                                   </td>
                                 </tr>
                               ))}
                           </>
                         )}
                       </>
                     )}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}