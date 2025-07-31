import React from 'react';

interface SummaryRendererProps {
  content: string;
  summaryType: 'academic' | 'friendly' | 'exam';
}

const SummaryRenderer: React.FC<SummaryRendererProps> = ({ content, summaryType }) => {
  // Markdown'u parse edip HTML'e çevir
  const parseMarkdown = (text: string) => {
    return text
      // Başlıkları
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-800 mb-3 mt-4 flex items-center">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-700 mb-2 mt-3">$1</h3>')
      
      // Emoji'leri ve başlıkları
      .replace(/^## 📚 (.*$)/gim, '<h2 class="text-xl font-bold text-blue-600 mb-3 mt-4 flex items-center"><span class="mr-2">📚</span>$1</h2>')
      .replace(/^## 🔑 (.*$)/gim, '<h2 class="text-xl font-bold text-purple-600 mb-3 mt-4 flex items-center"><span class="mr-2">🔑</span>$1</h2>')
      .replace(/^## 💡 (.*$)/gim, '<h2 class="text-xl font-bold text-green-600 mb-3 mt-4 flex items-center"><span class="mr-2">💡</span>$1</h2>')
      .replace(/^## 🎯 (.*$)/gim, '<h2 class="text-xl font-bold text-orange-600 mb-3 mt-4 flex items-center"><span class="mr-2">🎯</span>$1</h2>')
      .replace(/^## 📖 (.*$)/gim, '<h2 class="text-xl font-bold text-indigo-600 mb-3 mt-4 flex items-center"><span class="mr-2">📖</span>$1</h2>')
      .replace(/^## ⚠️ (.*$)/gim, '<h2 class="text-xl font-bold text-red-600 mb-3 mt-4 flex items-center"><span class="mr-2">⚠️</span>$1</h2>')
      .replace(/^## 📝 (.*$)/gim, '<h2 class="text-xl font-bold text-blue-600 mb-3 mt-4 flex items-center"><span class="mr-2">📝</span>$1</h2>')
      .replace(/^## 🔍 (.*$)/gim, '<h2 class="text-xl font-bold text-green-600 mb-3 mt-4 flex items-center"><span class="mr-2">🔍</span>$1</h2>')
      .replace(/^## 📚 (.*$)/gim, '<h2 class="text-xl font-bold text-purple-600 mb-3 mt-4 flex items-center"><span class="mr-2">📚</span>$1</h2>')
      .replace(/^## ⚡ (.*$)/gim, '<h2 class="text-xl font-bold text-yellow-600 mb-3 mt-4 flex items-center"><span class="mr-2">⚡</span>$1</h2>')
      .replace(/^## 💭 (.*$)/gim, '<h2 class="text-xl font-bold text-pink-600 mb-3 mt-4 flex items-center"><span class="mr-2">💭</span>$1</h2>')
      .replace(/^## 🤔 (.*$)/gim, '<h2 class="text-xl font-bold text-blue-600 mb-3 mt-4 flex items-center"><span class="mr-2">🤔</span>$1</h2>')
      .replace(/^## 💡 (.*$)/gim, '<h2 class="text-xl font-bold text-green-600 mb-3 mt-4 flex items-center"><span class="mr-2">💡</span>$1</h2>')
      .replace(/^## 🎉 (.*$)/gim, '<h2 class="text-xl font-bold text-yellow-600 mb-3 mt-4 flex items-center"><span class="mr-2">🎉</span>$1</h2>')
      .replace(/^## 📋 (.*$)/gim, '<h2 class="text-xl font-bold text-indigo-600 mb-3 mt-4 flex items-center"><span class="mr-2">📋</span>$1</h2>')
      
      // Tabloları - Yeni format için
      .replace(/\| Kavram \| Açıklama \| Örnek \|/g, '<thead class="bg-gray-50"><tr class="border-b border-gray-200"><th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kavram</th><th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th><th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Örnek</th></tr></thead>')
      .replace(/\| Kavram \| Açıklama \| Sınav Örneği \|/g, '<thead class="bg-gray-50"><tr class="border-b border-gray-200"><th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kavram</th><th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th><th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sınav Örneği</th></tr></thead>')
      .replace(/\| (.*?) \| (.*?) \| (.*?) \|/g, '<tr class="border-b border-gray-200"><td class="px-3 py-2 text-sm font-medium text-gray-900">$1</td><td class="px-3 py-2 text-sm text-gray-700">$2</td><td class="px-3 py-2 text-sm text-gray-700">$3</td></tr>')
      .replace(/\|--------\|--------\|--------\|/g, '')
      
      // Tablo wrapper'ı
      .replace(/(<thead.*?<\/thead>)(.*?)(?=##|$)/gs, '<div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200 mb-4 border border-gray-200 rounded-lg">$1<tbody class="bg-white divide-y divide-gray-200">$2</tbody></table></div>')
      
      // Listeleri
      .replace(/^- (.*$)/gim, '<li class="mb-1 text-gray-700">$1</li>')
      .replace(/^1\. \*\*(.*?)\*\*: (.*$)/gim, '<li class="mb-2"><span class="font-semibold text-gray-800">$1:</span> $2</li>')
      .replace(/^2\. \*\*(.*?)\*\*: (.*$)/gim, '<li class="mb-2"><span class="font-semibold text-gray-800">$1:</span> $2</li>')
      .replace(/^3\. \*\*(.*?)\*\*: (.*$)/gim, '<li class="mb-2"><span class="font-semibold text-gray-800">$1:</span> $2</li>')
      
      // Liste wrapper'ları
      .replace(/(<li.*?<\/li>)+/gs, '<ul class="list-disc list-inside space-y-1 mb-3">$&</ul>')
      
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
      
      // Italic text
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-600">$1</em>')
      
      // Notlar
      .replace(/\*Not: (.*?)\*/g, '<div class="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r"><p class="text-sm text-blue-800 italic">Not: $1</p></div>')
      
      // Satır sonları
      .replace(/\n/g, '<br>');
  };

  const getSummaryTypeStyles = () => {
    switch (summaryType) {
      case 'academic':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200';
      case 'friendly':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
      case 'exam':
        return 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getSummaryTypeIcon = () => {
    switch (summaryType) {
      case 'academic':
        return '📚';
      case 'friendly':
        return '😊';
      case 'exam':
        return '📝';
      default:
        return '📄';
    }
  };

  const getSummaryTypeTitle = () => {
    switch (summaryType) {
      case 'academic':
        return 'Akademik Özet';
      case 'friendly':
        return 'Samimi Özet';
      case 'exam':
        return 'Sınav Odaklı Özet';
      default:
        return 'Özet';
    }
  };

  return (
    <div className={`rounded-lg border p-6 ${getSummaryTypeStyles()} shadow-sm`}>
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">{getSummaryTypeIcon()}</span>
        <h3 className="text-lg font-bold text-gray-800">{getSummaryTypeTitle()}</h3>
      </div>
      
      <div 
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ 
          __html: parseMarkdown(content) 
        }}
      />
    </div>
  );
};

export default SummaryRenderer; 