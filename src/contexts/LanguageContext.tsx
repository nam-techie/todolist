import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // App
    appName: 'TaskFlow',
    
    // Header
    focusTimer: 'Focus Timer',
    addTask: 'Add Task',
    
    // Sidebar
    listView: 'List View',
    calendarView: 'Calendar View',
    analyticsView: 'Analytics View',
    workspaces: 'Workspaces',
    totalTasks: 'Total Tasks',
    completed: 'Completed',
    
    // Main Content
    defaultWorkspace: 'Personal',
    listViewDesc: 'Manage your tasks efficiently',
    calendarViewDesc: 'View your tasks in calendar format',
    analyticsViewDesc: 'Track your productivity and progress',
    
    // Task Form
    createNewTask: 'Create New Task',
    editTask: 'Edit Task',
    taskTitle: 'Task Title',
    taskTitlePlaceholder: 'Enter task title...',
    description: 'Description',
    descriptionPlaceholder: 'Add task description...',
    priority: 'Priority',
    lowPriority: 'Low Priority',
    mediumPriority: 'Medium Priority',
    highPriority: 'High Priority',
    status: 'Status',
    pending: 'Pending',
    inProgress: 'In Progress',
    dueDate: 'Due Date',
    selectDueDate: 'Select due date and time',
    estimatedTime: 'Estimated Time (minutes)',
    workspace: 'Workspace',
    tags: 'Tags',
    addTagPlaceholder: 'Add a tag...',
    add: 'Add',
    cancel: 'Cancel',
    createTask: 'Create Task',
    updateTask: 'Update Task',
    
    // ListView
    searchTasks: 'Search tasks...',
    filters: 'Filters',
    all: 'All',
    sortBy: 'Sort by',
    createdDate: 'Created Date',
    title: 'Title',
    order: 'Order',
    descending: 'Descending',
    ascending: 'Ascending',
    noTasksFound: 'No tasks found',
    adjustFilters: 'Try adjusting your search or filters',
    overdue: 'Overdue',
    dueIn: 'Due in',
    days: 'days',
    hours: 'h',
    markDone: 'Mark Done',
    done: 'Done',
    
    // Calendar
    selectDate: 'Select a date',
    tasksdue: 'tasks due',
    noTasksThisDay: 'No tasks due this day',
    selectDateToView: 'Select a date to view tasks',
    today: 'Today',
    clear: 'Clear',
    
    // Theme
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    
    // Language
    language: 'Language',
    english: 'English',
    vietnamese: 'Tiếng Việt',
    
    // Settings
    settings: 'Settings',
    toggleSidebar: 'Toggle Sidebar',
    
    // Time
    min: 'min',
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
    
    // Days
    sun: 'Sun',
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat'
  },
  vi: {
    // App
    appName: 'TaskFlow',
    
    // Header
    focusTimer: 'Hẹn Giờ Tập Trung',
    addTask: 'Thêm Việc',
    
    // Sidebar
    listView: 'Danh Sách',
    calendarView: 'Lịch',
    analyticsView: 'Thống Kê',
    workspaces: 'Không Gian Làm Việc',
    totalTasks: 'Tổng Công Việc',
    completed: 'Hoàn Thành',
    
    // Main Content
    defaultWorkspace: 'Cá Nhân',
    listViewDesc: 'Quản lý công việc hiệu quả',
    calendarViewDesc: 'Xem công việc theo lịch',
    analyticsViewDesc: 'Theo dõi năng suất và tiến độ',
    
    // Task Form
    createNewTask: 'Tạo Công Việc Mới',
    editTask: 'Sửa Công Việc',
    taskTitle: 'Tên Công Việc',
    taskTitlePlaceholder: 'Nhập tên công việc...',
    description: 'Mô Tả',
    descriptionPlaceholder: 'Thêm mô tả công việc...',
    priority: 'Ưu Tiên',
    lowPriority: 'Ưu Tiên Thấp',
    mediumPriority: 'Ưu Tiên Trung Bình',
    highPriority: 'Ưu Tiên Cao',
    status: 'Trạng Thái',
    pending: 'Chờ Xử Lý',
    inProgress: 'Đang Thực Hiện',
    dueDate: 'Hạn Chót',
    selectDueDate: 'Chọn ngày và giờ hạn chót',
    estimatedTime: 'Thời Gian Ước Tính (phút)',
    workspace: 'Không Gian Làm Việc',
    tags: 'Thẻ',
    addTagPlaceholder: 'Thêm thẻ...',
    add: 'Thêm',
    cancel: 'Hủy',
    createTask: 'Tạo Công Việc',
    updateTask: 'Cập Nhật',
    
    // ListView
    searchTasks: 'Tìm kiếm công việc...',
    filters: 'Bộ Lọc',
    all: 'Tất Cả',
    sortBy: 'Sắp Xếp Theo',
    createdDate: 'Ngày Tạo',
    title: 'Tên',
    order: 'Thứ Tự',
    descending: 'Giảm Dần',
    ascending: 'Tăng Dần',
    noTasksFound: 'Không tìm thấy công việc',
    adjustFilters: 'Thử điều chỉnh tìm kiếm hoặc bộ lọc',
    overdue: 'Quá Hạn',
    dueIn: 'Còn',
    days: 'ngày',
    hours: 'giờ',
    markDone: 'Đánh Dấu Xong',
    done: 'Xong',
    
    // Calendar
    selectDate: 'Chọn ngày',
    tasksdue: 'công việc đến hạn',
    noTasksThisDay: 'Không có công việc nào đến hạn hôm nay',
    selectDateToView: 'Chọn ngày để xem công việc',
    today: 'Hôm Nay',
    clear: 'Xóa',
    
    // Theme
    lightMode: 'Chế Độ Sáng',
    darkMode: 'Chế Độ Tối',
    
    // Language
    language: 'Ngôn Ngữ',
    english: 'English',
    vietnamese: 'Tiếng Việt',
    
    // Settings
    settings: 'Cài Đặt',
    toggleSidebar: 'Ẩn/Hiện Thanh Bên',
    
    // Time
    min: 'phút',
    january: 'Tháng 1',
    february: 'Tháng 2',
    march: 'Tháng 3',
    april: 'Tháng 4',
    may: 'Tháng 5',
    june: 'Tháng 6',
    july: 'Tháng 7',
    august: 'Tháng 8',
    september: 'Tháng 9',
    october: 'Tháng 10',
    november: 'Tháng 11',
    december: 'Tháng 12',
    
    // Days
    sun: 'CN',
    mon: 'T2',
    tue: 'T3',
    wed: 'T4',
    thu: 'T5',
    fri: 'T6',
    sat: 'T7'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
