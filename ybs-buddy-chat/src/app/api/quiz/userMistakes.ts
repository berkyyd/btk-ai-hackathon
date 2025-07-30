import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export async function POST(request: NextRequest) {
  try {
    const { userId, questionId, topic, quizId, userAnswer, correctAnswer } = await request.json();
    if (!userId || !questionId || !quizId) return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    await addDoc(collection(db, 'userMistakes'), {
      userId, questionId, topic, quizId, userAnswer, correctAnswer, createdAt: new Date().toISOString()
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Kayıt başarısız' }, { status: 500 });
  }
} 