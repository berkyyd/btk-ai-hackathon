import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId gerekli' }, { status: 400 });
  const foldersRef = collection(db, 'personalNoteFolders');
  const q = query(foldersRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  const folders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ success: true, folders });
}

export async function POST(request: NextRequest) {
  const { userId, name } = await request.json();
  if (!userId || !name) return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
  const docRef = await addDoc(collection(db, 'personalNoteFolders'), {
    userId, name, createdAt: new Date().toISOString()
  });
  return NextResponse.json({ success: true, id: docRef.id });
}

export async function DELETE(request: NextRequest) {
  const { id, userId } = await request.json();
  if (!id || !userId) return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
  const folderRef = doc(db, 'personalNoteFolders', id);
  await deleteDoc(folderRef);
  return NextResponse.json({ success: true });
} 