import React, { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Workspace } from '../types/Task';
import { useLanguage } from '../contexts/LanguageContext';
import {
  HomeIcon,
  BriefcaseIcon,
  FlagIcon,
  HeartIcon,
  BookOpenIcon,
  PaintBrushIcon,
  BeakerIcon,
  CakeIcon,
  SparklesIcon,
  LightBulbIcon,
  MusicalNoteIcon,
  PaperAirplaneIcon,
  UserIcon,
  PencilIcon,
  ComputerDesktopIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';

interface WorkspaceManagerProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  onWorkspaceChange: (workspace: Workspace) => void;
  onCreateWorkspace: (name: string, color: string, icon: string) => void;
  onUpdateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  onDeleteWorkspace: (id: string) => void;
}

const WORKSPACE_COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

const WORKSPACE_ICON_COMPONENTS = {
  'home': HomeIcon,
  'briefcase': BriefcaseIcon,
  'target': FlagIcon,
  'heart': HeartIcon,
  'book': BookOpenIcon,
  'paint': PaintBrushIcon,
  'beaker': BeakerIcon,
  'cake': CakeIcon,
  'sparkles': SparklesIcon,
  'lightbulb': LightBulbIcon,
  'music': MusicalNoteIcon,
  'plane': PaperAirplaneIcon,
  'user': UserIcon,
  'pencil': PencilIcon,
  'computer': ComputerDesktopIcon,
  'puzzle': PuzzlePieceIcon
};

const WORKSPACE_ICONS = [
  'home', 'briefcase', 'target', 'heart', 'book', 'paint', 'beaker', 'cake',
  'sparkles', 'lightbulb', 'music', 'plane', 'user', 'pencil', 'computer', 'puzzle'
];

function WorkspaceManager({ 
  workspaces, 
  currentWorkspace, 
  onWorkspaceChange, 
  onCreateWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace 
}: WorkspaceManagerProps) {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: WORKSPACE_COLORS[0],
    icon: WORKSPACE_ICONS[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingWorkspace) {
      onUpdateWorkspace(editingWorkspace.id, formData);
      setEditingWorkspace(null);
    } else {
      onCreateWorkspace(formData.name, formData.color, formData.icon);
    }

    setFormData({ name: '', color: WORKSPACE_COLORS[0], icon: WORKSPACE_ICONS[0] });
    setShowForm(false);
  };

  const handleEdit = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setFormData({
      name: workspace.name,
      color: workspace.color,
      icon: workspace.icon
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingWorkspace(null);
    setFormData({ name: '', color: WORKSPACE_COLORS[0], icon: WORKSPACE_ICONS[0] });
  };

  return (
    <div className="space-y-4">
      {/* Workspace List */}
      <div className="space-y-2">
        {workspaces.map(workspace => (
          <div
            key={workspace.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
              currentWorkspace.id === workspace.id
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-750'
            }`}
            onClick={() => onWorkspaceChange(workspace)}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: workspace.color }}
              >
                {React.createElement(WORKSPACE_ICON_COMPONENTS[workspace.icon as keyof typeof WORKSPACE_ICON_COMPONENTS] || HomeIcon, { className: "w-5 h-5" })}
              </div>
              <span className="font-medium">{workspace.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(workspace);
                }}
                className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              {workspace.id !== 'default' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteWorkspace(workspace.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Workspace Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>{t('addWorkspace')}</span>
        </button>
      )}

      {/* Workspace Form */}
      {showForm && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('workspaceName')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={t('workspaceExample')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('icon')}
              </label>
              <div className="grid grid-cols-8 gap-2">
                {WORKSPACE_ICONS.map(icon => {
                  const IconComponent = WORKSPACE_ICON_COMPONENTS[icon as keyof typeof WORKSPACE_ICON_COMPONENTS];
                  return (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`p-2 rounded-lg transition-colors ${
                        formData.icon === icon
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('color')}
              </label>
              <div className="grid grid-cols-8 gap-2">
                {WORKSPACE_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      formData.color === color
                        ? 'border-white scale-110'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {editingWorkspace ? t('updateWorkspace') : t('createWorkspace')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default WorkspaceManager;