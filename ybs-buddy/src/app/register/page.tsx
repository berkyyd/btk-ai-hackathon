'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { createUserWithEmailAndPassword, updateProfile, deleteUser } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, setDoc, getDoc, updateDoc, DocumentReference } from "firebase/firestore";
import { validateInvitationCode, markInvitationCodeAsUsed } from '../../utils/invitationCodeService';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    invitationCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setUserManually } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      setLoading(false);
      return;
    }

    let createdUser: any = null;

    try {
      // 1. Firebase Auth ile kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      createdUser = userCredential.user;
      
      // 2. Display name güncelle
      if (formData.displayName) {
        await updateProfile(createdUser, { displayName: formData.displayName });
      }

      let userRole = 'student'; // Varsayılan rol
      let invitationCodeDocRef: DocumentReference | null = null;

      // Davet kodu kontrolü
      if (formData.invitationCode) {
        const validationResult = await validateInvitationCode(formData.invitationCode);
        if (validationResult.success && validationResult.docRef) {
          // Davet kodundan gelen role'ü kullan
          userRole = validationResult.targetRole || 'student';
          invitationCodeDocRef = validationResult.docRef;
        } else {
          console.warn('Davet kodu geçersiz veya kullanılmış: ', validationResult.error);
          // Davet kodu geçersiz olsa bile kayıt işlemine devam et, rol varsayılan olarak kalır.
        }
      }

      // 3. Firestore'a kullanıcı dökümanı oluştur
      await setDoc(doc(db, "users", createdUser.uid), {
        uid: createdUser.uid,
        displayName: formData.displayName,
        email: formData.email,
        role: userRole, 
        createdAt: new Date().toISOString(),
        bio: "",
        avatarUrl: ""
      });

      // Davet kodu kullanıldı olarak işaretle (Firestore kaydı başarılı olduktan sonra)
      if (invitationCodeDocRef && createdUser.uid) {
        await markInvitationCodeAsUsed(invitationCodeDocRef, createdUser.uid);
      }
      
      // 4. Kullanıcıyı direkt giriş yapmış duruma getir
      setUserManually(createdUser, userRole);
      
      // 5. Başarılı kayıt - ana sayfaya yönlendir
      router.push('/');

    } catch (err: any) {
      console.error('Register error:', err);
      
      // Eğer Auth'da kullanıcı oluşturuldu ama Firestore kaydı başarısız olduysa
      if (createdUser) {
        try {
          await deleteUser(createdUser);
        } catch (deleteError) {
          console.error('Failed to delete user after failed registration:', deleteError);
        }
      }
      
      if (err.code === 'auth/email-already-in-use') {
        setError('Bu email adresi zaten kullanımda. Lütfen farklı bir email adresi kullanın veya giriş yapın.');
      } else if (err.code === 'auth/weak-password') {
        setError('Şifre en az 6 karakter olmalıdır.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Geçerli bir email adresi giriniz.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('İnternet bağlantınızı kontrol ediniz.');
      } else {
        setError('Kayıt olurken bir hata oluştu. Lütfen tekrar deneyiniz.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden" style={{ marginTop: '72px' }}>
      {/* Background Animated Elements */}
      <div className="absolute inset-0">
        {/* Floating AI Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-primary-300 rounded-full opacity-15 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-primary-400 rounded-full opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Additional Light Effects */}
        <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-blue-200 rounded-full opacity-15 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/3 right-1/4 w-28 h-28 bg-indigo-200 rounded-full opacity-12 animate-pulse" style={{animationDelay: '1.5s'}}></div>
        
        {/* AI Circuit-like Elements */}
        <div className="absolute top-1/2 left-1/6 w-12 h-12 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-lg opacity-20 animate-pulse" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute bottom-1/4 right-1/6 w-16 h-16 bg-gradient-to-br from-indigo-300 to-blue-400 rounded-lg opacity-15 animate-pulse" style={{animationDelay: '1.2s'}}></div>
        
        {/* Floating Light Particles */}
        <div className="absolute top-1/4 right-1/3 w-8 h-8 bg-white rounded-full opacity-30 animate-pulse shadow-lg" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-white rounded-full opacity-25 animate-pulse shadow-lg" style={{animationDelay: '0.7s'}}></div>
        <div className="absolute top-2/3 right-1/2 w-10 h-10 bg-white rounded-full opacity-20 animate-pulse shadow-lg" style={{animationDelay: '1.8s'}}></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
          {/* Modern Glassmorphism Border Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10"></div>
          
          {/* Subtle Border Glow */}
          <div className="absolute inset-0 rounded-3xl border border-white/30"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Yeni hesap oluşturun
              </h2>
              <p className="text-gray-600">
                Veya{' '}
                <Link href="/login" className="font-semibold text-green-600 hover:text-green-700 transition-colors">
                  mevcut hesabınıza giriş yapın
                </Link>
              </p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Ad Soyad
                  </label>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    autoComplete="name"
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:bg-white/90"
                    placeholder="Ad Soyad"
                    value={formData.displayName}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email adresi
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:bg-white/90"
                    placeholder="Email adresi"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Şifre
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:bg-white/90"
                    placeholder="Şifre (en az 6 karakter)"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Şifre Tekrar
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:bg-white/90"
                    placeholder="Şifre Tekrar"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="invitationCode" className="block text-sm font-semibold text-gray-700 mb-2">
                    Davet Kodu (isteğe bağlı)
                  </label>
                  <input
                    id="invitationCode"
                    name="invitationCode"
                    type="text"
                    autoComplete="off"
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 transition-all duration-300 hover:bg-white/90"
                    placeholder="Davet Kodu (isteğe bağlı)"
                    value={formData.invitationCode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Kayıt olunuyor...
                    </div>
                  ) : (
                    'Kayıt Ol'
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link href="/" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                  Ana sayfaya dön
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 