import React, { useState, useEffect } from 'react';
import { CheckSquare, Calendar, BarChart3, Plus, Menu, Timer, Settings } from 'lucide-react';
import { Task, Priority, TaskStatus } from './types/Task';
import { Workspace } from './types/Task';
import { taskService } from './services/taskService';
import { workspaceService } from './services/workspaceService';
import ListView from './components/ListView';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import TaskForm from './components/TaskForm';
import WorkspaceManager from './components/WorkspaceManager';
import FocusTimer from './components/FocusTimer';

type ViewType = 'list' | 'calendar' | 'analytics';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<string>('default');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showWorkspaceManager, setShowWorkspaceManager] = useState(false);
  const [showFocusTimer, setShowFocusTimer] = useState(false);

  useEffect(() => {
    const loadedTasks = taskService.getTasks();
    const loadedWorkspaces = workspaceService.getWorkspaces();
    setTasks(loadedTasks);
    setWorkspaces(loadedWorkspaces);
  }, []);

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask = taskService.createTask({
      ...taskData,
      workspaceId: currentWorkspace
    });
    setTasks(prev => [...prev, newTask]);
    setShowTaskForm(false);
  };

  const handleUpdateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      const updatedTask = taskService.updateTask(editingTask.id, taskData);
      setTasks(prev => prev.map(task => task.id === editingTask.id ? updatedTask : task));
      setEditingTask(null);
      setShowTaskForm(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    taskService.deleteTask(taskId);
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const updatedTask = taskService.updateTask(taskId, { ...task, status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    }
  };

  const handleCreateWorkspace = (workspaceData: Omit<Workspace, 'id' | 'createdAt'>) => {
    const newWorkspace = workspaceService.createWorkspace(workspaceData);
    setWorkspaces(prev => [...prev, newWorkspace]);
  };

  const handleUpdateWorkspace = (workspaceId: string, workspaceData: Partial<Workspace>) => {
    const updatedWorkspace = workspaceService.updateWorkspace(workspaceId, workspaceData);
    if (updatedWorkspace) {
      setWorkspaces(prev => prev.map(w => w.id === workspaceId ? updatedWorkspace : w));
    }
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    if (workspaceId === 'default') return;
    
    workspaceService.deleteWorkspace(workspaceId);
    setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
    
    // Delete all tasks in this workspace
    const tasksToDelete = tasks.filter(task => task.workspaceId === workspaceId);
    tasksToDelete.forEach(task => taskService.deleteTask(task.id));
    setTasks(prev => prev.filter(task => task.workspaceId !== workspaceId));
    
    if (currentWorkspace === workspaceId) {
      setCurrentWorkspace('default');
    }
  };

  const currentWorkspaceData = workspaces.find(w => w.id === currentWorkspace);
  const filteredTasks = tasks.filter(task => task.workspaceId === currentWorkspace);

  const getViewIcon = (view: ViewType) => {
    switch (view) {
      case 'list': return CheckSquare;
      case 'calendar': return Calendar;
      case 'analytics': return BarChart3;
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return (
          <ListView
            tasks={filteredTasks}
            onToggleTask={handleToggleTask}
            onEditTask={(task) => {
              setEditingTask(task);
              setShowTaskForm(true);
            }}
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            tasks={filteredTasks}
            onToggleTask={handleToggleTask}
            onEditTask={(task) => {
              setEditingTask(task);
              setShowTaskForm(true);
            }}
          />
        );
      case 'analytics':
        return <AnalyticsView tasks={filteredTasks} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">TaskFlow</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFocusTimer(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Timer className="w-4 h-4" />
              <span className="hidden sm:inline">Focus Timer</span>
            </button>
            <button
              onClick={() => setShowTaskForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out`}>
          <div className="p-6">
            {/* View Navigation */}
            <div className="space-y-2 mb-8">
              {(['list', 'calendar', 'analytics'] as ViewType[]).map((view) => {
                const Icon = getViewIcon(view);
                const isActive = currentView === view;
                return (
                  <button
                    key={view}
                    onClick={() => {
                      setCurrentView(view);
                      setShowSidebar(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="capitalize">{view} View</span>
                  </button>
                );
              })}
            </div>

            {/* Workspace Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Workspaces
                </h3>
                <button
                  onClick={() => setShowWorkspaceManager(true)}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
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
                        setShowSidebar(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? `bg-${workspace.color}-600 text-white`
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                      style={isActive ? { backgroundColor: `var(--color-${workspace.color}-600)` } : {}}
                    >
                      <span className="text-lg">{workspace.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{workspace.name}</div>
                        <div className="text-xs opacity-75">
                          {completedTasks}/{workspaceTasks.length} completed
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Total Tasks</div>
                <div className="text-2xl font-bold">{filteredTasks.length}</div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Completed</div>
                <div className="text-2xl font-bold text-green-500">
                  {filteredTasks.filter(t => t.status === 'completed').length}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {currentWorkspaceData?.name || 'Default Workspace'}
            </h2>
            <p className="text-gray-400">
              {currentView === 'list' && 'Manage your tasks efficiently'}
              {currentView === 'calendar' && 'View your tasks in calendar format'}
              {currentView === 'analytics' && 'Track your productivity and progress'}
            </p>
          </div>
          
          {renderCurrentView()}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
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

      {showWorkspaceManager && (
        <WorkspaceManager
          workspaces={workspaces}
          onCreateWorkspace={handleCreateWorkspace}
          onUpdateWorkspace={handleUpdateWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
          onClose={() => setShowWorkspaceManager(false)}
        />
      )}

      {showFocusTimer && (
        <FocusTimer
          onClose={() => setShowFocusTimer(false)}
        />
      )}
    </div>
  );
}

export default App;