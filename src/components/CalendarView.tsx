import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Task } from '../types/Task';

interface CalendarViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function CalendarView({ tasks, onToggleComplete, onEditTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { calendarDays, tasksMap } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of the month and calculate days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const tasksMap = new Map<string, Task[]>();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
      
      // Group tasks by date
      const dateKey = date.toDateString();
      const dayTasks = tasks.filter(task => 
        task.dueAt && task.dueAt.toDateString() === dateKey
      );
      if (dayTasks.length > 0) {
        tasksMap.set(dateKey, dayTasks);
      }
    }
    
    return { calendarDays: days, tasksMap };
  }, [currentDate, tasks]);

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.toDateString();
    return tasksMap.get(dateKey) || [];
  }, [selectedDate, tasksMap]);

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Calendar */}
      <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const dateKey = date.toDateString();
            const dayTasks = tasksMap.get(dateKey) || [];
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`p-2 min-h-[80px] text-left border rounded-lg transition-all duration-200 hover:bg-gray-700 ${
                  isSelected(date)
                    ? 'bg-green-500/10 border-green-500/20'
                    : isToday(date)
                    ? 'bg-blue-500/10 border-blue-500/20'
                    : 'border-gray-700 hover:border-gray-600'
                } ${
                  !isCurrentMonth(date) ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                <div className="font-medium text-sm mb-1">
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map(task => (
                    <div
                      key={task.id}
                      className={`text-xs p-1 rounded truncate ${getPriorityColor(task.priority)} bg-opacity-20 text-white`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-gray-400">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Tasks */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <CalendarIcon className="w-6 h-6 text-green-400" />
          <div>
            <h3 className="font-semibold text-white">
              {selectedDate ? selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              }) : 'Select a date'}
            </h3>
            {selectedDate && (
              <p className="text-sm text-gray-400">
                {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''} due
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {selectedDateTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                {selectedDate ? 'No tasks due this day' : 'Select a date to view tasks'}
              </div>
            </div>
          ) : (
            selectedDateTasks.map(task => (
              <div
                key={task.id}
                className="bg-gray-700 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium ${
                      task.status === 'completed' 
                        ? 'text-gray-400 line-through' 
                        : 'text-gray-100'
                    }`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-gray-400 text-sm mt-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {task.priority}
                      </span>
                      {task.estimatedMinutes && (
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{task.estimatedMinutes}min</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    className={`ml-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      task.status === 'completed'
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {task.status === 'completed' ? 'Done' : 'Mark Done'}
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