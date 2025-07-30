import { GoogleGenerativeAI } from '@google/generative-ai';
import { SUMMARY_PROMPTS } from './summaryPrompts';

export interface QuizGenerationRequest {
  courseId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  timeLimit: number;
  examFormat: string;
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

  private async makeGeminiRequest(prompt: string, apiKey?: string): Promise<string> {
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
      const prompt = `
        YBS (Yönetim Bilişim Sistemleri) bölümü için ${request.questionCount} adet ${request.difficulty} zorlukta soru oluştur.
        
        Sınav Formatı: ${request.examFormat}
        Süre: ${request.timeLimit} dakika
        Ders: ${request.courseId}
        
        Sorular şu formatta olmalı:
        - Çoktan seçmeli sorular (A, B, C, D seçenekleri)
        - Doğru/Yanlış soruları
        - Açık uçlu sorular
        
        Her soru için:
        - Soru metni
        - Seçenekler (çoktan seçmeli için)
        - Doğru cevap
        - Açıklama
        
        JSON formatında döndür.
      `;
      const response = await this.makeGeminiRequest(prompt);
      return JSON.parse(response);
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
        
        Lütfen:
        1. Tüm metni çıkar
        2. Formatı koru
        3. Türkçe karakterleri düzgün göster
        4. Sayfa numaralarını belirt
        
        Sadece çıkarılan metni döndür, başka açıklama ekleme.
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