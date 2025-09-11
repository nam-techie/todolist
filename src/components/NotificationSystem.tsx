import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onRemove }) => {
  const { t } = useLanguage();

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return (
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-2.5 h-1.5 border-2 border-white border-t-0 border-r-0 transform rotate-45 translate-x-0.5 -translate-y-0.5"></div>
          </div>
        );
      case 'error':
        return (
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center relative">
            <div className="w-2.5 h-0.5 bg-white transform rotate-45"></div>
            <div className="w-2.5 h-0.5 bg-white transform -rotate-45 absolute"></div>
          </div>
        );
      case 'warning':
        return (
          <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center relative">
            <div className="w-0.5 h-2 bg-white"></div>
            <div className="w-1 h-1 bg-white rounded-full absolute bottom-0.5"></div>
          </div>
        );
      case 'info':
        return (
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center relative">
            <div className="w-0.5 h-2 bg-white"></div>
            <div className="w-1 h-1 bg-white rounded-full absolute top-0.5"></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
          getStyles={getNotificationStyles}
          getIcon={getNotificationIcon}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
  getStyles: (type: Notification['type']) => string;
  getIcon: (type: Notification['type']) => React.ReactNode;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRemove,
  getStyles,
  getIcon
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        handleRemove();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`border rounded-lg p-4 shadow-lg ${getStyles(notification.type)}`}>
        <div className="flex items-start space-x-3">
          {getIcon(notification.type)}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">{notification.title}</h4>
            <p className="text-sm opacity-90 mt-1">{notification.message}</p>
          </div>
          <button
            onClick={handleRemove}
            className="flex-shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
          >
            <div className="w-4 h-4 relative">
              <div className="w-3 h-0.5 bg-current transform rotate-45 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="w-3 h-0.5 bg-current transform -rotate-45 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSystem;
