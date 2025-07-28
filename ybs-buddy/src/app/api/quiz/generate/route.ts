import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '../../../../utils/geminiService';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

export async function POST(request: NextRequest) {
  try {
    const { courseId, difficulty, questionCount, timeLimit, examFormat } = await request.json();

    // Validation
    if (!courseId || !questionCount) {
      return NextResponse.json(
        { error: 'Ders ve soru sayısı gereklidir' },
        { status: 400 }
      );
    }

    // Ders adını al (gerçek uygulamada veritabanından çekilir)
    const courseNames: { [key: string]: string } = {
      'course1': 'Veri Tabanı Yönetimi',
      'course2': 'Programlama',
      'course3': 'Web Teknolojileri'
    };
    const courseName = courseNames[courseId] || 'Bilinmeyen Ders';

    // Seçilen dersin notlarını Firestore'dan çek
    let notesContent = '';
    try {
      const notesRef = collection(db, 'notes');
      const notesQuery = query(notesRef, where('courseId', '==', courseId));
      const notesSnapshot = await getDocs(notesQuery);
      const notes = notesSnapshot.docs.map(doc => doc.data().content).filter(Boolean);
      if (notes.length > 0) {
        notesContent = notes.join('\n\n');
      }
    } catch (err) {
      console.error('Notlar çekilemedi:', err);
    }

    try {
      // Gemini API ile sorular oluştur
      const questions = await geminiService.generateQuizQuestions(
        courseName,
        difficulty || 'medium',
        questionCount,
        notesContent,
        examFormat // yeni parametre
      );

      return NextResponse.json({
        success: true,
        questions: questions,
        totalQuestions: questionCount,
        timeLimit: timeLimit || 30,
        difficulty: difficulty || 'medium',
      });

    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      
      // Fallback: Mock sorular döndür
      const mockQuestions = generateMockQuestions(courseId, difficulty, questionCount);

      return NextResponse.json({
        success: true,
        questions: mockQuestions,
        totalQuestions: questionCount,
        timeLimit: timeLimit || 30,
        difficulty: difficulty || 'medium',
        note: 'Gemini API kullanılamadı, mock sorular döndürüldü'
      });
    }

  } catch (error: any) {
    console.error('Quiz generation error:', error);
    
    return NextResponse.json(
      { error: 'Sınav oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

function generateMockQuestions(courseId: string, difficulty: string = 'medium', count: number) {
  const questions: any[] = [];
  
  const questionTypes = ['multiple_choice', 'true_false', 'open_ended'];
  const courseNames: { [key: string]: string } = {
    'course1': 'Veri Tabanı Yönetimi',
    'course2': 'Programlama',
    'course3': 'Web Teknolojileri'
  };
  
  for (let i = 1; i <= count; i++) {
    const questionType = questionTypes[i % questionTypes.length];
    const courseName = courseNames[courseId] || 'Bilinmeyen Ders';
    
    let question: any = {
      id: `q_${i}`,
      question: `${courseName} dersi için ${difficulty} zorlukta ${i}. soru`,
      type: questionType,
      difficulty: difficulty,
      explanation: 'Bu sorunun açıklaması burada yer alacak',
    };

    if (questionType === 'multiple_choice') {
      question.options = [
        'A) Birinci seçenek',
        'B) İkinci seçenek', 
        'C) Üçüncü seçenek',
        'D) Dördüncü seçenek'
      ];
      question.correctAnswer = question.options[0]; // İlk seçeneği doğru kabul et
    } else if (questionType === 'true_false') {
      question.correctAnswer = Math.random() > 0.5;
    } else {
      question.correctAnswer = 'Açık uçlu soru cevabı';
    }
    
    questions.push(question);
  }
  
  return questions;
} 