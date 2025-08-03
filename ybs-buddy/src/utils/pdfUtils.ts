import { Note as NoteType } from '../types/note';

interface Course {
  id: string;
  name: string;
  code?: string;
}

export const downloadNoteAsPDF = async (note: NoteType, courseName?: string, userName?: string) => {
  try {
    // Basit HTML tabanlı PDF oluşturma
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${note.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.6;
            color: #333;
          }
          h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 30px;
            color: #000;
          }
          .content {
            font-size: 14px;
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <h1>${note.title}</h1>
        <div class="content">${note.content}</div>
      </body>
      </html>
    `;
    
    // HTML'i PDF'e çevir
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // PDF dosya adı
    const createdDate = typeof note.createdAt === 'string' 
      ? new Date(note.createdAt) 
      : note.createdAt;
    const formattedDate = createdDate.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/[^0-9]/g, '');
    
    const cleanFileName = note.title
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    
    const fileName = `${cleanFileName}_${formattedDate}.html`;
    
    // Dosyayı indir
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // URL'i temizle
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    return false;
  }
}; 