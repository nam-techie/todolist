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
  const [currentTime, setCurrentTime] = useState(0);
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
        const elapsed = Math.floor((Date.now() - new Date(timeTracking.activeSessionStart!).getTime()) / 1000 / 60);
        setCurrentTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeTracking.isActive, timeTracking.activeSessionStart]);

  const startTracking = () => {
    const updatedTracking = {
      ...timeTracking,
      isActive: true,
      activeSessionStart: new Date()
    };
    
    onUpdateTask(task.id, { 
      timeTracking: updatedTracking,
      status: 'in-progress' as const
    });
    setCurrentTime(0);
  };

  const pauseTracking = () => {
    if (!timeTracking.activeSessionStart) return;
    
    const sessionMinutes = Math.floor((Date.now() - new Date(timeTracking.activeSessionStart).getTime()) / 1000 / 60);
    
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
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-400 font-medium">Active Session</div>
              <div className="text-2xl font-bold text-white">
                {formatTime(currentTime)}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={pauseTracking}
                className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                title="Pause"
              >
                <PauseIcon className="w-4 h-4" />
              </button>
              <button
                onClick={stopTracking}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                title="Stop"
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
              placeholder="Add session note..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Start Button */}
      {!timeTracking.isActive && (
        <button
          onClick={startTracking}
          className="w-full flex items-center justify-center space-x-2 p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors mb-4"
        >
          <PlayIcon className="w-4 h-4" />
          <span>Start Tracking</span>
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
