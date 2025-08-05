import React, { useState } from 'react';
import { SUMMARY_PROMPTS } from '../utils/summaryPrompts';
import { geminiService } from '../utils/geminiService';
import { useToast } from './ToastContainer';

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
  const { showToast } = useToast();

  if (!open || !note) return null;

  // Özet notların tekrar özetlenmesini engelle
  if (note.title.startsWith('Özet:')) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-2xl w-full mx-4 relative border border-white/20">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200/60">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">⚠️</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Özet Notu</h2>
                <p className="text-sm text-gray-600">Bu zaten bir özet notu</p>
              </div>
            </div>
            
            <button 
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-300" 
              onClick={onClose}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="px-8 py-6 space-y-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/60">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">📝</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Özet Notu Tespit Edildi</h3>
                  <p className="text-sm text-gray-600">{note.title}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Bu not zaten bir özet notu olduğu için tekrar özetlenemez. Özet notlar sadece düzenlenebilir.
                </p>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60">
                  <h4 className="font-medium text-gray-800 mb-2">Özet İçeriği:</h4>
                  <div 
                    className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                </div>
              </div>
            </div>
            
            {/* Butonlar */}
            <div className="flex gap-3">
              <button 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl" 
                onClick={() => {
                  // Not detay modalına geri dön
                  onClose();
                }}
              >
                🔙 Geri Dön
              </button>
              
              <button 
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-200" 
                onClick={onClose}
              >
                ❌ Kapat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSummarize = async () => {
    setSummaryLoading(true);
    setSummaryError('');
    setSummaryResult(null);
    
    // Başlangıç toast'u
    showToast({
      type: 'info',
      title: 'Özetleme Başlatıldı',
      message: 'Notunuz AI tarafından özetleniyor...',
      duration: 3000
    });
    
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
        showToast({
          type: 'success',
          title: 'Özetleme Tamamlandı',
          message: 'Notunuz başarıyla özetlendi!',
          duration: 4000
        });
      } else {
        setSummaryError(data.error || 'Özetleme başarısız.');
        showToast({
          type: 'error',
          title: 'Özetleme Hatası',
          message: data.error || 'Özetleme sırasında bir hata oluştu.',
          duration: 5000
        });
      }
    } catch (err) {
      setSummaryError('Sunucu hatası.');
      showToast({
        type: 'error',
        title: 'Bağlantı Hatası',
        message: 'Sunucuya bağlanırken bir hata oluştu.',
        duration: 5000
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!user || !note || !summaryResult) return;
    setSummaryLoading(true);
    setSummaryError('');
    
    // Kaydetme başlangıç toast'u
    showToast({
      type: 'info',
      title: 'Özet Kaydediliyor',
      message: 'Özet notunuz profilinize kaydediliyor...',
      duration: 3000
    });
    
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
        
        // Başarı toast'u
        showToast({
          type: 'success',
          title: 'Özet Başarıyla Kaydedildi! 🎉',
          message: `"${note.title}" notunun özeti profilinize kaydedildi. Özetlerim bölümünden görüntüleyebilirsiniz.`,
          duration: 6000
        });
      } else {
        setSummaryError(data.error || 'Kayıt başarısız.');
        showToast({
          type: 'error',
          title: 'Kaydetme Hatası',
          message: data.error || 'Özet kaydedilirken bir hata oluştu.',
          duration: 5000
        });
      }
    } catch (err) {
      setSummaryError('Sunucu hatası.');
      showToast({
        type: 'error',
        title: 'Bağlantı Hatası',
        message: 'Sunucuya bağlanırken bir hata oluştu.',
        duration: 5000
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-2xl w-full mx-4 relative border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">📝</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Not Özetleme</h2>
              <p className="text-sm text-gray-600">AI ile notunuzu özetleyin</p>
            </div>
          </div>
          
          <button 
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-300" 
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-8 py-6 space-y-6">
          {/* Not Bilgisi */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200/60">
            <h3 className="font-semibold text-gray-800 mb-2">Özetlenecek Not:</h3>
            <p className="text-sm text-gray-700 font-medium">{note.title}</p>
          </div>
          
          {/* Özetleme Türü Seçimi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Özetleme Türü</label>
            <select
              className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 transition-all duration-300"
              value={summaryType}
              onChange={e => setSummaryType(e.target.value as SummaryType)}
              disabled={summaryLoading}
            >
              {SUMMARY_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          {/* Özetle Butonu */}
          <button
            className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
              summaryLoading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-xl transform hover:scale-[1.02]'
            }`}
            onClick={handleSummarize}
            disabled={summaryLoading}
          >
            {summaryLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Özetleniyor...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>🤖</span>
                <span>AI ile Özetle</span>
              </div>
            )}
          </button>
          
          {/* Hata Mesajı */}
          {summaryError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {summaryError}
            </div>
          )}
          
          {/* Özet Sonucu */}
          {summaryResult && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200/60">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  Özet Sonucu
                </h3>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 max-h-60 overflow-y-auto border border-gray-200/60">
                  <div 
                    className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: summaryResult }}
                  />
                </div>
              </div>
              
              {/* Kaydet Butonu */}
              <button
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                  summaryLoading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-xl transform hover:scale-[1.02]'
                }`}
                onClick={handleSaveSummary}
                disabled={summaryLoading}
              >
                {summaryLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Kaydediliyor...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>💾</span>
                    <span>Profilde Kaydet</span>
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryModal; 