import { useState, useEffect, useCallback } from 'react';
import { offlineStorage } from '../utils/offlineStorage';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [pendingChanges, setPendingChanges] = useState(0);

  useEffect(() => {
    const cleanup = offlineStorage.onOnlineStatusChange((online) => {
      setIsOnline(online);
      if (online) {
        // Auto-sync when coming back online
        handleSync();
      }
    });

    // Load pending changes count
    const changes = offlineStorage.getPendingChanges();
    setPendingChanges(changes.length);

    return cleanup;
  }, []);

  const handleSync = useCallback(async () => {
    if (!isOnline) return;

    setSyncStatus('syncing');
    
    try {
      // Simulate sync process
      const changes = offlineStorage.getPendingChanges();
      
      // In a real app, you would send changes to your backend here
      // await syncWithBackend(changes);
      
      // For demo, just clear pending changes after 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      offlineStorage.clearPendingChanges();
      setPendingChanges(0);
      setSyncStatus('success');
      
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  }, [isOnline]);

  const addPendingChange = useCallback((type: 'create' | 'update' | 'delete', entityType: 'task' | 'workspace', data: any) => {
    offlineStorage.addPendingChange({ type, entityType, data });
    setPendingChanges(prev => prev + 1);
  }, []);

  return {
    isOnline,
    syncStatus,
    pendingChanges,
    handleSync,
    addPendingChange
  };
};
