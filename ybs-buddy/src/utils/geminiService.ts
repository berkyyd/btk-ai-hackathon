import { GoogleGenerativeAI } from '@google/generative-ai';
import { SUMMARY_PROMPTS } from './summaryPrompts';

export interface QuizGenerationRequest {
  courseId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  timeLimit: number;
  examFormat: string;
  notesContent?: string;
}

export interface NoteSummarizationRequest {
  content: string;
  summaryType: 'brief' | 'detailed' | 'bullet_points';
}

export interface AcademicGuidanceRequest {
  userProfile: {
    classYear: number;
    interests: string[];
    goals: string[];
    weaknesses: string[];
  };
  courseContext?: string;
}

export class GeminiService {
  private apiKey: string;
  private summaryApiKey: string;
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    this.summaryApiKey = process.env.GEMINI_SUMMARY_API_KEY || process.env.NEXT_PUBLIC_GEMINI_SUMMARY_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not set');
    }
    if (!this.summaryApiKey) {
      console.warn('GEMINI_SUMMARY_API_KEY environment variable is not set');
    }
    
    // Only create genAI if we have a valid API key
    const keyToUse = this.summaryApiKey || this.apiKey;
    if (keyToUse) {
      this.genAI = new GoogleGenerativeAI(keyToUse);
    }
  }

  async makeRequest(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured');
    }
    return this.makeGeminiRequest(prompt);
  }

  public async makeGeminiRequest(prompt: string, apiKey?: string): Promise<string> {
    try {
      const key = apiKey || this.apiKey;
      if (!key) {
        throw new Error('API key is required');
      }
      // Her istek için doğru anahtarla model nesnesi oluştur
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API request failed:', error);
      throw error;
    }
  }

  async generateQuiz(request: QuizGenerationRequest): Promise<any> {
    try {
      // Sınav türüne göre soru tiplerini belirle
      let questionTypes = [];
      switch (request.examFormat) {
        case 'test':
          questionTypes = ['multiple_choice'];
          break;
        case 'classic':
          questionTypes = ['open_ended'];
          break;
        case 'mixed':
        default:
          questionTypes = ['multiple_choice', 'true_false', 'open_ended'];
          break;
      }

      // İngilizce dersler için dil kontrolü
      const isEnglishCourse = request.courseId.toLowerCase().includes('ingilizce') || 
                             request.courseId.toLowerCase().includes('english') ||
                             request.courseId.toLowerCase().includes('yabancı dil');
      
      let languageInstruction = '';
      if (isEnglishCourse) {
        languageInstruction = `IMPORTANT: ALL QUESTIONS, OPTIONS, EXPLANATIONS, AND CORRECT ANSWERS MUST BE ENTIRELY IN ENGLISH. DO NOT USE ANY TURKISH WORDS OR SENTENCES. ONLY ENGLISH!\n\n`;
      } else {
        languageInstruction = 'SORULAR TÜRKÇE OLARAK HAZIRLANMALIDIR. Tüm sorular, seçenekler, açıklamalar Türkçe olmalıdır.';
      }

      const prompt = `
        ${isEnglishCourse ? languageInstruction : ''}
        YBS (Yönetim Bilişim Sistemleri) bölümü için ${request.questionCount} adet ${request.difficulty} zorlukta soru oluştur.
        
        Ders: ${request.courseId}
        Sınav Formatı: ${request.examFormat}
        Soru Türleri: ${questionTypes.join(', ')}
        Süre: ${request.timeLimit} dakika
        
        ${languageInstruction}
        
        ${request.notesContent ? `Not İçeriği:\n${request.notesContent}\n\nBu notlara dayalı sorular oluştur.` : ''}
        
        Soru formatları:
        ${questionTypes.includes('multiple_choice') ? (isEnglishCourse ? '- Multiple choice questions (Options: A, B, C, D)' : '- Çoktan seçmeli sorular (A, B, C, D seçenekleri)') : ''}
        ${questionTypes.includes('true_false') ? (isEnglishCourse ? '- True/False questions' : '- Doğru/Yanlış soruları') : ''}
        ${questionTypes.includes('open_ended') ? (isEnglishCourse ? '- Open-ended questions' : '- Açık uçlu sorular') : ''}
        
        ÖNEMLİ: SADECE JSON formatında yanıt ver. Markdown, açıklama veya başka hiçbir şey ekleme.
        
        Yanıt formatı:
        [
          {
            "id": "q1",
            "question": "Soru metni",
            "type": "multiple_choice",
            "options": ["A) Seçenek1", "B) Seçenek2", "C) Seçenek3", "D) Seçenek4"],
            "correctAnswer": "Doğru cevap",
            "explanation": "Açıklama",
            "difficulty": "${request.difficulty}"
          }
        ]
        
        Sadece JSON array döndür, başka hiçbir şey yazma.
        ${isEnglishCourse ? '\nREMEMBER: ABSOLUTELY EVERYTHING MUST BE IN ENGLISH. DO NOT USE TURKISH.' : ''}
      `;
      
      const response = await this.makeGeminiRequest(prompt);
      
      // Markdown formatındaki JSON'u temizle
      let cleanResponse = response.trim();
      
      // Markdown code blocks'ları temizle
      if (cleanResponse.includes('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanResponse.includes('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/g, '');
      }
      
      // Başındaki ve sonundaki boşlukları temizle
      cleanResponse = cleanResponse.trim();
      
      // JSON array başlangıcını kontrol et
      if (!cleanResponse.startsWith('[')) {
        // Array başlangıcı yoksa ekle
        if (cleanResponse.includes('{')) {
          const firstBrace = cleanResponse.indexOf('{');
          const lastBrace = cleanResponse.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            cleanResponse = '[' + cleanResponse.substring(firstBrace, lastBrace + 1) + ']';
          }
        }
      }
      
      try {
        return JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response that failed to parse:', cleanResponse);
        
        // Fallback: Basit bir quiz oluştur
        console.log('Creating fallback quiz...');
        return this.createFallbackQuiz(request);
      }
    } catch (error) {
      console.error('Quiz generation failed:', error);
      throw error;
    }
  }

  private createFallbackQuiz(request: QuizGenerationRequest): any[] {
    const questions = [];
    const isEnglishCourse = request.courseId.toLowerCase().includes('ingilizce') || 
                           request.courseId.toLowerCase().includes('english') ||
                           request.courseId.toLowerCase().includes('yabancı dil');
    
    for (let i = 1; i <= request.questionCount; i++) {
      const question = {
        id: `q${i}`,
        question: isEnglishCourse 
          ? `Sample question ${i} for ${request.courseId} course.`
          : `${request.courseId} dersi için örnek soru ${i}.`,
        type: 'multiple_choice',
        options: isEnglishCourse 
          ? ['A) Option A', 'B) Option B', 'C) Option C', 'D) Option D']
          : ['A) Seçenek A', 'B) Seçenek B', 'C) Seçenek C', 'D) Seçenek D'],
        correctAnswer: isEnglishCourse ? 'A) Option A' : 'A) Seçenek A',
        explanation: isEnglishCourse 
          ? 'This is a fallback question due to API issues.'
          : 'Bu soru API sorunları nedeniyle oluşturulmuş bir yedek sorudur.',
        difficulty: request.difficulty
      };
      questions.push(question);
    }
    
    return questions;
  }

  async summarizeNote(content: string, summaryType: keyof typeof SUMMARY_PROMPTS = 'academic'): Promise<string> {
    try {
      const prompt = SUMMARY_PROMPTS[summaryType](content);
      return await this.makeGeminiRequest(prompt, this.summaryApiKey);
    } catch (error) {
      console.error('Note summarization failed:', error);
      throw error;
    }
  }

  async generateAcademicGuidance(request: AcademicGuidanceRequest): Promise<string> {
    try {
      const prompt = `
        YBS ${request.userProfile.classYear}. sınıf öğrencisi için akademik rehberlik oluştur.
        
        Öğrenci Profili:
        - Sınıf: ${request.userProfile.classYear}
        - İlgi Alanları: ${request.userProfile.interests.join(', ')}
        - Hedefler: ${request.userProfile.goals.join(', ')}
        - Zayıf Yönler: ${request.userProfile.weaknesses.join(', ')}
        
        Ders Bağlamı: ${request.courseContext || 'Genel'}
        
        Öneriler:
        - Çalışma stratejileri
        - Kaynak önerileri
        - Kariyer tavsiyeleri
        - Zaman yönetimi
      `;
      return await this.makeGeminiRequest(prompt);
    } catch (error) {
      console.error('Academic guidance generation failed:', error);
      throw error;
    }
  }

  async generateExplanation(question: string, userAnswer: string, correctAnswer: string): Promise<string> {
    try {
      const prompt = `
        Soru: ${question}
        Kullanıcının Cevabı: ${userAnswer}
        Doğru Cevap: ${correctAnswer}
        
        Bu soru için detaylı açıklama oluştur:
        - Neden bu cevap doğru/yanlış?
        - Konuyla ilgili önemli noktalar
        - Benzer sorular için ipuçları
      `;
      return await this.makeGeminiRequest(prompt);
    } catch (error) {
      console.error('Gemini açıklama üretimi başarısız:', error);
      throw error;
    }
  }

  async extractTextFromPDF(fileName: string, base64Data: string): Promise<string> {
    try {
      const fileSize = Math.ceil((base64Data.length * 3) / 4);
      if (fileSize > 5 * 1024 * 1024) {
        throw new Error('PDF dosyası çok büyük (5MB limit)');
      }
      const prompt = `
        Bu PDF dosyasından metin çıkar: ${fileName}
        
        PDF Base64 verisi: ${base64Data}
        
        ÖNEMLİ KURALLAR:
        1. Sadece PDF'deki orijinal metni çıkar
        2. Hiçbir çeviri yapma - metni olduğu gibi bırak
        3. İngilizce metinleri Türkçe'ye çevirme
        4. Türkçe metinleri İngilizce'ye çevirme
        5. Sadece metin çıkar, yorum ekleme
        6. Formatı koru (paragraflar, satırlar, tablolar)
        7. Türkçe karakterleri düzgün göster
        8. Sayfa numaralarını belirt
        
        PDF'de ne varsa onu olduğu gibi çıkar. Sadece çıkarılan metni döndür, başka açıklama ekleme.
      `;
      const extractedText = await this.makeGeminiRequest(prompt, this.summaryApiKey);
      return extractedText;
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService(); 