import { NextResponse } from 'next/server';
import { getLectureNotes, saveChatHistory, saveChatFeedback } from '../../../utils/firebaseUtils';
import { ChatbotRequest, ChatbotResponse, ChatMessage, UserData, CurriculumCourse, Note, SummarizedNote, QuizResult, UserInfo } from '../../../types/api';
import { answerWithRetriever } from '../../../utils/langchainService';
import { geminiService } from '../../../utils/geminiService';
import { db } from '../../../config/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore/lite';
import { getAllCourses, getCoursesByClassAndSemester, getCurriculumInfo } from '../../../utils/curriculumUtils';

// Composite index oluşturma fonksiyonu
async function createCompositeIndex(): Promise<boolean> {
  try {
    // Index oluşturma isteği gönder
    const indexUrl = 'https://console.firebase.google.com/v1/r/project/ybs-buddy/firestore/indexes?create_composite=ClFwcm9qZWN0cy95YnMtYnVkZHkvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3N1bW1hcml6ZWROb3Rlcy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC';
    // Composite index oluşturmak için şu linke gidin: ${indexUrl}
    return false; // Index henüz hazır değil
  } catch (error) {
    console.error('Index oluşturma hatası:', error);
    return false;
  }
}

// Kullanıcıya özel veri kaynaklarını çek
async function getUserSpecificData(userId: string): Promise<UserData> {
  const data: UserData = {
    curriculum: null,
    courses: [],
    notes: [],
    quizResults: [],
    summarizedNotes: [],
    userInfo: null
  };

  try {
    // Güncel müfredat bilgilerini çek
    const curriculumInfo = getCurriculumInfo();
    data.curriculum = curriculumInfo;
    
    // API'den gelen dersler
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    data.courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as unknown as CurriculumCourse[];

    // Kullanıcının notlarını çek
    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', userId)
    );
    const notesSnapshot = await getDocs(notesQuery);
    data.notes = notesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as unknown as Note[];

    // Kullanıcının özetlenmiş notlarını çek (index hatası için try-catch)
    try {
      const summarizedNotesQuery = query(
        collection(db, 'summarizedNotes'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const summarizedNotesSnapshot = await getDocs(summarizedNotesQuery);
      data.summarizedNotes = summarizedNotesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as SummarizedNote[];
    } catch (indexError) {
      console.warn('Composite index not ready for summarizedNotes, fetching without orderBy');
      // Index yoksa sadece userId ile çek
      const summarizedNotesQuery = query(
        collection(db, 'summarizedNotes'),
        where('userId', '==', userId)
      );
      const summarizedNotesSnapshot = await getDocs(summarizedNotesQuery);
      const rawSummarizedNotes = summarizedNotesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as SummarizedNote[];
      
      // Client-side sorting by createdAt
      data.summarizedNotes = rawSummarizedNotes.sort((a, b) => {
        // Firestore timestamp'i Date'e çevir
        const getDate = (timestamp: unknown): Date => {
          if (timestamp instanceof Date) return timestamp;
          if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
            return new Date((timestamp as { seconds: number }).seconds * 1000);
          }
          return new Date(0);
        };
        
        const dateA = getDate(a.createdAt);
        const dateB = getDate(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
    }

    // Kullanıcının sınav sonuçlarını çek
    const quizQuery = query(
      collection(db, 'quizResults'),
      where('userId', '==', userId)
    );
    const quizSnapshot = await getDocs(quizQuery);
    const rawQuizResults = quizSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as unknown as QuizResult[];
    
    // Client-side sorting by completedAt
    data.quizResults = rawQuizResults.sort((a, b) => {
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
      } as unknown as UserInfo;
    }

  } catch (error) {
    console.error('Error fetching user-specific data:', error);
    // Hata durumunda boş veri döndür
    return data;
  }

  return data;
}

async function generateSmartAnswer(question: string, data: UserData, userId: string, previousMessages?: ChatMessage[]): Promise<string> {
  const questionLower = question.toLowerCase();
  
  // Dinamik selamlaşma kontrolü
  if (questionLower.includes('naber') || questionLower.includes('nasılsın') || questionLower.includes('selam') || questionLower.includes('merhaba') || questionLower.includes('hey')) {
    const displayName = data.userInfo?.displayName || 'Kullanıcı';
    const greetings = [
      `Merhaba! 👋 ${displayName} nasılsın?`,
      `Selam! 😊 ${displayName} iyi misin?`,
      `Hey! 🎉 ${displayName} nasıl gidiyor?`,
      `Merhaba! 🌟 ${displayName} bugün nasıl?`,
      `Selamlar! ✨ ${displayName} nasılsın?`
    ];
    const randomIndex = Math.floor(Math.random() * greetings.length);
    const selectedGreeting = greetings[randomIndex];
    return selectedGreeting || 'Merhaba! 👋 Kullanıcı nasılsın?';
  }
  
  // Soru türünü belirle
  let contextType = 'general';
  let specificPrompt = '';

  if (questionLower.includes('müfredat') || questionLower.includes('ders') || questionLower.includes('course')) {
    contextType = 'courses';
    
    // Son 5 mesajı al ve context oluştur
    const recentMessages = previousMessages?.slice(-5) || [];
    const conversationContext = recentMessages.length > 0 
      ? `\n\nÖNCEKİ KONUŞMA:\n${recentMessages.map(msg => `${msg.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${msg.content}`).join('\n')}`
      : '';

    specificPrompt = `
SORU TÜRÜ: MÜFREDAT/DERS SORUSU
KULLANICI: ${data.userInfo?.displayName || 'Kullanıcı'}
SORU: ${question}

GÜNCEL MÜFREDAT BİLGİLERİ:
${JSON.stringify(data.curriculum, null, 2)}

YÖNERGELER:
- Güncel müfredat verilerini kullan (curriculum.json)
- Ders kodları, AKTS kredileri, zorunlu/seçmeli durumu belirt
- Sınıf ve dönem bilgilerini ver
- Gerçek verilerden bahset, varsayım yapma
- Önceki konuşmayı dikkate al ve bağlamı koru
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

KULLANICININ ÖZETLENMİŞ NOTLARI:
${JSON.stringify(data.summarizedNotes, null, 2)}

YÖNERGELER:
- Sadece kullanıcının kendi notlarını kullan
- Not başlıkları, içerikleri, ders bilgilerini ver
- PDF dosyalarından bahset
- Akademisyen notlarını vurgula (🎓 Akademisyen Notu)
- Öğrenci notlarını belirt (👨‍🎓 Öğrenci Notu)
- Özetlenmiş notları da dahil et (📝 ÖZET)
- Gerçek not verilerini kullan, varsayım yapma
- Türkçe cevap ver

CEVAP:`;
  } else if (questionLower.includes('özet') || questionLower.includes('summary') || questionLower.includes('summarized')) {
    contextType = 'summarizedNotes';
    specificPrompt = `
SORU TÜRÜ: ÖZETLENMİŞ NOT SORUSU
KULLANICI: ${data.userInfo?.displayName || 'Kullanıcı'}
SORU: ${question}

KULLANICININ ÖZETLENMİŞ NOTLARI:
${JSON.stringify(data.summarizedNotes, null, 2)}

YÖNERGELER:
- Sadece kullanıcının özetlenmiş notlarını kullan
- Özet türlerini belirt (Akademik, Samimi, Sınav Odaklı)
- Özetlenmiş not başlıklarını ve içeriklerini ver
- Hangi nottan özetlendiğini belirt
- Özetleme tarihlerini belirt
- Eğer özetlenmiş not yoksa "Henüz özetlenmiş notunuz bulunmuyor" de
- Gerçek özet verilerini kullan, varsayım yapma
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
  } else if (questionLower.includes('kişisel takip') || questionLower.includes('personal tracking') || questionLower.includes('geçmiş sınavlarım') || questionLower.includes('quiz analizi') || questionLower.includes('sınav geçmişi') || questionLower.includes('performans') || questionLower.includes('başarı') || questionLower.includes('takip')) {
    contextType = 'personalTracking';
    specificPrompt = `
SORU TÜRÜ: KİŞİSEL TAKİP SORUSU
KULLANICI: ${data.userInfo?.displayName || 'Kullanıcı'}
SORU: ${question}

KULLANICININ SINAV SONUÇLARI:
${JSON.stringify(data.quizResults, null, 2)}

KULLANICININ NOTLARI:
${JSON.stringify(data.notes, null, 2)}

KULLANICININ ÖZETLENMİŞ NOTLARI:
${JSON.stringify(data.summarizedNotes, null, 2)}

YÖNERGELER:
- Kişisel Takip özelliği hakkında detaylı bilgi ver
- Kullanıcının sınav performansını analiz et
- Başarı trendlerini göster
- Hangi derslerde daha iyi/kötü olduğunu belirt
- Öneriler sun (hangi derslere daha fazla çalışması gerektiği)
- Quiz analizi özelliğinden bahset
- Geçmiş sınavların detaylarını ver
- Motive edici ve yapıcı öneriler ver
- Türkçe cevap ver

CEVAP:`;
  } else if (questionLower.includes('profilim') || questionLower.includes('profile') || questionLower.includes('profil') || questionLower.includes('kullanıcı bilgileri') || questionLower.includes('hesap')) {
    contextType = 'profile';
    specificPrompt = `
SORU TÜRÜ: PROFİL SORUSU
KULLANICI: ${data.userInfo?.displayName || 'Kullanıcı'}
SORU: ${question}

KULLANICI BİLGİLERİ:
${JSON.stringify(data.userInfo, null, 2)}

KULLANICININ NOTLARI:
${JSON.stringify(data.notes, null, 2)}

KULLANICININ ÖZETLENMİŞ NOTLARI:
${JSON.stringify(data.summarizedNotes, null, 2)}

KULLANICININ SINAV SONUÇLARI:
${JSON.stringify(data.quizResults, null, 2)}

YÖNERGELER:
- Profilim sayfası özelliklerini açıkla
- Kullanıcının not istatistiklerini ver
- Akademisyen notlarını vurgula (🎓 Akademisyen Notu)
- Öğrenci notlarını belirt (👨‍🎓 Öğrenci Notu)
- Özetlenmiş notları dahil et (📝 ÖZET)
- Sınav performansını analiz et
- Kişisel gelişim önerileri sun
- Motive edici yaklaşım benimse
- Türkçe cevap ver

CEVAP:`;
  } else if (questionLower.includes('ders notları') || questionLower.includes('ders notlari') || questionLower.includes('notlar') || questionLower.includes('notes') || questionLower.includes('not ekle') || questionLower.includes('not paylaş')) {
    contextType = 'courseNotes';
    specificPrompt = `
SORU TÜRÜ: DERS NOTLARI SORUSU
KULLANICI: ${data.userInfo?.displayName || 'Kullanıcı'}
SORU: ${question}

KULLANICININ NOTLARI:
${JSON.stringify(data.notes, null, 2)}

KULLANICININ ÖZETLENMİŞ NOTLARI:
${JSON.stringify(data.summarizedNotes, null, 2)}

MÜFREDAT BİLGİLERİ:
${JSON.stringify(data.courses, null, 2)}

YÖNERGELER:
- Ders Notları sayfası özelliklerini açıkla
- Not türlerini belirt:
  * 🎓 Akademisyen Notu (Akademisyenler tarafından paylaşılan)
  * 👨‍🎓 Öğrenci Notu (Öğrenciler tarafından paylaşılan)
  * 📝 ÖZET (Özetlenmiş notlar)
- Not filtreleme özelliklerini açıkla
- PDF yükleme özelliğinden bahset
- Not paylaşım kurallarını belirt
- Akademisyen notlarının önceliğini vurgula
- Özetlenmiş notların özel durumunu açıkla
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

KULLANICININ ÖZETLENMİŞ NOTLARI:
${JSON.stringify(data.summarizedNotes, null, 2)}

KULLANICININ SINAV SONUÇLARI:
${JSON.stringify(data.quizResults, null, 2)}

YÖNERGELER:
- Samimi ve motive edici cevap ver
- Kullanıcının adını kullan
- Genel bilgiler ver
- Not türlerini belirt (Akademisyen/Öğrenci/Özet)
- Özetlenmiş notları da dahil et
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
    const { question, userId, context, previousMessages }: ChatbotRequest = await request.json();

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
        answer = await generateSmartAnswer(question, userData, userId, previousMessages);
        sources = ['Kullanıcı Verileri'];
        usedRetriever = false;
      } catch (err) {
        console.error('Smart answer generation error:', err);
        answer = undefined;
      }
    }

    // Eğer hala cevap yoksa, genel asistan prompt'u ile cevap üret
    if (!answer) {
      // Son 5 mesajı al ve context oluştur
      const recentMessages = previousMessages?.slice(-5) || [];
      const conversationContext = recentMessages.length > 0 
        ? `\n\nÖNCEKİ KONUŞMA:\n${recentMessages.map(msg => `${msg.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${msg.content}`).join('\n')}`
        : '';

      const generalPrompt = `Sen YBS Buddy'nin akıllı asistanısın. Kullanıcıdan gelen soruya öğrenci dostu, samimi ve açıklayıcı bir şekilde cevap ver. Eğer selam, naber, nasılsın gibi bir mesaj ise sıcak bir şekilde karşılık ver. Cevabın sade, anlaşılır ve motive edici olsun. Önceki konuşmayı dikkate al ve bağlamı koru.`;
      answer = await geminiService.makeRequest(`${generalPrompt}${conversationContext}\n\nSORU: ${question}\n\nCEVAP:`);
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
