import React, { useEffect, useState } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';

interface SummarizedNote {
  id: string;
  noteId: string;
  originalTitle: string;
  summary: string;
  summaryType: string;
  createdAt: { seconds: number; nanoseconds: number } | string;
}

interface SummarizedNotesListProps {
  userId: string;
}

const SUMMARY_TYPE_LABELS: Record<string, string> = {
  academic: 'Akademik',
  friendly: 'Samimi',
  exam: 'Sınav Odaklı',
};

const SummarizedNotesList: React.FC<SummarizedNotesListProps> = ({ userId }) => {
  const [summaries, setSummaries] = useState<SummarizedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSummary, setEditSummary] = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/profile/summarized-notes?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSummaries(data.summaries || []);
        } else {
          setError(data.error || 'Özetler alınamadı.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Sunucu hatası.');
        setLoading(false);
      });
  }, [userId]);

  const handleEdit = (summary: SummarizedNote) => {
    setEditingId(summary.id);
    setEditSummary(summary.summary);
  };

  const handleSave = async (summaryId: string) => {
    try {
      const response = await fetch(`/api/profile/summarized-notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summaryId,
          summary: editSummary,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSummaries(prev => 
          prev.map(s => 
            s.id === summaryId 
              ? { ...s, summary: editSummary }
              : s
          )
        );
        setEditingId(null);
        setEditSummary('');
      } else {
        alert('Özet güncellenirken hata oluştu: ' + data.error);
      }
    } catch (error) {
      console.error('Edit error:', error);
      alert('Özet güncellenirken hata oluştu.');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditSummary('');
  };

  const downloadPDF = (summary: SummarizedNote) => {
    // pdfMake'ı yapılandır - vfs otomatik olarak yüklenir
    
    // Tarih formatını al
    const date = typeof summary.createdAt === 'object' && 'seconds' in summary.createdAt
      ? new Date(summary.createdAt.seconds * 1000).toLocaleString('tr-TR')
      : summary.createdAt && typeof summary.createdAt === 'string'
        ? new Date(summary.createdAt).toLocaleString('tr-TR')
        : 'Bilinmeyen tarih';
    
    // PDF doküman tanımı
    const docDefinition = {
      content: [
        // Not başlığı
        {
          text: summary.originalTitle,
          style: 'title',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        
        // Ayırıcı çizgi
        {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0, x2: 515, y2: 0,
              lineWidth: 1,
              lineColor: '#cccccc'
            }
          ],
          margin: [0, 0, 0, 20]
        },
        
        // Özet içeriği
        {
          text: summary.summary,
          style: 'content',
          margin: [0, 0, 0, 20]
        },
        
        // Alt bilgi çizgisi
        {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0, x2: 515, y2: 0,
              lineWidth: 1,
              lineColor: '#cccccc'
            }
          ],
          margin: [0, 20, 0, 10]
        },
        
        // Tarih
        {
          text: `Oluşturulma Tarihi: ${date}`,
          style: 'footer',
          alignment: 'center'
        }
      ],
      
      styles: {
        title: {
          fontSize: 18,
          bold: true,
          color: '#333333'
        },
        content: {
          fontSize: 12,
          lineHeight: 1.5,
          color: '#333333'
        },
        footer: {
          fontSize: 10,
          italics: true,
          color: '#666666'
        }
      }
    };
    
    // PDF'i oluştur ve indir
    const fileName = `${summary.originalTitle.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g, '')}_özet.pdf`;
    (pdfMake as any).createPdf(docDefinition).download(fileName);
  };

  if (loading) return <div>Özetler yükleniyor...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (summaries.length === 0) return <div>Henüz özetlenmiş notunuz yok.</div>;

  return (
    <div className="space-y-6">
      {summaries.map((s) => (
        <div key={s.id} className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow bg-white">
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-lg">{s.originalTitle}</div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                {SUMMARY_TYPE_LABELS[s.summaryType] || s.summaryType}
              </span>
              <button
                onClick={() => handleEdit(s)}
                className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                disabled={editingId === s.id}
              >
                ✏️ Düzenle
              </button>
              <button
                onClick={() => downloadPDF(s)}
                className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
              >
                📄 PDF İndir
              </button>
            </div>
          </div>
          
          {editingId === s.id ? (
            <div className="mb-2">
              <textarea
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                className="w-full p-2 border rounded-md resize-none"
                rows={6}
                placeholder="Özeti düzenleyin..."
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleSave(s.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                >
                  Kaydet
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-700 whitespace-pre-line mb-2" style={{ maxHeight: 150, overflowY: 'auto' }}>
              {s.summary}
            </div>
          )}
          
          <div className="text-xs text-gray-500 text-right">
            {typeof s.createdAt === 'object' && 'seconds' in s.createdAt
              ? new Date(s.createdAt.seconds * 1000).toLocaleString('tr-TR')
              : s.createdAt && typeof s.createdAt === 'string'
                ? new Date(s.createdAt).toLocaleString('tr-TR')
                : ''}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummarizedNotesList; 