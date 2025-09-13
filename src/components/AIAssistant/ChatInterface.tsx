import React, { useState, useRef, useEffect } from 'react';
import { useAIAssistant } from '../../contexts/AIAssistantContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  PaperAirplaneIcon,
  CameraIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

interface ChatInterfaceProps {
  tasks?: any[];
  currentView?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ tasks = [], currentView }) => {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    clearError,
    analyzeScreenshot
  } = useAIAssistant();
  
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState('');
  const [isScreenshotting, setIsScreenshotting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle send message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');

    await sendMessage(message, { tasks, currentView });
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle screenshot
  const handleScreenshot = async () => {
    if (isScreenshotting || isLoading) return;

    setIsScreenshotting(true);
    try {
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        // Create canvas to capture frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          
          // Convert to base64
          const screenshotData = canvas.toDataURL('image/png');
          
          // Stop the stream
          stream.getTracks().forEach(track => track.stop());
          
          // Send to AI for analysis
          analyzeScreenshot(screenshotData, currentView || 'màn hình');
        }
      };
    } catch (error) {
      console.error('Screenshot error:', error);
      // Handle permission denied or other errors gracefully
    } finally {
      setIsScreenshotting(false);
    }
  };

  // Quick action buttons
  const quickActions = [
    {
      label: 'Lịch học hôm nay',
      message: 'Tôi có lịch học gì hôm nay? Hãy phân tích các task và đề xuất thời gian học phù hợp.',
      icon: ClockIcon
    },
    {
      label: 'Ưu tiên công việc',
      message: 'Hãy giúp tôi sắp xếp ưu tiên các công việc dựa trên deadline và mức độ quan trọng.',
      icon: SparklesIcon
    },
    {
      label: 'Kế hoạch tuần',
      message: 'Dựa vào các task hiện tại, hãy đề xuất kế hoạch học tập cho tuần này.',
      icon: ClockIcon
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-900/50 border-b border-red-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
            <span className="text-red-200 text-sm">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          // Welcome Message
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-white font-bold text-xl mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Study Assistant
            </h3>
            <p className="text-gray-300 text-sm max-w-xs mx-auto leading-relaxed">
              Xin chào! Tôi là trợ lý AI của bạn. Hãy hỏi tôi về lịch học, quản lý thời gian, hoặc bất kỳ điều gì bạn cần hỗ trợ! ✨
            </p>
          </div>
        ) : (
          // Chat Messages
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {/* Typing Indicator */}
            {isLoading && <TypingIndicator />}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 p-4">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleScreenshot}
              disabled={isScreenshotting || isLoading}
              className={`
                p-2 rounded-lg transition-colors
                ${isScreenshotting 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }
              `}
              title="Chụp màn hình để phân tích"
            >
              <CameraIcon className="w-4 h-4" />
            </button>
          </div>
          
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
              title="Xóa lịch sử chat"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Input Field */}
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="
                w-full px-3 py-2 pr-10
                bg-gray-800 border border-gray-600 rounded-lg
                text-white placeholder-gray-400
                focus:outline-none focus:border-blue-500
                resize-none overflow-hidden
                min-h-[40px] max-h-[120px]
              "
              rows={1}
              disabled={isLoading}
              style={{
                height: 'auto',
                minHeight: '40px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`
              p-2 rounded-lg transition-colors
              ${inputValue.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
            title="Gửi tin nhắn"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Status */}
        {isScreenshotting && (
          <div className="mt-2 text-xs text-blue-400 flex items-center space-x-1">
            <CameraIcon className="w-3 h-3 animate-pulse" />
            <span>Đang chụp màn hình...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
