import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '../../../utils/geminiService';

export async function POST(request: NextRequest) {
  try {
    const { userPerformance } = await request.json();
    // Gemini ile öneri üret
    const guidance = await geminiService.generateAcademicGuidance(userPerformance);
    return NextResponse.json({ success: true, guidance });
  } catch (error) {
    return NextResponse.json({ error: 'Yönlendirme oluşturulamadı' }, { status: 500 });
  }
} 