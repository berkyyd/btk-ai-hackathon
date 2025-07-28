import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId gerekli' }, { status: 400 });
  const notesRef = collection(db, 'personalNotes');
  const q = query(notesRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ success: true, notes });
}

export async function POST(request: NextRequest) {
  const { userId, title, content, tags, folder } = await request.json();
  if (!userId || !title || !content) return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
  const docRef = await addDoc(collection(db, 'personalNotes'), {
    userId, title, content, tags: tags || [], folder: folder || null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  });
  return NextResponse.json({ success: true, id: docRef.id });
}

export async function PUT(request: NextRequest) {
  const { id, userId, title, content, tags, folder } = await request.json();
  if (!id || !userId) return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
  const noteRef = doc(db, 'personalNotes', id);
  await updateDoc(noteRef, { title, content, tags, folder, updatedAt: new Date().toISOString() });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { id, userId } = await request.json();
  if (!id || !userId) return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
  const noteRef = doc(db, 'personalNotes', id);
  await deleteDoc(noteRef);
  return NextResponse.json({ success: true });
} 