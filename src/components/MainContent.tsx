import React from 'react';
import { Task, Workspace } from '../types/Task';
import { useLanguage } from '../contexts/LanguageContext';
import ListView from './ListView';
import CalendarView from './CalendarView';
import AnalyticsView from './AnalyticsView';

type ViewType = 'list' | 'calendar' | 'analytics';

interface MainContentProps {
  currentView: ViewType;
  currentWorkspaceData?: Workspace;
  filteredTasks: Task[];
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

const MainContent: React.FC<MainContentProps> = ({
  currentView,
  currentWorkspaceData,
  filteredTasks,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
  searchInputRef
}) => {
  const { t } = useLanguage();
  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return (
          <ListView
            tasks={filteredTasks}
            onToggleTask={onToggleTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onUpdateTask={onUpdateTask}
            searchInputRef={searchInputRef}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            tasks={filteredTasks}
            onToggleTask={onToggleTask}
          />
        );
      case 'analytics':
        return <AnalyticsView tasks={filteredTasks} />;
      default:
        return null;
    }
  };

  return (
    <main className={`flex-1 p-6 ${currentView === 'calendar' ? 'flex flex-col min-h-0' : ''}`}>
      <div className={`mb-6 ${currentView === 'calendar' ? 'flex-shrink-0' : ''}`}>
        <h2 className="text-2xl font-bold mb-2 text-white">
          {currentWorkspaceData?.name || t('defaultWorkspace')}
        </h2>
        <p className="text-gray-400">
          {currentView === 'list' && t('listViewDesc')}
          {currentView === 'calendar' && t('calendarViewDesc')}
          {currentView === 'analytics' && t('analyticsViewDesc')}
        </p>
      </div>
      
      {currentView === 'calendar' ? (
        <div className="flex-1 min-h-0">
          {renderCurrentView()}
        </div>
      ) : (
        renderCurrentView()
      )}
    </main>
  );
};

export default MainContent;
