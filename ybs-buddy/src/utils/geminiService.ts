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
  private baseUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

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
  async generateQuizQuestions(courseName: string, difficulty: string, questionCount: number, notesContent?: string, examFormat?: 'test' | 'classic' | 'mixed'): Promise<any[]> {
    let prompt = '';
    if (notesContent && notesContent.trim().length > 0) {
      prompt += `Aşağıda ilgili dersin notları verilmiştir. Sadece bu notlardan sınav sorusu üret.\n\nNOTLAR:\n${notesContent}\n\n`;
    }
    let formatDesc = '';
    if (examFormat === 'test') {
      formatDesc = 'Sadece çoktan seçmeli (multiple_choice) sorular üret.';
    } else if (examFormat === 'classic') {
      formatDesc = 'Sadece açık uçlu (open_ended) sorular üret.';
    } else {
      formatDesc = 'Sorular şu formatlarda olmalı: 1. Çoktan seçmeli (multiple_choice): 4 seçenekli, 2. Doğru/Yanlış (true_false): true/false cevap, 3. Açık uçlu (open_ended): kısa cevap, 4. Boşluk doldurma (fill_blank): kısa cevap.';
    }
    prompt += `\n${courseName} dersi için ${difficulty} zorlukta ${questionCount} adet sınav sorusu oluştur.\n${formatDesc}\n\nHer soru için şu bilgileri ver:\n- id: benzersiz ID\n- question: soru metni\n- type: 'multiple_choice', 'true_false', 'open_ended', 'fill_blank'\n- options: çoktan seçmeli için ['A) ...', 'B) ...', 'C) ...', 'D) ...']\n- correctAnswer: doğru cevap\n- explanation: açıklama\n- difficulty: '${difficulty}'\n\nJSON formatında döndür, sadece soru array'ini ver. Her sorunun cevabını ve açıklamasını mutlaka ekle. Açıklamalar 2-3 cümle uzunluğunda, doğru cevabı ve neden doğru olduğunu net bir şekilde anlatan, öğrencinin yanlış anlamalarını gidermeye yönelik olsun.`;

    try {
      const response = await this.makeRequest(prompt);
      // Kod bloğu varsa temizle
      const cleanResponse = response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Quiz generation failed:', error);
      // Fallback: Mock sorular döndür
      return this.generateMockQuestions(courseName, difficulty, questionCount);
    }
  }

  // Not özetle
  async summarizeNote(content: string, category: string): Promise<string> {
    let prompt = '';
    switch (category) {
      case 'academic':
        prompt = `Aşağıdaki notu akademik bir dille özetle:\n\n${content}\n\nÖzet şu formatta olsun:\n- Ana konular\n- Önemli noktalar\n- Anahtar terimler\n- Özet (2-3 cümle)`;
        break;
      case 'entertaining':
        prompt = `Aşağıdaki notu eğlenceli ve akılda kalıcı bir şekilde özetle:\n\n${content}\n\nÖzet şu formatta olsun:\n- İlginç bilgiler\n- Mizahi yaklaşımlar (varsa)\n- Akılda kalıcı ana fikirler\n- Özet (2-3 cümle)`;
        break;
      default:
        prompt = `Aşağıdaki notu özetle ve ana noktaları çıkar:\n\n${content}\n\nÖzet şu formatta olsun:\n- Ana konular\n- Önemli noktalar\n- Anahtar terimler\n- Özet (2-3 cümle)`;
        break;
    }

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

  // Yanlış cevaplanan sorular için açıklama üret
  async explainAnswer(question: string, correctAnswer: string, userAnswer: string): Promise<string> {
    const prompt = `Aşağıdaki soruya verilen yanlış cevabı değerlendir. Doğru cevabın ne olduğunu ve neden doğru olduğunu açıkla. Öğrencinin cevabının neden yanlış olduğunu kısaca belirt.

Soru: ${question}
Doğru Cevap: ${correctAnswer}
Öğrencinin Cevabı: ${userAnswer}

Yanıtı 2-3 cümleyle, açıklayıcı ve anlaşılır bir dille yaz.`;
    try {
      const response = await this.makeRequest(prompt);
      return response.trim();
    } catch (error) {
      console.error('Gemini açıklama üretimi başarısız:', error);
      return 'Açıklama üretilemedi.';
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