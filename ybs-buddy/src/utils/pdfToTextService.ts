import { GoogleGenerativeAI } from '@google/generative-ai';

export interface TextExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
  pageCount?: number;
}

export class PdfToTextService {
  private genAI: GoogleGenerativeAI;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_SUMMARY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('NEXT_PUBLIC_GEMINI_SUMMARY_API_KEY environment variable is not set');
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  async extractTextFromFile(file: File): Promise<TextExtractionResult> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('PDF işleme sadece browser ortamında desteklenir');
      }
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const header = new TextDecoder().decode(uint8Array.slice(0, 1024));
      if (!header.includes('%PDF')) {
        throw new Error('Geçerli PDF dosyası değil');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('PDF dosyası çok büyük (5MB limit)');
      }
      const base64Data = await this.fileToBase64(file);
      const text = await this.extractTextWithGemini(file.name, base64Data);
      return {
        success: true,
        text,
        pageCount: 1
      };
    } catch (error) {
      return {
        success: false,
        error: 'PDF\'den metin çıkarılamadı: ' + (error as Error).message
      };
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async extractTextWithGemini(fileName: string, base64Data: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API anahtarı yapılandırılmamış');
    }
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
    const prompt = 'Bu PDF dosyasının içindeki metni çıkar. Sadece metni ver, başka bir yorum veya özet yapma.';
    const pdfFilePart = {
      inlineData: {
        data: base64Data,
        mimeType: 'application/pdf'
      }
    };
    const result = await model.generateContent([prompt, pdfFilePart]);
    const response = await result.response;
    return response.text();
  }
}

export const pdfToTextService = new PdfToTextService(); 