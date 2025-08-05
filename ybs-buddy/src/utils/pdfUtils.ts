import { Note as NoteType } from '../types/note';
import jsPDF from 'jspdf';
import 'src/assets/fonts/DejaVuSans-normal.js';
import 'src/assets/fonts/DejaVuSans-Bold-bold.js';

interface Course {
  id: string;
  name: string;
  code?: string;
}

// HTML içeriğini parse et ve düz metne çevir
function parseHTMLContent(htmlContent: string): string {
  // Önce tabloları özel olarak işle
  let text = htmlContent;
  
  // Tabloları bul ve düzenle
  const tableRegex = /<table[\s\S]*?<\/table>/gi;
  text = text.replace(tableRegex, (tableMatch) => {
    // Tablo başlıklarını çıkar
    const headers = Array.from(tableMatch.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi))
      .map(m => (m && m[1] ? m[1].replace(/<[^>]+>/g, '').trim() : ''))
      .filter(h => h.length > 0);
    
    // Tablo satırlarını çıkar
    const rows = Array.from(tableMatch.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi))
      .map(tr => {
        return Array.from((tr[1] || '').matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi))
          .map(td => (td && td[1] ? td[1].replace(/<[^>]+>/g, '').trim() : ''))
          .filter(cell => cell.length > 0);
      })
      .filter(row => row.length > 0);
    
    if (headers.length === 0 && rows.length === 0) {
      return '\n';
    }
    
    // Tabloyu düzenli metin olarak formatla
    let formattedTable = '\n';
    
    // Başlık satırı (sadece bir kez)
    if (headers.length > 0) {
      formattedTable += headers.join(' | ') + '\n';
      formattedTable += '-'.repeat(headers.join(' | ').length) + '\n';
    }
    
    // Veri satırları (başlık satırını tekrar etme)
    rows.forEach(row => {
      if (row.length > 0) {
        formattedTable += row.join(' | ') + '\n';
      }
    });
    
    return formattedTable + '\n';
  });
  
  // Diğer HTML etiketlerini kaldır
  text = text
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<html[^>]*>/gi, '')
    .replace(/<\/html>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<body[^>]*>/gi, '')
    .replace(/<\/body>/gi, '')
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<h1[^>]*>/gi, '\n\n')
    .replace(/<h2[^>]*>/gi, '\n\n')
    .replace(/<h3[^>]*>/gi, '\n\n')
    .replace(/<h4[^>]*>/gi, '\n\n')
    .replace(/<h5[^>]*>/gi, '\n\n')
    .replace(/<h6[^>]*>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/li>/gi, '')
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<strong[^>]*>/gi, '')
    .replace(/<\/strong>/gi, '')
    .replace(/<b[^>]*>/gi, '')
    .replace(/<\/b>/gi, '')
    .replace(/<em[^>]*>/gi, '')
    .replace(/<\/em>/gi, '')
    .replace(/<i[^>]*>/gi, '')
    .replace(/<\/i>/gi, '')
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Fazla boşlukları temizle
    .replace(/^\s+|\s+$/g, ''); // Başındaki ve sonundaki boşlukları temizle

  return text;
}

