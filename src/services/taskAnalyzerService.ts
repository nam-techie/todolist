import { Task, Priority, TaskStatus } from '../types/Task';

// Task Analysis Types
export interface TaskAnalysis {
  summary: TaskSummary;
  insights: TaskInsight[];
  recommendations: TaskRecommendation[];
  schedule: StudyScheduleSuggestion[];
  workloadAnalysis: WorkloadAnalysis;
}

export interface TaskSummary {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  dueSoon: number; // Due within 3 days
  highPriority: number;
  completionRate: number;
  averageCompletionTime?: number; // in minutes
}

export interface TaskInsight {
  type: 'warning' | 'info' | 'success' | 'tip';
  title: string;
  message: string;
  priority: number; // 1-5, higher is more important
}

export interface TaskRecommendation {
  type: 'priority' | 'schedule' | 'break' | 'focus';
  title: string;
  description: string;
  actionable: boolean;
  urgency: 'low' | 'medium' | 'high';
}

export interface StudyScheduleSuggestion {
  timeSlot: string;
  duration: number; // minutes
  taskIds: string[];
  reason: string;
  priority: Priority;
}

export interface WorkloadAnalysis {
  currentLoad: 'light' | 'moderate' | 'heavy' | 'overwhelming';
  peakDays: string[];
  suggestedBreaks: string[];
  timeDistribution: {
    [priority in Priority]: number; // percentage
  };
  deadlineDistribution: {
    today: number;
    thisWeek: number;
    nextWeek: number;
    later: number;
  };
}

class TaskAnalyzerService {
  // Main analysis method
  analyzeUserTasks(tasks: Task[]): TaskAnalysis {
    const summary = this.generateTaskSummary(tasks);
    const insights = this.generateInsights(tasks, summary);
    const recommendations = this.generateRecommendations(tasks, summary);
    const schedule = this.generateScheduleSuggestions(tasks);
    const workloadAnalysis = this.analyzeWorkload(tasks);

    return {
      summary,
      insights,
      recommendations,
      schedule,
      workloadAnalysis
    };
  }

  // Generate task summary statistics
  private generateTaskSummary(tasks: Task[]): TaskSummary {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    const summary: TaskSummary = {
      total: tasks.length,
      completed: 0,
      pending: 0,
      inProgress: 0,
      overdue: 0,
      dueSoon: 0,
      highPriority: 0,
      completionRate: 0
    };

    let totalCompletionTime = 0;
    let completedTasksWithTime = 0;

    tasks.forEach(task => {
      // Status counts
      switch (task.status) {
        case 'completed':
          summary.completed++;
          break;
        case 'pending':
          summary.pending++;
          break;
        case 'in-progress':
          summary.inProgress++;
          break;
      }

      // Priority counts
      if (task.priority === 'high') {
        summary.highPriority++;
      }

      // Due date analysis
      if (task.dueDate && task.status !== 'completed') {
        const dueDate = new Date(task.dueDate);
        if (dueDate < today) {
          summary.overdue++;
        } else if (dueDate <= threeDaysFromNow) {
          summary.dueSoon++;
        }
      }

      // Completion time tracking
      if (task.status === 'completed' && task.timeTracking?.totalMinutes) {
        totalCompletionTime += task.timeTracking.totalMinutes;
        completedTasksWithTime++;
      }
    });

    summary.completionRate = summary.total > 0 ? (summary.completed / summary.total) * 100 : 0;
    summary.averageCompletionTime = completedTasksWithTime > 0 ? totalCompletionTime / completedTasksWithTime : undefined;

    return summary;
  }

  // Generate insights based on task data
  private generateInsights(tasks: Task[], summary: TaskSummary): TaskInsight[] {
    const insights: TaskInsight[] = [];

    // Overdue tasks warning
    if (summary.overdue > 0) {
      insights.push({
        type: 'warning',
        title: 'Công việc quá hạn',
        message: `Bạn có ${summary.overdue} công việc đã quá hạn. Hãy ưu tiên hoàn thành ngay!`,
        priority: 5
      });
    }

    // Due soon warning
    if (summary.dueSoon > 0) {
      insights.push({
        type: 'warning',
        title: 'Deadline sắp tới',
        message: `${summary.dueSoon} công việc sẽ đến hạn trong 3 ngày tới.`,
        priority: 4
      });
    }

    // High completion rate praise
    if (summary.completionRate >= 80) {
      insights.push({
        type: 'success',
        title: 'Tỷ lệ hoàn thành cao',
        message: `Xuất sắc! Bạn đã hoàn thành ${summary.completionRate.toFixed(1)}% công việc.`,
        priority: 2
      });
    }

    // Low completion rate concern
    if (summary.completionRate < 50 && summary.total > 5) {
      insights.push({
        type: 'warning',
        title: 'Tỷ lệ hoàn thành thấp',
        message: `Chỉ ${summary.completionRate.toFixed(1)}% công việc được hoàn thành. Hãy xem xét lại kế hoạch.`,
        priority: 3
      });
    }

    // Too many high priority tasks
    if (summary.highPriority > 5) {
      insights.push({
        type: 'tip',
        title: 'Quá nhiều ưu tiên cao',
        message: `${summary.highPriority} công việc ưu tiên cao có thể gây áp lực. Hãy cân nhắc lại mức độ ưu tiên.`,
        priority: 3
      });
    }

    // Time estimation accuracy
    if (summary.averageCompletionTime) {
      const avgEstimated = this.getAverageEstimatedTime(tasks.filter(t => t.status === 'completed'));
      if (avgEstimated && Math.abs(summary.averageCompletionTime - avgEstimated) > 30) {
        insights.push({
          type: 'info',
          title: 'Ước tính thời gian',
          message: `Thời gian thực tế và ước tính chênh lệch ${Math.abs(summary.averageCompletionTime - avgEstimated).toFixed(0)} phút.`,
          priority: 2
        });
      }
    }

    // Sort by priority
    return insights.sort((a, b) => b.priority - a.priority);
  }

