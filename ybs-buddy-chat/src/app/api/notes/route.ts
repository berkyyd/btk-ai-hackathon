import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classYear = searchParams.get('classYear'); // Hala okuyoruz ama kullanmıyoruz
    const semester = searchParams.get('semester');
    const courseId = searchParams.get('courseId');
    const search = searchParams.get('search');

    console.log('Notes API Request params:', { classYear, semester, courseId, search });

    // Tüm notları getir (client-side filtering için)
    const notesRef = collection(db, 'notes');
    let q = query(notesRef, orderBy('createdAt', 'desc'));

    console.log('Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    const notes: any[] = [];

    querySnapshot.forEach((doc) => {
      notes.push({
        id: doc.id,
        ...doc.data(),
        class: doc.data().classYear, // classYear'ı class olarak eşle
      });
    });

    console.log('Found notes:', notes.length);
    console.log('Notes data sent to frontend:', notes);

    return NextResponse.json({
      success: true,
      notes,
      total: notes.length,
    });

  } catch (error: any) {
    console.error('Notes API error:', error);
    
    return NextResponse.json(
      { error: 'Notlar yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    console.log('Received raw request body for new note:', requestBody);
    const { title, content, courseId, classYear, semester, tags, isPublic, fileUrl, role, userId } = requestBody;

    // Validation
    if (!title || !content || !courseId) {
      return NextResponse.json(
        { error: 'Başlık, içerik ve ders seçimi gereklidir' },
        { status: 400 }
      );
    }

    // Firestore'a yeni not ekle
    const docRef = await addDoc(collection(db, 'notes'), {
      title,
      content,
      courseId,
      classYear: parseInt(classYear) || 1,
      semester: semester || 'Güz',
      tags: tags || [],
      isPublic: isPublic || false,
      likes: 0,
      favorites: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fileUrl: fileUrl || null, // Yeni eklendi
      // Role alanı eklendi
      role: role || 'student', // Gelen role değerini kullan, yoksa student
      // Kullanıcı ID'si
      userId: userId || 'anonymous',
    });

    return NextResponse.json({
      success: true,
      noteId: docRef.id,
      message: 'Not başarıyla eklendi',
    });

  } catch (error: any) {
    console.error('Add note error:', error);
    
    return NextResponse.json(
      { error: 'Not eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('id');
    
    if (!noteId) {
      return NextResponse.json(
        { error: 'Not ID\'si gereklidir' },
        { status: 400 }
      );
    }

    const requestBody = await request.json();
    const { title, content, tags, isPublic } = requestBody;

    // Firestore'da notu güncelle
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      title,
      content,
      tags: tags || [],
      isPublic: isPublic || false,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Not başarıyla güncellendi',
    });

  } catch (error: any) {
    console.error('Update note error:', error);
    
    return NextResponse.json(
      { error: 'Not güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 