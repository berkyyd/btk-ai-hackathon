'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';
import { createInvitationCode } from '../../utils/invitationCodeService';
import { getCurriculumInfo } from '../../utils/curriculumUtils';
import { useToast } from '../../components/ToastContainer';

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
  const { showToast } = useToast();
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
        showToast({
          type: 'success',
          title: 'Davet Kodu Oluşturuldu',
          message: '',
          duration: 10000,
          // Custom content for copy button
          customContent: (
            <div className="flex items-center gap-2">
              <span className="font-mono text-base bg-gray-100 px-2 py-1 rounded">{result.code}</span>
              <button
                className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded hover:from-blue-600 hover:to-indigo-700 text-xs font-semibold shadow"
                onClick={() => {
                  navigator.clipboard.writeText(result.code || '');
                  showToast({ type: 'info', title: 'Kopyalandı', message: 'Davet kodu panoya kopyalandı!', duration: 2000 });
                }}
              >
                Kopyala
              </button>
            </div>
          )
        });
      } else {
        showToast({ type: 'error', title: 'Davet kodu oluşturulamadı!', message: '', duration: 4000 });
      }
    } catch (error) {
      showToast({ type: 'error', title: 'Davet kodu oluşturulamadı!', message: '', duration: 4000 });
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50" style={{ marginTop: '72px' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50" style={{ marginTop: '72px' }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Giriş Yapın</h2>
          <p className="text-gray-600">Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50" style={{ marginTop: '72px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">👤</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profilim</h1>
              <p className="text-gray-600">Hesap bilgileriniz ve yönetim paneli</p>
            </div>
          </div>
        </div>

        {/* Kullanıcı Bilgileri */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">ℹ️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Kullanıcı Bilgileri</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl p-4">
              <label className="block text-sm font-medium text-blue-700 mb-2">Ad Soyad</label>
              <p className="text-lg font-semibold text-gray-900">{user.displayName || 'Belirtilmemiş'}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/60 rounded-xl p-4">
              <label className="block text-sm font-medium text-green-700 mb-2">E-posta</label>
              <p className="text-lg font-semibold text-gray-900">{user.email}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/60 rounded-xl p-4">
              <label className="block text-sm font-medium text-purple-700 mb-2">Rol</label>
              <p className="text-lg font-semibold text-gray-900">
                {role === 'academician' ? '🎓 Akademisyen' : 
                 role === 'admin' ? '👑 Yönetici' : '👨‍🎓 Öğrenci'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-4">
              <label className="block text-sm font-medium text-amber-700 mb-2">Kullanıcı ID</label>
              <p className="text-sm font-mono text-gray-900 break-all">{user.uid}</p>
            </div>
          </div>
        </div>

        {/* Admin Paneli */}
        {role === 'admin' && (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-8 mb-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm">⚙️</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Yönetici Paneli</h2>
            </div>
            
            {/* Kullanıcı Yönetimi */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">👥</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Kullanıcı Yönetimi</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  {/* Arama Kutusu */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="İsim veya e-posta ara..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full sm:w-64 text-sm border border-gray-300 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Rol Filtresi */}
                  <select
                    value={roleFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="text-sm border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70 backdrop-blur-sm text-gray-900"
                  >
                    <option value="">Tüm Roller</option>
                    <option value="admin">Yönetici</option>
                    <option value="academician">Akademisyen</option>
                    <option value="student">Öğrenci</option>
                  </select>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Kullanıcılar yükleniyor...</p>
                </div>
              ) : (
                <>
                  <div className="bg-white/50 backdrop-blur-sm border border-gray-200/60 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200/60">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Kullanıcı
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              E-posta
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Rol
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              İşlemler
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/60">
                          {users.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-6 py-12 text-center">
                                <div className="text-4xl mb-4">🔍</div>
                                <p className="text-gray-600 font-medium">Kullanıcı bulunamadı</p>
                                <p className="text-sm text-gray-500 mt-1">Arama kriterlerinizi değiştirmeyi deneyin</p>
                              </td>
                            </tr>
                          ) : (
                            users.map((rowUser) => (
                              <tr key={rowUser.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                      <span className="text-white text-sm font-bold">
                                        {(rowUser.displayName || rowUser.email || 'U').charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="text-sm font-semibold text-gray-900">{rowUser.displayName || 'İsimsiz'}</div>
                                      <div className="text-xs text-gray-500">ID: {rowUser.id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">{rowUser.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${
                                    rowUser.role === 'academician' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                    rowUser.role === 'admin' ? 'bg-red-100 text-red-800 border-red-200' :
                                    'bg-green-100 text-green-800 border-green-200'
                                  }`}>
                                    {rowUser.role === 'academician' ? '🎓 Akademisyen' :
                                     rowUser.role === 'admin' ? '👑 Yönetici' : '👨‍🎓 Öğrenci'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  {rowUser.id === user.uid ? (
                                    <span className="text-gray-500 text-sm font-medium">Kendi hesabınız</span>
                                  ) : (
                                    <select
                                      value={rowUser.role || 'student'}
                                      onChange={(e) => handleRoleChange(rowUser.id, e.target.value)}
                                      className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 hover:bg-gray-50 transition-colors"
                                    >
                                      <option value="student">👨‍🎓 Öğrenci</option>
                                      <option value="academician">🎓 Akademisyen</option>
                                      <option value="admin">👑 Yönetici</option>
                                    </select>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Sayfalama ve Bilgi */}
                  <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                      {totalUsers > 0 ? (
                        <>
                          <span className="font-semibold">Toplam {totalUsers} kullanıcı</span>
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
                          className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 transition-colors font-medium"
                        >
                          ← Önceki
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 transition-colors font-medium"
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
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">🎫</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Davet Kodu Oluşturma</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => generateInvitationCode('student')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <span className="text-lg">🎓</span>
                  Öğrenci Davet Kodu
                </button>
                <button
                  onClick={() => generateInvitationCode('academician')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <span className="text-lg">👨‍🏫</span>
                  Akademisyen Davet Kodu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Müfredat Yönetimi - Sadece Admin için */}
        {role === 'admin' && curriculumData && (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm">📚</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Müfredat Yönetimi</h2>
            </div>
            
            {/* Dönem Seçimi */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Dönem Seçin
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70 backdrop-blur-sm text-gray-900"
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
              <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">➕</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Yeni Ders Ekle</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Ders Kodu"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Ders Adı"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  />
                  <select
                    value={newCourse.type}
                    onChange={(e) => setNewCourse({...newCourse, type: e.target.value})}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  >
                    <option value="Zorunlu">Zorunlu</option>
                    <option value="Seçmeli">Seçmeli</option>
                  </select>
                  <input
                    type="number"
                    placeholder="AKTS"
                    value={newCourse.ects}
                    onChange={(e) => setNewCourse({...newCourse, ects: parseInt(e.target.value)})}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
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
                  className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <span className="text-lg">➕</span>
                  Ders Ekle
                </button>
              </div>
            )}

            {/* Mevcut Dersler Listesi */}
            {selectedSemester !== '' && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">📋</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Mevcut Dersler</h4>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/60 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200/60">
                        <tr>
                          <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Kod</th>
                          <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ders Adı</th>
                          <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tür</th>
                          <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">AKTS</th>
                          <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/60">
                        {curriculumData?.curriculum?.[parseInt(selectedSemester)]?.courses?.map((course, index) => (
                          <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 text-gray-900 font-medium">{course.code}</td>
                            <td className="p-4 text-gray-900">{course.name}</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                course.type === 'Zorunlu' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-green-100 text-green-800 border-green-200'
                              }`}>
                                {course.type}
                              </span>
                            </td>
                            <td className="p-4 text-gray-900 font-medium">{course.ects}</td>
                            <td className="p-4">
                              <button
                                onClick={() => {
                                  alert('Müfredat yönetimi özelliği kaldırıldı. Curriculum artık static JSON dosyasından geliyor.');
                                }}
                                className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;