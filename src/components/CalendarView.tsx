import { useState, useMemo } from 'react';
import { Task } from '../types/Task';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ClockIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline';
import { focusForestService } from '../services/focusForestService';
import ForestVisualization from './ForestVisualization';

interface CalendarViewProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function CalendarView({ tasks, onToggleTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { calendarDays, tasksMap, forestMap } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of the month and calculate days
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const tasksMap = new Map<string, Task[]>();
    const forestMap = focusForestService.getForestVisualization();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
      
      // Group tasks by date
      const dateKey = date.toDateString();
      const dayTasks = tasks.filter(task => 
        task.dueDate && new Date(task.dueDate).toDateString() === dateKey
      );
      if (dayTasks.length > 0) {
        tasksMap.set(dateKey, dayTasks);
      }
    }
    
    return { calendarDays: days, tasksMap, forestMap };
  }, [currentDate, tasks]);

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.toDateString();
    return tasksMap.get(dateKey) || [];
  }, [selectedDate, tasksMap]);

  const selectedDateTrees = useMemo(() => {
    if (!selectedDate) return [];
    const dateFormatted = selectedDate.toISOString().split('T')[0];
    return forestMap[dateFormatted] || [];
  }, [selectedDate, forestMap]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'prev' ? -1 : 1));
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };


  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full max-h-full overflow-hidden">
      {/* Calendar */}
      <div className="flex-1 lg:flex-[2] bg-gray-800 rounded-lg p-4 lg:p-6 border border-gray-700 flex flex-col min-h-0">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4 lg:mb-6 flex-shrink-0">
          <h2 className="text-lg lg:text-xl font-semibold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2 flex-shrink-0">
          {weekDays.map(day => (
            <div key={day} className="p-1 lg:p-2 text-center text-xs lg:text-sm font-medium text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 lg:gap-2 flex-1 min-h-0 overflow-auto custom-scrollbar">
          {calendarDays.map((date, index) => {
            const dateKey = date.toDateString();
            const dayTasks = tasksMap.get(dateKey) || [];
            const dateFormatted = date.toISOString().split('T')[0];
            const dayTrees = forestMap[dateFormatted] || [];
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`p-2 lg:p-3 min-h-[60px] lg:min-h-[80px] text-left border rounded-lg lg:rounded-xl transition-all duration-200 hover:bg-gray-700/50 ${
                  isSelected(date)
                    ? 'bg-green-500/10 border-green-500/30 shadow-green-500/20 shadow-lg'
                    : isToday(date)
                    ? 'bg-blue-500/10 border-blue-500/30 shadow-blue-500/20 shadow-md'
                    : 'border-gray-700/50 hover:border-gray-600/50'
                } ${
                  !isCurrentMonth(date) ? 'text-gray-600 opacity-60' : 'text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1 lg:mb-2">
                  <div className={`font-semibold text-xs lg:text-sm ${
                    isToday(date) ? 'text-blue-400' : 
                    isSelected(date) ? 'text-green-400' :
                    !isCurrentMonth(date) ? 'text-gray-500' : 'text-gray-200'
                  }`}>
                    {date.getDate()}
                  </div>
                  {dayTrees.length > 0 && (
                    <div className="flex items-center">
                      <ForestVisualization trees={dayTrees} isCompact={true} />
                    </div>
                  )}
                </div>
                <div className="space-y-1 overflow-hidden">
                  {/* Show 1 task on mobile, 2 on desktop, but only 1 if there are trees */}
                  <div className="lg:hidden">
                    {dayTasks.slice(0, dayTrees.length > 0 ? 1 : 1).map(task => (
                      <div
                        key={task.id}
                        className={`text-xs px-1 py-0.5 rounded truncate border-l-2 ${
                          task.priority === 'high' ? 'bg-red-500/10 border-red-500 text-red-300' :
                          task.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-300' :
                          'bg-blue-500/10 border-blue-500 text-blue-300'
                        } ${task.status === 'completed' ? 'opacity-60 line-through' : ''}`}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > (dayTrees.length > 0 ? 1 : 1) && (
                      <div className="text-xs text-gray-400 font-medium">
                        +{dayTasks.length - (dayTrees.length > 0 ? 1 : 1)} more
                      </div>
                    )}
                  </div>
                  <div className="hidden lg:block">
                    {dayTasks.slice(0, dayTrees.length > 0 ? 1 : 2).map(task => (
                      <div
                        key={task.id}
                        className={`text-xs px-2 py-1 rounded truncate border-l-2 ${
                          task.priority === 'high' ? 'bg-red-500/10 border-red-500 text-red-300' :
                          task.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-300' :
                          'bg-blue-500/10 border-blue-500 text-blue-300'
                        } ${task.status === 'completed' ? 'opacity-60 line-through' : ''}`}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > (dayTrees.length > 0 ? 1 : 2) && (
                      <div className="text-xs text-gray-400 font-medium">
                        +{dayTasks.length - (dayTrees.length > 0 ? 1 : 2)} more
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Tasks */}
      <div className="w-full lg:w-80 lg:flex-shrink-0 bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700/50 shadow-lg flex flex-col min-h-0 max-h-full">
        <div className="flex items-center space-x-3 mb-4 lg:mb-6 flex-shrink-0">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white text-base lg:text-lg truncate">
              {selectedDate ? selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              }) : 'Select a date'}
            </h3>
            {selectedDate && (
              <div className="space-y-1">
                <p className="text-xs lg:text-sm text-gray-400">
                  {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''} scheduled
                </p>
                {selectedDateTrees.length > 0 && (
                  <p className="text-xs lg:text-sm text-green-400">
                    🌳 {selectedDateTrees.length} focus session{selectedDateTrees.length !== 1 ? 's' : ''} completed
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Forest Trees Section */}
        {selectedDate && selectedDateTrees.length > 0 && (
          <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-xl p-3 lg:p-4 border border-green-500/20 mb-3 lg:mb-4 flex-shrink-0">
            <h4 className="text-xs lg:text-sm font-medium text-green-400 mb-2 lg:mb-3 flex items-center space-x-2">
              <span>🌳</span>
              <span>Focus Forest ({selectedDateTrees.length} tree{selectedDateTrees.length !== 1 ? 's' : ''})</span>
            </h4>
            <ForestVisualization trees={selectedDateTrees} isCompact={true} />
          </div>
        )}

        <div className="space-y-2 lg:space-y-3 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {selectedDateTasks.length === 0 ? (
            <div className="text-center py-8 lg:py-12">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-6 h-6 lg:w-8 lg:h-8 text-gray-500" />
              </div>
              <div className="text-gray-400 mb-2 font-medium text-sm lg:text-base">
                {selectedDate ? 'No tasks scheduled' : 'Select a date to view tasks'}
              </div>
              <div className="text-xs lg:text-sm text-gray-500">
                {selectedDate ? 'This day is free!' : 'Click on any date above'}
              </div>
              {selectedDate && selectedDateTrees.length > 0 && (
                <div className="text-xs lg:text-sm text-green-400 mt-4">
                  But you completed {selectedDateTrees.length} focus session{selectedDateTrees.length !== 1 ? 's' : ''}! 🌳
                </div>
              )}
            </div>
          ) : (
            selectedDateTasks.map(task => (
              <div
                key={task.id}
                className={`bg-gradient-to-r from-gray-700 to-gray-700/80 rounded-xl p-3 lg:p-4 border transition-all duration-200 hover:shadow-lg ${
                  task.status === 'completed' ? 'border-green-500/30' : 'border-gray-600/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start space-x-2 lg:space-x-3">
                      <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full mt-1.5 flex-shrink-0 ${
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-sm lg:text-base ${
                          task.status === 'completed' 
                            ? 'text-gray-400 line-through' 
                            : 'text-gray-100'
                        }`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-gray-400 text-xs lg:text-sm mt-1 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center flex-wrap gap-2 mt-2 lg:mt-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {task.priority.toUpperCase()}
                          </span>
                          {task.estimatedMinutes && (
                            <div className="flex items-center space-x-1 text-xs text-gray-400 bg-gray-600/50 px-2 py-1 rounded-full">
                              <ClockIcon className="w-3 h-3" />
                              <span>{task.estimatedMinutes}min</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className={`flex-shrink-0 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 ${
                      task.status === 'completed'
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                        : 'bg-gray-600/50 text-gray-300 hover:bg-gray-500/50 border border-gray-500/30'
                    }`}
                  >
                    {task.status === 'completed' ? '✓ Done' : 'Mark Done'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarView;