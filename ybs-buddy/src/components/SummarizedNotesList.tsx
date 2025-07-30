import React, { useEffect, useState } from 'react';

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

  if (loading) return <div>Özetler yükleniyor...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (summaries.length === 0) return <div>Henüz özetlenmiş notunuz yok.</div>;

  return (
    <div className="space-y-6">
      {summaries.map((s) => (
        <div key={s.id} className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow bg-white">
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-lg">{s.originalTitle}</div>
            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">{SUMMARY_TYPE_LABELS[s.summaryType] || s.summaryType}</span>
          </div>
          <div className="text-gray-700 whitespace-pre-line mb-2" style={{ maxHeight: 150, overflowY: 'auto' }}>{s.summary}</div>
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