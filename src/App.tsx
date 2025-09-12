import React, { useState, useRef } from 'react';
import { Task, Workspace } from './types/Task';
import { useFirebaseTaskManager } from './hooks/useFirebaseTaskManager';
import { useLanguage } from './contexts/LanguageContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useNotifications } from './hooks/useNotifications';
import { useOfflineSync } from './hooks/useOfflineSync';
import { smartNotificationService } from './services/smartNotificationService';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import OfflineIndicator from './components/OfflineIndicator';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import TaskForm from './components/TaskForm';
import WorkspaceManagerModal from './components/WorkspaceManagerModal';
import FocusTimer from './components/FocusTimer';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import NotificationSystem from './components/NotificationSystem';
import LoginScreen from './components/LoginScreen';

type ViewType = 'list' | 'calendar' | 'analytics';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showWorkspaceManager, setShowWorkspaceManager] = useState(false);
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { language, setLanguage } = useLanguage();
  const { notifications, removeNotification, notifySuccess, notifyError, notifyWarning, notifyInfo } = useNotifications();
  const { isOnline, syncStatus, pendingChanges, handleSync } = useOfflineSync();

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const {
    tasks,
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    filteredTasks,
    currentWorkspaceData,
    // loading,
    // syncing,
    handleCreateTask: createTask,
    handleUpdateTask: updateTask,
    handleDeleteTask,
    handleToggleTask,
    handleCreateWorkspace,
    handleUpdateWorkspace,
    handleDeleteWorkspace
  } = useFirebaseTaskManager();

  // Keyboard shortcuts
  const { getShortcuts } = useKeyboardShortcuts({
    onNewTask: () => setShowTaskForm(true),
    onToggleTheme: () => {}, // Remove theme toggle
    onToggleLanguage: () => setLanguage(language === 'vi' ? 'en' : 'vi'),
    onSearch: () => {
      if (currentView === 'list' && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    },
    onFocusTimer: () => setShowFocusTimer(true),
    onNavigateToList: () => setCurrentView('list'),
    onNavigateToCalendar: () => setCurrentView('calendar'),
    onNavigateToAnalytics: () => setCurrentView('analytics'),
  });

  // Show keyboard help with '?' key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowKeyboardHelp(true);
      }
      if (e.key === 'Escape') {
        setShowKeyboardHelp(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Smart Notifications - after filteredTasks is available
  React.useEffect(() => {
    if (filteredTasks.length === 0) return;

    smartNotificationService.startMonitoring(filteredTasks, (type, title, message) => {
      switch (type) {
        case 'success':
          notifySuccess(title, message);
          break;
        case 'warning':
          notifyWarning(title, message);
          break;
        case 'error':
          notifyError(title, message);
          break;
        default:
          notifyInfo(title, message);
      }
    });

    // Request notification permission
    smartNotificationService.requestNotificationPermission();

    return () => {
      smartNotificationService.stopMonitoring();
    };
  }, [filteredTasks, notifySuccess, notifyWarning, notifyError, notifyInfo]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close any open dropdowns when clicking outside
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        // This will be handled by individual dropdown components
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show login screen if user is not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createTask(taskData);
      setShowTaskForm(false);
      notifySuccess('Task Created', 'Your task has been created successfully!');
    } catch {
      notifyError('Error', 'Failed to create task. Please try again.');
    }
  };

  const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      try {
        await updateTask(editingTask.id, taskData);
        setEditingTask(null);
        setShowTaskForm(false);
        notifySuccess('Task Updated', 'Your task has been updated successfully!');
      } catch {
        notifyError('Error', 'Failed to update task. Please try again.');
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTaskWithNotification = async (taskId: string) => {
    try {
      await handleDeleteTask(taskId);
      notifySuccess('Task Deleted', 'Task has been removed successfully!');
    } catch {
      notifyError('Error', 'Failed to delete task. Please try again.');
    }
  };

  const handleToggleTaskWithNotification = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    try {
      await handleToggleTask(taskId);
      if (task) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        if (newStatus === 'completed') {
          notifySuccess('Task Completed', `"${task.title}" has been marked as completed!`);
        }
      }
    } catch {
      notifyError('Error', 'Failed to update task. Please try again.');
    }
  };


  return (
    <div className={`${currentView === 'calendar' ? 'h-screen' : 'min-h-screen'} bg-gray-950 text-white flex flex-col ${currentView === 'calendar' ? 'overflow-hidden' : ''}`}>
      <Header
        setShowFocusTimer={setShowFocusTimer}
        setShowTaskForm={setShowTaskForm}
        onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
      />

      <div className={`flex flex-1 ${currentView === 'calendar' ? 'min-h-0' : ''}`}>
        <Sidebar
          showMobileSidebar={showMobileSidebar}
          setShowMobileSidebar={setShowMobileSidebar}
          currentView={currentView}
          setCurrentView={setCurrentView}
          workspaces={workspaces}
          currentWorkspace={currentWorkspace}
          setCurrentWorkspace={setCurrentWorkspace}
          tasks={tasks}
          filteredTasks={filteredTasks}
          setShowWorkspaceManager={setShowWorkspaceManager}
        />

        <MainContent
          currentView={currentView}
          currentWorkspaceData={currentWorkspaceData}
          filteredTasks={filteredTasks}
          onToggleTask={handleToggleTaskWithNotification}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTaskWithNotification}
          onUpdateTask={(taskId: string, updates: Partial<Task>) => {
            updateTask(taskId, updates as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);
          }}
          searchInputRef={searchInputRef}
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Modals */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          workspaces={workspaces}
          currentWorkspace={currentWorkspaceData}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}

      {showWorkspaceManager && currentWorkspaceData && (
        <WorkspaceManagerModal
          isOpen={showWorkspaceManager}
          workspaces={workspaces}
          currentWorkspace={currentWorkspaceData}
          onWorkspaceChange={(workspace: Workspace) => setCurrentWorkspace(workspace.id)}
          onCreateWorkspace={(name: string, color: string, icon: string) => {
            handleCreateWorkspace({ name, color, icon });
          }}
          onUpdateWorkspace={handleUpdateWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
          onClose={() => setShowWorkspaceManager(false)}
        />
      )}

      {showFocusTimer && (
        <FocusTimer
          isOpen={showFocusTimer}
          onClose={() => setShowFocusTimer(false)}
        />
      )}

      {showKeyboardHelp && (
        <KeyboardShortcutsHelp
          isOpen={showKeyboardHelp}
          onClose={() => setShowKeyboardHelp(false)}
          shortcuts={getShortcuts()}
        />
      )}

      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />

      <OfflineIndicator
        isOnline={isOnline}
        syncStatus={syncStatus}
        pendingChanges={pendingChanges}
        onSync={handleSync}
      />
    </div>
  );
}

export default App;