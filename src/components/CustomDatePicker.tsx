import React, { useState, useRef, useEffect } from 'react';
import { 
  CalendarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date and time",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [time, setTime] = useState(
    value ? new Date(value).toTimeString().slice(0, 5) : '14:00'
  );
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'prev' ? -1 : 1));
    setCurrentDate(newDate);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    const [hours, minutes] = time.split(':');
    const newDateTime = new Date(date);
    newDateTime.setHours(parseInt(hours), parseInt(minutes));
    onChange(newDateTime.toISOString());
  };

  const updateTime = (newTime: string) => {
    setTime(newTime);
    if (selectedDate) {
      const [hours, minutes] = newTime.split(':');
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(parseInt(hours), parseInt(minutes));
      onChange(newDateTime.toISOString());
    }
  };

  const clearDate = () => {
    setSelectedDate(null);
    onChange('');
    setIsOpen(false);
  };

  const setToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDate(today);
    const [hours, minutes] = time.split(':');
    today.setHours(parseInt(hours), parseInt(minutes));
    onChange(today.toISOString());
  };

  const formatDisplayValue = () => {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-left flex items-center justify-between ${className}`}
      >
        <span className={value ? 'text-white' : 'text-gray-400'}>
          {formatDisplayValue() || placeholder}
        </span>
        <CalendarIcon className="w-5 h-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 text-gray-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-xs font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {getDaysInMonth(currentDate).map((date, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectDate(date)}
                className={`p-2 text-sm rounded-lg transition-colors ${
                  isSelected(date)
                    ? 'bg-green-500 text-white'
                    : isToday(date)
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : isCurrentMonth(date)
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-600 hover:bg-gray-800'
                }`}
              >
                {date.getDate()}
              </button>
            ))}
          </div>

          {/* Time Picker */}
          <div className="border-t border-gray-700 pt-4">
            <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <ClockIcon className="w-4 h-4 mr-2" />
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => updateTime(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-700 mt-4">
      className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-left flex items-center justify-between transition-all ${className}`}
              <button
                type="button"
                onClick={clearDate}
                className="px-3 py-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button
      <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 p-4">
                onClick={setToday}
                className="px-3 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-gray-800 rounded-lg transition-colors"
              >
                Today
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
              className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
  );
};

export default CustomDatePicker;

              className={`p-2 text-sm rounded-xl transition-colors ${
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              className="px-3 py-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-xl transition-colors"
              className="px-3 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-gray-800 rounded-xl transition-colors"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg hover:shadow-green-500/25"