import React from 'react';
import { Workspace } from '../types/Task';
import WorkspaceManager from './WorkspaceManager';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';

interface WorkspaceManagerModalProps {
  isOpen: boolean;
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  onWorkspaceChange: (workspace: Workspace) => void;
  onCreateWorkspace: (name: string, color: string, icon: string) => void;
  onUpdateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  onDeleteWorkspace: (id: string) => void;
  onClose: () => void;
}

const WorkspaceManagerModal: React.FC<WorkspaceManagerModalProps> = ({
  isOpen,
  workspaces,
  currentWorkspace,
  onWorkspaceChange,
  onCreateWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace,
  onClose
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{t('workspaceManager')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="p-6">
          <WorkspaceManager
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            onWorkspaceChange={onWorkspaceChange}
            onCreateWorkspace={onCreateWorkspace}
            onUpdateWorkspace={onUpdateWorkspace}
            onDeleteWorkspace={onDeleteWorkspace}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkspaceManagerModal;
