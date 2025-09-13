import React, { useState, useEffect } from 'react';
import { useAIAssistant } from '../../contexts/AIAssistantContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  MinusIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import ChatInterface from './ChatInterface';

const FloatingChatBot: React.FC = () => {
  const { 
    isOpen, 
    isMinimized, 
    isEnabled, 
    hasApiKey, 
    toggleChat, 
    closeChat, 
    toggleMinimize,
    messages,
    isLoading
  } = useAIAssistant();
  
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Show tooltip on first visit
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('ai_assistant_tooltip_seen');
    if (!hasSeenTooltip && isEnabled && hasApiKey) {
      setShowTooltip(true);
      const timer = setTimeout(() => {
        setShowTooltip(false);
        localStorage.setItem('ai_assistant_tooltip_seen', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isEnabled, hasApiKey]);

  // Animation on click
  const handleToggleChat = () => {
    setIsAnimating(true);
    toggleChat();
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Don't render if AI is disabled or no API key
  if (!isEnabled || !hasApiKey) {
    return null;
  }

  const hasUnreadMessages = messages.length > 0 && !isOpen;

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className={`
          fixed bottom-24 right-6 z-50 
          w-96 backdrop-blur-xl
          bg-gray-900/95 border border-gray-600/50 rounded-2xl shadow-2xl
          transition-all duration-300 ease-in-out
          ${isMinimized ? 'h-12' : 'h-[500px]'}
          max-w-[calc(100vw-3rem)]
          sm:w-96
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-600/50 bg-gray-800/80 rounded-t-2xl backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <SparklesIcon className="w-6 h-6 text-blue-400" />
                {isLoading && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">AI Study Assistant</h3>
                <p className="text-gray-400 text-xs">Trợ lý học tập thông minh</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleMinimize}
                className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                title={isMinimized ? 'Mở rộng' : 'Thu gọn'}
              >
                <MinusIcon className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={closeChat}
                className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                title="Đóng chat"
              >
                <XMarkIcon className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="h-[calc(100%-4rem)]">
              <ChatInterface />
            </div>
          )}
        </div>
      )}

      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Tooltip */}
        {showTooltip && !isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
            <div className="text-white text-sm font-medium mb-1">
               AI Study Assistant
            </div>
            <div className="text-gray-300 text-xs">
              Xin chào! Tôi là trợ lý AI của bạn. Hãy click để bắt đầu chat nhé!
            </div>
            {/* Tooltip arrow */}
            <div className="absolute top-full right-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-700"></div>
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={handleToggleChat}
          className={`
            relative w-16 h-16 rounded-full shadow-2xl
            bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
            hover:from-blue-600 hover:via-purple-600 hover:to-pink-600
            transition-all duration-300 ease-in-out
            transform hover:scale-110 active:scale-95
            ${isAnimating ? 'animate-bounce' : ''}
            ${isOpen ? 'rotate-180' : 'rotate-0'}
            border-3 border-white/30
          `}
          title={isOpen ? 'Đóng AI Assistant' : 'Mở AI Assistant'}
        >
          {/* Background Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60 blur-xl animate-pulse"></div>
          
          {/* Icon */}
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            {isOpen ? (
              <XMarkIcon className="w-7 h-7 text-white drop-shadow-lg" />
            ) : (
              <ChatBubbleLeftRightIcon className="w-7 h-7 text-white drop-shadow-lg" />
            )}
          </div>

          {/* Notification Badge */}
          {hasUnreadMessages && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
          )}
        </button>

        {/* Status Indicator */}
        <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={closeChat}
        />
      )}
    </>
  );
};

export default FloatingChatBot;
