import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
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

export async function POST(request: NextRequest) {
  try {
    const { userId, quizId, score, totalPoints, answers, completedAt, timeSpent, questions } = await request.json();
    if (!userId || !quizId || !answers || !completedAt || !questions) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    }
    
    // Quiz sonucunu kaydet
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

    // Quiz tamamlandıktan sonra analiz yap (arka planda)
    try {
      // Kullanıcının tüm quiz sonuçlarını getir
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

      if (quizResults.length > 0) {
        // Son 4 haftalık veriyi al
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        
        const recentResults = quizResults.filter(result => 
          new Date(result.completedAt) >= fourWeeksAgo
        );

        // Haftalık gruplandırma
        const weeklyData = [];
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
        const wrongAnswers: Array<{
          question: string;
          userAnswer: string;
          correctAnswer: string;
          topic: string;
          date: any;
        }> = [];
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
        const weakAreas = Object.entries(topicAnalysis)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([topic, count]) => ({ topic, errorCount: count as number }));

        // AI ile analiz yap
        const analysisPrompt = `
Kullanıcının quiz sonuçlarını analiz et ve kişiselleştirilmiş çalışma önerileri ver.

QUIZ SONUÇLARI:
${JSON.stringify(quizResults.slice(0, 10), null, 2)}

YANLIŞ CEVAPLAR:
${JSON.stringify(wrongAnswers.slice(0, 20), null, 2)}

ZAYIF ALANLAR:
${JSON.stringify(weakAreas, null, 2)}

HAFTALIK GELİŞİM:
${JSON.stringify(weeklyData, null, 2)}

Lütfen şu formatta analiz yap:

1. GENEL PERFORMANS: Kullanıcının genel başarı durumu
2. ZAYIF ALANLAR: En çok hata yaptığı konular (3-5 tane)
3. ÇALIŞMA ÖNERİLERİ: Her zayıf alan için spesifik öneriler
4. HAFTALIK GELİŞİM: Son 4 haftadaki ilerleme analizi
5. MOTİVASYON: Kullanıcıyı motive edici mesaj

Türkçe olarak, samimi bir dil kullan. Emoji kullan ve pozitif ol.
`;

        const analysisResponse = await geminiService.makeRequest(analysisPrompt);
        
        // Analiz sonucunu kullanıcının profilinde sakla
        await addDoc(collection(db, 'userAnalytics'), {
          userId,
          type: 'quiz_analysis',
          data: {
            message: analysisResponse,
            weakAreas,
            recommendations: [],
            weeklyProgress: weeklyData,
            totalQuizzes: quizResults.length,
            averageScore: Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length)
          },
          createdAt: new Date().toISOString(),
          quizResultId: docRef.id
        });
      }
    } catch (analysisError) {
      console.error('Quiz analiz hatası:', analysisError);
      // Analiz hatası quiz kaydetmeyi etkilemez
    }

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Quiz sonucu kaydedilemedi:', error);
    return NextResponse.json({ error: 'Quiz sonucu kaydedilemedi' }, { status: 500 });
  }
} 