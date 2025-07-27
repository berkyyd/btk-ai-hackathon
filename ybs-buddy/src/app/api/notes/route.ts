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
      });
    });

    console.log('Found notes:', notes.length);

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
    const { title, content, courseId, classYear, semester, tags, isPublic } = await request.json();

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
      // TODO: Kullanıcı ID'si eklenecek (auth sistemi tamamlandığında)
      userId: 'anonymous',
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