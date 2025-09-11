import { useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface KeyboardShortcuts {
  onNewTask: () => void;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  onSearch: () => void;
  onFocusTimer: () => void;
  onNavigateToList: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToAnalytics: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  const { language, setLanguage } = useLanguage();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs or textareas
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement)?.contentEditable === 'true'
    ) {
      return;
    }

    const { ctrlKey, metaKey, shiftKey, altKey, key } = event;
    const modKey = ctrlKey || metaKey; // Support both Ctrl (Windows/Linux) and Cmd (Mac)

    // Ctrl/Cmd + N: New Task
    if (modKey && !shiftKey && !altKey && key === 'n') {
      event.preventDefault();
      shortcuts.onNewTask();
      return;
    }

    // Ctrl/Cmd + D: Toggle Theme
    if (modKey && !shiftKey && !altKey && key === 'd') {
      event.preventDefault();
      shortcuts.onToggleTheme();
      return;
    }

    // Ctrl/Cmd + L: Toggle Language
    if (modKey && !shiftKey && !altKey && key === 'l') {
      event.preventDefault();
      shortcuts.onToggleLanguage();
      return;
    }

    // Ctrl/Cmd + K: Search
    if (modKey && !shiftKey && !altKey && key === 'k') {
      event.preventDefault();
      shortcuts.onSearch();
      return;
    }

    // Ctrl/Cmd + T: Focus Timer
    if (modKey && !shiftKey && !altKey && key === 't') {
      event.preventDefault();
      shortcuts.onFocusTimer();
      return;
    }

    // Number keys for navigation (1, 2, 3)
    if (!modKey && !shiftKey && !altKey) {
      switch (key) {
        case '1':
          event.preventDefault();
          shortcuts.onNavigateToList();
          return;
        case '2':
          event.preventDefault();
          shortcuts.onNavigateToCalendar();
          return;
        case '3':
          event.preventDefault();
          shortcuts.onNavigateToAnalytics();
          return;
      }
    }

    // ESC: Close modals (handled by individual components)
    // Enter: Submit forms (handled by individual components)
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Return shortcut descriptions for help/tooltip
  const getShortcuts = useCallback(() => {
    return [
      { key: 'Ctrl/Cmd + N', description: 'Create new task' },
      { key: 'Ctrl/Cmd + D', description: 'Toggle dark/light theme' },
      { key: 'Ctrl/Cmd + L', description: 'Toggle language' },
      { key: 'Ctrl/Cmd + K', description: 'Focus search' },
      { key: 'Ctrl/Cmd + T', description: 'Open focus timer' },
      { key: '1', description: 'Navigate to List view' },
      { key: '2', description: 'Navigate to Calendar view' },
      { key: '3', description: 'Navigate to Analytics view' },
    ];
  }, []);

  return { getShortcuts };
};
