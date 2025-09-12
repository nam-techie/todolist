import React, { useMemo } from 'react';
import { Task } from '../types/Task';
import { useLanguage } from '../contexts/LanguageContext';
import { ChartBarIcon, ClockIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

interface ProductivityChartProps {
  tasks: Task[];
}

const ProductivityChart: React.FC<ProductivityChartProps> = ({ tasks }) => {
  const { t } = useLanguage();

  const productivityData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    const dailyData = last30Days.map(date => {
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === date.toDateString();
      });

      const completedTasks = tasks.filter(task => {
        if (task.status !== 'completed') return false;
        const completedDate = new Date(task.updatedAt);
        return completedDate.toDateString() === date.toDateString();
      });

      const totalTimeSpent = completedTasks.reduce((total, task) => {
        return total + (task.timeTracking?.totalMinutes || task.estimatedMinutes || 0);
      }, 0);

      return {
        date,
        created: dayTasks.length,
        completed: completedTasks.length,
        timeSpent: totalTimeSpent
      };
    });

    const maxCreated = Math.max(...dailyData.map(d => d.created), 1);
    const maxCompleted = Math.max(...dailyData.map(d => d.completed), 1);
    const maxTime = Math.max(...dailyData.map(d => d.timeSpent), 1);

    return { dailyData, maxCreated, maxCompleted, maxTime };
  }, [tasks]);

  const weeklyProductivity = useMemo(() => {
    const last4Weeks = Array.from({ length: 4 }, (_, i) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (i * 7) - 6);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (i * 7));
      
      const weekTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= startDate && taskDate <= endDate;
      });

      const completedInWeek = weekTasks.filter(t => t.status === 'completed').length;
      const totalTime = weekTasks.reduce((total, task) => {
        return total + (task.timeTracking?.totalMinutes || 0);
      }, 0);

      return {
        week: `${t('week')} ${4 - i}`,
        tasks: weekTasks.length,
        completed: completedInWeek,
        efficiency: weekTasks.length > 0 ? (completedInWeek / weekTasks.length) * 100 : 0,
        timeSpent: totalTime
      };
    }).reverse();

    return last4Weeks;
  }, [tasks]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Daily Activity Chart */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <ChartBarIcon className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">{t('dailyActivity')}</h3>
        </div>
        
        <div className="flex items-end justify-between space-x-1 h-32 mb-4">
          {productivityData.dailyData.slice(-14).map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center space-y-1">
              {/* Completed Tasks Bar */}
              <div className="w-full bg-gray-700 rounded-t relative" style={{ height: '80px' }}>
                <div
                  className="bg-green-500 rounded-t absolute bottom-0 w-full transition-all duration-500"
                  style={{ 
                    height: `${(day.completed / productivityData.maxCompleted) * 80}px`,
                    minHeight: day.completed > 0 ? '2px' : '0px'
                  }}
                />
                {day.completed > 0 && (
                  <div className="absolute -top-5 w-full text-center">
                    <span className="text-xs text-green-400 bg-gray-900 px-1 py-0.5 rounded">
                      {day.completed}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Date Label */}
              <div className="text-xs text-gray-400 font-medium">
                {day.date.getDate()}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-300">Completed Tasks</span>
          </div>
        </div>
      </div>

      {/* Weekly Efficiency */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
          <h3 className="text-lg font-semibold text-white">{t('weeklyEfficiency')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {weeklyProductivity.map((week, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-2">{week.week}</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {Math.round(week.efficiency)}%
                </div>
                <div className="text-xs text-gray-400">
                  {week.completed}/{week.tasks} completed
                </div>
                {week.timeSpent > 0 && (
                  <div className="text-xs text-blue-400 mt-1">
                    {formatTime(week.timeSpent)} spent
                  </div>
                )}
              </div>
              
              {/* Efficiency Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="h-2 bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${week.efficiency}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Spent Analysis */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <ClockIcon className="w-6 h-6 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">{t('timeAnalysis')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Time Spent */}
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {formatTime(tasks.reduce((total, task) => total + (task.timeTracking?.totalMinutes || 0), 0))}
            </div>
            <div className="text-sm text-gray-400">{t('totalTimeTracked')}</div>
          </div>

          {/* Average Session */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {(() => {
                const allSessions = tasks.flatMap(t => t.timeTracking?.sessions || []);
                const avgSession = allSessions.length > 0 
                  ? allSessions.reduce((sum, s) => sum + s.minutes, 0) / allSessions.length 
                  : 0;
                return formatTime(Math.round(avgSession));
              })()}
            </div>
            <div className="text-sm text-gray-400">{t('averageSession')}</div>
          </div>

          {/* Estimated vs Actual */}
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">
              {(() => {
                const estimated = tasks.reduce((total, task) => total + (task.estimatedMinutes || 0), 0);
                const actual = tasks.reduce((total, task) => total + (task.timeTracking?.totalMinutes || 0), 0);
                const accuracy = estimated > 0 ? Math.round((actual / estimated) * 100) : 0;
                return `${accuracy}%`;
              })()}
            </div>
            <div className="text-sm text-gray-400">{t('estimationAccuracy')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityChart;
