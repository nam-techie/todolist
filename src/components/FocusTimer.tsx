import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Settings, Timer, Coffee, Trees, Award } from 'lucide-react';
import { focusForestService, ForestStats } from '../services/focusForestService';
import ForestVisualization from './ForestVisualization';

interface FocusTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

type TimerMode = 'focus' | 'break';
type TimerStatus = 'idle' | 'running' | 'paused';

const FOCUS_DURATIONS = [25, 45, 60, 90, 120]; // minutes
const BREAK_DURATIONS = [5, 10, 15]; // minutes

function FocusTimer({ isOpen, onClose }: FocusTimerProps) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [showSettings, setShowSettings] = useState(false);
  const [showForest, setShowForest] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [forestStats, setForestStats] = useState<ForestStats>(focusForestService.getStats());
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status]);

  useEffect(() => {
    // Create audio for notification
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
  }, []);

  const handleTimerComplete = () => {
    setStatus('idle');
    
    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    if (mode === 'focus' && sessionStartTime) {
      // Save completed focus session to forest
      const sessionData = {
        startTime: sessionStartTime,
        endTime: new Date(),
        duration: selectedDuration,
        completed: true,
        date: new Date().toISOString().split('T')[0]
      };
      
      focusForestService.saveSession(sessionData);
      setForestStats(focusForestService.getStats());
      setSessions(prev => prev + 1);
      setSessionStartTime(null);
      
      setMode('break');
      setTimeLeft(5 * 60); // 5 minute break
      setSelectedDuration(5);
    } else {
      setMode('focus');
      setTimeLeft(selectedDuration * 60);
    }

    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification(
        mode === 'focus' ? '🌳 Focus session complete! Tree planted!' : 'Break time over!',
        {
          body: mode === 'focus' ? 'Time for a break! Your forest is growing!' : 'Ready for another focus session?',
          icon: '/vite.svg'
        }
      );
    }
  };

  const startTimer = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setStatus('running');
    
    // Record session start time for focus mode
    if (mode === 'focus') {
      setSessionStartTime(new Date());
    }
  };

  const pauseTimer = () => {
    setStatus('paused');
  };

  const stopTimer = () => {
    setStatus('idle');
    setTimeLeft(selectedDuration * 60);
    setSessionStartTime(null); // Reset session start time
  };

  const resetTimer = (duration: number) => {
    setSelectedDuration(duration);
    setTimeLeft(duration * 60);
    setStatus('idle');
    setShowSettings(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    const totalTime = selectedDuration * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Focus Timer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {showSettings ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Focus Duration</h3>
                <div className="grid grid-cols-3 gap-2">
                  {FOCUS_DURATIONS.map(duration => (
                    <button
                      key={duration}
                      onClick={() => resetTimer(duration)}
                      className={`p-3 rounded-lg font-medium transition-colors ${
                        selectedDuration === duration
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {duration}m
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Back to Timer
              </button>
            </div>
          ) : showForest ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
                  <Trees className="w-5 h-5 text-green-400" />
                  <span>Your Forest</span>
                </h3>
                <ForestVisualization trees={focusForestService.getTrees()} />
              </div>
              
              {/* Forest Stats */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">{forestStats.treesPlanted}</div>
                    <div className="text-sm text-gray-400">Trees Planted</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{forestStats.currentStreak}</div>
                    <div className="text-sm text-gray-400">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{forestStats.forestLevel}</div>
                    <div className="text-sm text-gray-400">Forest Level</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{Math.floor(forestStats.totalMinutes / 60)}h</div>
                    <div className="text-sm text-gray-400">Total Focus</div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowForest(false)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Back to Timer
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Timer Display */}
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-gray-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                      className={mode === 'focus' ? 'text-green-500' : 'text-blue-500'}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold text-white mb-2">
                      {formatTime(timeLeft)}
                    </div>
                    <div className={`text-sm font-medium ${
                      mode === 'focus' ? 'text-green-400' : 'text-blue-400'
                    }`}>
                      {mode === 'focus' ? (
                        <div className="flex items-center space-x-1">
                          <Timer className="w-4 h-4" />
                          <span>Focus Time</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <Coffee className="w-4 h-4" />
                          <span>Break Time</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                {status === 'idle' && (
                  <button
                    onClick={startTimer}
                    className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full transition-colors"
                  >
                    <Play className="w-6 h-6" />
                  </button>
                )}
                {status === 'running' && (
                  <button
                    onClick={pauseTimer}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-full transition-colors"
                  >
                    <Pause className="w-6 h-6" />
                  </button>
                )}
                {status === 'paused' && (
                  <>
                    <button
                      onClick={startTimer}
                      className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full transition-colors"
                    >
                      <Play className="w-6 h-6" />
                    </button>
                    <button
                      onClick={stopTimer}
                      className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors"
                    >
                      <Square className="w-6 h-6" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowSettings(true)}
                  className="bg-gray-600 hover:bg-gray-500 text-white p-4 rounded-full transition-colors"
                >
                  <Settings className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setShowForest(true)}
                  className="bg-green-600 hover:bg-green-500 text-white p-4 rounded-full transition-colors"
                >
                  <Trees className="w-6 h-6" />
                </button>
              </div>

              {/* Stats */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{focusForestService.getTodayStats().sessions}</div>
                    <div className="text-sm text-gray-400">Sessions Today</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{focusForestService.getTodayStats().minutes}</div>
                    <div className="text-sm text-gray-400">Minutes Focused</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{focusForestService.getTodayStats().trees}</div>
                    <div className="text-sm text-gray-400 flex items-center justify-center space-x-1">
                      <Trees className="w-3 h-3" />
                      <span>Trees</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FocusTimer;