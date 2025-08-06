import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '../../../utils/geminiService';

// Basit Levenshtein mesafesi fonksiyonu
function levenshtein(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix: number[][] = Array.from({ length: an + 1 }, () => Array(bn + 1).fill(0));
  for (let i = 0; i <= an; i++) matrix[i]![0] = i;
  for (let j = 0; j <= bn; j++) matrix[0]![j] = j;
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + cost
      );
    }
  }
  return matrix[an]![bn]!;
}

// Türkçe kök bulma ve normalize etme (çok basit)
function normalizeTR(str: string): string {
  return str
    .toLocaleLowerCase('tr-TR')
    .replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { questions, answers } = await request.json();
    if (!questions || !answers) return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    let score = 0;
    const results = await Promise.all(questions.map(async (q: any) => {
      const userAnswer = answers[q.id] || '';
      let isCorrect = false;
      const type = q.type || q.questionType || 'multiple_choice';

      if (type === 'fill_in_the_blank') {
        // Boşluk doldurma: normalize et, Levenshtein mesafesi ile toleranslı kontrol
        const corrects = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
        isCorrect = corrects.some((ans: string) => {
          const normUser = normalizeTR(userAnswer);
          const normAns = normalizeTR(ans);
          // 2 harf veya %20'den az fark toleransı
          const lev = levenshtein(normUser, normAns);
          return lev <= 2 || lev / Math.max(normUser.length, normAns.length) < 0.2 || normAns.includes(normUser) || normUser.includes(normAns);
        });
      } else if (type === 'open_ended' || type === 'classic') {
        // Klasik: Gemini ile esnek kontrol
        const prompt = `Aşağıdaki iki cevabın anlamı aynı mı, biri diğerinin doğru cevabı mı?\n\nDoğru cevap: ${q.correctAnswer}\nKullanıcı cevabı: ${userAnswer}\n\nSadece "EVET" veya "HAYIR" olarak cevap ver.`;
        try {
          const aiResult = await geminiService.makeGeminiRequest(prompt);
          isCorrect = aiResult.trim().toUpperCase().startsWith('E');
        } catch (e) {
          // AI hatası olursa fallback olarak yine Levenshtein ile kontrol et
          const normUser = normalizeTR(userAnswer);
          const normAns = normalizeTR(q.correctAnswer);
          const lev = levenshtein(normUser, normAns);
          isCorrect = lev <= 3 || lev / Math.max(normUser.length, normAns.length) < 0.25;
        }
      } else if (Array.isArray(q.correctAnswer)) {
        isCorrect = q.correctAnswer.some((ans: string) => userAnswer.toLowerCase().trim() === ans.toLowerCase().trim());
      } else if (typeof q.correctAnswer === 'string') {
        isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
      } else {
        isCorrect = userAnswer === q.correctAnswer;
      }
      if (isCorrect) score++;
      return { questionId: q.id, isCorrect, userAnswer, correctAnswer: q.correctAnswer };
    }));
    return NextResponse.json({ success: true, score, results });
  } catch (error) {
    return NextResponse.json({ error: 'Değerlendirme başarısız' }, { status: 500 });
  }
} 