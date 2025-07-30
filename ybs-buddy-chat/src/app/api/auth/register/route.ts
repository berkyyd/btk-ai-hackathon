import { NextRequest, NextResponse } from 'next/server';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../../config/firebase';

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // Firebase Authentication ile kullanıcı oluştur
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Display name güncelle
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Firestore'da kullanıcı dokümanı oluştur
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: displayName || user.displayName,
      createdAt: new Date().toISOString(),
      role: 'student',
      preferences: {
        theme: 'light',
        notifications: true,
      },
    });

    // JWT token oluştur
    const token = await user.getIdToken();

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName,
      },
      token,
    });

  } catch (error: any) {
    console.error('Register error:', error);
    
    // Firebase Auth hata kodlarını Türkçe'ye çevir
    let errorMessage = 'Kayıt olurken bir hata oluştu';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Bu email adresi zaten kullanımda';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Geçersiz email adresi';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Şifre çok zayıf';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
} 