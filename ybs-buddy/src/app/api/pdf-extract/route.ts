import { NextRequest, NextResponse } from 'next/server';
import { FILE_SIZE_LIMITS } from '../../../constants';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'Dosya bulunamadı'
      }, { status: 400 });
    }

    // Dosya türü kontrolü
    if (file.type !== 'application/pdf') {
      return NextResponse.json({
        success: false,
        error: 'Sadece PDF dosyaları kabul edilir'
      }, { status: 400 });
    }

    // Dosya boyutu kontrolü (10MB)
    if (file.size > FILE_SIZE_LIMITS.PDF_MAX_SIZE) {
      return NextResponse.json({
        success: false,
        error: 'Dosya boyutu 10MB\'dan büyük olamaz'
      }, { status: 400 });
    }

    // Dosyayı ArrayBuffer'a çevir
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Basit PDF kontrolü
    const header = buffer.toString('ascii', 0, FILE_SIZE_LIMITS.PDF_HEADER_CHECK_SIZE);
    if (!header.includes('%PDF')) {
      return NextResponse.json({
        success: false,
        error: 'Geçerli PDF dosyası değil'
      }, { status: 400 });
    }

    // Şimdilik basit bir metin çıkarma simülasyonu
    // Gerçek PDF işleme için daha sonra geliştirilecek
    const extractedText = `PDF dosyası başarıyla yüklendi: ${file.name}

Bu PDF dosyasından metin çıkarma özelliği şu anda geliştirme aşamasındadır. Dosya boyutu: ${(file.size / 1024 / 1024).toFixed(2)} MB

PDF içeriği analiz edildi ve dosya geçerli bir PDF formatında tespit edildi.`;

    return NextResponse.json({
      success: true,
      text: extractedText,
      pageCount: 1,
      info: {
        title: file.name,
        author: '',
        subject: '',
        creator: ''
      }
    });

  } catch (error) {
    console.error('PDF extraction error:', error);
    return NextResponse.json({
      success: false,
      error: 'PDF işleme hatası: ' + (error as Error).message
    }, { status: 500 });
  }
} 