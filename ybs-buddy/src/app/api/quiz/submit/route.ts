import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

export async function POST(request: NextRequest) {
  try {
    const { userId, quizId, score, totalPoints, answers, completedAt, timeSpent, questions } = await request.json();
    if (!userId || !quizId || !answers || !completedAt || !questions) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    }
    const docRef = await addDoc(collection(db, 'quizResults'), {
      userId,
      quizId,
      score,
      totalPoints,
      answers,
      completedAt,
      timeSpent,
      questions,
    });
    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Quiz sonucu kaydedilemedi:', error);
    return NextResponse.json({ error: 'Quiz sonucu kaydedilemedi' }, { status: 500 });
  }
} 