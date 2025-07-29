import { NextResponse } from 'next/server';
import { getLectureNotes, saveChatHistory, saveChatFeedback } from '../../../utils/firebaseUtils';
import { ChatbotRequest, ChatbotResponse, ChatMessage } from '../../../types/api';
import { answerWithRetriever } from '../../../utils/langchainService';
import { geminiService } from '../../../utils/geminiService';

// Örnek notları oluşturmak için GET endpoint'i
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'create-sample-notes') {
      const { createSampleNotesForChatbot } = await import('../../../utils/firebaseUtils');
      await createSampleNotesForChatbot();
      return NextResponse.json({ 
        success: true, 
        message: 'Sample notes created successfully for chatbot' 
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

    // Tüm notları çek (cache için)
    const allNotes = await getLectureNotes();
    let answer: string | undefined = undefined;
    let sources: string[] = [];
    let usedRetriever = false;

    if (allNotes.length > 0) {
      // LangChain retriever + QA chain ile cevap üret
      try {
        const result = await answerWithRetriever({ question, notes: allNotes });
        answer = result.answer;
        sources = result.sources;
        usedRetriever = true;
      } catch (err) {
        console.error('LangChain retriever error:', err);
        answer = undefined;
      }
    }

    // Eğer retriever ile cevap yoksa veya not bulunamadıysa, Gemini genel asistan prompt'u ile cevap üret
    if (!answer) {
      const generalPrompt = `Sen YBS Buddy'nin akıllı asistanısın. Kullanıcıdan gelen soruya öğrenci dostu, samimi ve açıklayıcı bir şekilde cevap ver. Eğer selam, naber, nasılsın gibi bir mesaj ise sıcak bir şekilde karşılık ver. Eğer derslerle ilgili bir soruysa, genel bilgi ver. Cevabın sade, anlaşılır ve motive edici olsun.`;
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

    // Chat geçmişini kaydet (eğer userId varsa)
    if (userId) {
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
    }

    const response: ChatbotResponse = {
      answer: answer || '',
      sources,
      confidence: usedRetriever ? 0.8 : 0.5
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
