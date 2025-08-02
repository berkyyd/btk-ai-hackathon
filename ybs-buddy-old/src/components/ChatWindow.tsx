'use client';

import React, { useState, useRef, useEffect } from 'react';
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

  // Chat history'yi yönet
  const chatHistory = externalChatHistory || internalChatHistory;
  
  const addMessage = (newMessage: ChatMessage) => {
    const updatedHistory = [...chatHistory, newMessage];
    if (onChatHistoryChange) {
      onChatHistoryChange(updatedHistory);
    } else {
      setInternalChatHistory(updatedHistory);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

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
          userId: user?.uid || 'anonymous',
          previousMessages: chatHistory.slice(-5)
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
      const updatedHistory = chatHistory.map((msg) =>
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
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-background-card rounded-lg shadow-dark-card flex flex-col z-50 border border-border-light">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-t-lg">
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
              className="text-white hover:text-gray-200 focus:outline-none transition-all duration-300"
              title="Minimize"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200 focus:outline-none transition-all duration-300"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-background-hover">
        {/* Welcome message only when no messages */}
        {chatHistory.length === 0 && (
          <div className="text-center text-text-light py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-900/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-2 text-text">Merhaba! Ben YBS Buddy 👋</p>
            <p className="text-xs mb-4 text-text-light">Size nasıl yardımcı olabilirim?</p>
            
            {/* Örnek sorular */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-text-muted mb-2">Örnek sorular:</p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => {
                    setMessage("Müfredatta kaç adet ders var?");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs bg-primary-900/30 text-primary-300 px-3 py-2 rounded-lg hover:bg-primary-900/50 transition-all duration-300 text-left"
                >
                  📚 Müfredatta kaç adet ders var?
                </button>
                <button
                  onClick={() => {
                    setMessage("Benim notlarım neler?");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs bg-primary-900/30 text-primary-300 px-3 py-2 rounded-lg hover:bg-primary-900/50 transition-all duration-300 text-left"
                >
                  📝 Benim notlarım neler?
                </button>
                <button
                  onClick={() => {
                    setMessage("Geçmiş sınav sonuçlarım nasıl?");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs bg-primary-900/30 text-primary-300 px-3 py-2 rounded-lg hover:bg-primary-900/50 transition-all duration-300 text-left"
                >
                  📊 Geçmiş sınav sonuçlarım nasıl?
                </button>
                <button
                  onClick={() => {
                    setMessage("En yüksek puan aldığım sınav hangisi?");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="text-xs bg-primary-900/30 text-primary-300 px-3 py-2 rounded-lg hover:bg-primary-900/50 transition-all duration-300 text-left"
                >
                  🏆 En yüksek puan aldığım sınav hangisi?
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show all messages */}
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-background-card border border-border-light text-text'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.role === 'user' ? 'text-primary-100' : 'text-text-muted'
                }`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
              
              {/* Feedback buttons for assistant messages */}
              {msg.role === 'assistant' && !msg.feedback && (
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleFeedback(msg.id, 'helpful')}
                    className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded hover:bg-green-900/50 transition-all duration-300"
                  >
                    👍 Yardımcı
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, 'not_helpful')}
                    className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded hover:bg-red-900/50 transition-all duration-300"
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
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-red-900/30 text-red-400'
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
            <div className="bg-background-card border border-border-light p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-text-light">Yazıyor...</span>
              </div>
            </div>
          </div>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <div className="bg-primary-900/20 border border-primary-400/30 rounded-lg p-3">
            <p className="text-xs font-medium text-primary-300 mb-2">📚 Kaynaklar:</p>
            <div className="space-y-1">
              {sources.map((source, index) => (
                <p key={index} className="text-xs text-primary-400">• {source}</p>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border-light bg-background-card">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 border border-border-light rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-text-accent focus:border-transparent bg-background-hover text-text hover:border-border-accent transition-all duration-300"
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
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover-lift"
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
