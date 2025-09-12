import React, { useState, useEffect, useCallback } from 'react';
import { Task, TimeSession } from '../types/Task';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  ClockIcon
} from '@heroicons/react/24/outline';

interface TimeTrackerProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ task, onUpdateTask }) => {
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [sessionNote, setSessionNote] = useState('');
  
  // Ensure timeTracking exists with default values
  const timeTracking = task.timeTracking || {
    sessions: [],
    totalMinutes: 0,
    isActive: false,
    activeSessionStart: undefined
  };

  // Helper function to safely parse timestamp
  const parseTimestamp = useCallback((timestamp: any): number | null => {
    if (!timestamp) return null;
    
    try {
      // If it's already a Date object
      if (timestamp instanceof Date) {
        const time = timestamp.getTime();
        return isNaN(time) ? null : time;
      }
      
      // If it's a Firestore Timestamp object
      if (timestamp.seconds !== undefined) {
        return timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000;
      }
      
      // If it's a string or number
      const parsed = new Date(timestamp);
      const time = parsed.getTime();
      return isNaN(time) ? null : time;
    } catch (error) {
      console.error('Error parsing timestamp:', error, timestamp);
      return null;
    }
  }, []);

  // Effect to handle timer updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timeTracking.isActive && timeTracking.activeSessionStart) {
      const startTime = parseTimestamp(timeTracking.activeSessionStart);
      
      if (startTime) {
        // Set initial time
        const initialElapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
        setCurrentTime(initialElapsed);
        
        // Start interval
        interval = setInterval(() => {
          const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
          setCurrentTime(elapsed);
        }, 1000);
      } else {
        // Invalid timestamp, reset
        setCurrentTime(0);
        const resetTracking = {
          ...timeTracking,
          isActive: false
        };
        // Remove activeSessionStart completely instead of setting to undefined
        delete (resetTracking as any).activeSessionStart;
        onUpdateTask(task.id, { timeTracking: resetTracking });
      }
    } else {
      setCurrentTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timeTracking.isActive, timeTracking.activeSessionStart, parseTimestamp, task.id, onUpdateTask]);

  const startTracking = () => {
    setCurrentTime(0);
    const now = new Date();
    
    const updatedTracking = {
      ...timeTracking,
      isActive: true,
      activeSessionStart: now // Store as Date object
    };
    
    onUpdateTask(task.id, { 
      timeTracking: updatedTracking,
      status: 'in-progress' as const
    });
  };

  const pauseTracking = () => {
    if (!timeTracking.activeSessionStart) return;
    
    const startTime = parseTimestamp(timeTracking.activeSessionStart);
    
    if (!startTime) {
      // Invalid timestamp, just reset
      const resetTracking = {
        ...timeTracking,
        isActive: false
      };
      // Remove activeSessionStart completely instead of setting to undefined
      delete (resetTracking as any).activeSessionStart;
      onUpdateTask(task.id, { timeTracking: resetTracking });
      setCurrentTime(0);
      return;
    }
    
    const sessionSeconds = Math.floor((Date.now() - startTime) / 1000);
    const sessionMinutes = Math.max(0, Math.floor(sessionSeconds / 60));
    
    const newSession: TimeSession = {
      id: Date.now().toString(),
      startTime: new Date(startTime),
      endTime: new Date(),
      minutes: sessionMinutes,
      note: sessionNote
    };

    const updatedTracking = {
      ...timeTracking,
      sessions: [...timeTracking.sessions, newSession],
      totalMinutes: timeTracking.totalMinutes + sessionMinutes,
      isActive: false
    };
    
    // Remove activeSessionStart completely instead of setting to undefined
    delete (updatedTracking as any).activeSessionStart;

    onUpdateTask(task.id, { timeTracking: updatedTracking });
    setSessionNote('');
    setCurrentTime(0);
  };

  const stopTracking = () => {
    pauseTracking();
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDetailedTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) {
      return '00:00';
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return hours > 0
      ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const minutes = Math.floor((endTime.getTime() - start.getTime()) / 1000 / 60);
    return formatTime(minutes);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">{t('timeTracking')}</h3>
        </div>
        <div className="text-sm text-gray-400">
          {t('total')}: {formatTime(timeTracking.totalMinutes)}
          {task.estimatedMinutes && (
            <span className="ml-2">
              / {formatTime(task.estimatedMinutes)} {t('estimated')}
            </span>
          )}
        </div>
      </div>

      {/* Current Session */}
      {timeTracking.isActive && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-blue-400 font-medium">{t('activeSession')}</div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-red-400 font-medium">{t('live')}</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-white font-mono tracking-wider">
                {formatDetailedTime(currentTime)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {currentTime >= 3600 ? t('hoursMinutesSeconds') : t('minutesSeconds')}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={pauseTracking}
                className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                title={t('pause')}
              >
                <PauseIcon className="w-4 h-4" />
              </button>
              <button
                onClick={stopTracking}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                title={t('stop')}
              >
                <StopIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="mt-3">
            <input
              type="text"
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
              placeholder={t('addSessionNote')}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Start Button */}
      {!timeTracking.isActive && (
        <button
          onClick={startTracking}
          className="w-full flex items-center justify-center space-x-2 p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors mb-4 group"
        >
          <PlayIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <div className="font-medium">{t('startTracking')}</div>
            {timeTracking.totalMinutes > 0 && (
              <div className="text-xs text-green-200">
                {t('total')}: {formatTime(timeTracking.totalMinutes)}
              </div>
            )}
          </div>
        </button>
      )}

      {/* Previous Sessions */}
      {timeTracking.sessions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">{t('previousSessions')}</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {timeTracking.sessions.slice(-5).reverse().map((session) => (
              <div key={session.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                <div className="flex-1">
                  <div className="text-sm text-white">{formatTime(session.minutes)}</div>
                  {session.note && (
                    <div className="text-xs text-gray-400">{session.note}</div>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(session.startTime).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTracker;
