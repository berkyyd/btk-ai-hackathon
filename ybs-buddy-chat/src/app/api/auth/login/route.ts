import { NextRequest, NextResponse } from 'next/server';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../../config/firebase';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // JWT token oluştur (Firebase Auth otomatik olarak yapar)
    const token = await user.getIdToken();

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
      token,
    });

  } catch (error: any) {
    console.error('Login error:', error);
    
    // Firebase Auth hata kodlarını Türkçe'ye çevir
    let errorMessage = 'Giriş yapılırken bir hata oluştu';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Şifre yanlış';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Geçersiz email adresi';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    );
  }
} 