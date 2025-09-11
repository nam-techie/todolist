import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  WifiIcon, 
  CloudIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface OfflineIndicatorProps {
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  pendingChanges: number;
  onSync: () => void;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  syncStatus,
  pendingChanges,
  onSync
}) => {
  const { t } = useLanguage();

  const getStatusIcon = () => {
    if (!isOnline) {
      return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />;
    }

    switch (syncStatus) {
      case 'syncing':
        return <ArrowPathIcon className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />;
      default:
        return <CloudIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) {
      return `Offline${pendingChanges > 0 ? ` • ${pendingChanges} pending` : ''}`;
    }

    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Synced';
      case 'error':
        return 'Sync failed';
      default:
        return pendingChanges > 0 ? `${pendingChanges} pending` : 'Online';
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    
    switch (syncStatus) {
      case 'syncing':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'success':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'error':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return pendingChanges > 0 
          ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
          : 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={onSync}
        disabled={!isOnline || syncStatus === 'syncing'}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed ${getStatusColor()}`}
        title={isOnline ? 'Click to sync' : 'You are offline'}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </button>
    </div>
  );
};

export default OfflineIndicator;
