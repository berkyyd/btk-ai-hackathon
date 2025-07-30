import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '../../../../utils/geminiService';

export async function POST(request: NextRequest) {
  try {
    const { content, summaryType } = await request.json();

    // Validation
    if (!content) {
      return NextResponse.json(
        { error: 'İçerik gerekli' },
        { status: 400 }
      );
    }

    // Gemini API ile özetleme
    const summary = await geminiService.summarizeNote(content, summaryType || 'academic');

    return NextResponse.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('Note summarization error:', error);
    return NextResponse.json(
      { error: 'Özetleme hatası' },
      { status: 500 }
    );
  }
}