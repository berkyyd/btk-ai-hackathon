'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';
import { createInvitationCode } from '../../utils/invitationCodeService';
import { getCurriculumInfo } from '../../utils/curriculumUtils';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-text-secondary">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Giriş Yapın</h2>
          <p className="text-text-secondary">Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Profilim</h1>
          <p className="mt-2 text-text-secondary">Hesap bilgileriniz ve yönetim paneli</p>
        </div>

        {/* Kullanıcı Bilgileri */}
        <div className="card-glass p-6 mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Kullanıcı Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary">Ad Soyad</label>
              <p className="mt-1 text-sm text-text-primary">{user.displayName || 'Belirtilmemiş'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">E-posta</label>
              <p className="mt-1 text-sm text-text-primary">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Rol</label>
              <p className="mt-1 text-sm text-text-primary">
                {role === 'academician' ? '🎓 Akademisyen' : 
                 role === 'admin' ? '👑 Yönetici' : '👨‍🎓 Öğrenci'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Kullanıcı ID</label>
              <p className="mt-1 text-sm text-text-primary font-mono">{user.uid}</p>
            </div>
          </div>
        </div>

        {/* Admin Paneli */}
        {role === 'admin' && (
          <div className="card-glass p-6 mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Yönetici Paneli</h2>
            
            {/* Kullanıcı Yönetimi */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-text-primary">Kullanıcı Yönetimi</h3>
                <div className="flex gap-3">
                  {/* Arama Kutusu */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="İsim veya e-posta ara..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="text-sm border border-primary-700/30 rounded-md px-3 py-2 pl-8 w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-card-light text-text-primary"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Rol Filtresi */}
                  <select
                    value={roleFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="text-sm border border-primary-700/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-card-light text-text-primary"
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
                  <div className="loading-spinner mx-auto"></div>
                  <p className="mt-2 text-sm text-text-secondary">Kullanıcılar yükleniyor...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto border border-primary-700/30 rounded-lg">
                    <table className="min-w-full divide-y divide-primary-700/30">
                      <thead className="bg-primary-900/20">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Kullanıcı
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            E-posta
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Rol
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-card-light divide-y divide-primary-700/30">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                              <div className="text-lg mb-2">🔍</div>
                              <p>Kullanıcı bulunamadı</p>
                              <p className="text-sm mt-1">Arama kriterlerinizi değiştirmeyi deneyin</p>
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user.id} className="hover:bg-primary-900/10 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-text-primary">{user.displayName || 'İsimsiz'}</div>
                                <div className="text-xs text-text-muted">ID: {user.id}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-text-primary">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                                  user.role === 'academician' ? 'bg-primary-900/30 text-primary-300 border-primary-700/30' :
                                  user.role === 'admin' ? 'bg-secondary-900/30 text-secondary-300 border-secondary-700/30' :
                                  'bg-green-900/30 text-green-300 border-green-700/30'
                                }`}>
                                  {user.role === 'academician' ? 'Akademisyen' :
                                   user.role === 'admin' ? 'Yönetici' : 'Öğrenci'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <select
                                  value={user.role || 'student'}
                                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                  className="text-sm border border-primary-700/30 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-card-light text-text-primary"
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
                    <div className="text-sm text-text-secondary">
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
                          className="px-3 py-1 text-sm border border-primary-700/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-900/20 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary transition-colors"
                        >
                          ← Önceki
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm border border-primary-700/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-900/20 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary transition-colors"
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
              <h3 className="text-lg font-medium text-text-primary mb-3">Davet Kodu Oluşturma</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => generateInvitationCode('student')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors border border-green-500/30"
                >
                  🎓 Öğrenci Davet Kodu
                </button>
                <button
                  onClick={() => generateInvitationCode('academician')}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors border border-primary-500/30"
                >
                  👨‍🏫 Akademisyen Davet Kodu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Müfredat Yönetimi - Sadece Admin için */}
        {role === 'admin' && curriculumData && (
          <div className="card-glass p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Müfredat Yönetimi</h2>
            
            {/* Dönem Seçimi */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Dönem Seçin
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 border border-primary-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary"
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
              <div className="mb-6 p-4 bg-primary-900/10 rounded-lg border border-primary-700/30">
                <h4 className="text-lg font-semibold mb-3 text-text-primary">Yeni Ders Ekle</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Ders Kodu"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                    className="px-3 py-2 border border-primary-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary"
                  />
                  <input
                    type="text"
                    placeholder="Ders Adı"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                    className="px-3 py-2 border border-primary-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary"
                  />
                  <select
                    value={newCourse.type}
                    onChange={(e) => setNewCourse({...newCourse, type: e.target.value})}
                    className="px-3 py-2 border border-primary-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary"
                  >
                    <option value="Zorunlu">Zorunlu</option>
                    <option value="Seçmeli">Seçmeli</option>
                  </select>
                  <input
                    type="number"
                    placeholder="AKTS"
                    value={newCourse.ects}
                    onChange={(e) => setNewCourse({...newCourse, ects: parseInt(e.target.value)})}
                    className="px-3 py-2 border border-primary-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card-light text-text-primary"
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
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors border border-green-500/30"
                >
                  ➕ Ders Ekle
                </button>
              </div>
            )}

            {/* Mevcut Dersler Listesi */}
            {selectedSemester !== '' && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3 text-text-primary">Mevcut Dersler</h4>
                <div className="bg-card-light rounded-lg border border-primary-700/30 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-primary-900/20">
                      <tr>
                        <th className="p-2 text-left text-text-secondary">Kod</th>
                        <th className="p-2 text-left text-text-secondary">Ders Adı</th>
                        <th className="p-2 text-left text-text-secondary">Tür</th>
                        <th className="p-2 text-left text-text-secondary">AKTS</th>
                        <th className="p-2 text-left text-text-secondary">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {curriculumData?.curriculum?.[parseInt(selectedSemester)]?.courses?.map((course, index) => (
                        <tr key={index} className="border-t border-primary-700/30 hover:bg-primary-900/10 transition-colors">
                          <td className="p-2 text-text-primary">{course.code}</td>
                          <td className="p-2 text-text-primary">{course.name}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs border ${
                              course.type === 'Zorunlu' ? 'bg-primary-900/30 text-primary-300 border-primary-700/30' : 'bg-green-900/30 text-green-300 border-green-700/30'
                            }`}>
                              {course.type}
                            </span>
                          </td>
                          <td className="p-2 text-text-primary">{course.ects}</td>
                          <td className="p-2">
                            <button
                              onClick={() => {
                                alert('Müfredat yönetimi özelliği kaldırıldı. Curriculum artık static JSON dosyasından geliyor.');
                              }}
                              className="text-red-400 hover:text-red-300 text-sm transition-colors"
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