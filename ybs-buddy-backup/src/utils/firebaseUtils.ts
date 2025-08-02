import { db } from '../config/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore/lite';

export async function getLectureNotes() {
  try {
    const notesCollectionRef = collection(db, 'notes');
    const querySnapshot = await getDocs(notesCollectionRef);
    const notes: { id: string; title: string; content: string; course?: string }[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.title && data.content) {
        notes.push({ id: doc.id, title: data.title, content: data.content, course: data.course });
      }
    });
    return notes;
  } catch (error) {
    console.error("Error fetching lecture notes from Firebase:", error);
    return [];
  }
}

export async function saveChatHistory(userId: string, messages: any[]) {
  try {
    const chatRef = collection(db, 'chatHistory');
    const chatDoc = {
      userId,
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(chatRef, chatDoc);
    return docRef.id;
  } catch (error) {
    console.error('Error saving chat history:', error);
    throw error;
  }
}

export async function saveChatFeedback(feedback: any) {
  try {
    const feedbackRef = collection(db, 'chatFeedback');
    const feedbackDoc = {
      ...feedback,
      timestamp: new Date().toISOString()
    };
    await addDoc(feedbackRef, feedbackDoc);
  } catch (error) {
    console.error('Error saving chat feedback:', error);
    throw error;
  }
} 