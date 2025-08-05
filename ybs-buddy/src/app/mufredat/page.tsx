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
      </div>
    );
  }

  if (loading) return <div style={{ marginTop: '72px' }} className="p-8 text-center text-text-secondary">Yükleniyor...</div>;
  if (error) return <div style={{ marginTop: '72px' }} className="p-8 text-center text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50" style={{ marginTop: '72px' }}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Müfredat</h1>
          <p className="text-text-secondary">YBS Bölümü Ders Programı</p>
        </div>

        {/* Filtreleme Bölümü */}
        <Card className="mb-8 card-glass">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">Filtreleme</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Sınıf</label>
              <select
                value={filters.selectedClass}
                onChange={(e) => handleFilterChange('selectedClass', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-primary-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary"
              >
                {classOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Dönem</label>
              <select
                value={filters.selectedSemester}
                onChange={(e) => handleFilterChange('selectedSemester', e.target.value)}
                className="w-full px-3 py-2 border border-primary-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary"
              >
                {semesterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Tür</label>
              <select
                value={filters.selectedType}
                onChange={(e) => handleFilterChange('selectedType', e.target.value)}
                className="w-full px-3 py-2 border border-primary-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary"
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
          <Card className="card-glass">
            <div className="text-center py-8">
              <p className="text-text-muted text-lg">Seçilen filtrelere uygun ders bulunamadı.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredCurriculum.map((semester, index) => (
              <Card key={index} className="overflow-hidden card-glass">
                <div className="bg-gradient-to-r from-primary-900/30 to-secondary-900/30 px-6 py-4 border-b border-primary-800/30">
                  <h2 className="text-xl font-bold text-text-primary">
                    {semester.class}. Sınıf - {semester.semester.includes('Güz') ? 'Güz' : 'Bahar'}
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-primary-900/20 border-b border-primary-800/30">
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Ders Kodu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Ders Adı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          AKTS
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Tür
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-800/30">
                      {semester.courses.map((course, courseIndex) => {
                        // Genel seçmeli ders satırlarını atla (örn: "Seçmeli Ders 5. Yarıyıl")
                        if (course.name.includes('Seçmeli Ders') && course.name.includes('Yarıyıl')) {
                          return null;
                        }
                        
                        // Staj kontrolü
                        const isStaj = course.name.toLowerCase().includes('staj');
                        
                        return (
                          <tr key={course.code + courseIndex} className="hover:bg-primary-900/10 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                              {course.code}
                            </td>
                            <td className="px-6 py-4 text-sm text-text-primary">
                              {course.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                              {course.ects}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${
                                isStaj 
                                  ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                                  : course.type === 'Zorunlu' 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
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
                          <tr className="bg-secondary-900/20">
                            <td colSpan={4} className="px-6 py-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-secondary-300">
                                  Bu dönem {getElectiveCourseCount(semester)} adet seçmeli ders alabilirsiniz:
                                </span>
                              </div>
                            </td>
                          </tr>
                          {semester.elective_courses
                            .filter(course => !course.name.includes('Üniversite Seçmeli Dersler'))
                            .map((course, courseIndex) => (
                              <tr key={`elective-${course.code}-${courseIndex}`} className="hover:bg-secondary-900/10 transition-colors bg-secondary-900/5">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-300">
                                  {course.code}
                                </td>
                                <td className="px-6 py-4 text-sm text-secondary-300">
                                  {course.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                                  {course.ects}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <span className="inline-flex px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm bg-purple-100 text-purple-800 border border-purple-200">
                                    Seçmeli
                                  </span>
                                </td>
                              </tr>
                            ))}
                          
                          {/* USD Dersler bölümü */}
                          {semester.elective_courses.some(course => course.name.includes('Üniversite Seçmeli Dersler')) && (
                            <>
                              <tr className="bg-purple-900/20">
                                <td colSpan={4} className="px-6 py-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-purple-300">
                                      USD (Üniversite Seçmeli Dersler):
                                    </span>
                                  </div>
                                </td>
                              </tr>
                              {semester.elective_courses
                                .filter(course => course.name.includes('Üniversite Seçmeli Dersler'))
                                .map((course, courseIndex) => (
                                  <tr key={`usd-${course.code}-${courseIndex}`} className="hover:bg-purple-900/10 transition-colors bg-purple-900/5">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-300">
                                      {course.code}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-purple-300">
                                      {course.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                                      {course.ects}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                      <span className="inline-flex px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm bg-indigo-100 text-indigo-800 border border-indigo-200">
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
    </div>
  );
}