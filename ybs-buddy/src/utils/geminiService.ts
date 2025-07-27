interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not set');
    }
  }

  private async makeRequest(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const requestBody: GeminiRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No response from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API request failed:', error);
      throw error;
    }
  }

  // Quiz soruları oluştur
  async generateQuizQuestions(courseName: string, difficulty: string, questionCount: number): Promise<any[]> {
    const prompt = `
    ${courseName} dersi için ${difficulty} zorlukta ${questionCount} adet sınav sorusu oluştur.
    
    Sorular şu formatlarda olmalı:
    1. Çoktan seçmeli (multiple_choice): 4 seçenekli
    2. Doğru/Yanlış (true_false): true/false cevap
    3. Açık uçlu (open_ended): kısa cevap
    
    Her soru için şu bilgileri ver:
    - id: benzersiz ID
    - question: soru metni
    - type: "multiple_choice", "true_false", veya "open_ended"
    - options: çoktan seçmeli için ["A) ...", "B) ...", "C) ...", "D) ..."]
    - correctAnswer: doğru cevap
    - explanation: açıklama
    - difficulty: "${difficulty}"
    
    JSON formatında döndür, sadece soru array'ini ver.
    `;

    try {
      const response = await this.makeRequest(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Quiz generation failed:', error);
      // Fallback: Mock sorular döndür
      return this.generateMockQuestions(courseName, difficulty, questionCount);
    }
  }

  // Not özetle
  async summarizeNote(content: string): Promise<string> {
    const prompt = `
    Aşağıdaki notu özetle ve ana noktaları çıkar:
    
    ${content}
    
    Özet şu formatta olsun:
    - Ana konular
    - Önemli noktalar
    - Anahtar terimler
    - Özet (2-3 cümle)
    `;

    try {
      return await this.makeRequest(prompt);
    } catch (error) {
      console.error('Note summarization failed:', error);
      return 'Özet oluşturulamadı.';
    }
  }

  // Akademik yönlendirme
  async generateAcademicGuidance(userPerformance: any): Promise<string> {
    const prompt = `
    Kullanıcının performansına göre akademik yönlendirme önerisi ver:
    
    Performans: ${JSON.stringify(userPerformance)}
    
    Şu konularda öneri ver:
    - Hangi konulara odaklanmalı
    - Çalışma stratejileri
    - Kaynak önerileri
    - Zaman yönetimi
    `;

    try {
      return await this.makeRequest(prompt);
    } catch (error) {
      console.error('Academic guidance generation failed:', error);
      return 'Yönlendirme oluşturulamadı.';
    }
  }

  // Mock sorular (fallback)
  private generateMockQuestions(courseName: string, difficulty: string, count: number): any[] {
    const questions: any[] = [];
    const questionTypes = ['multiple_choice', 'true_false', 'open_ended'];
    
    for (let i = 1; i <= count; i++) {
      const questionType = questionTypes[i % questionTypes.length];
      
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
        question.correctAnswer = 'A';
      } else if (questionType === 'true_false') {
        question.correctAnswer = Math.random() > 0.5;
      } else {
        question.correctAnswer = 'Açık uçlu soru cevabı';
      }
      
      questions.push(question);
    }
    
    return questions;
  }
}

export const geminiService = new GeminiService(); 