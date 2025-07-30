import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { questions, answers } = await request.json();
    if (!questions || !answers) return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    let score = 0;
    const results = questions.map((q: any) => {
      const userAnswer = answers[q.id];
      let isCorrect = false;

      if (Array.isArray(q.correctAnswer)) {
        // If correctAnswer is an array (e.g., for fill-in-the-blank with multiple correct answers)
        isCorrect = q.correctAnswer.some((ans: string) => userAnswer.toLowerCase().trim() === ans.toLowerCase().trim());
      } else if (typeof q.correctAnswer === 'string') {
        // For single string answers (multiple-choice, true-false)
        isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
      } else {
        // Fallback for other types or unexpected cases
        isCorrect = userAnswer === q.correctAnswer;
      }
      if (isCorrect) score++;
      return { questionId: q.id, isCorrect, userAnswer, correctAnswer: q.correctAnswer };
    });
    return NextResponse.json({ success: true, score, results });
  } catch (error) {
    return NextResponse.json({ error: 'Değerlendirme başarısız' }, { status: 500 });
  }
} 