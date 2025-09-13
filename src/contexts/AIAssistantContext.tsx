import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { openaiService, ChatMessage } from '../services/openaiService';
import { Task } from '../types/Task';
import { useLanguage } from './LanguageContext';

export interface AIAssistantState {
  // UI State
  isOpen: boolean;
  isMinimized: boolean;
  
  // Chat State
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  
  // Configuration
  isEnabled: boolean;
  hasApiKey: boolean;
}

export interface AIAssistantActions {
  // UI Actions
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  toggleMinimize: () => void;
  
  // Chat Actions
  sendMessage: (content: string, context?: { tasks?: Task[]; currentView?: string }) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  
  // Utility Actions
  generateStudySchedule: (tasks: Task[]) => Promise<void>;
  analyzeScreenshot: (screenshotData: string, context: string) => Promise<void>;
}

interface AIAssistantContextType extends AIAssistantState, AIAssistantActions {}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

// Local storage keys
const STORAGE_KEYS = {
  CHAT_HISTORY: 'ai_chat_history',
  UI_STATE: 'ai_ui_state',
  SETTINGS: 'ai_settings'
};

export const AIAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  
  // Initialize state
  const [state, setState] = useState<AIAssistantState>(() => {
    // Load saved UI state
    const savedUIState = localStorage.getItem(STORAGE_KEYS.UI_STATE);
    const uiState = savedUIState ? JSON.parse(savedUIState) : {};
    
    // Load chat history
    const savedMessages = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    const messages = savedMessages ? JSON.parse(savedMessages) : [];
    
    // Get service configuration
    const config = openaiService.getConfig();
    
    return {
      isOpen: uiState.isOpen || false,
      isMinimized: uiState.isMinimized || false,
      messages,
      isLoading: false,
      error: null,
      isEnabled: config.enableAI,
      hasApiKey: config.hasApiKey
    };
  });

  // Save UI state to localStorage
  const saveUIState = useCallback(() => {
    const uiState = {
      isOpen: state.isOpen,
      isMinimized: state.isMinimized
    };
    localStorage.setItem(STORAGE_KEYS.UI_STATE, JSON.stringify(uiState));
  }, [state.isOpen, state.isMinimized]);

  // Save chat history to localStorage
  const saveChatHistory = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(state.messages));
  }, [state.messages]);

  // Auto-save when state changes
  useEffect(() => {
    saveUIState();
  }, [saveUIState]);

  useEffect(() => {
    saveChatHistory();
  }, [saveChatHistory]);

  // UI Actions
  const toggleChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const openChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true, isMinimized: false }));
  }, []);

  const closeChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const toggleMinimize = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  }, []);

  // Chat Actions
  const sendMessage = useCallback(async (
    content: string, 
    context?: { tasks?: Task[]; currentView?: string }
  ) => {
    if (!content.trim()) return;
    
    if (!state.isEnabled || !state.hasApiKey) {
      setState(prev => ({
        ...prev,
        error: 'AI Assistant chưa được cấu hình. Vui lòng thêm OpenAI API key.'
      }));
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }));

    try {
      // Send to OpenAI
      const response = await openaiService.sendMessage(
        [...state.messages, userMessage],
        context
      );

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false
      }));

    } catch (error) {
      console.error('AI Assistant Error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [state.messages, state.isEnabled, state.hasApiKey]);

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }));
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Utility Actions
  const generateStudySchedule = useCallback(async (tasks: Task[]) => {
    if (!state.isEnabled || !state.hasApiKey) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const schedule = await openaiService.generateStudySchedule(tasks);
      
      const assistantMessage: ChatMessage = {
        id: `schedule_${Date.now()}`,
        role: 'assistant',
        content: schedule,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false
      }));

    } catch (error) {
      console.error('Study Schedule Generation Error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Không thể tạo lịch học. Vui lòng thử lại.'
      }));
    }
  }, [state.isEnabled, state.hasApiKey]);

  const analyzeScreenshot = useCallback(async (screenshotData: string, context: string) => {
    if (!state.isEnabled || !state.hasApiKey) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const analysis = await openaiService.analyzeScreenshot(screenshotData, context);
      
      const assistantMessage: ChatMessage = {
        id: `screenshot_${Date.now()}`,
        role: 'assistant',
        content: analysis,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false
      }));

    } catch (error) {
      console.error('Screenshot Analysis Error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Không thể phân tích ảnh chụp màn hình. Vui lòng thử lại.'
      }));
    }
  }, [state.isEnabled, state.hasApiKey]);

  // Context value
  const contextValue: AIAssistantContextType = {
    // State
    ...state,
    
    // UI Actions
    toggleChat,
    openChat,
    closeChat,
    toggleMinimize,
    
    // Chat Actions
    sendMessage,
    clearMessages,
    clearError,
    
    // Utility Actions
    generateStudySchedule,
    analyzeScreenshot
  };

  return (
    <AIAssistantContext.Provider value={contextValue}>
      {children}
    </AIAssistantContext.Provider>
  );
};

// Hook to use AI Assistant context
export const useAIAssistant = (): AIAssistantContextType => {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
};
