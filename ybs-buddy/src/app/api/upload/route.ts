import { NextRequest, NextResponse } from 'next/server';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../config/firebase';

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

    // Dosya türü kontrolü
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Sadece PDF dosyaları yüklenebilir.' }, { status: 400 });
    }

    // Dosya boyutu kontrolü (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Dosya boyutu 10MB\'dan büyük olamaz.' }, { status: 400 });
    }

    const storageRef = ref(storage, `uploads/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Promise yerine async/await kullan
    await new Promise<void>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Yükleme ilerlemesini burada takip edebilirsiniz
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Dosya yükleme hatası:', error);
          reject(error);
        },
        async () => {
          resolve();
        }
      );
    });

    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    console.log('API: File uploaded successfully, URL:', downloadURL);

    return NextResponse.json({ 
      success: true, 
      fileUrl: downloadURL, 
      processedContent: extractedText || '' 
    });

  } catch (error) {
    console.error('Dosya yükleme API hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
