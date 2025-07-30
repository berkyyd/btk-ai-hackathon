import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { adminApp } from '../../../config/firebaseAdmin';
import { GoogleGenerativeAI } from '@google/generative-ai';

const auth = getAuth(adminApp);
const db = getFirestore(adminApp);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { noteId, category } = await req.json();
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const noteRef = db.collection('notes').doc(noteId);
    const noteDoc = await noteRef.get();

    if (!noteDoc.exists) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const noteData = noteDoc.data();
    const noteContent = noteData?.content;
    const noteTitle = noteData?.title;

    if (!noteContent) {
      return NextResponse.json({ error: 'Note content is empty' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Aşağıdaki ders notunu "${category}" kategorisine uygun olarak özetle. Özet, notun ana fikirlerini ve önemli noktalarını içermeli, ancak seçilen kategoriye göre bir ton ve odak noktası olmalıdır. Not başlığı: "${noteTitle}", Not içeriği: "${noteContent}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summarizedContent = response.text();

    // Özetlenen notu kullanıcının profiline kaydet
    const userProfileRef = db.collection('users').doc(userId);
    await userProfileRef.update({
      summarizedNotes: FieldValue.arrayUnion({
        noteId: noteId,
        title: noteTitle,
        summarizedContent: summarizedContent,
        category: category,
        createdAt: FieldValue.serverTimestamp(),
      }),
    });

    return NextResponse.json({ success: true, summarizedContent });
  } catch (error) {
    console.error('Error summarizing note:', error);
    return NextResponse.json({ error: 'Failed to summarize note' }, { status: 500 });
  }
}