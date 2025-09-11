import { useState, useEffect } from 'react';
import { Task, Workspace } from '../types/Task';
import { taskService } from '../services/taskService';
import { workspaceService } from '../services/workspaceService';

export const useTaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<string>('default');

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
    return newTask;
  };

  const handleUpdateTask = (taskId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const updatedTask = taskService.updateTask(taskId, taskData);
    setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
    return updatedTask;
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
    return newWorkspace;
  };

  const handleUpdateWorkspace = (workspaceId: string, workspaceData: Partial<Workspace>) => {
    const updatedWorkspace = workspaceService.updateWorkspace(workspaceId, workspaceData);
    if (updatedWorkspace) {
      setWorkspaces(prev => prev.map(w => w.id === workspaceId ? updatedWorkspace : w));
    }
    return updatedWorkspace;
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

  const filteredTasks = tasks.filter(task => task.workspaceId === currentWorkspace);
  const currentWorkspaceData = workspaces.find(w => w.id === currentWorkspace);

  return {
    tasks,
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    filteredTasks,
    currentWorkspaceData,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleToggleTask,
    handleCreateWorkspace,
    handleUpdateWorkspace,
    handleDeleteWorkspace
  };
};
