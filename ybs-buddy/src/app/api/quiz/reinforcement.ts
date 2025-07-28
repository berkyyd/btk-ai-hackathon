import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '../../../utils/geminiService';

export async function POST(request: NextRequest) {
  try {
    const { userId, mistakes } = await request.json();
    // mistakes: [{ topic, count }]
    // Gemini ile yeni sorular üretilebilir, şimdilik mock
    const questions = mistakes.map((m: any, i: number) => ({
      id: `reinforce_${i}`,
      question: `${m.topic} konusunda yeni bir soru`,
      type: 'multiple_choice',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'A',
      explanation: 'Doğru cevap açıklaması',
      difficulty: 'medium',
      topic: m.topic
    }));
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    return NextResponse.json({ error: 'Pekiştirme sınavı oluşturulamadı' }, { status: 500 });
  }
} 