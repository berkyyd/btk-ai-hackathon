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
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    this.summaryApiKey = process.env.GEMINI_SUMMARY_API_KEY || process.env.NEXT_PUBLIC_GEMINI_SUMMARY_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not set');
    }
    if (!this.summaryApiKey) {
      console.warn('GEMINI_SUMMARY_API_KEY environment variable is not set');
    }
    // Always use summaryApiKey if available for genAI
    this.genAI = new GoogleGenerativeAI(this.summaryApiKey || this.apiKey);
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
        
        SADECE JSON formatında yanıt ver, markdown kullanma. Her soru için:
        {
          "id": "question_id",
          "question": "Question text",
          "type": "multiple_choice|true_false|open_ended",
          "options": ["A) Option1", "B) Option2", "C) Option3", "D) Option4"] (only for multiple_choice),
          "correctAnswer": "Correct answer",
          "explanation": "Explanation",
          "difficulty": "${request.difficulty}"
        }
        
        Tüm soruları bir array içinde döndür. Sadece JSON, başka hiçbir şey yazma.
        ${isEnglishCourse ? '\nREMEMBER: ABSOLUTELY EVERYTHING MUST BE IN ENGLISH. DO NOT USE TURKISH.' : ''}
      `;
      
      const response = await this.makeGeminiRequest(prompt);
      
      // Markdown formatındaki JSON'u temizle
      let cleanResponse = response;
      if (response.includes('```json')) {
        cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (response.includes('```')) {
        cleanResponse = response.replace(/```\n?/g, '');
      }
      
      try {
        return JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response that failed to parse:', cleanResponse);
        throw new Error('Gemini API yanıtı JSON formatında değil');
      }
    } catch (error) {
      console.error('Quiz generation failed:', error);
      throw error;
    }
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