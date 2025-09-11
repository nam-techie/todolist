import { Task, Priority, TaskStatus } from '../types/Task';

class TaskService {
  private storageKey = 'taskflow-tasks';

  getTasks(): Task[] {
    try {
      const tasks = localStorage.getItem(this.storageKey);
      if (!tasks) return [];
      
      const parsedTasks = JSON.parse(tasks);
      return parsedTasks.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  }

  saveTasks(tasks: Task[]): void {
    try {
      const tasksToSave = tasks.map(task => ({
        ...task,
        dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      }));
      localStorage.setItem(this.storageKey, JSON.stringify(tasksToSave));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }

  createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const now = new Date();
    const newTask: Task = {
      ...taskData,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const tasks = this.getTasks();
    tasks.push(newTask);
    this.saveTasks(tasks);
    
    return newTask;
  }

  updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      dueDate: updates.dueDate ? new Date(updates.dueDate) : tasks[taskIndex].dueDate,
      updatedAt: new Date(),
    };

    tasks[taskIndex] = updatedTask;
    this.saveTasks(tasks);
    
    return updatedTask;
  }

  deleteTask(taskId: string): void {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    this.saveTasks(filteredTasks);
  }

  getTasksByWorkspace(workspaceId: string): Task[] {
    return this.getTasks().filter(task => task.workspaceId === workspaceId);
  }
}

export const taskService = new TaskService();