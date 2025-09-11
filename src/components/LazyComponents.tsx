import { lazy } from 'react';

// Lazy load heavy components
export const LazyAnalyticsView = lazy(() => import('./AnalyticsView'));
export const LazyCalendarView = lazy(() => import('./CalendarView'));
export const LazyTaskForm = lazy(() => import('./TaskForm'));
export const LazyWorkspaceManager = lazy(() => import('./WorkspaceManager'));
export const LazyFocusTimer = lazy(() => import('./FocusTimer'));

// Loading component
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    <span className="ml-3 text-gray-400">Loading...</span>
  </div>
);
