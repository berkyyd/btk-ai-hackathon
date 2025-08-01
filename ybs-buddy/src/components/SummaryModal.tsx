import React, { useState } from 'react';
import { SUMMARY_PROMPTS } from '../utils/summaryPrompts';
import { geminiService } from '../utils/geminiService';

interface SummaryModalProps {
  open: boolean;
  onClose: () => void;
  note: { 
    id: string; 
    title: string; 
    content: string;
    courseId?: string;
    class?: number;
    semester?: string;
  } | null;
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
      // Özet notu normal notlar koleksiyonuna kaydet
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Özet: ${note.title}`,
          content: summaryResult,
          courseId: note.courseId || '',
          class: note.class || 1,
          semester: note.semester || 'Güz',
          tags: ['Özet', summaryType],
          role: 'student',
          isPublic: false, // Özet notlar özel olsun
          userId: user.uid,
          originalFileName: null,
          isPDF: false,
          extractedText: null,
          fileSize: null,
          fileUrl: null
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (onSaved) onSaved();
        onClose();
        alert('Özet notu kaydedildi!');
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
            <div className="mb-4" style={{ maxHeight: 400, overflowY: 'auto' }}>
              {/* SummaryRenderer component was removed, so this will be empty or a placeholder */}
              {/* For now, we'll just display the raw summary result */}
              <p>{summaryResult}</p>
            </div>
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