import React from 'react';
import { Task, Workspace } from '../types/Task';
import { useLanguage } from '../contexts/LanguageContext';
import { useUI } from '../contexts/UIContext';
import { focusForestService } from '../services/focusForestService';
import ForestVisualization from './ForestVisualization';
import { 
  ListBulletIcon, 
  CalendarDaysIcon, 
  ChartBarIcon,
  CogIcon,
  BuildingOfficeIcon,
  TreePineIcon
} from '@heroicons/react/24/outline';

type ViewType = 'list' | 'calendar' | 'analytics';

interface SidebarProps {
  showMobileSidebar: boolean;
  setShowMobileSidebar: (show: boolean) => void;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  workspaces: Workspace[];
  currentWorkspace: string;
  setCurrentWorkspace: (id: string) => void;
  tasks: Task[];
  filteredTasks: Task[];
  setShowWorkspaceManager: (show: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  showMobileSidebar,
  setShowMobileSidebar,
  currentView,
  setCurrentView,
  workspaces,
  currentWorkspace,
  setCurrentWorkspace,
  tasks,
  filteredTasks,
  setShowWorkspaceManager
}) => {
  const { t } = useLanguage();
  const forestStats = focusForestService.getStats();
  const todayStats = focusForestService.getTodayStats();
  const recentTrees = focusForestService.getTrees().slice(-6);

  const getViewIcon = (view: ViewType) => {
    switch (view) {
      case 'list': return <ListBulletIcon className="w-5 h-5" />;
      case 'calendar': return <CalendarDaysIcon className="w-5 h-5" />;
      case 'analytics': return <ChartBarIcon className="w-5 h-5" />;
    }
  };

  const getViewName = (view: ViewType) => {
    switch (view) {
      case 'list': return t('listView');
      case 'calendar': return t('calendarView');
      case 'analytics': return t('analyticsView');
    }
  };

  return (
    <aside className={`custom-scrollbar ${
      showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out overflow-y-auto`}>
      <div className="p-4 lg:p-6 space-y-6">
        {/* View Navigation */}
        <div className="space-y-2">
          {(['list', 'calendar', 'analytics'] as ViewType[]).map((view) => {
            const icon = getViewIcon(view);
            const name = getViewName(view);
            const isActive = currentView === view;
            return (
              <button
                key={view}
                onClick={() => {
                  setCurrentView(view);
                  setShowMobileSidebar(false);
                }}
                className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {icon}
                <span className="font-medium">{name}</span>
              </button>
            );
          })}
        </div>

        {/* Forest Section */}
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TreePineIcon className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-semibold text-green-400">My Forest</h3>
            </div>
            <div className="text-xs text-green-300 bg-green-500/20 px-2 py-1 rounded-full">
              Level {forestStats.forestLevel}
            </div>
          </div>
          
          {/* Today's Progress */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{todayStats.trees}</div>
              <div className="text-xs text-gray-400">Trees Today</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{todayStats.sessions}</div>
              <div className="text-xs text-gray-400">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">{Math.floor(todayStats.minutes / 60)}h</div>
              <div className="text-xs text-gray-400">Focused</div>
            </div>
          </div>

          {/* Recent Trees */}
          {recentTrees.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-2">Recent Trees:</div>
              <ForestVisualization trees={recentTrees} isCompact={true} />
            </div>
          )}

          {/* Forest Stats */}
          <div className="mt-3 pt-3 border-t border-green-500/20">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Total Trees:</span>
              <span className="text-green-400 font-medium">{forestStats.treesPlanted}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-400">Streak:</span>
              <span className="text-orange-400 font-medium">{forestStats.currentStreak} days</span>
            </div>
          </div>
        </div>
        {/* Workspace Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              {t('workspaces')}
            </h3>
            <button
              onClick={() => setShowWorkspaceManager(true)}
              className="p-1 hover:bg-gray-800 rounded transition-colors"
              title={t('settings')}
            >
              <CogIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-1">
            {workspaces.map((workspace) => {
              const isActive = currentWorkspace === workspace.id;
              const workspaceTasks = tasks.filter(t => t.workspaceId === workspace.id);
              const completedTasks = workspaceTasks.filter(t => t.status === 'completed').length;
              
              return (
                <button
                  key={workspace.id}
                  onClick={() => {
                    setCurrentWorkspace(workspace.id);
                    setShowMobileSidebar(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <BuildingOfficeIcon className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{workspace.name}</div>
                    <div className="text-xs opacity-75">
                      {completedTasks}/{workspaceTasks.length} {t('completed').toLowerCase()}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700/50">
            <div className="text-sm text-gray-400 mb-1">{t('totalTasks')}</div>
            <div className="text-2xl font-bold text-white">{filteredTasks.length}</div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700/50">
            <div className="text-sm text-gray-400 mb-1">{t('completed')}</div>
            <div className="text-2xl font-bold text-green-500">
              {filteredTasks.filter(t => t.status === 'completed').length}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
