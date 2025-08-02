import { NextRequest, NextResponse } from 'next/server';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore/lite';
import { auth, db } from '../../../../config/firebase';
import { validateInvitationCode, markInvitationCodeAsUsed } from '../../../../utils/invitationCodeService';

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName, invitationCode } = await request.json();

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

    let userRole = 'student'; // Varsayılan rol
    let invitationCodeDocRef = null;

    // Davet kodu kontrolü
    if (invitationCode) {
      const validationResult = await validateInvitationCode(invitationCode);
      if (validationResult.success && validationResult.docRef) {
        userRole = validationResult.targetRole || 'student';
        invitationCodeDocRef = validationResult.docRef;
      } else {
        return NextResponse.json(
          { error: 'Geçersiz veya kullanılmış davet kodu' },
          { status: 400 }
        );
      }
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
      role: userRole,
      preferences: {
        theme: 'light',
        notifications: true,
      },
    });

    // Davet kodu kullanıldı olarak işaretle
    if (invitationCodeDocRef && user.uid) {
      await markInvitationCodeAsUsed(invitationCodeDocRef, user.uid);
    }

    // JWT token oluştur
    const token = await user.getIdToken();

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName,
        role: userRole,
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