  // Generate actionable recommendations
  private generateRecommendations(tasks: Task[], summary: TaskSummary): TaskRecommendation[] {
    const recommendations: TaskRecommendation[] = [];

    // Handle overdue tasks
    if (summary.overdue > 0) {
      recommendations.push({
        type: 'priority',
        title: 'Xử lý công việc quá hạn',
        description: 'Tập trung hoàn thành các công việc quá hạn trước khi bắt đầu công việc mới.',
        actionable: true,
        urgency: 'high'
      });
    }

    // Schedule break time
    if (summary.inProgress + summary.pending > 10) {
      recommendations.push({
        type: 'break',
        title: 'Lên lịch nghỉ ngơi',
        description: 'Với khối lượng công việc lớn, hãy đảm bảo có thời gian nghỉ ngơi hợp lý.',
        actionable: true,
        urgency: 'medium'
      });
    }

    // Focus time recommendation
    if (summary.highPriority > 0) {
      recommendations.push({
        type: 'focus',
        title: 'Thời gian tập trung',
        description: 'Dành 2-3 tiếng vào buổi sáng để làm các công việc ưu tiên cao.',
        actionable: true,
        urgency: 'medium'
      });
    }

    // Time estimation improvement
    const tasksWithoutEstimate = tasks.filter(t => !t.estimatedMinutes && t.status !== 'completed').length;
    if (tasksWithoutEstimate > 0) {
      recommendations.push({
        type: 'schedule',
        title: 'Ước tính thời gian',
        description: `${tasksWithoutEstimate} công việc chưa có ước tính thời gian. Hãy thêm để lập kế hoạch tốt hơn.`,
        actionable: true,
        urgency: 'low'
      });
    }

    return recommendations;
  }

  // Generate study schedule suggestions
  private generateScheduleSuggestions(tasks: Task[]): StudyScheduleSuggestion[] {
    const incompleteTasks = tasks.filter(t => t.status !== 'completed');
    const suggestions: StudyScheduleSuggestion[] = [];

    // Morning focus time (8:00-10:00)
    const highPriorityTasks = incompleteTasks
      .filter(t => t.priority === 'high')
      .slice(0, 2);
    
    if (highPriorityTasks.length > 0) {
      suggestions.push({
        timeSlot: '8:00-10:00',
        duration: 120,
        taskIds: highPriorityTasks.map(t => t.id),
        reason: 'Buổi sáng là thời gian tập trung cao nhất, phù hợp cho công việc ưu tiên cao',
        priority: 'high'
      });
    }

    // Afternoon work time (14:00-16:00)
    const mediumPriorityTasks = incompleteTasks
      .filter(t => t.priority === 'medium')
      .slice(0, 3);
    
    if (mediumPriorityTasks.length > 0) {
      suggestions.push({
        timeSlot: '14:00-16:00',
        duration: 120,
        taskIds: mediumPriorityTasks.map(t => t.id),
        reason: 'Buổi chiều phù hợp cho các công việc mức độ trung bình',
        priority: 'medium'
      });
    }

    // Evening review time (19:00-20:00)
    const lowPriorityTasks = incompleteTasks
      .filter(t => t.priority === 'low')
      .slice(0, 2);
    
    if (lowPriorityTasks.length > 0) {
      suggestions.push({
        timeSlot: '19:00-20:00',
        duration: 60,
        taskIds: lowPriorityTasks.map(t => t.id),
        reason: 'Buổi tối phù hợp cho review và các công việc nhẹ nhàng',
        priority: 'low'
      });
    }

    return suggestions;
  }

