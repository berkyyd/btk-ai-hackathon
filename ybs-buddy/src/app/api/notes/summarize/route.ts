import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '../../../../utils/geminiService';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    // Validation
    if (!content) {
      return NextResponse.json(
        { error: 'Not içeriği gereklidir' },
        { status: 400 }
      );
    }

    try {
      // Gemini API ile not özetle
      const summary = await geminiService.summarizeNote(content);

      return NextResponse.json({
        success: true,
        summary: summary,
      });

    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      
      return NextResponse.json({
        success: false,
        error: 'Not özetlenirken bir hata oluştu',
        summary: 'Özet oluşturulamadı. Lütfen daha sonra tekrar deneyin.'
      });
    }

  } catch (error: any) {
    console.error('Note summarization error:', error);
    
    return NextResponse.json(
      { error: 'Not özetlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 