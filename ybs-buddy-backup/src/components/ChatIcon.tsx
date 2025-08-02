'use client';

import React, { useState, useEffect, useRef } from 'react';
import ChatWindow from './ChatWindow';
import { useAuth } from '../contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { ChatMessage } from '../types/api';

const ChatIcon: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const chatRef = useRef<HTMLDivElement>(null);

  // Kullanıcı giriş yaptığında chat'i temizle
  useEffect(() => {
    if (user?.uid) {
      setChatHistory([]);
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
    // localStorage'a kaydetme - her girişte temiz başla
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
          className="fixed bottom-6 right-6 bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-3 rounded-full shadow-dark-glow hover:shadow-dark-card hover:scale-105 focus:outline-none focus:ring-4 focus:ring-text-accent focus:ring-opacity-50 z-50 transition-all duration-300"
          aria-label="Chatbot'u geri yükle"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {/* Main Chat Button */}
      {!isMinimized && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 rounded-full shadow-dark-glow hover:shadow-dark-card hover:scale-105 focus:outline-none focus:ring-4 focus:ring-text-accent focus:ring-opacity-50 z-50 transition-all duration-300"
          aria-label="Chatbot'u aç"
        >
          {isOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
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
