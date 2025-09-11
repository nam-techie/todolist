import { Task, Workspace } from '../types/Task';

export interface ExportData {
  tasks: Task[];
  workspaces: Workspace[];
  exportDate: string;
  version: string;
}

export const exportData = (tasks: Task[], workspaces: Workspace[]): string => {
  const exportData: ExportData = {
    tasks,
    workspaces,
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  };

  return JSON.stringify(exportData, null, 2);
};

export const downloadFile = (content: string, filename: string, contentType: string = 'application/json') => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importData = (jsonString: string): ExportData | null => {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate structure
    if (!data.tasks || !Array.isArray(data.tasks)) {
      throw new Error('Invalid tasks data');
    }
    
    if (!data.workspaces || !Array.isArray(data.workspaces)) {
      throw new Error('Invalid workspaces data');
    }

    // Validate task structure
    for (const task of data.tasks) {
      if (!task.id || !task.title || !task.status || !task.priority) {
        throw new Error('Invalid task structure');
      }
    }

    // Validate workspace structure
    for (const workspace of data.workspaces) {
      if (!workspace.id || !workspace.name) {
        throw new Error('Invalid workspace structure');
      }
    }

    return data as ExportData;
  } catch (error) {
    console.error('Import error:', error);
    return null;
  }
};

export const exportToCSV = (tasks: Task[]): string => {
  const headers = ['Title', 'Description', 'Priority', 'Status', 'Due Date', 'Tags', 'Workspace', 'Created At', 'Estimated Minutes'];
  
  const csvData = [
    headers.join(','),
    ...tasks.map(task => [
      `"${task.title.replace(/"/g, '""')}"`,
      `"${(task.description || '').replace(/"/g, '""')}"`,
      task.priority,
      task.status,
      task.dueDate || '',
      `"${task.tags.join('; ')}"`,
      task.workspaceId,
      new Date(task.createdAt).toISOString(),
      task.estimatedMinutes || ''
    ].join(','))
  ];

  return csvData.join('\n');
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsText(file);
  });
};
