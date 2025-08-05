'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, ChatbotResponse } from '../types/api';
import { useAuth } from '../contexts/AuthContext';

interface ChatWindowProps {
  onClose: () => void;
  onMinimize?: () => void;
  chatHistory?: ChatMessage[];
  onChatHistoryChange?: (history: ChatMessage[]) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  onClose, 
  onMinimize, 
  chatHistory: externalChatHistory,
  onChatHistoryChange 
}) => {
  const [message, setMessage] = useState('');
  const [internalChatHistory, setInternalChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<string[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Chat history'yi yönet - external varsa onu kullan, yoksa internal'ı
  const currentChatHistory = externalChatHistory || internalChatHistory;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChatHistory, fullscreen]);

  const handleSendMessage = async () => {
    const currentMessage = message.trim();
    if (currentMessage === '') return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: currentMessage,
      role: 'user',
      timestamp: new Date()
    };

    // Kullanıcı mesajını hemen ekle
    if (onChatHistoryChange) {
      // External chat history kullanılıyorsa
      const newHistory = [...currentChatHistory, userMessage];
      onChatHistoryChange(newHistory);
    } else {
      // Internal chat history kullanılıyorsa
      setInternalChatHistory(prev => [...prev, userMessage]);
    }

    setMessage('');
    setIsLoading(true);
    setSources([]);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: currentMessage,
          userId: user?.uid || 'anonymous',
          userName: user?.displayName || '',
          previousMessages: currentChatHistory.slice(-3)
        }),
      });

      const data: ChatbotResponse = await response.json();
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.answer || 'Bir hata oluştu.',
        role: 'assistant',
        timestamp: new Date()
      };

      // Bot mesajını ekle
      if (onChatHistoryChange) {
        // External chat history kullanılıyorsa - hem kullanıcı hem bot mesajını ekle
        const newHistory = [...currentChatHistory, userMessage, botMessage];
        onChatHistoryChange(newHistory);
      } else {
        // Internal chat history kullanılıyorsa
        setInternalChatHistory(prev => [...prev, botMessage]);
      }
      
      if (data.sources && data.sources.length > 0) {
        setSources(data.sources);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.',
        role: 'assistant',
        timestamp: new Date()
      };
      
      if (onChatHistoryChange) {
        // External chat history kullanılıyorsa - hem kullanıcı hem hata mesajını ekle
        const newHistory = [...currentChatHistory, userMessage, errorMessage];
        onChatHistoryChange(newHistory);
      } else {
        // Internal chat history kullanılıyorsa
        setInternalChatHistory(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, feedback: 'helpful' | 'not_helpful') => {
    if (!user?.uid) return;

    try {
      await fetch('/api/chatbot', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          feedback,
          userId: user.uid
        }),
      });

      // Update the message with feedback
      const updatedHistory = currentChatHistory.map((msg) =>
        msg.id === messageId ? { ...msg, feedback } : msg
      );
      
      if (onChatHistoryChange) {
        onChatHistoryChange(updatedHistory);
      } else {
        setInternalChatHistory(updatedHistory);
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Panel boyutları
  const panelClass = fullscreen
    ? 'fixed inset-0 w-full h-full max-w-none max-h-none rounded-none p-0'
    : 'fixed bottom-4 right-4 w-[420px] max-w-[98vw] h-[600px] card-glass rounded-3xl shadow-2xl border border-white/30';

  return (
    <div className={`${panelClass} z-50 flex flex-col bg-white/80 backdrop-blur-2xl transition-all duration-500`}
      style={{ boxShadow: fullscreen ? '0 0 0 9999px rgba(30,41,59,0.25)' : undefined }}>
      {/* Header */}
      <div className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-400 text-white rounded-t-3xl shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-black">YBS Buddy AI</h2>
            <p className="text-xs text-white opacity-90">Akıllı Asistan & Sohbet</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFullscreen((f) => !f)}
            className="text-white/80 hover:text-white focus:outline-none transition-colors duration-300"
            title={fullscreen ? 'Küçült' : 'Büyüt'}
          >
            {fullscreen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h4V4m0 0v4m0-4H4m16 12h-4v4m0 0v-4m0 4h4" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h7v7H4V4zm9 9h7v7h-7v-7z" />
              </svg>
            )}
          </button>
          {onMinimize && (
            <button 
              onClick={onMinimize} 
              className="text-white/80 hover:text-white focus:outline-none transition-colors duration-300"
              title="Minimize"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white focus:outline-none transition-colors duration-300"
            title="Kapat"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-white/80 via-blue-50 to-indigo-50">
        {/* Welcome message only when no messages */}
        {currentChatHistory.length === 0 && (
          <div className="text-center text-gray-700 py-10">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-lg font-semibold mb-2 text-blue-900">Merhaba! Ben YBS Buddy AI 🤖</p>
            <p className="text-sm mb-4 text-blue-700">Her konuda sohbet edebilir, bilgi alabilir veya yardım isteyebilirsin.</p>
            <div className="space-y-2">
              <p className="text-xs font-medium text-blue-500 mb-2">Örnek sorular:</p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => {
                    setMessage("Müfredatta kaç adet ders var?");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-lg hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 text-left border border-blue-200 hover:scale-105 shadow-sm"
                >
                  📚 Müfredatta kaç adet ders var?
                </button>
                <button
                  onClick={() => {
                    setMessage("Benim notlarım neler?");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-lg hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 text-left border border-blue-200 hover:scale-105 shadow-sm"
                >
                  📝 Benim notlarım neler?
                </button>
                <button
                  onClick={() => {
                    setMessage("Geçmiş sınav sonuçlarım nasıl?");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-lg hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 text-left border border-blue-200 hover:scale-105 shadow-sm"
                >
                  📊 Geçmiş sınav sonuçlarım nasıl?
                </button>
                <button
                  onClick={() => {
                    setMessage("En yüksek puan aldığım sınav hangisi?");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-lg hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 text-left border border-blue-200 hover:scale-105 shadow-sm"
                >
                  🏆 En yüksek puan aldığım sınav hangisi?
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show all messages */}
        {currentChatHistory.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`p-4 rounded-2xl shadow-lg transition-all duration-300 group ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white border-0 hover:shadow-2xl' 
                  : 'bg-white/95 border border-blue-200 shadow-md text-black hover:shadow-xl'
              }`}>
                <p className={`text-base whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user' ? 'text-white' : 'text-black'
                }`}>{msg.content}</p>
                <p className={`text-xs mt-2 ${
                  msg.role === 'user' ? 'text-blue-200' : 'text-blue-600'
                }`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
              {/* Feedback buttons for assistant messages */}
              {msg.role === 'assistant' && !msg.feedback && (
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleFeedback(msg.id, 'helpful')}
                    className="text-xs bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-2 py-1 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all duration-300 border border-green-200 hover:scale-105 shadow-sm"
                  >
                    👍 Yardımcı
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, 'not_helpful')}
                    className="text-xs bg-gradient-to-r from-red-50 to-pink-50 text-red-700 px-2 py-1 rounded-lg hover:from-red-100 hover:to-pink-100 transition-all duration-300 border border-red-200 hover:scale-105 shadow-sm"
                  >
                    👎 Yardımcı Değil
                  </button>
                </div>
              )}
              {/* Show feedback status */}
              {msg.role === 'assistant' && msg.feedback && (
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-lg border shadow-sm ${
                    msg.feedback === 'helpful' 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200' 
                      : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200'
                  }`}>
                    {msg.feedback === 'helpful' ? '👍 Teşekkürler!' : '👎 Geri bildiriminiz için teşekkürler'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/90 border border-gray-200 p-4 rounded-2xl shadow-md flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-blue-500">Yazıyor...</span>
            </div>
          </div>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 shadow-sm">
            <p className="text-xs font-medium text-blue-700 mb-2">📚 Kaynaklar:</p>
            <div className="space-y-1">
              {sources.map((source, index) => (
                <p key={index} className="text-xs text-blue-900">• {source}</p>
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-200 bg-white/90 rounded-b-3xl">
        <div className="flex space-x-3 items-end">
          <textarea
            rows={1}
            className="flex-1 border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 transition-all duration-300 resize-none text-base shadow-sm"
            placeholder="Bir şeyler yazın veya soru sorun..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
            style={{ minHeight: 44, maxHeight: fullscreen ? 120 : 80 }}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || message.trim() === ''}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl transform hover:scale-105 text-lg font-bold shadow-lg"
            style={{ minHeight: 44 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
