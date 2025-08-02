import { NextRequest, NextResponse } from 'next/server';

// Akıllı cevap karşılaştırma fonksiyonu
function evaluateAnswer(userAnswer: string, correctAnswer: string | string[], questionType: string): boolean {
  const userAnswerClean = userAnswer.toLowerCase().trim();
  
  // Çoktan seçmeli sorular için
  if (questionType === 'multiple_choice' || questionType === 'true_false') {
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.some((ans: string) => userAnswerClean === ans.toLowerCase().trim());
    } else {
      return userAnswerClean === correctAnswer.toLowerCase().trim();
    }
  }
  
  // Açık uçlu sorular için akıllı değerlendirme
  if (questionType === 'open_ended') {
    // Doğru cevap bir string ise
    if (typeof correctAnswer === 'string') {
      const correctAnswerClean = correctAnswer.toLowerCase().trim();
      
      // Tam eşleşme kontrolü
      if (userAnswerClean === correctAnswerClean) return true;
      
      // Virgülle ayrılmış cevaplar için
      if (correctAnswerClean.includes(',')) {
        const correctItems = correctAnswerClean.split(',').map(item => item.trim());
        const userItems = userAnswerClean.split(',').map(item => item.trim());
        
        // En az %70 eşleşme varsa doğru kabul et
        const matchingItems = userItems.filter(item => 
          correctItems.some(correctItem => 
            item.includes(correctItem) || correctItem.includes(item)
          )
        );
        
        return matchingItems.length >= Math.ceil(correctItems.length * 0.7);
      }
      
      // Anahtar kelime kontrolü
      const keywords = correctAnswerClean.split(' ').filter(word => word.length > 3);
      const userKeywords = userAnswerClean.split(' ').filter(word => word.length > 3);
      
      const matchingKeywords = userKeywords.filter(keyword =>
        keywords.some(correctKeyword =>
          keyword.includes(correctKeyword) || correctKeyword.includes(keyword)
        )
      );
      
      return matchingKeywords.length >= Math.ceil(keywords.length * 0.6);
    }
    
    // Doğru cevap bir array ise
    if (Array.isArray(correctAnswer)) {
      const correctAnswersClean = correctAnswer.map(ans => ans.toLowerCase().trim());
      
      // En az bir doğru cevap varsa kabul et
      return correctAnswersClean.some(ans => {
        if (ans.includes(',')) {
          const ansItems = ans.split(',').map(item => item.trim());
          const userItems = userAnswerClean.split(',').map(item => item.trim());
          
          const matchingItems = userItems.filter(item =>
            ansItems.some(ansItem =>
              item.includes(ansItem) || ansItem.includes(item)
            )
          );
          
          return matchingItems.length >= Math.ceil(ansItems.length * 0.7);
        } else {
          return userAnswerClean.includes(ans) || ans.includes(userAnswerClean);
        }
      });
    }
  }
  
  // Fallback
  return userAnswerClean === String(correctAnswer).toLowerCase().trim();
}

export async function POST(request: NextRequest) {
  try {
    const { questions, answers } = await request.json();
    if (!questions || !answers) return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    
    let score = 0;
    const results = questions.map((q: any) => {
      const userAnswer = answers[q.id] || '';
      const isCorrect = evaluateAnswer(userAnswer, q.correctAnswer, q.type);
      
      if (isCorrect) score++;
      
      return { 
        questionId: q.id, 
        isCorrect, 
        userAnswer, 
        correctAnswer: q.correctAnswer,
        questionType: q.type
      };
    });
    
    return NextResponse.json({ 
      success: true, 
      score, 
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      results 
    });
  } catch (error) {
    console.error('Quiz evaluation error:', error);
    return NextResponse.json({ error: 'Değerlendirme başarısız' }, { status: 500 });
  }
} 