import { Task, Workspace } from '../types/Task';

interface OfflineData {
  tasks: Task[];
  workspaces: Workspace[];
  lastSync: string;
  pendingChanges: PendingChange[];
}

interface PendingChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  entityType: 'task' | 'workspace';
  data: any;
  timestamp: string;
}

export class OfflineStorageService {
  private static readonly STORAGE_KEY = 'taskflow_offline_data';
  private static readonly SYNC_QUEUE_KEY = 'taskflow_sync_queue';

  static saveOfflineData(tasks: Task[], workspaces: Workspace[]): void {
    const data: OfflineData = {
      tasks,
      workspaces,
      lastSync: new Date().toISOString(),
      pendingChanges: this.getPendingChanges()
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  static loadOfflineData(): OfflineData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load offline data:', error);
      return null;
    }
  }

  static addPendingChange(change: Omit<PendingChange, 'id' | 'timestamp'>): void {
    const pendingChange: PendingChange = {
      ...change,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };

    const changes = this.getPendingChanges();
    changes.push(pendingChange);
    
    try {
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(changes));
    } catch (error) {
      console.error('Failed to save pending change:', error);
    }
  }

  static getPendingChanges(): PendingChange[] {
    try {
      const changes = localStorage.getItem(this.SYNC_QUEUE_KEY);
      return changes ? JSON.parse(changes) : [];
    } catch (error) {
      console.error('Failed to load pending changes:', error);
      return [];
    }
  }

  static clearPendingChanges(): void {
    try {
      localStorage.removeItem(this.SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Failed to clear pending changes:', error);
    }
  }

  static isOnline(): boolean {
    return navigator.onLine;
  }

  static onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  static getStorageUsage(): { used: number; available: number; percentage: number } {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      // Modern browsers
      return navigator.storage.estimate().then(estimate => ({
        used: estimate.usage || 0,
        available: estimate.quota || 0,
        percentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0
      }));
    } else {
      // Fallback for older browsers
      const used = new Blob([localStorage.getItem(this.STORAGE_KEY) || '']).size;
      const available = 5 * 1024 * 1024; // 5MB estimate
      return Promise.resolve({
        used,
        available,
        percentage: (used / available) * 100
      });
    }
  }

  static exportForSync(): string {
    const data = this.loadOfflineData();
    if (!data) return '{}';
    
    return JSON.stringify({
      tasks: data.tasks,
      workspaces: data.workspaces,
      pendingChanges: data.pendingChanges,
      lastSync: data.lastSync
    });
  }

  static importFromSync(syncData: string): boolean {
    try {
      const data = JSON.parse(syncData);
      
      // Validate structure
      if (!data.tasks || !Array.isArray(data.tasks)) return false;
      if (!data.workspaces || !Array.isArray(data.workspaces)) return false;

      this.saveOfflineData(data.tasks, data.workspaces);
      
      if (data.pendingChanges && Array.isArray(data.pendingChanges)) {
        localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(data.pendingChanges));
      }

      return true;
    } catch (error) {
      console.error('Failed to import sync data:', error);
      return false;
    }
  }
}

export const offlineStorage = OfflineStorageService;
