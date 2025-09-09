import React, { useState, useCallback } from 'react';
import { Conversation } from '../types';
import { ExportOptions, exportService } from '../services/exportService';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose, conversation }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeMetadata: true,
    includeImages: true,
    includeTimestamps: true,
    theme: 'light',
    pageSize: 'A4',
    fontSize: 'medium'
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState(conversation.title || '');
  const [author, setAuthor] = useState('');
  const [subject, setSubject] = useState('');

  const estimate = exportService.estimateExportSize(conversation, exportOptions);

  const handleExport = useCallback(async () => {
    if (isExporting) return;

    setIsExporting(true);
    setExportError(null);

    try {
      const finalOptions: ExportOptions = {
        ...exportOptions,
        title: customTitle || conversation.title || 'Medical AI Conversation',
        author: author || undefined,
        subject: subject || undefined
      };

      await exportService.exportConversation(conversation, finalOptions);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [conversation, exportOptions, customTitle, author, subject, isExporting, onClose]);

  const handleOptionChange = useCallback(<K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K]
  ) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  if (!isOpen) return null;

  const formats = exportService.getAvailableFormats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Export Conversation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
            disabled={isExporting}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formats.map(format => (
                <label
                  key={format.value}
                  className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    exportOptions.format === format.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={exportOptions.format === format.value}
                    onChange={e => handleOptionChange('format', e.target.value as 'pdf' | 'docx')}
                    className="sr-only"
                    disabled={isExporting}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {format.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {format.description}
                    </div>
                  </div>
                  {exportOptions.format === format.value && (
                    <div className="flex-shrink-0 text-blue-500 ml-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Document Properties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                placeholder="Enter document title"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isExporting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Author (Optional)
              </label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Enter author name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isExporting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject (Optional)
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Enter document subject or description"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isExporting}
            />
          </div>

          {/* Content Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Content Options
            </label>
            <div className="space-y-3">
              {[
                { key: 'includeMetadata', label: 'Include metadata (creation date, message count, etc.)' },
                { key: 'includeImages', label: 'Include image references' },
                { key: 'includeTimestamps', label: 'Include message timestamps' }
              ].map(option => (
                <label key={option.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions[option.key as keyof ExportOptions] as boolean}
                    onChange={e => handleOptionChange(option.key as keyof ExportOptions, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                    disabled={isExporting}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Formatting Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Page Size
              </label>
              <select
                value={exportOptions.pageSize}
                onChange={e => handleOptionChange('pageSize', e.target.value as 'A4' | 'Letter')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isExporting}
              >
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Size
              </label>
              <select
                value={exportOptions.fontSize}
                onChange={e => handleOptionChange('fontSize', e.target.value as 'small' | 'medium' | 'large')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isExporting}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <select
                value={exportOptions.theme}
                onChange={e => handleOptionChange('theme', e.target.value as 'light' | 'dark')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isExporting}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>

          {/* Export Estimate */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Export Estimate
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Pages</div>
                <div className="font-medium text-gray-900 dark:text-white">{estimate.pages}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">File Size</div>
                <div className="font-medium text-gray-900 dark:text-white">{estimate.fileSize}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Processing Time</div>
                <div className="font-medium text-gray-900 dark:text-white">{estimate.processingTime}</div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {exportError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-red-700 dark:text-red-300">
                  {exportError}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''} to export
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
              disabled={isExporting}
            >
              Cancel
            </button>
            
            <button
              onClick={handleExport}
              disabled={isExporting || !customTitle.trim()}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                isExporting || !customTitle.trim()
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  Export {exportOptions.format.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;