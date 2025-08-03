'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
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
  const { register } = useAuth();

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

    try {
      // 1. Firebase Auth ile kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      
      // 2. Display name güncelle
      if (formData.displayName) {
        await updateProfile(user, { displayName: formData.displayName });
      }
      
      console.log('Firebase register successful:', user);

      let userRole = 'student'; // Varsayılan rol
      let invitationCodeDocRef: DocumentReference | null = null;

      // Davet kodu kontrolü
      if (formData.invitationCode) {
        const validationResult = await validateInvitationCode(formData.invitationCode);
        if (validationResult.success && validationResult.docRef) {
          // Davet kodundan gelen role'ü kullan
          userRole = validationResult.targetRole || 'student';
          invitationCodeDocRef = validationResult.docRef;
          console.log('Davet kodu ile kayıt - Role:', userRole);
        } else {
          console.warn('Davet kodu geçersiz veya kullanılmış: ', validationResult.error);
          // Davet kodu geçersiz olsa bile kayıt işlemine devam et, rol varsayılan olarak kalır.
        }
      }

      // 3. Firestore'a kullanıcı dökümanı oluştur
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: formData.displayName,
        email: formData.email,
        role: userRole, 
        createdAt: new Date().toISOString(),
        bio: "",
        avatarUrl: ""
      });

      // Davet kodu kullanıldı olarak işaretle (Firestore kaydı başarılı olduktan sonra)
      if (invitationCodeDocRef && user.uid) {
        await markInvitationCodeAsUsed(invitationCodeDocRef, user.uid);
      }
      
      // 4. AuthContext'i güncelle
      await register(formData.email, formData.password);
      
      // 5. Başarılı kayıt - ana sayfaya yönlendir
      router.push('/');

    } catch (err: any) {
      console.error('Register error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Bu email adresi zaten kullanımda');
      } else if (err.code === 'auth/weak-password') {
        setError('Şifre çok zayıf');
      } else {
        setError('Kayıt olurken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="card-glass p-8 rounded-2xl">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-text-primary">
              Yeni hesap oluşturun
            </h2>
            <p className="mt-2 text-center text-sm text-text-secondary">
              Veya{' '}
              <Link href="/login" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
                mevcut hesabınıza giriş yapın
              </Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/20 border border-red-700/30 text-red-300 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-text-secondary mb-2">
                  Ad Soyad
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  className="appearance-none relative block w-full px-3 py-2 border border-primary-700/30 placeholder-text-muted text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-card-light sm:text-sm transition-all duration-300"
                  placeholder="Ad Soyad"
                  value={formData.displayName}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                  Email adresi
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-primary-700/30 placeholder-text-muted text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-card-light sm:text-sm transition-all duration-300"
                  placeholder="Email adresi"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                  Şifre
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-primary-700/30 placeholder-text-muted text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-card-light sm:text-sm transition-all duration-300"
                  placeholder="Şifre (en az 6 karakter)"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-2">
                  Şifre Tekrar
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-primary-700/30 placeholder-text-muted text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-card-light sm:text-sm transition-all duration-300"
                  placeholder="Şifre Tekrar"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="invitationCode" className="block text-sm font-medium text-text-secondary mb-2">
                  Davet Kodu (isteğe bağlı)
                </label>
                <input
                  id="invitationCode"
                  name="invitationCode"
                  type="text"
                  autoComplete="off"
                  className="appearance-none relative block w-full px-3 py-2 border border-primary-700/30 placeholder-text-muted text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-card-light sm:text-sm transition-all duration-300"
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
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border border-secondary-500/30"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="loading-spinner w-4 h-4"></div>
                    Kayıt olunuyor...
                  </div>
                ) : (
                  'Kayıt Ol'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link href="/" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
                Ana sayfaya dön
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
