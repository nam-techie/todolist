import React, { useState, useEffect } from 'react';
import { Task, Priority, TaskStatus, Workspace } from '../types/Task';
import { useLanguage } from '../contexts/LanguageContext';
import CustomDatePicker from './CustomDatePicker';
import { 
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  FlagIcon,
  TagIcon,
  MapPinIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface TaskFormProps {
  task?: Task | null;
  workspaces: Workspace[];
  currentWorkspace?: Workspace;
  onSubmit: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  task, 
  workspaces, 
  currentWorkspace,
  onSubmit, 
  onClose 
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    status: 'pending' as TaskStatus,
    dueDate: '',
    tags: [] as string[],
    workspaceId: currentWorkspace?.id || 'default',
    estimatedMinutes: 30
  });

  const [tagInput, setTagInput] = useState('');
  
  // Predefined tags
  const predefinedTags = [
    'Work', 'Personal', 'Urgent', 'Meeting', 'Study', 'Exercise', 
    'Shopping', 'Health', 'Travel', 'Finance', 'Project', 'Call',
    'Email', 'Review', 'Planning', 'Research', 'Design', 'Development'
  ];

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
        tags: task.tags || [],
        workspaceId: task.workspaceId,
        estimatedMinutes: task.estimatedMinutes || 30
      });
    } else if (currentWorkspace) {
      setFormData(prev => ({
        ...prev,
        workspaceId: currentWorkspace.id
      }));
    }
  }, [task, currentWorkspace]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      tags: formData.tags.filter(tag => tag.trim() !== '')
    };

    onSubmit(taskData);
  };

  const addTag = (tag?: string) => {
    const tagToAdd = tag || tagInput.trim();
    if (tagToAdd && !formData.tags.includes(tagToAdd)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagToAdd]
      }));
      if (!tag) setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === document.activeElement) {
      e.preventDefault();
      addTag();
    }
  };

  const priorityColors: Record<Priority, string> = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {task ? t('editTask') : t('createNewTask')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('taskTitle')} *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={t('taskTitlePlaceholder')}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder={t('descriptionPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <FlagIcon className="w-4 h-4 mr-2" />
                {t('priority')}
              </label>
              <div className="relative">
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                  className="w-full px-4 py-3 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="low">{t('lowPriority')}</option>
                  <option value="medium">{t('mediumPriority')}</option>
                  <option value="high">{t('highPriority')}</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('status')}
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                  className="w-full px-4 py-3 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="pending">{t('pending')}</option>
                  <option value="in-progress">{t('inProgress')}</option>
                  <option value="completed">{t('completed')}</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Due Date */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {t('dueDate')}
              </label>
              <CustomDatePicker
                value={formData.dueDate}
                onChange={(value) => setFormData(prev => ({ ...prev, dueDate: value }))}
                placeholder={t('selectDueDate')}
              />
            </div>

            {/* Estimated Time */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <ClockIcon className="w-4 h-4 mr-2" />
                {t('estimatedTime')}
              </label>
              <input
                type="number"
                min="5"
                max="480"
                step="5"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedMinutes: parseInt(e.target.value) || 30 }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Workspace */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <MapPinIcon className="w-4 h-4 mr-2" />
              {t('workspace')}
            </label>
            <div className="relative">
              <select
                value={formData.workspaceId}
                onChange={(e) => setFormData(prev => ({ ...prev, workspaceId: e.target.value }))}
                className="w-full px-4 py-3 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.icon} {workspace.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <TagIcon className="w-4 h-4 mr-2" />
              {t('tags')}
            </label>
            
            {/* Custom Tag Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Add custom tag..."
              />
              <button
                type="button"
                onClick={() => addTag()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                Add
              </button>
            </div>

            {/* Predefined Tags */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">Quick tags:</p>
              <div className="flex flex-wrap gap-2">
                {predefinedTags
                  .filter(tag => !formData.tags.includes(tag))
                  .slice(0, 12)
                  .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-full text-sm transition-colors border border-gray-600 hover:border-gray-500"
                    >
                      + {tag}
                    </button>
                  ))}
              </div>
            </div>
            
            {/* Selected Tags */}
            {formData.tags.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Selected tags:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm border border-green-500/30"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400 transition-colors ml-1"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Priority Preview */}
          <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${priorityColors[formData.priority]}`}></div>
            <span className="text-gray-300 capitalize">{formData.priority} Priority Task</span>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
{t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
{task ? t('updateTask') : t('createTask')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;