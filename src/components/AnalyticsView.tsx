import React, { useMemo } from 'react';
import { Task } from '../types/Task';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CheckIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import ProductivityChart from './ProductivityChart';

interface AnalyticsViewProps {
  tasks: Task[];
}

interface AnalyticsData {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  priorityDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  weeklyCompletion: { day: string; completed: number }[];
}

function AnalyticsView({ tasks }: AnalyticsViewProps) {
  const { t } = useLanguage();
  
  const analytics = useMemo((): AnalyticsData => {
    const now = new Date();
    
    const data: AnalyticsData = {
      total: tasks.length,
      completed: 0,
      pending: 0,
      overdue: 0,
      completionRate: 0,
      priorityDistribution: { low: 0, medium: 0, high: 0 },
      statusDistribution: { pending: 0, 'in-progress': 0, completed: 0 },
      weeklyCompletion: []
    };

    // Calculate basic stats
    tasks.forEach(task => {
      if (task.status === 'completed') data.completed++;
      else data.pending++;
      
      if (task.dueDate && task.status !== 'completed' && new Date(task.dueDate) < now) {
        data.overdue++;
      }
      
      data.priorityDistribution[task.priority]++;
      data.statusDistribution[task.status]++;
    });

    data.completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0;

    // Weekly completion data (last 7 days)
    const weekDays = [t('sun'), t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat')];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    data.weeklyCompletion = last7Days.map(date => ({
      day: weekDays[date.getDay()],
      completed: tasks.filter(task => 
        task.status === 'completed' && 
        new Date(task.updatedAt).toDateString() === date.toDateString()
      ).length
    }));

    return data;
  }, [tasks]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'green' }: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: 'green' | 'blue' | 'yellow' | 'red';
  }) => {
    const colorClasses = {
      green: 'text-green-400 bg-green-500/10 border-green-500/20',
      blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      red: 'text-red-400 bg-red-500/10 border-red-500/20'
    };

    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  const ProgressBar = ({ label, value, max, color = 'green' }: {
    label: string;
    value: number;
    max: number;
    color?: 'green' | 'blue' | 'yellow' | 'red';
  }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const colorClasses = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500'
    };

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">{label}</span>
          <span className="text-gray-400">{value}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const maxWeeklyValue = Math.max(...analytics.weeklyCompletion.map(d => d.completed), 1);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={ClipboardDocumentListIcon}
          title={t('totalTasks')}
          value={analytics.total}
          subtitle={t('allTime')}
          color="blue"
        />
        <StatCard
          icon={CheckCircleIcon}
          title={t('completed')}
          value={analytics.completed}
          subtitle={`${analytics.completionRate.toFixed(1)}% ${t('completionRate')}`}
          color="green"
        />
        <StatCard
          icon={ClockIcon}
          title={t('pending')}
          value={analytics.pending}
          subtitle={t('tasksRemaining')}
          color="yellow"
        />
        <StatCard
          icon={ExclamationTriangleIcon}
          title={t('overdue')}
          value={analytics.overdue}
          subtitle={t('pastDueDate')}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <ChartBarIcon className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">{t('priorityDistribution')}</h3>
          </div>
          <div className="space-y-4">
            <ProgressBar
              label={t('high')}
              value={analytics.priorityDistribution.high}
              max={analytics.total}
              color="red"
            />
            <ProgressBar
              label={t('medium')}
              value={analytics.priorityDistribution.medium}
              max={analytics.total}
              color="yellow"
            />
            <ProgressBar
              label={t('low')}
              value={analytics.priorityDistribution.low}
              max={analytics.total}
              color="blue"
            />
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <CheckIcon className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">{t('statusOverview')}</h3>
          </div>
          <div className="space-y-4">
            <ProgressBar
              label={t('completed')}
              value={analytics.statusDistribution.completed}
              max={analytics.total}
              color="green"
            />
            <ProgressBar
              label={t('inProgress')}
              value={analytics.statusDistribution['in-progress']}
              max={analytics.total}
              color="blue"
            />
            <ProgressBar
              label={t('pending')}
              value={analytics.statusDistribution.pending}
              max={analytics.total}
              color="yellow"
            />
          </div>
        </div>
      </div>

      {/* Weekly Completion Chart */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <CalendarIcon className="w-6 h-6 text-green-400" />
          <h3 className="text-lg font-semibold text-white">{t('weeklyCompletion')}</h3>
        </div>
        <div className="flex items-end justify-between space-x-2 h-48">
          {analytics.weeklyCompletion.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-700 rounded-t-lg relative" style={{ height: '160px' }}>
                <div
                  className="bg-green-500 rounded-t-lg absolute bottom-0 w-full transition-all duration-500"
                  style={{ 
                    height: `${(day.completed / maxWeeklyValue) * 160}px`,
                    minHeight: day.completed > 0 ? '8px' : '0px'
                  }}
                />
                {day.completed > 0 && (
                  <div className="absolute -top-6 w-full text-center">
                    <span className="text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded">
                      {day.completed}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-2 font-medium">
                {day.day}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Rate Circle */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{t('overallProgress')}</h3>
            <p className="text-gray-400">
              {analytics.completed} of {analytics.total} {t('completedTasks').toLowerCase()}
            </p>
          </div>
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-700"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-green-500"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${analytics.completionRate}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {Math.round(analytics.completionRate)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Productivity Charts */}
      <ProductivityChart tasks={tasks} />
    </div>
  );
}

export default AnalyticsView;