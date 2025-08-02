import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classYear = searchParams.get('classYear');
    const semester = searchParams.get('semester');
    const courseType = searchParams.get('courseType');

    // API Request params: { classYear, semester, courseType }

    // Firestore'dan dersleri getir
    const coursesRef = collection(db, 'courses');
    let q = query(coursesRef);

    // Tüm dersleri getir, filtreleme client-side'da yapılacak
    q = query(coursesRef);

    // Executing Firestore query...
    const querySnapshot = await getDocs(q);
    const courses: any[] = [];

    querySnapshot.forEach((doc) => {
      courses.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Found courses: ${courses.length}

    return NextResponse.json({
      success: true,
      courses,
      total: courses.length,
    });

  } catch (error: any) {
    console.error('Courses API error:', error);
    
    return NextResponse.json(
      { error: 'Dersler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, code, classYear, semester, courseType, credits, description } = await request.json();

    // Validation
    if (!name || !code || !classYear || !semester || !courseType) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanlar doldurulmalıdır' },
        { status: 400 }
      );
    }

    // Firestore'a yeni ders ekle
    const { addDoc } = await import('firebase/firestore');
    const docRef = await addDoc(collection(db, 'courses'), {
      name,
      code,
      classYear: parseInt(classYear),
      semester,
      courseType,
      credits: parseInt(credits) || 0,
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      courseId: docRef.id,
      message: 'Ders başarıyla eklendi',
    });

  } catch (error: any) {
    console.error('Add course error:', error);
    
    return NextResponse.json(
      { error: 'Ders eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 