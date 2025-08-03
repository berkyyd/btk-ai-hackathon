import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { geminiService } from '../../../../utils/geminiService';

interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalPoints: number;
  answers: Array<{
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
  completedAt: string;
  timeSpent: number;
  questions: Array<{
    id: string;
    question: string; // text yerine question kullan
    topic?: string;
    correctAnswer: string;
    explanation?: string;
  }>;
}

interface WrongAnswer {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  topic: string;
  date: string;
}

interface WeakArea {
  topic: string;
  errorCount: number;
}

interface WeeklyProgress {
  week: number;
  avgScore: number;
  quizCount: number;
  results: QuizResult[];
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 });
    }

    // Kullanıcının quiz sonuçlarını getir
    const quizResultsRef = collection(db, 'quizResults');
    
    let quizResults: QuizResult[] = [];
    
    try {
      // Önce composite index ile dene
      const q = query(
        quizResultsRef, 
        where('userId', '==', userId),
        orderBy('completedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      quizResults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as QuizResult[];
    } catch (indexError: any) {
      // Index yoksa sadece userId ile sorgula ve client-side sırala
      const q = query(quizResultsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      quizResults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as QuizResult[];
      
      // Client-side sıralama
      quizResults.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }

    if (quizResults.length === 0) {
      return NextResponse.json({
        analysis: {
          message: 'Henüz quiz sonucunuz bulunmuyor. İlk quizinizi tamamladıktan sonra analiz yapılabilir.',
          weakAreas: [],
          recommendations: [],
          weeklyProgress: null,
          totalQuizzes: 0,
          averageScore: 0
        }
      });
    }

    // Son 4 haftalık veriyi al
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const recentResults = quizResults.filter(result => 
      new Date(result.completedAt) >= fourWeeksAgo
    );

    // Haftalık gruplandırma
    const weeklyData: WeeklyProgress[] = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const weekResults = recentResults.filter(result => {
        const resultDate = new Date(result.completedAt);
        return resultDate >= weekStart && resultDate < weekEnd;
      });
      
      if (weekResults.length > 0) {
        const avgScore = weekResults.reduce((sum, result) => sum + result.score, 0) / weekResults.length;
        weeklyData.push({
          week: i + 1,
          avgScore: Math.round(avgScore),
          quizCount: weekResults.length,
          results: weekResults
        });
      }
    }

    // Yanlış cevapları analiz et
    const wrongAnswers: WrongAnswer[] = [];
    const topicAnalysis: Record<string, number> = {};
    
    quizResults.forEach(result => {
      result.answers?.forEach(answer => {
        if (!answer.isCorrect) {
          const question = result.questions?.find(q => q.id === answer.questionId);
          if (question) {
            wrongAnswers.push({
              question: question.question,
              userAnswer: answer.userAnswer,
              correctAnswer: answer.correctAnswer,
              topic: question.topic || 'Genel',
              date: result.completedAt
            });
            
            const topic = question.topic || 'Genel';
            if (!topicAnalysis[topic]) {
              topicAnalysis[topic] = 0;
            }
            topicAnalysis[topic]++;
          }
        }
      });
    });

    // En zayıf alanları belirle
    const weakAreas: WeakArea[] = Object.entries(topicAnalysis)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([topic, count]) => ({ topic, errorCount: count as number }));

    // En son quiz sonucunu belirle (en üstteki quiz)
    const mostRecentQuiz = quizResults[0]; // En son yapılan quiz
    const oldestQuiz = quizResults[quizResults.length - 1]; // En eski quiz
    
    // AI ile analiz yap
    const analysisPrompt = `
Kullanıcının quiz sonuçlarını analiz et ve kişiselleştirilmiş çalışma önerileri ver.

ÖNEMLİ: Quiz sonuçları en yeniden en eskiye doğru sıralanmıştır. En üstteki quiz en son yapılan quizdir.

EN SON QUIZ (${mostRecentQuiz?.completedAt}): ${mostRecentQuiz?.score}%
EN ESKİ QUIZ (${oldestQuiz?.completedAt}): ${oldestQuiz?.score}%

QUIZ SONUÇLARI (En yeniden en eskiye):
${JSON.stringify(quizResults.slice(0, 10), null, 2)}

YANLIŞ CEVAPLAR:
${JSON.stringify(wrongAnswers.slice(0, 20), null, 2)}

ZAYIF ALANLAR:
${JSON.stringify(weakAreas, null, 2)}

HAFTALIK GELİŞİM:
${JSON.stringify(weeklyData, null, 2)}

Lütfen şu formatta analiz yap:

1. GENEL PERFORMANS: Kullanıcının genel başarı durumu
2. SON QUIZ ANALİZİ: En son yapılan quizin detaylı analizi
3. ZAYIF ALANLAR: En çok hata yaptığı konular (3-5 tane)
4. ÇALIŞMA ÖNERİLERİ: Her zayıf alan için spesifik öneriler
5. HAFTALIK GELİŞİM: Son 4 haftadaki ilerleme analizi
6. MOTİVASYON: Kullanıcıyı motive edici mesaj

Türkçe olarak, samimi bir dil kullan. Emoji kullan ve pozitif ol. En son quizi "ilk quiz" olarak adlandırma, "en son quiz" veya "son quiz" olarak adlandır.
`;

    const analysisResponse = await geminiService.makeRequest(analysisPrompt);
    
    const analysisResult = {
      message: analysisResponse,
      weakAreas,
      recommendations: [],
      weeklyProgress: weeklyData,
      totalQuizzes: quizResults.length,
      averageScore: Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length)
    };

    // Analiz sonucunu Firestore'a kaydet
    try {
      const analyticsRef = collection(db, 'userAnalytics');
      await addDoc(analyticsRef, {
        userId,
        type: 'quiz_analysis',
        data: analysisResult,
        createdAt: new Date(),
        quizCount: quizResults.length
      });
    } catch (saveError) {
      console.error('Analiz sonucu kaydedilemedi:', saveError);
    }
    
    return NextResponse.json({
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Quiz analiz hatası:', error);
    return NextResponse.json({ error: 'Analiz yapılamadı' }, { status: 500 });
  }
} 