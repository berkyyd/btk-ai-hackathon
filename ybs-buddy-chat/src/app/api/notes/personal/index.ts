// Kişisel notlar Firestore koleksiyonu: 'personalNotes'
// Alanlar: userId, title, content, tags, folder, createdAt, updatedAt
// Tip: PersonalNote
export interface PersonalNote {
  id?: string;
  userId: string;
  title: string;
  content: string;
  tags?: string[];
  folder?: string;
  createdAt: string;
  updatedAt: string;
} 