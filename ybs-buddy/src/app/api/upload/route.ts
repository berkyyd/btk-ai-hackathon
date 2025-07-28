import { NextRequest, NextResponse } from 'next/server';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../config/firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    let extractedText = formData.get('extractedText') as string || '';

    console.log('API: Received file:', file ? file.name : 'No file');
    console.log('API: Received extractedText length:', extractedText.length);

    if (!file) {
      console.error('API: No file received.');
      return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
    }

    const storageRef = ref(storage, `uploads/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Yükleme ilerlemesini burada takip edebilirsiniz
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Dosya yükleme hatası:', error);
          reject(NextResponse.json({ error: 'Dosya yüklenirken bir hata oluştu.' }, { status: 500 }));
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          let processedContent = '';

          console.log('API: Extracted text before Gemini processing:', extractedText.substring(0, 500)); // Debug log

          if (extractedText) {
            try {
              const API_KEY = process.env.GEMINI_API_KEY;

              if (!API_KEY) {
                console.warn('Gemini API anahtarı yapılandırılmamış.');
                processedContent = extractedText; // Gemini API yoksa orijinal metni kullan
              } else {
                const genAI = new GoogleGenerativeAI(API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-pro"});

                const prompt = `Aşağıdaki ders notu içeriğini özetle ve önemli noktalarını çıkar:\n\n${extractedText}`;
                const result = await model.generateContent(prompt);
                const response = await result.response;
                processedContent = response.text();
                console.log('API: Gemini processed content length:', processedContent.length); // Debug log
                console.log('API: Gemini processed content (first 500 chars):', processedContent.substring(0, 500)); // Debug log
              }
            } catch (geminiError) {
              console.error('API: Gemini metin işleme hatası:', geminiError);
              processedContent = extractedText; // Hata durumunda orijinal metni kullan
            }
          } else {
            processedContent = ''; // Metin yoksa boş bırak
            console.log('API: No extracted text to process with Gemini.'); // Debug log
          }

          resolve(NextResponse.json({ success: true, fileUrl: downloadURL, processedContent }));
        }
      );
    });
  } catch (error) {
    console.error('Dosya yükleme API hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