export const downloadNoteAsPDF = async (note: NoteType, courseName?: string, userName?: string) => {
  try {
    // PDF oluştur
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Font ayarla - import edilen fontları kullan
    pdf.setFont('DejaVuSans', 'normal');
    pdf.setFontSize(16);
    
    // Sayfa boyutları
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    
    let yPosition = margin + 20;
    
    // Başlık
    pdf.setFontSize(18);
    pdf.setFont('DejaVuSans', 'bold');
    
    const titleLines = pdf.splitTextToSize(note.title, contentWidth);
    pdf.text(titleLines, margin, yPosition);
    yPosition += (titleLines.length * 8) + 15;
    
    // Bilgi satırları
    pdf.setFontSize(10);
    pdf.setFont('DejaVuSans', 'normal');
    
    if (courseName) {
      pdf.text(`Ders: ${courseName}`, margin, yPosition);
      yPosition += 8;
    }
    
    if (userName) {
      pdf.text(`Öğrenci: ${userName}`, margin, yPosition);
      yPosition += 8;
    }
    
    const createdDate = typeof note.createdAt === 'string' 
      ? new Date(note.createdAt) 
      : note.createdAt;
    pdf.text(`Oluşturulma Tarihi: ${createdDate.toLocaleDateString('tr-TR')}`, margin, yPosition);
    yPosition += 15;
    
    // Ayırıcı çizgi
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    // İçerik - HTML'i parse et
    pdf.setFontSize(12);
    pdf.setFont('DejaVuSans', 'normal');
    
    const parsedContent = parseHTMLContent(note.content);
    const contentLines = pdf.splitTextToSize(parsedContent, contentWidth);
    
    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i];
      
      // Sayfa sonuna yaklaştıysak yeni sayfa ekle
      if (yPosition + 8 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin + 20;
      }
      
      pdf.text(line, margin, yPosition);
      yPosition += 8;
    }
    
    // PDF dosya adı
    const formattedDate = createdDate.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/[^0-9]/g, '');
    
    const cleanFileName = note.title
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    
    const fileName = `${cleanFileName}_${formattedDate}.pdf`;
    
    // PDF'i indir
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    return false;
  }
};

// HTML formatında not içeriği oluştur
export const createNoteHTML = (note: NoteType, courseName?: string, userName?: string): string => {
  const createdDate = typeof note.createdAt === 'string' 
    ? new Date(note.createdAt) 
    : note.createdAt;
  
  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${note.title}</title>
      <style>
        @font-face {
          font-family: 'DejaVuSans';
          src: url('/fonts/DejaVuSans-normal.js') format('javascript');
          font-weight: normal;
          font-style: normal;
        }
        @font-face {
          font-family: 'DejaVuSans';
          src: url('/fonts/DejaVuSans-Bold-bold.js') format('javascript');
          font-weight: bold;
          font-style: normal;
        }
        
        body {
          font-family: 'DejaVuSans', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .container {
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #000;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
          font-family: 'DejaVuSans', Arial, sans-serif;
        }
        .info {
          font-size: 14px;
          color: #666;
          margin-bottom: 20px;
          font-family: 'DejaVuSans', Arial, sans-serif;
        }
        .date {
          font-size: 12px;
          color: #999;
          margin-bottom: 30px;
          font-family: 'DejaVuSans', Arial, sans-serif;
        }
        .content {
          font-size: 14px;
          line-height: 1.8;
          white-space: pre-wrap;
          font-family: 'DejaVuSans', Arial, sans-serif;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 20px 0;
          font-family: 'DejaVuSans', Arial, sans-serif;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        ul, ol {
          margin: 10px 0;
          padding-left: 20px;
          font-family: 'DejaVuSans', Arial, sans-serif;
        }
        li {
          margin: 5px 0;
        }
        h2 {
          font-size: 18px;
          font-weight: bold;
          margin: 20px 0 10px 0;
          color: #000;
          font-family: 'DejaVuSans', Arial, sans-serif;
        }
        h3 {
          font-size: 16px;
          font-weight: bold;
          margin: 15px 0 8px 0;
          color: #333;
          font-family: 'DejaVuSans', Arial, sans-serif;
        }
        strong {
          font-weight: bold;
        }
        em {
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${note.title}</h1>
        ${courseName ? `<div class="info"><strong>Ders:</strong> ${courseName}</div>` : ''}
        ${userName ? `<div class="info"><strong>Öğrenci:</strong> ${userName}</div>` : ''}
        <div class="date">
          <strong>Oluşturulma Tarihi:</strong> ${createdDate.toLocaleDateString('tr-TR')}
        </div>
        <div class="content">
          ${note.content}
        </div>
      </div>
    </body>
    </html>
  `;
}; 