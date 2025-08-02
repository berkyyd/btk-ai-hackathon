'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';
import { createInvitationCode } from '../../utils/invitationCodeService';
import { getCurriculumInfo } from '../../utils/curriculumUtils';
import LoginPrompt from '../../components/LoginPrompt';

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
  elective_courses?: CurriculumCourse[];
}

interface CurriculumData {
  university: string;
  faculty: string;
  department: string;
  curriculum: CurriculumSemester[];
}

const ProfilePage = () => {
  const { user, role, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
        title="Profil Sayfasına Erişim"
        message="Profil bilgilerinizi görüntülemek ve düzenlemek için giriş yapmanız gerekiyor."
      />
    );
  }
  const [curriculumData, setCurriculumData] = useState<CurriculumData | null>(null);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    type: 'Zorunlu',
    ects: 4
  });
  
  // Sayfalama state'leri
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user && role === 'admin') {
      fetchUsers();
    }
    
    // Curriculum verilerini yükle
    const curriculum = getCurriculumInfo();
    setCurriculumData(curriculum);
  }, [user, role, currentPage, roleFilter, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: '5',
        role: roleFilter,
        search: searchQuery
      });
      const response = await fetch(`/api/users?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalUsers(data.pagination.totalUsers);
      } else {
        console.error('Kullanıcılar yüklenirken hata:', data.error);
        alert('Kullanıcılar yüklenirken hata oluştu: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Kullanıcı listesini yenile
        fetchUsers();
        alert('Kullanıcı rolü başarıyla güncellendi!');
      } else {
        alert('Rol güncellenirken hata oluştu: ' + data.error);
      }
    } catch (error) {
      console.error('Rol güncelleme hatası:', error);
      alert('Rol güncellenirken hata oluştu!');
    }
  };

  const generateInvitationCode = async (targetRole: 'academician' | 'student' = 'student') => {
    try {
      const result = await createInvitationCode(targetRole);
      if (result.success && result.code) {
        alert(`Davet kodu: ${result.code}`);
      } else {
        alert('Davet kodu oluşturulamadı!');
      }
    } catch (error) {
      console.error('Davet kodu oluşturma hatası:', error);
      alert('Davet kodu oluşturulamadı!');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Arama yapıldığında ilk sayfaya dön
  };

  const handleFilterChange = (filter: string) => {
    setRoleFilter(filter);
    setCurrentPage(1); // Filtre değiştiğinde ilk sayfaya dön
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Giriş Yapın</h2>
          <p className="text-gray-600">Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profilim</h1>
          <p className="mt-2 text-gray-600">Hesap bilgileriniz ve yönetim paneli</p>
        </div>

        {/* Kullanıcı Bilgileri */}
        <div className="bg-gray-100 rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Kullanıcı Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
              <p className="mt-1 text-sm text-gray-900">{user.displayName || 'Belirtilmemiş'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-posta</label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rol</label>
              <p className="mt-1 text-sm text-gray-900">
                {role === 'academician' ? '🎓 Akademisyen' : 
                 role === 'admin' ? '👑 Yönetici' : '👨‍🎓 Öğrenci'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kullanıcı ID</label>
              <p className="mt-1 text-sm text-gray-900 font-mono">{user.uid}</p>
            </div>
          </div>
        </div>

        {/* Admin Paneli */}
        {role === 'admin' && (
          <div className="bg-gray-100 rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Yönetici Paneli</h2>
            
            {/* Kullanıcı Yönetimi */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Kullanıcı Yönetimi</h3>
                <div className="flex gap-3">
                  {/* Arama Kutusu */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="İsim veya e-posta ara..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-3 py-2 pl-8 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Rol Filtresi */}
                  <select
                    value={roleFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tüm Roller</option>
                    <option value="admin">Yönetici</option>
                    <option value="academician">Akademisyen</option>
                    <option value="student">Öğrenci</option>
                  </select>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Kullanıcılar yükleniyor...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kullanıcı
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            E-posta
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rol
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-100 divide-y divide-gray-300">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                              <div className="text-lg mb-2">🔍</div>
                              <p>Kullanıcı bulunamadı</p>
                              <p className="text-sm mt-1">Arama kriterlerinizi değiştirmeyi deneyin</p>
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-200">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{user.displayName || 'İsimsiz'}</div>
                                <div className="text-xs text-gray-500">ID: {user.id}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.role === 'academician' ? 'bg-blue-100 text-blue-800' :
                                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {user.role === 'academician' ? 'Akademisyen' :
                                   user.role === 'admin' ? 'Yönetici' : 'Öğrenci'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <select
                                  value={user.role || 'student'}
                                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="student">Öğrenci</option>
                                  <option value="academician">Akademisyen</option>
                                  <option value="admin">Yönetici</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Sayfalama ve Bilgi */}
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      {totalUsers > 0 ? (
                        <>
                          Toplam {totalUsers} kullanıcı
                          {searchQuery && ` (${searchQuery} için arama sonucu)`}
                          {roleFilter && ` (${roleFilter} rolü)`}
                          , Sayfa {currentPage} / {totalPages}
                        </>
                      ) : (
                        'Kullanıcı bulunamadı'
                      )}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          ← Önceki
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Sonraki →
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Davet Kodu Oluşturma */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Davet Kodu Oluşturma</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => generateInvitationCode('student')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  🎓 Öğrenci Davet Kodu
                </button>
                <button
                  onClick={() => generateInvitationCode('academician')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  👨‍🏫 Akademisyen Davet Kodu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Müfredat Yönetimi - Sadece Admin için */}
        {role === 'admin' && curriculumData && (
          <div className="bg-gray-100 rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Müfredat Yönetimi</h2>
            
            {/* Dönem Seçimi */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dönem Seçin
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Dönem seçin</option>
                {curriculumData?.curriculum?.map((semester, index) => (
                  <option key={index} value={index}>
                    {semester.class}. Sınıf {semester.semester}
                  </option>
                ))}
              </select>
            </div>

            {/* Yeni Ders Ekleme Formu */}
            {selectedSemester !== '' && (
              <div className="mb-6 p-4 bg-gray-200 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">Yeni Ders Ekle</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Ders Kodu"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Ders Adı"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newCourse.type}
                    onChange={(e) => setNewCourse({...newCourse, type: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Zorunlu">Zorunlu</option>
                    <option value="Seçmeli">Seçmeli</option>
                  </select>
                  <input
                    type="number"
                    placeholder="AKTS"
                    value={newCourse.ects}
                    onChange={(e) => setNewCourse({...newCourse, ects: parseInt(e.target.value)})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    if (!newCourse.code || !newCourse.name) {
                      alert('Lütfen ders kodu ve adını girin!');
                      return;
                    }
                    
                    alert('Müfredat yönetimi özelliği kaldırıldı. Curriculum artık static JSON dosyasından geliyor.');
                  }}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  ➕ Ders Ekle
                </button>
              </div>
            )}

            {/* Mevcut Dersler Listesi */}
            {selectedSemester !== '' && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">Mevcut Dersler</h4>
                <div className="bg-white rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Kod</th>
                        <th className="p-2 text-left">Ders Adı</th>
                        <th className="p-2 text-left">Tür</th>
                        <th className="p-2 text-left">AKTS</th>
                        <th className="p-2 text-left">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {curriculumData?.curriculum?.[parseInt(selectedSemester)]?.courses?.map((course, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50">
                          <td className="p-2">{course.code}</td>
                          <td className="p-2">{course.name}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              course.type === 'Zorunlu' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {course.type}
                            </span>
                          </td>
                          <td className="p-2">{course.ects}</td>
                          <td className="p-2">
                            <button
                              onClick={() => {
                                alert('Müfredat yönetimi özelliği kaldırıldı. Curriculum artık static JSON dosyasından geliyor.');
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              🗑️ Sil
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;