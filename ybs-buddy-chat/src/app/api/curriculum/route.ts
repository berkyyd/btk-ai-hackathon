import { NextRequest, NextResponse } from 'next/server';
import curriculumData from '../../../data/curriculum.json';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(curriculumData);
  } catch (error: any) {
    console.error('Curriculum API error:', error);
    
    return NextResponse.json(
      { error: 'Müfredat yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 