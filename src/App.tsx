import React, { useState, useRef } from 'react';
import { Task, Workspace } from './types/Task';
import { useTaskManager } from './hooks/useTaskManager';
import { useLanguage } from './contexts/LanguageContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useNotifications } from './hooks/useNotifications';
import { useOfflineSync } from './hooks/useOfflineSync';
import { smartNotificationService } from './services/smartNotificationService';
import Header from './components/Header';
import OfflineIndicator from './components/OfflineIndicator';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import TaskForm from './components/TaskForm';
import WorkspaceManagerModal from './components/WorkspaceManagerModal';
import FocusTimer from './components/FocusTimer';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import NotificationSystem from './components/NotificationSystem';

type ViewType = 'list' | 'calendar' | 'analytics';

function App() {
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


  const {
    tasks,
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    filteredTasks,
    currentWorkspaceData,
    handleCreateTask: createTask,
    handleUpdateTask: updateTask,
    handleDeleteTask,
    handleToggleTask,
    handleCreateWorkspace,
    handleUpdateWorkspace,
    handleDeleteWorkspace
  } = useTaskManager();

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    createTask(taskData);
    setShowTaskForm(false);
    notifySuccess('Task Created', 'Your task has been created successfully!');
  };

  const handleUpdateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(null);
      setShowTaskForm(false);
      notifySuccess('Task Updated', 'Your task has been updated successfully!');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTaskWithNotification = (taskId: string) => {
    handleDeleteTask(taskId);
    notifySuccess('Task Deleted', 'Task has been removed successfully!');
  };

  const handleToggleTaskWithNotification = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    handleToggleTask(taskId);
    if (task) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      if (newStatus === 'completed') {
        notifySuccess('Task Completed', `"${task.title}" has been marked as completed!`);
      }
    }
  };

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