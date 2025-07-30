import { NextResponse } from 'next/server';
import { getLectureNotes, saveChatHistory, saveChatFeedback } from '../../../utils/firebaseUtils';
import { ChatbotRequest, ChatbotResponse, ChatMessage } from '../../../types/api';
import { answerWithRetriever } from '../../../utils/langchainService';
import { geminiService } from '../../../utils/geminiService';
import { db } from '../../../config/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

// Kullanıcıya özel veri kaynaklarını çek
async function getUserSpecificData(userId: string) {
  const data: {
    courses: any[];
    notes: any[];
    quizResults: any[];
    userInfo: any;
  } = {
    courses: [],
    notes: [],
    quizResults: [],
    userInfo: null
  };

  try {
    // Müfredat bilgilerini çek (tüm kullanıcılar için aynı)
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    data.courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Kullanıcının notlarını çek
    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', userId)
    );
    const notesSnapshot = await getDocs(notesQuery);
    data.notes = notesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Kullanıcının sınav sonuçlarını çek
    const quizQuery = query(
      collection(db, 'quizResults'),
      where('userId', '==', userId)
    );
    const quizSnapshot = await getDocs(quizQuery);
    data.quizResults = quizSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a: any, b: any) => {
      // Client-side sorting by completedAt
      const dateA = new Date(a.completedAt || 0);
      const dateB = new Date(b.completedAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    // Kullanıcı bilgilerini çek
    const userQuery = query(collection(db, 'users'), where('uid', '==', userId));
    const userSnapshot = await getDocs(userQuery);
    if (!userSnapshot.empty && userSnapshot.docs[0]) {
      data.userInfo = {
        id: userSnapshot.docs[0].id,
        ...userSnapshot.docs[0].data()
      };
    }

  } catch (error) {
    console.error('Error fetching user-specific data:', error);
    // Hata durumunda boş veri döndür
    return data;
  }

  return data;
}

// Soru analizi ve akıllı cevap üretimi
async function generateSmartAnswer(question: string, data: any, userId: string) {
  const questionLower = question.toLowerCase();
  
  // Soru türünü belirle
  let contextType = 'general';
  let specificPrompt = '';

  if (questionLower.includes('müfredat') || questionLower.includes('ders') || questionLower.includes('course')) {
    contextType = 'courses';
    specificPrompt = `
SORU TÜRÜ: MÜFREDAT/DERS SORUSU
KULLANICI: ${data.userInfo?.displayName || 'Kullanıcı'}
SORU: ${question}

MÜFREDAT VERİLERİ:
${JSON.stringify(data.courses, null, 2)}

YÖNERGELER:
- Sadece müfredat verilerini kullan
- Ders kodları, AKTS kredileri, zorunlu/seçmeli durumu belirt
- Sınıf ve dönem bilgilerini ver
- Gerçek verilerden bahset, varsayım yapma
- Türkçe cevap ver

CEVAP:`;
  } else if (questionLower.includes('not') || questionLower.includes('note') || questionLower.includes('pdf')) {
    contextType = 'notes';
    specificPrompt = `
SORU TÜRÜ: NOT SORUSU
KULLANICI: ${data.userInfo?.displayName || 'Kullanıcı'}
SORU: ${question}

KULLANICININ NOTLARI:
${JSON.stringify(data.notes, null, 2)}

YÖNERGELER:
- Sadece kullanıcının kendi notlarını kullan
- Not başlıkları, içerikleri, ders bilgilerini ver
- PDF dosyalarından bahset
- Akademisyen notlarını vurgula
- Gerçek not verilerini kullan, varsayım yapma
- Türkçe cevap ver

CEVAP:`;
  } else if (questionLower.includes('sınav') || questionLower.includes('quiz') || questionLower.includes('test') || questionLower.includes('exam')) {
    contextType = 'quiz';
    specificPrompt = `
SORU TÜRÜ: SINAV SORUSU
KULLANICI: ${data.userInfo?.displayName || 'Kullanıcı'}
SORU: ${question}

KULLANICININ SINAV SONUÇLARI:
${JSON.stringify(data.quizResults, null, 2)}

YÖNERGELER:
- Sadece kullanıcının kendi sınav sonuçlarını kullan
- Puanları, doğru/yanlış sayılarını ver
- Sınav tarihlerini belirt
- Başarı oranlarını hesapla
- Eğer sınav sonucu yoksa "Henüz sınav sonucunuz bulunmuyor" de
- Gerçek sınav verilerini kullan, varsayım yapma
- Türkçe cevap ver

CEVAP:`;
  } else {
    // Genel soru
    specificPrompt = `
SORU TÜRÜ: GENEL SORU
KULLANICI: ${data.userInfo?.displayName || 'Kullanıcı'}
SORU: ${question}

KULLANICI BİLGİLERİ:
${JSON.stringify(data.userInfo, null, 2)}

MÜFREDAT BİLGİLERİ:
${JSON.stringify(data.courses, null, 2)}

KULLANICININ NOTLARI:
${JSON.stringify(data.notes, null, 2)}

KULLANICININ SINAV SONUÇLARI:
${JSON.stringify(data.quizResults, null, 2)}

YÖNERGELER:
- Samimi ve motive edici cevap ver
- Kullanıcının adını kullan
- Genel bilgiler ver
- Türkçe cevap ver

CEVAP:`;
  }

  return await geminiService.makeRequest(specificPrompt);
}

