import { useState, useEffect, useCallback } from 'react';
import { Task, Workspace } from '../types/Task';
import { firebaseService } from '../services/firebaseService';
import { workspaceService } from '../services/workspaceService';
import { useAuth } from '../contexts/AuthContext';
import { taskService } from '../services/taskService';

export const useFirebaseTaskManager = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<string>('default');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Migrate local data to Firebase on first login
  const migrateLocalData = useCallback(async () => {
    if (!user) return;

    try {
      setSyncing(true);
      const localTasks = taskService.getTasks();
      
      if (localTasks.length > 0) {
        console.log('Migrating local tasks to Firebase...');
        await firebaseService.migrateLocalTasks(localTasks, user.uid);
        
        // Clear local storage after successful migration
        localStorage.removeItem('tasks');
        console.log('Migration completed successfully');
      }
    } catch (error) {
      console.error('Error migrating local data:', error);
    } finally {
      setSyncing(false);
    }
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Check and migrate local data first
    migrateLocalData();

    // Subscribe to real-time updates
    const unsubscribe = firebaseService.subscribeToTasks(user.uid, (updatedTasks) => {
      setTasks(updatedTasks);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, migrateLocalData]);

  // Load workspaces (still using local storage for now)
  useEffect(() => {
    const loadedWorkspaces = workspaceService.getWorkspaces();
    setWorkspaces(loadedWorkspaces);
  }, []);

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setSyncing(true);
      const taskId = await firebaseService.addTask({
        ...taskData,
        workspaceId: currentWorkspace
      }, user.uid);
      
      // Task will be updated via real-time subscription
      return taskId;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setSyncing(true);
      await firebaseService.updateTask(taskId, taskData, user.uid);
      // Task will be updated via real-time subscription
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setSyncing(true);
      await firebaseService.deleteTask(taskId);
      // Task will be removed via real-time subscription
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !user) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    try {
      setSyncing(true);
      await firebaseService.updateTask(taskId, { 
        ...task, 
        status: newStatus 
      }, user.uid);
      // Task will be updated via real-time subscription
    } catch (error) {
      console.error('Error toggling task:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  // Workspace operations (still local for now)
  const handleCreateWorkspace = (workspaceData: Omit<Workspace, 'id' | 'createdAt'>) => {
    const newWorkspace = workspaceService.createWorkspace(workspaceData);
    setWorkspaces(prev => [...prev, newWorkspace]);
    return newWorkspace;
  };

  const handleUpdateWorkspace = (workspaceId: string, workspaceData: Partial<Workspace>) => {
    const updatedWorkspace = workspaceService.updateWorkspace(workspaceId, workspaceData);
    if (updatedWorkspace) {
      setWorkspaces(prev => prev.map(w => w.id === workspaceId ? updatedWorkspace : w));
    }
    return updatedWorkspace;
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (workspaceId === 'default' || !user) return;
    
    try {
      setSyncing(true);
      
      // Delete all tasks in this workspace from Firebase
      const tasksToDelete = tasks.filter(task => task.workspaceId === workspaceId);
      await Promise.all(
        tasksToDelete.map(task => firebaseService.deleteTask(task.id))
      );
      
      // Delete workspace locally
      workspaceService.deleteWorkspace(workspaceId);
      setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
      
      if (currentWorkspace === workspaceId) {
        setCurrentWorkspace('default');
      }
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const filteredTasks = tasks.filter(task => task.workspaceId === currentWorkspace);
  const currentWorkspaceData = workspaces.find(w => w.id === currentWorkspace);

  return {
    tasks,
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    filteredTasks,
    currentWorkspaceData,
    loading,
    syncing,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleToggleTask,
    handleCreateWorkspace,
    handleUpdateWorkspace,
    handleDeleteWorkspace
  };
};
