import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 });
    }

    const resultsRef = collection(db, 'quizResults');
    const q = query(resultsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const topicStats: Record<string, { total: number; wrong: number }> = {};

    results.forEach((r: any) => {
      if (r.topic && r.isCorrect !== undefined) {
        if (!topicStats[r.topic]) {
          topicStats[r.topic] = { total: 0, wrong: 0 };
        }
        const stats = topicStats[r.topic];
        if (stats) {
          stats.total++;
          if (!r.isCorrect) stats.wrong++;
        }
      }
    });

    const weaknesses = Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        errorRate: (stats.wrong / stats.total) * 100,
        totalQuestions: stats.total,
        wrongAnswers: stats.wrong
      }))
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 5);

    return NextResponse.json({ weaknesses });
  } catch (error) {
    console.error('Zayıf alan analizi hatası:', error);
    return NextResponse.json({ error: 'Analiz yapılamadı' }, { status: 500 });
  }
} 