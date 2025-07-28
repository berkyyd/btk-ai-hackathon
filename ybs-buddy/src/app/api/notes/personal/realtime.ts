import { NextRequest, NextResponse } from 'next/server';

// Not: Gerçek zamanlı dinleme için client-side Firebase Realtime Database SDK kullanılmalı.
// Bu endpoint sadece örnek/mock veri döndürür.

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId gerekli' }, { status: 400 });
  // Gerçek zamanlı dinleme backendde yapılmaz, client-side yapılır.
  // Burada sadece örnek/mock veri dönüyoruz.
  return NextResponse.json({ success: true, notes: [] });
} 