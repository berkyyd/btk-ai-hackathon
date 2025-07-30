import React, { useState } from 'react';
import { SUMMARY_PROMPTS } from '../utils/summaryPrompts';

interface SummaryModalProps {
  open: boolean;
  onClose: () => void;
  note: { id: string; title: string; content: string } | null;
  user: { uid: string } | null;
  onSaved?: () => void;
}

const SUMMARY_TYPES = [
  { value: 'academic', label: 'Akademik Özet' },
  { value: 'friendly', label: 'Samimi Özet' },
  { value: 'exam', label: 'Sınav Odaklı Özet' },
] as const;

type SummaryType = typeof SUMMARY_TYPES[number]['value'];

const SummaryModal: React.FC<SummaryModalProps> = ({ open, onClose, note, user, onSaved }) => {
  const [summaryType, setSummaryType] = useState<SummaryType>('academic');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState('');

  if (!open || !note) return null;

  const handleSummarize = async () => {
    setSummaryLoading(true);
    setSummaryError('');
    setSummaryResult(null);
    try {
      const res = await fetch('/api/notes/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: note.content,
          summaryType,
        }),
      });
      const data = await res.json();
      if (data.success && data.summary) {
        setSummaryResult(data.summary);
      } else {
        setSummaryError(data.error || 'Özetleme başarısız.');
      }
    } catch (err) {
      setSummaryError('Sunucu hatası.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!user || !note || !summaryResult) return;
    setSummaryLoading(true);
    setSummaryError('');
    try {
      const res = await fetch('/api/profile/summarized-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          noteId: note.id,
          originalTitle: note.title,
          summary: summaryResult,
          summaryType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (onSaved) onSaved();
        onClose();
        alert('Özet profiline kaydedildi!');
      } else {
        setSummaryError(data.error || 'Kayıt başarısız.');
      }
    } catch (err) {
      setSummaryError('Sunucu hatası.');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Özetleme Türü Seç</h2>
        <div className="mb-4">
          <select
            className="w-full border rounded px-3 py-2"
            value={summaryType}
            onChange={e => setSummaryType(e.target.value as SummaryType)}
            disabled={summaryLoading}
          >
            {SUMMARY_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full mb-4"
          onClick={handleSummarize}
          disabled={summaryLoading}
        >
          {summaryLoading ? 'Özetleniyor...' : 'Özetle'}
        </button>
        {summaryError && <div className="text-red-500 mb-2">{summaryError}</div>}
        {summaryResult && (
          <div className="mb-4">
            <h3 className="font-bold mb-2">Özet</h3>
            <div className="bg-gray-100 p-3 rounded whitespace-pre-line text-gray-800 mb-2" style={{ maxHeight: 200, overflowY: 'auto' }}>{summaryResult}</div>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
              onClick={handleSaveSummary}
              disabled={summaryLoading}
            >
              Profilde Kaydet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryModal; 