// Örnek notları oluşturmak için GET endpoint'i
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'create-sample-notes') {
      return NextResponse.json({ 
        success: true, 
        message: 'Sample notes feature removed' 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Chatbot GET API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { question, userId, context }: ChatbotRequest = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Kullanıcıya özel veri kaynaklarını çek
    const userData = await getUserSpecificData(userId);
    
    // Tüm notları çek (eski retriever için - sadece kullanıcının notları)
    const allNotes = await getLectureNotes();
    const userNotes = allNotes.filter((note: any) => note.userId === userId);
    
    let answer: string | undefined = undefined;
    let sources: string[] = [];
    let usedRetriever = false;

    // Önce LangChain retriever ile dene (kullanıcının notları için)
    if (userNotes.length > 0) {
      try {
        const result = await answerWithRetriever({ question, notes: userNotes });
        answer = result.answer;
        sources = result.sources;
        usedRetriever = true;
      } catch (err) {
        console.error('LangChain retriever error:', err);
        answer = undefined;
      }
    }

    // Eğer retriever ile cevap yoksa veya yetersizse, akıllı cevap üret
    if (!answer || answer.length < 50) {
      try {
        answer = await generateSmartAnswer(question, userData, userId);
        sources = ['Kullanıcı Verileri'];
        usedRetriever = false;
      } catch (err) {
        console.error('Smart answer generation error:', err);
        answer = undefined;
      }
    }

    // Eğer hala cevap yoksa, genel asistan prompt'u ile cevap üret
    if (!answer) {
      const generalPrompt = `Sen YBS Buddy'nin akıllı asistanısın. Kullanıcıdan gelen soruya öğrenci dostu, samimi ve açıklayıcı bir şekilde cevap ver. Eğer selam, naber, nasılsın gibi bir mesaj ise sıcak bir şekilde karşılık ver. Cevabın sade, anlaşılır ve motive edici olsun.`;
      answer = await geminiService.makeRequest(`${generalPrompt}\n\nSORU: ${question}\n\nCEVAP:`);
      sources = [];
    }

    // Chat mesajını oluştur
    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      content: answer || '',
      role: 'assistant',
      timestamp: new Date(),
      feedback: null
    };

    // Chat geçmişini kaydet
    try {
      await saveChatHistory(userId, [
        {
          id: (Date.now() - 1).toString(),
          content: question,
          role: 'user',
          timestamp: new Date()
        },
        chatMessage
      ]);
    } catch (error) {
      console.error('Error saving chat history:', error);
    }

    const response: ChatbotResponse = {
      answer: answer || '',
      sources,
      confidence: usedRetriever ? 0.95 : 0.85
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Chat geri bildirimi için endpoint
export async function PUT(request: Request) {
  try {
    const { messageId, feedback, userId } = await request.json();

    if (!messageId || !feedback || !userId) {
      return NextResponse.json({ error: 'Message ID, feedback and user ID are required' }, { status: 400 });
    }

    await saveChatFeedback({
      messageId,
      feedback,
      userId,
      timestamp: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chatbot feedback API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
