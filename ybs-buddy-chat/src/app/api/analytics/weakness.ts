import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, quizResults } = await request.json();
    // quizResults: [{ topic, isCorrect }]
    // En çok yanlış yapılan konuları bul
    const topicStats: Record<string, { total: number; wrong: number }> = {};
    quizResults.forEach((r: any) => {
      if (!topicStats[r.topic]) topicStats[r.topic] = { total: 0, wrong: 0 };
      topicStats[r.topic].total++;
      if (!r.isCorrect) topicStats[r.topic].wrong++;
    });
    const weaknesses = Object.entries(topicStats)
      .filter(([_, v]) => v.wrong > 0)
      .map(([topic, v]) => ({ topic, wrong: v.wrong, total: v.total }));
    return NextResponse.json({ success: true, weaknesses });
  } catch (error) {
    return NextResponse.json({ error: 'Zayıflık analizi başarısız' }, { status: 500 });
  }
} 