  // Analyze workload distribution
  private analyzeWorkload(tasks: Task[]): WorkloadAnalysis {
    const incompleteTasks = tasks.filter(t => t.status !== 'completed');
    const now = new Date();
    
    // Determine current load
    let currentLoad: WorkloadAnalysis['currentLoad'] = 'light';
    if (incompleteTasks.length > 20) currentLoad = 'overwhelming';
    else if (incompleteTasks.length > 15) currentLoad = 'heavy';
    else if (incompleteTasks.length > 8) currentLoad = 'moderate';

    // Priority distribution
    const priorityCounts = { high: 0, medium: 0, low: 0 };
    incompleteTasks.forEach(task => {
      priorityCounts[task.priority]++;
    });

    const total = incompleteTasks.length || 1;
    const timeDistribution = {
      high: (priorityCounts.high / total) * 100,
      medium: (priorityCounts.medium / total) * 100,
      low: (priorityCounts.low / total) * 100
    };

    // Deadline distribution
    const deadlineDistribution = { today: 0, thisWeek: 0, nextWeek: 0, later: 0 };
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextWeekEnd = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    incompleteTasks.forEach(task => {
      if (!task.dueDate) {
        deadlineDistribution.later++;
        return;
      }

      const dueDate = new Date(task.dueDate);
      if (dueDate <= today) {
        deadlineDistribution.today++;
      } else if (dueDate <= thisWeekEnd) {
        deadlineDistribution.thisWeek++;
      } else if (dueDate <= nextWeekEnd) {
        deadlineDistribution.nextWeek++;
      } else {
        deadlineDistribution.later++;
      }
    });

    return {
      currentLoad,
      peakDays: this.identifyPeakDays(tasks),
      suggestedBreaks: this.suggestBreakTimes(currentLoad),
      timeDistribution,
      deadlineDistribution
    };
  }

  // Helper methods
  private getAverageEstimatedTime(completedTasks: Task[]): number | null {
    const tasksWithEstimate = completedTasks.filter(t => t.estimatedMinutes);
    if (tasksWithEstimate.length === 0) return null;
    
    const total = tasksWithEstimate.reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0);
    return total / tasksWithEstimate.length;
  }

  private identifyPeakDays(tasks: Task[]): string[] {
    const dayCount: { [key: string]: number } = {};
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dayCount[dateStr] = 0;
    }

    tasks.forEach(task => {
      if (task.dueDate && task.status !== 'completed') {
        const dueDateStr = new Date(task.dueDate).toISOString().split('T')[0];
        if (dayCount[dueDateStr] !== undefined) {
          dayCount[dueDateStr]++;
        }
      }
    });

    return Object.entries(dayCount)
      .filter(([_, count]) => count >= 3)
      .map(([date, _]) => date);
  }

  private suggestBreakTimes(currentLoad: WorkloadAnalysis['currentLoad']): string[] {
    switch (currentLoad) {
      case 'overwhelming':
        return ['10:30-10:45', '12:00-13:00', '15:30-15:45', '17:00-17:15'];
      case 'heavy':
        return ['10:30-10:45', '12:00-13:00', '15:30-15:45'];
      case 'moderate':
        return ['12:00-13:00', '15:30-15:45'];
      default:
        return ['12:00-13:00'];
    }
  }

  // Generate Vietnamese context-aware study advice
  generateStudyAdvice(analysis: TaskAnalysis): string {
    const { summary, workloadAnalysis } = analysis;
    let advice = '';

    // Workload-based advice
    switch (workloadAnalysis.currentLoad) {
      case 'overwhelming':
        advice += '🚨 Khối lượng công việc hiện tại rất lớn. Hãy tập trung vào các công việc ưu tiên cao và cân nhắc hoãn lại những việc không cấp thiết.\n\n';
        break;
      case 'heavy':
        advice += '⚠️ Bạn đang có khá nhiều công việc. Hãy phân bổ thời gian hợp lý và đừng quên nghỉ ngơi.\n\n';
        break;
      case 'moderate':
        advice += '✅ Khối lượng công việc ở mức vừa phải. Đây là thời điểm tốt để duy trì nhịp độ ổn định.\n\n';
        break;
      case 'light':
        advice += '😊 Bạn đang có ít công việc. Có thể đây là lúc để học thêm kỹ năng mới hoặc chuẩn bị cho tương lai.\n\n';
        break;
    }

    // Completion rate advice
    if (summary.completionRate >= 80) {
      advice += '🎉 Tỷ lệ hoàn thành công việc của bạn rất tốt! Hãy tiếp tục duy trì.\n\n';
    } else if (summary.completionRate < 50) {
      advice += '💪 Tỷ lệ hoàn thành còn thấp. Hãy thử chia nhỏ công việc và đặt deadline rõ ràng hơn.\n\n';
    }

    // Priority advice
    if (workloadAnalysis.timeDistribution.high > 50) {
      advice += '🔥 Bạn có quá nhiều công việc ưu tiên cao. Hãy xem xét lại và phân loại thành "thực sự cấp thiết" và "quan trọng nhưng không gấp".\n\n';
    }

    return advice.trim() || 'Bạn đang quản lý công việc khá tốt! Hãy tiếp tục duy trì nhịp độ này.';
  }
}

// Export singleton instance
export const taskAnalyzerService = new TaskAnalyzerService();
