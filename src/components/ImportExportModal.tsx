import React, { useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Task, Workspace } from '../types/Task';
import { exportData, exportToCSV, downloadFile, importData, readFileAsText, ExportData } from '../utils/importExport';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  workspaces: Workspace[];
  onImport: (data: ExportData) => void;
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  workspaces,
  onImport
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importError, setImportError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const jsonData = exportData(tasks, workspaces);
    const filename = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(jsonData, filename, 'application/json');
  };

  const handleExportCSV = () => {
    const csvData = exportToCSV(tasks);
    const filename = `taskflow-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csvData, filename, 'text/csv');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus('loading');
    setImportError('');

    try {
      const content = await readFileAsText(file);
      const importedData = importData(content);

      if (!importedData) {
        throw new Error('Invalid file format or corrupted data');
      }

      onImport(importedData);
      setImportStatus('success');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Unknown error occurred');
      setImportStatus('error');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Import & Export
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <div className="w-5 h-5 relative text-gray-400">
              <div className="absolute w-4 h-0.5 bg-current transform rotate-45 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute w-4 h-0.5 bg-current transform -rotate-45 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'export'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 relative">
                <div className="absolute top-1 left-1 right-1 bottom-0 border border-current"></div>
                <div className="absolute top-0 left-2 right-2 h-1 bg-current"></div>
                <div className="absolute bottom-2 left-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-current transform -translate-x-1/2"></div>
              </div>
              <span>Export</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'import'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 relative">
                <div className="absolute top-0 left-1 right-1 bottom-1 border border-current"></div>
                <div className="absolute top-2 left-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-current transform -translate-x-1/2"></div>
              </div>
              <span>Import</span>
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Export Your Data
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Download your tasks and workspaces as a backup file.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 text-blue-600 dark:text-blue-400">
                        <div className="w-full h-full border border-current rounded"></div>
                        <div className="absolute top-1 left-1 right-1 h-0.5 bg-current"></div>
                        <div className="absolute top-2.5 left-1 right-1 h-0.5 bg-current"></div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">JSON Backup</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Complete backup with all data
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <div className="w-5 h-5">
                      <div className="w-full h-0.5 bg-current transform rotate-45 translate-y-2"></div>
                      <div className="w-full h-0.5 bg-current transform -rotate-45 translate-y-1.5"></div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 text-green-600 dark:text-green-400">
                        <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                          <div className="bg-current"></div>
                          <div className="bg-current"></div>
                          <div className="bg-current"></div>
                          <div className="bg-current"></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">CSV Export</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Tasks only, spreadsheet format
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <div className="w-5 h-5">
                      <div className="w-full h-0.5 bg-current transform rotate-45 translate-y-2"></div>
                      <div className="w-full h-0.5 bg-current transform -rotate-45 translate-y-1.5"></div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Import Your Data
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Restore your tasks and workspaces from a backup file.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleImportClick}
                  disabled={importStatus === 'loading'}
                  className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-400 dark:hover:border-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importStatus === 'loading' ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600 dark:text-gray-400">Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 text-gray-400">
                        <div className="w-full h-full border-2 border-current rounded"></div>
                        <div className="absolute top-1/2 left-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-current transform -translate-x-1/2 -translate-y-1"></div>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Click to select JSON backup file
                      </span>
                    </div>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {importStatus === 'success' && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2.5 h-1.5 border-2 border-white border-t-0 border-r-0 transform rotate-45 translate-x-0.5 -translate-y-0.5"></div>
                      </div>
                      <span className="text-green-800 dark:text-green-200 text-sm font-medium">
                        Import successful!
                      </span>
                    </div>
                  </div>
                )}

                {importStatus === 'error' && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center relative">
                        <div className="w-2.5 h-0.5 bg-white transform rotate-45"></div>
                        <div className="w-2.5 h-0.5 bg-white transform -rotate-45 absolute"></div>
                      </div>
                      <div className="flex-1">
                        <div className="text-red-800 dark:text-red-200 text-sm font-medium">
                          Import failed
                        </div>
                        <div className="text-red-600 dark:text-red-400 text-xs mt-1">
                          {importError}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                <strong>Note:</strong> Importing will merge with your existing data. 
                Duplicate items will be skipped.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExportModal;
