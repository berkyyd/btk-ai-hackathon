'use client';

import React, { useState, useEffect } from 'react';
import ChatWindow from './ChatWindow';
import { ChatMessage } from '../types/api';

const ChatIcon: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleChatHistoryChange = (newHistory: ChatMessage[]) => {
    setChatHistory(newHistory);
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 z-50 transition-all duration-200"
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
      {isOpen && (
        <ChatWindow 
          onClose={toggleChat}
          chatHistory={chatHistory}
          onChatHistoryChange={handleChatHistoryChange}
        />
      )}
    </>
  );
};

export default ChatIcon;
