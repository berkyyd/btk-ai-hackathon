'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatbotResponse } from '../types/api';
import { useAuth } from '../contexts/AuthContext';

interface ChatWindowProps {
  onClose: () => void;
  chatHistory?: ChatMessage[];
  onChatHistoryChange?: (history: ChatMessage[]) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  onClose, 
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

  const addMessage = (newMessage: ChatMessage) => {
    if (onChatHistoryChange) {
      // External chat history kullanılıyorsa
      onChatHistoryChange([...currentChatHistory, newMessage]);
    } else {
      // Internal chat history kullanılıyorsa
      setInternalChatHistory(prev => [...prev, newMessage]);
    }
  };

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

    // Kullanıcı mesajını hemen ekle ve state'i güncelle
    addMessage(userMessage);
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
          userId: user?.uid 
        }),
      });

      const data: ChatbotResponse = await response.json();
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.answer || 'Bir hata oluştu.',
        role: 'assistant',
        timestamp: new Date()
      };

      // Bot mesajını mevcut history'ye ekle
      addMessage(botMessage);
      
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
      addMessage(errorMessage);
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
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
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
        <button 
          onClick={onClose} 
          className="text-white hover:text-gray-200 focus:outline-none transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
        {currentChatHistory.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm">Merhaba! Size nasıl yardımcı olabilirim?</p>
            <p className="text-xs mt-2">Derslerle ilgili sorularınızı sorabilirsiniz.</p>
          </div>
        )}

        {currentChatHistory.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white border border-gray-200'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
              
              {/* Feedback buttons for assistant messages */}
              {msg.role === 'assistant' && !msg.feedback && (
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleFeedback(msg.id, 'helpful')}
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                  >
                    👍 Yardımcı
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, 'not_helpful')}
                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                  >
                    👎 Yardımcı Değil
                  </button>
                </div>
              )}
              
              {/* Show feedback status */}
              {msg.role === 'assistant' && msg.feedback && (
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    msg.feedback === 'helpful' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
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
            <div className="bg-white border border-gray-200 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">Yazıyor...</span>
              </div>
            </div>
          </div>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-800 mb-2">📚 Kaynaklar:</p>
            <div className="space-y-1">
              {sources.map((source, index) => (
                <p key={index} className="text-xs text-blue-700">• {source}</p>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Mesajınızı yazın..."
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
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
