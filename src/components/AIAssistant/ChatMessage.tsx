import React from 'react';
import { ChatMessage as ChatMessageType } from '../../services/openaiService';
import { 
  UserIcon, 
  SparklesIcon,
  ClipboardDocumentIcon 
} from '@heroicons/react/24/outline';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  // Copy message content to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-400">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`
        flex items-start space-x-2 max-w-[85%]
        ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}
      `}>
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser 
            ? 'bg-blue-600' 
            : 'bg-gradient-to-r from-purple-500 to-blue-500'
          }
        `}>
          {isUser ? (
            <UserIcon className="w-4 h-4 text-white" />
          ) : (
            <SparklesIcon className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={`
          relative px-4 py-3 rounded-2xl max-w-sm shadow-lg
          ${isUser 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md' 
            : 'bg-gray-800 text-gray-100 rounded-bl-md border border-gray-600'
          }
        `}>
          {/* Message Text */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content.split('\n').map((line, index, array) => (
              <span key={index}>
                {line}
                {index < array.length - 1 && <br />}
              </span>
            ))}
          </div>

          {/* Timestamp */}
          <div className={`
            text-xs mt-1 opacity-70
            ${isUser ? 'text-blue-100' : 'text-gray-400'}
          `}>
            {formatTime(message.timestamp)}
          </div>

          {/* Copy Button (appears on hover for assistant messages) */}
          {!isUser && (
            <button
              onClick={copyToClipboard}
              className="
                absolute -right-8 top-2 p-1 
                opacity-0 group-hover:opacity-100 
                hover:bg-gray-700 rounded 
                transition-opacity duration-200
              "
              title="Sao chép tin nhắn"
            >
              <ClipboardDocumentIcon className="w-4 h-4 text-gray-400 hover:text-gray-200" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
