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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Chat history'yi yönet - external varsa onu kullan, yoksa internal'ı
  const currentChatHistory = externalChatHistory || internalChatHistory;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChatHistory]);

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

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] card-glass rounded-lg shadow-xl flex flex-col z-50 border border-primary-700/30">
      {/* Header */}
      <div className="flex justify-between items-center p-4 primary-gradient-bg text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">YBS Buddy</h2>
            <p className="text-xs opacity-90">Akıllı Asistan</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onMinimize && (
            <button 
              onClick={onMinimize} 
              className="text-white hover:text-gray-200 focus:outline-none transition-colors"
              title="Minimize"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200 focus:outline-none transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-primary-900/5">
        {/* Welcome message only when no messages */}
        {currentChatHistory.length === 0 && (
          <div className="text-center text-text-secondary py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-900/20 rounded-full flex items-center justify-center border border-primary-700/30">
              <svg className="w-8 h-8 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-2 text-text-primary">Merhaba! Ben YBS Buddy 👋</p>
            <p className="text-xs mb-4 text-text-secondary">Size nasıl yardımcı olabilirim?</p>
            
            {/* Örnek sorular */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-text-muted mb-2">Örnek sorular:</p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => {
                    setMessage("Müfredatta kaç adet ders var?");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs bg-primary-900/20 text-primary-300 px-3 py-2 rounded-lg hover:bg-primary-800/30 transition-all duration-300 text-left border border-primary-700/30 hover:scale-105"
                >
                  📚 Müfredatta kaç adet ders var?
                </button>
                <button
                  onClick={() => {
                    setMessage("Benim notlarım neler?");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs bg-primary-900/20 text-primary-300 px-3 py-2 rounded-lg hover:bg-primary-800/30 transition-all duration-300 text-left border border-primary-700/30 hover:scale-105"
                >
                  📝 Benim notlarım neler?
                </button>
                <button
                  onClick={() => {
                    setMessage("Geçmiş sınav sonuçlarım nasıl?");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs bg-primary-900/20 text-primary-300 px-3 py-2 rounded-lg hover:bg-primary-800/30 transition-all duration-300 text-left border border-primary-700/30 hover:scale-105"
                >
                  📊 Geçmiş sınav sonuçlarım nasıl?
                </button>
                <button
                  onClick={() => {
                    setMessage("En yüksek puan aldığım sınav hangisi?");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs bg-primary-900/20 text-primary-300 px-3 py-2 rounded-lg hover:bg-primary-800/30 transition-all duration-300 text-left border border-primary-700/30 hover:scale-105"
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
              <div className={`p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-primary-600 text-white border border-primary-500/30' 
                  : 'bg-card-light border border-primary-700/30'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.role === 'user' ? 'text-primary-200' : 'text-text-muted'
                }`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
              
              {/* Feedback buttons for assistant messages */}
              {msg.role === 'assistant' && !msg.feedback && (
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleFeedback(msg.id, 'helpful')}
                    className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded hover:bg-green-800/40 transition-all duration-300 border border-green-700/30 hover:scale-105"
                  >
                    👍 Yardımcı
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, 'not_helpful')}
                    className="text-xs bg-red-900/30 text-red-300 px-2 py-1 rounded hover:bg-red-800/40 transition-all duration-300 border border-red-700/30 hover:scale-105"
                  >
                    👎 Yardımcı Değil
                  </button>
                </div>
              )}
              
              {/* Show feedback status */}
              {msg.role === 'assistant' && msg.feedback && (
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded border ${
                    msg.feedback === 'helpful' 
                      ? 'bg-green-900/30 text-green-300 border-green-700/30' 
                      : 'bg-red-900/30 text-red-300 border-red-700/30'
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
            <div className="bg-card-light border border-primary-700/30 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-text-secondary">Yazıyor...</span>
              </div>
            </div>
          </div>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <div className="bg-primary-900/20 border border-primary-700/30 rounded-lg p-3">
            <p className="text-xs font-medium text-primary-300 mb-2">📚 Kaynaklar:</p>
            <div className="space-y-1">
              {sources.map((source, index) => (
                <p key={index} className="text-xs text-primary-200">• {source}</p>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-primary-800/30 bg-card-light">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 border border-primary-700/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-card-light text-text-primary"
            placeholder="Müfredat, ders notları, sınavlar hakkında soru sorun..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || message.trim() === ''}
            className="btn-premium px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
