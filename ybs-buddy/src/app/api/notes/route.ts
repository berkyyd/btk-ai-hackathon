import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, addDoc, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface Note {
  id: string;
  title?: string;
  content?: string;
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classYear = searchParams.get('classYear');
    const semester = searchParams.get('semester');
    const courseId = searchParams.get('courseId');
    const search = searchParams.get('search');

    // Firestore query oluştur
    let q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));

    // Filtreler ekle
    if (classYear) {
      q = query(q, where('classYear', '==', parseInt(classYear)));
    }
    if (semester) {
      q = query(q, where('semester', '==', semester));
    }
    if (courseId) {
      q = query(q, where('courseId', '==', courseId));
    }

    const querySnapshot = await getDocs(q);
    const notes: Note[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Arama filtresi (client-side)
    let filteredNotes = notes;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredNotes = notes.filter(note => 
        note.title?.toLowerCase().includes(searchLower) ||
        note.content?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredNotes
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
    const { 
      title, 
      content, 
      courseId, 
      classYear, 
      class: classParam,
      semester, 
      tags, 
      isPublic, 
      fileUrl,
      // PDF specific properties
      isPDF,
      extractedText,
      pageCount,
      fileSize,
      originalFileName,
      role,
      userId
    } = requestBody;

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
      classYear: parseInt(classYear || classParam) || 1,
      semester: semester || 'Güz',
      tags: tags || [],
      isPublic: isPublic || false,
      likes: 0,
      favorites: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Kullanıcı ID'si
      userId: userId || 'anonymous',
      fileUrl: fileUrl || null,
      // PDF specific properties
      isPDF: isPDF || false,
      extractedText: extractedText || null,
      pageCount: pageCount || null,
      fileSize: fileSize || null,
      originalFileName: originalFileName || null,
      // Role alanı eklendi
      role: role || 'student', // Gelen role değerini kullan, yoksa student
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
    
    console.log('PUT request - noteId:', noteId);
    
    if (!noteId) {
      return NextResponse.json(
        { error: 'Not ID\'si gereklidir' },
        { status: 400 }
      );
    }

    const requestBody = await request.json();
    const { title, content, tags, isPublic } = requestBody;
    
    console.log('PUT request - body:', { title, content, tags, isPublic });

    // Firestore'da notu güncelle
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      title,
      content,
      tags: tags || [],
      isPublic: isPublic || false,
      updatedAt: new Date().toISOString(),
    });

    console.log('Note updated successfully:', noteId);

    return NextResponse.json({
      success: true,
      message: 'Not başarıyla güncellendi',
    });

  } catch (error: any) {
    console.error('Update note error:', error);
    
    return NextResponse.json(
      { error: `Not güncellenirken bir hata oluştu: ${error.message}` },
      { status: 500 }
    );
  }
} 