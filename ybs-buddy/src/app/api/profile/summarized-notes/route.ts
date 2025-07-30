import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../config/firebase';
import { collection, getDocs, addDoc, query, where, Timestamp } from 'firebase/firestore';

// GET: Kullanıcının özetlenmiş notlarını getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId gerekli' }, { status: 400 });
    const summariesRef = collection(db, 'summarizedNotes');
    const q = query(summariesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const summaries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, summaries });
  } catch (error) {
    return NextResponse.json({ error: 'Özetler alınamadı' }, { status: 500 });
  }
}

// POST: Yeni özet kaydet
export async function POST(request: NextRequest) {
  try {
    const { userId, noteId, originalTitle, summary, summaryType } = await request.json();
    if (!userId || !noteId || !originalTitle || !summary || !summaryType) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    }
    const docRef = await addDoc(collection(db, 'summarizedNotes'), {
      userId,
      noteId,
      originalTitle,
      summary,
      summaryType,
      createdAt: Timestamp.now(),
    });
    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    return NextResponse.json({ error: 'Özet kaydedilemedi' }, { status: 500 });
  }
} 