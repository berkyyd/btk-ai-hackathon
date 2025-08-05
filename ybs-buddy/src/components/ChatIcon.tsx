'use client';

import React, { useState, useEffect, useRef } from 'react';
import ChatWindow from './ChatWindow';
import { useAuth } from '../contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { ChatMessage } from '../types/api';

const ModernAIIcon = ({ size = 28 }) => (
  <span className="block animate-[spin_8s_linear_infinite]">
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ai-gradient" cx="50%" cy="50%" r="80%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="60%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#ai-gradient)" />
      {/* Circuit/brain lines */}
      <g stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.85">
        <path d="M20 7v6" />
        <path d="M20 27v6" />
        <path d="M7 20h6" />
        <path d="M27 20h6" />
        <path d="M13 13l4.2 4.2" />
        <path d="M27 27l-4.2-4.2" />
        <path d="M13 27l4.2-4.2" />
        <path d="M27 13l-4.2 4.2" />
      </g>
      {/* Central AI dot */}
      <circle cx="20" cy="20" r="4" fill="#fff" fillOpacity="0.9" />
      {/* Small circuit nodes */}
      <circle cx="20" cy="7" r="1.2" fill="#fff" />
      <circle cx="20" cy="33" r="1.2" fill="#fff" />
      <circle cx="7" cy="20" r="1.2" fill="#fff" />
      <circle cx="33" cy="20" r="1.2" fill="#fff" />
      <circle cx="13" cy="13" r="1" fill="#fff" />
      <circle cx="27" cy="27" r="1" fill="#fff" />
      <circle cx="13" cy="27" r="1" fill="#fff" />
      <circle cx="27" cy="13" r="1" fill="#fff" />
    </svg>
  </span>
);

const ChatIcon: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const chatRef = useRef<HTMLDivElement>(null);

  // Chat history'yi localStorage'dan yükle
  useEffect(() => {
    if (user?.uid) {
      const savedHistory = localStorage.getItem(`chatHistory_${user.uid}`);
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          // Timestamp'leri Date objesine çevir
          const historyWithDates = parsedHistory.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setChatHistory(historyWithDates);
        } catch (error) {
          console.error('Chat history yüklenirken hata:', error);
          setChatHistory([]);
        }
      } else {
        setChatHistory([]);
      }
    } else {
      setChatHistory([]);
    }
  }, [user?.uid]);

  // Kullanıcı değiştiğinde chat'i kapat
  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      setIsMinimized(false);
      setChatHistory([]);
    }
  }, [user]);

  // Sayfa değiştiğinde chat'i minimize et
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setIsMinimized(true);
    }
  }, [pathname, isOpen, isMinimized]);

  // Dışarı tıklama ile minimize et
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        if (isOpen && !isMinimized) {
          setIsMinimized(true);
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMinimized]);

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setChatHistory([]);
  };

  const restoreChat = () => {
    setIsMinimized(false);
    setIsOpen(true);
  };

  const handleChatHistoryChange = (newHistory: ChatMessage[]) => {
    setChatHistory(newHistory);
    
    // Chat history'yi localStorage'a kaydet
    if (user?.uid) {
      try {
        localStorage.setItem(`chatHistory_${user.uid}`, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Chat history kaydedilirken hata:', error);
      }
    }
  };

  // Giriş yapmamış kullanıcılar için chat gösterilmez
  if (loading || !user) {
    return null;
  }

  return (
    <>
      {/* Minimized Chat Tab */}
      {isMinimized && (
        <button
          onClick={restoreChat}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 z-50 transition-all duration-300 transform hover:rotate-12"
          aria-label="Chatbot'u geri yükle"
        >
          <ModernAIIcon size={24} />
        </button>
      )}

      {/* Main Chat Button */}
      {!isMinimized && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 z-50 transition-all duration-300 transform hover:rotate-12"
          aria-label="Chatbot'u aç"
        >
          {isOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <ModernAIIcon size={32} />
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div ref={chatRef}>
          <ChatWindow 
            onClose={closeChat} 
            onMinimize={minimizeChat}
            chatHistory={chatHistory}
            onChatHistoryChange={handleChatHistoryChange}
          />
        </div>
      )}
    </>
  );
};

export default ChatIcon;
