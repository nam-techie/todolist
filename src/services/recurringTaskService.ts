import { Task, RecurrencePattern } from '../types/Task';
import { taskService } from './taskService';

export class RecurringTaskService {
  private static generateNextOccurrence(task: Task, pattern: RecurrencePattern): Date | null {
    if (!task.dueDate || !pattern) return null;

    const currentDue = new Date(task.dueDate);
    const nextDue = new Date(currentDue);

    switch (pattern.type) {
      case 'daily':
        nextDue.setDate(currentDue.getDate() + pattern.interval);
        break;
      
      case 'weekly':
        nextDue.setDate(currentDue.getDate() + (pattern.interval * 7));
        break;
      
      case 'monthly':
        nextDue.setMonth(currentDue.getMonth() + pattern.interval);
        if (pattern.dayOfMonth) {
          nextDue.setDate(pattern.dayOfMonth);
        }
        break;
      
      case 'yearly':
        nextDue.setFullYear(currentDue.getFullYear() + pattern.interval);
        break;
      
      default:
        return null;
    }

    // Check if we should stop recurring
    if (pattern.endDate && nextDue > new Date(pattern.endDate)) {
      return null;
    }

    return nextDue;
  }

  static createRecurringTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, pattern: RecurrencePattern): Task {
    const recurringTask = taskService.createTask({
      ...taskData,
      isRecurring: true,
      recurrencePattern: pattern
    });

    // Generate initial instances if needed
    this.generateUpcomingInstances(recurringTask);
    
    return recurringTask;
  }

  static generateUpcomingInstances(parentTask: Task, daysAhead: number = 30): Task[] {
    if (!parentTask.isRecurring || !parentTask.recurrencePattern || !parentTask.dueDate) {
      return [];
    }

    const instances: Task[] = [];
    const pattern = parentTask.recurrencePattern;
    let currentDate = new Date(parentTask.dueDate);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);

    let occurrenceCount = 0;
    const maxOccurrences = pattern.maxOccurrences || 100;

    while (currentDate <= endDate && occurrenceCount < maxOccurrences) {
      const nextDate = this.generateNextOccurrence(
        { ...parentTask, dueDate: currentDate }, 
        pattern
      );

      if (!nextDate) break;

      // Check if instance already exists
      const existingTasks = taskService.getTasks();
      const instanceExists = existingTasks.some(task => 
        task.parentTaskId === parentTask.id &&
        task.dueDate &&
        new Date(task.dueDate).toDateString() === nextDate.toDateString()
      );

      if (!instanceExists) {
        const instance = taskService.createTask({
          title: parentTask.title,
          description: parentTask.description,
          priority: parentTask.priority,
          status: 'pending',
          dueDate: nextDate,
          tags: parentTask.tags,
          workspaceId: parentTask.workspaceId,
          estimatedMinutes: parentTask.estimatedMinutes,
          parentTaskId: parentTask.id,
          isRecurring: false
        });
        instances.push(instance);
      }

      currentDate = nextDate;
      occurrenceCount++;
    }

    return instances;
  }

  static updateRecurringTask(taskId: string, updates: Partial<Task>): Task | null {
    const task = taskService.updateTask(taskId, updates);
    
    if (task?.isRecurring) {
      // Regenerate instances if recurrence pattern changed
      if (updates.recurrencePattern) {
        this.cleanupFutureInstances(taskId);
        this.generateUpcomingInstances(task);
      }
    }

    return task;
  }

  static deleteRecurringTask(taskId: string, deleteInstances: boolean = false): void {
    if (deleteInstances) {
      this.cleanupFutureInstances(taskId);
    }
    taskService.deleteTask(taskId);
  }

  private static cleanupFutureInstances(parentTaskId: string): void {
    const allTasks = taskService.getTasks();
    const instances = allTasks.filter(task => 
      task.parentTaskId === parentTaskId &&
      task.status !== 'completed' &&
      task.dueDate &&
      new Date(task.dueDate) > new Date()
    );

    instances.forEach(instance => {
      taskService.deleteTask(instance.id);
    });
  }

  static getRecurringTaskInstances(parentTaskId: string): Task[] {
    const allTasks = taskService.getTasks();
    return allTasks.filter(task => task.parentTaskId === parentTaskId);
  }

  static completeRecurringTaskInstance(instanceId: string): Task | null {
    const instance = taskService.updateTask(instanceId, { status: 'completed' });
    
    if (instance?.parentTaskId) {
      const parentTask = taskService.getTasks().find(t => t.id === instance.parentTaskId);
      if (parentTask) {
        // Generate next instance if needed
        this.generateUpcomingInstances(parentTask, 60); // Look ahead 60 days
      }
    }

    return instance;
  }
}

export const recurringTaskService = RecurringTaskService;
