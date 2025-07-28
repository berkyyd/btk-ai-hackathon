import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const qStr = searchParams.get('q')?.toLowerCase() || '';
  if (!userId) return NextResponse.json({ error: 'userId gerekli' }, { status: 400 });
  const notesRef = collection(db, 'personalNotes');
  const qNotes = query(notesRef, where('userId', '==', userId));
  const snapshot = await getDocs(qNotes);
  const notes = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
  const filtered = notes.filter(note =>
    note.title.toLowerCase().includes(qStr) ||
    note.content.toLowerCase().includes(qStr) ||
    (note.tags && note.tags.some((tag: string) => tag.toLowerCase().includes(qStr)))
  );
  return NextResponse.json({ success: true, notes: filtered });
} 