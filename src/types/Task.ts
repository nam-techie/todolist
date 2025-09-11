export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: Date;
  tags: string[];
  workspaceId: string;
  estimatedMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  parentTaskId?: string; // For recurring task instances
  timeTracking?: TimeTracking;
}

export interface TimeTracking {
  sessions: TimeSession[];
  totalMinutes: number;
  isActive: boolean;
  activeSessionStart?: Date;
}

export interface TimeSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  minutes: number;
  note?: string;
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Every X days/weeks/months/years
  daysOfWeek?: number[]; // For weekly: 0=Sunday, 1=Monday, etc.
  dayOfMonth?: number; // For monthly: 1-31
  endDate?: string; // When to stop recurring
  maxOccurrences?: number; // Alternative to endDate
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
}