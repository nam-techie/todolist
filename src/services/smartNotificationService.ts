import { Task } from '../types/Task';

export class SmartNotificationService {
  private static checkInterval: NodeJS.Timeout | null = null;

  static startMonitoring(tasks: Task[], onNotify: (type: 'success' | 'warning' | 'error', title: string, message: string) => void) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check every minute
    this.checkInterval = setInterval(() => {
      this.checkTaskDeadlines(tasks, onNotify);
    }, 60000);

    // Initial check
    this.checkTaskDeadlines(tasks, onNotify);
  }

  static stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private static checkTaskDeadlines(tasks: Task[], onNotify: (type: 'success' | 'warning' | 'error', title: string, message: string) => void) {
    const now = new Date();
    
    tasks.forEach(task => {
      if (!task.dueDate || task.status === 'completed') return;
      
      const dueDate = new Date(task.dueDate);
      const timeDiff = dueDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

      // Overdue tasks
      if (timeDiff < 0) {
        const hoursOverdue = Math.abs(hoursDiff);
        if (hoursOverdue < 1) {
          onNotify('error', '⚠️ Task Overdue!', `"${task.title}" is now overdue!`);
        }
        return;
      }

      // Smart notifications based on priority
      if (task.priority === 'high') {
        // High priority: 24h, 12h, 6h, 2h, 1h, 30min
        if (Math.abs(daysDiff - 1) < 0.01) {
          onNotify('warning', '🔥 High Priority Reminder', `"${task.title}" is due in 24 hours!`);
        } else if (Math.abs(hoursDiff - 12) < 0.1) {
          onNotify('warning', '🔥 High Priority Alert', `"${task.title}" is due in 12 hours!`);
        } else if (Math.abs(hoursDiff - 6) < 0.1) {
          onNotify('error', '🚨 Urgent!', `"${task.title}" is due in 6 hours!`);
        } else if (Math.abs(hoursDiff - 2) < 0.1) {
          onNotify('error', '🚨 Very Urgent!', `"${task.title}" is due in 2 hours!`);
        } else if (Math.abs(hoursDiff - 1) < 0.1) {
          onNotify('error', '🚨 CRITICAL!', `"${task.title}" is due in 1 hour!`);
        } else if (Math.abs(hoursDiff - 0.5) < 0.05) {
          onNotify('error', '🚨 FINAL WARNING!', `"${task.title}" is due in 30 minutes!`);
        }
      } else if (task.priority === 'medium') {
        // Medium priority: 3 days, 1 day, 6h, 2h
        if (Math.abs(daysDiff - 3) < 0.01) {
          onNotify('info', '📅 Upcoming Task', `"${task.title}" is due in 3 days.`);
        } else if (Math.abs(daysDiff - 1) < 0.01) {
          onNotify('warning', '⏰ Task Due Tomorrow', `"${task.title}" is due tomorrow!`);
        } else if (Math.abs(hoursDiff - 6) < 0.1) {
          onNotify('warning', '⚠️ Task Due Soon', `"${task.title}" is due in 6 hours!`);
        } else if (Math.abs(hoursDiff - 2) < 0.1) {
          onNotify('error', '🚨 Task Due Very Soon!', `"${task.title}" is due in 2 hours!`);
        }
      } else if (task.priority === 'low') {
        // Low priority: 7 days, 3 days, 1 day
        if (Math.abs(daysDiff - 7) < 0.01) {
          onNotify('info', '📝 Gentle Reminder', `"${task.title}" is due in a week.`);
        } else if (Math.abs(daysDiff - 3) < 0.01) {
          onNotify('info', '📅 Task Reminder', `"${task.title}" is due in 3 days.`);
        } else if (Math.abs(daysDiff - 1) < 0.01) {
          onNotify('warning', '⏰ Task Due Tomorrow', `"${task.title}" is due tomorrow.`);
        }
      }
    });
  }

  static getTaskUrgencyLevel(task: Task): 'low' | 'medium' | 'high' | 'critical' | 'overdue' {
    if (!task.dueDate || task.status === 'completed') return 'low';
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const timeDiff = dueDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (timeDiff < 0) return 'overdue';
    
    if (task.priority === 'high') {
      if (hoursDiff <= 2) return 'critical';
      if (hoursDiff <= 6) return 'high';
      if (hoursDiff <= 24) return 'medium';
      return 'low';
    } else if (task.priority === 'medium') {
      if (hoursDiff <= 2) return 'critical';
      if (hoursDiff <= 6) return 'high';
      if (hoursDiff <= 24) return 'medium';
      return 'low';
    } else {
      if (hoursDiff <= 6) return 'high';
      if (hoursDiff <= 24) return 'medium';
      return 'low';
    }
  }

  static requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return Promise.resolve(false);
    }

    if (Notification.permission === 'granted') {
      return Promise.resolve(true);
    }

    if (Notification.permission === 'denied') {
      return Promise.resolve(false);
    }

    return Notification.requestPermission().then(permission => {
      return permission === 'granted';
    });
  }

  static showBrowserNotification(title: string, message: string, priority: 'low' | 'medium' | 'high' = 'medium') {
    if (Notification.permission !== 'granted') return;

    const icon = '/favicon.ico'; // You can add a custom icon
    
    const notification = new Notification(title, {
      body: message,
      icon,
      badge: icon,
      tag: 'taskflow-notification',
      requireInteraction: priority === 'high',
      silent: priority === 'low'
    });

    // Auto close after 5 seconds for low priority
    if (priority === 'low') {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}

export const smartNotificationService = SmartNotificationService;
