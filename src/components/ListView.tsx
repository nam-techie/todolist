import React, { useState, useMemo } from 'react';
import { Task, Priority, TaskStatus } from '../types/Task';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import TimeTracker from './TimeTracker';

interface ListViewProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

type SortField = 'title' | 'priority' | 'dueAt' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const priorityColors = {
  low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  high: 'text-red-400 bg-red-500/10 border-red-500/20'
};

const statusColors = {
  pending: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  'in-progress': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  completed: 'text-green-400 bg-green-500/10 border-green-500/20'
};

function ListView({ tasks, onToggleTask, onEditTask, onDeleteTask, onUpdateTask, searchInputRef }: ListViewProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'dueAt':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [tasks, searchQuery, selectedStatus, selectedPriority, sortField, sortOrder]);

  const isOverdue = (task: Task) => {
    return task.dueDate && task.status !== 'completed' && new Date(task.dueDate) < new Date();
  };

  const getTimeUntilDue = (dueDate: string) => {
    const now = new Date();
    const dueAt = new Date(dueDate);
    const diffMs = dueAt.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) return 'Overdue';
    if (diffHours < 24) return `Due in ${diffHours}h`;
    return `Due in ${diffDays} days`;
  };

  const getDueDateColor = (dueDate: string, status: TaskStatus) => {
    if (status === 'completed') return 'text-gray-400';
    
    const now = new Date();
    const dueAt = new Date(dueDate);
    const diffMs = dueAt.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    if (diffMs < 0) return 'text-red-400 bg-red-500/10 border border-red-500/20'; // Overdue
    if (diffDays <= 1) return 'text-red-400 bg-red-500/10 border border-red-500/20'; // 1 day
    if (diffDays <= 3) return 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20'; // 3 days
    if (diffDays <= 7) return 'text-green-400 bg-green-500/10 border border-green-500/20'; // 7 days
    return 'text-blue-400 bg-blue-500/10 border border-blue-500/20'; // More than 7 days
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('searchTasks')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors ${
              showFilters 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-gray-800 text-gray-400 hover:text-gray-300 border border-gray-700'
            }`}
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            <span>{t('filters')}</span>
          </button>
        </div>

        {showFilters && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('status')}</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as TaskStatus | 'all')}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">{t('all')}</option>
                  <option value="pending">{t('pending')}</option>
                  <option value="in-progress">{t('inProgress')}</option>
                  <option value="completed">{t('completed')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('priority')}</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as Priority | 'all')}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">{t('all')}</option>
                  <option value="low">{t('lowPriority')}</option>
                  <option value="medium">{t('mediumPriority')}</option>
                  <option value="high">{t('highPriority')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('sortBy')}</label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="createdAt">{t('createdDate')}</option>
                  <option value="dueAt">{t('dueDate')}</option>
                  <option value="priority">{t('priority')}</option>
                  <option value="title">{t('title')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('order')}</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="desc">{t('descending')}</option>
                  <option value="asc">{t('ascending')}</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredAndSortedTasks.length === 0 ? (
            <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">{t('noTasksFound')}</div>
            <div className="text-gray-500">{t('adjustFilters')}</div>
          </div>
        ) : (
          filteredAndSortedTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-gray-800 rounded-lg p-4 border transition-all duration-200 hover:bg-gray-750 ${
                isOverdue(task) 
                  ? 'border-red-500/20 bg-red-500/5' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => onToggleTask(task.id)}
                  className="mt-1 flex-shrink-0"
                >
                  {task.status === 'completed' ? (
                    <CheckCircleIconSolid className="w-6 h-6 text-green-400" />
                  ) : (
                    <CheckCircleIcon className="w-6 h-6 text-gray-400 hover:text-gray-300 transition-colors" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${
                        task.status === 'completed' 
                          ? 'text-gray-400 line-through' 
                          : 'text-gray-100'
                      }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title={t('edit')}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                        title={t('timeTracking')}
                      >
                        <PlayIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                        title={t('delete')}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[task.status]}`}>
                        {task.status}
                      </span>
                      {task.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                        <TagIcon className="w-3 h-3 text-gray-400" />
                          {task.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="text-xs text-gray-600 dark:text-gray-400">
                              {tag}
                            </span>
                          ))}
                          {task.tags.length > 2 && (
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              +{task.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {task.dueDate && (
                      <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-lg font-medium ${getDueDateColor(task.dueDate, task.status)}`}>
                        <ClockIcon className="w-3 h-3" />
                        <span className="font-semibold">{getTimeUntilDue(task.dueDate)}</span>
                        <span className="text-xs opacity-75">
                          ({new Date(task.dueDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Time Tracking */}
              {expandedTask === task.id && (
                <div className="mt-4 border-t border-gray-700 pt-4">
                  <TimeTracker
                    task={task}
                    onUpdateTask={onUpdateTask}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ListView;