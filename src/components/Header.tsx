import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Bars3Icon, ClockIcon, PlusIcon, CheckIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  setShowFocusTimer: (show: boolean) => void;
  setShowTaskForm: (show: boolean) => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  setShowFocusTimer,
  setShowTaskForm,
  onToggleSidebar
}) => {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-300 lg:hidden"
            title={t('toggleSidebar')}
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">{t('appName')}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* User Info */}
          {user && (
            <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-gray-800 rounded-xl">
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=10B981&color=fff`}
                alt="User Avatar"
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-300">
                {user.displayName || user.email?.split('@')[0] || 'User'}
              </span>
            </div>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            className="px-3 py-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-300 text-sm font-medium"
            title={t('language')}
          >
            {language === 'vi' ? 'EN' : 'VI'}
          </button>

          <button
            onClick={() => setShowFocusTimer(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors text-white shadow-lg hover:shadow-blue-500/25"
          >
            <ClockIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{t('focusTimer')}</span>
          </button>
          <button
            onClick={() => setShowTaskForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl transition-colors text-white shadow-lg hover:shadow-green-500/25"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{t('addTask')}</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-white"
            title="Đăng xuất"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
