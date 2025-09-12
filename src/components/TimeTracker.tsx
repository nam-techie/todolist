import React, { useState, useEffect } from 'react';
import { Task, TimeSession } from '../types/Task';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface TimeTrackerProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ task, onUpdateTask }) => {
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [sessionNote, setSessionNote] = useState('');
  
  const timeTracking = task.timeTracking || {
    sessions: [],
    totalMinutes: 0,
    isActive: false
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timeTracking.isActive && timeTracking.activeSessionStart) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(timeTracking.activeSessionStart!).getTime()) / 1000);
        setCurrentTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeTracking.isActive, timeTracking.activeSessionStart]);

  const startTracking = () => {
    setCurrentTime(0);
    const updatedTracking = {
      ...timeTracking,
      isActive: true,
      activeSessionStart: new Date()
    };
    
    onUpdateTask(task.id, { 
      timeTracking: updatedTracking,
      status: 'in-progress' as const
    });
  };

  const pauseTracking = () => {
    if (!timeTracking.activeSessionStart) return;
    
    const sessionSeconds = Math.floor((Date.now() - new Date(timeTracking.activeSessionStart).getTime()) / 1000);
    const sessionMinutes = Math.floor(sessionSeconds / 60);
    
    const newSession: TimeSession = {
      id: Date.now().toString(),
      startTime: new Date(timeTracking.activeSessionStart),
      endTime: new Date(),
      minutes: sessionMinutes,
      note: sessionNote
    };

    const updatedTracking = {
      ...timeTracking,
      sessions: [...timeTracking.sessions, newSession],
      totalMinutes: timeTracking.totalMinutes + sessionMinutes,
      isActive: false,
      activeSessionStart: undefined
    };

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
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
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
          <h3 className="font-semibold text-white">Time Tracking</h3>
        </div>
        <div className="text-sm text-gray-400">
          Total: {formatTime(timeTracking.totalMinutes)}
          {task.estimatedMinutes && (
            <span className="ml-2">
              / {formatTime(task.estimatedMinutes)} estimated
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
                <div className="text-blue-400 font-medium">Active Session</div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-red-400 font-medium">LIVE</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-white font-mono tracking-wider">
                {formatDetailedTime(currentTime)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {currentTime >= 3600 ? 'Hours:Minutes:Seconds' : 'Minutes:Seconds'}
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
            <div className="font-medium">Start Tracking</div>
            {timeTracking.totalMinutes > 0 && (
              <div className="text-xs text-green-200">
                Total: {formatTime(timeTracking.totalMinutes)}
              </div>
            )}
          </div>
        </button>
      )}

      {/* Previous Sessions */}
      {timeTracking.sessions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Previous Sessions</h4>
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
