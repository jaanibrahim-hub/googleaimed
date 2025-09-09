import React, { useState, useRef } from 'react';
import { conversationStorage } from '../services/conversationStorage';

interface ConversationExportImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (imported: number) => void;
}

const ConversationExportImport: React.FC<ConversationExportImportProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    errors: string[];
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportData = conversationStorage.exportConversations();
      
      // Create and download file
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const timestamp = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `mediteach-conversations-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('📁 Conversations exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export conversations. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = conversationStorage.importConversations(content);
        
        setImportResult(result);
        
        if (result.success && result.imported > 0) {
          onImportComplete?.(result.imported);
        }
      } catch (error) {
        setImportResult({
          success: false,
          imported: 0,
          errors: [`Failed to read file: ${error}`]
        });
      } finally {
        setIsImporting(false);
      }
    };

    reader.onerror = () => {
      setImportResult({
        success: false,
        imported: 0,
        errors: ['Failed to read file']
      });
      setIsImporting(false);
    };

    reader.readAsText(file);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const storageInfo = conversationStorage.getStorageInfo();
  const conversationCount = conversationStorage.getAllConversations().length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] text-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Backup & Restore</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-1"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            <p className="text-sm text-white text-opacity-90 mt-1">
              Save your medical conversations securely
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'export'
                  ? 'text-[#2E7D95] border-b-2 border-[#2E7D95] bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <i className="fas fa-download mr-2"></i>
              Export
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'import'
                  ? 'text-[#2E7D95] border-b-2 border-[#2E7D95] bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <i className="fas fa-upload mr-2"></i>
              Import
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'export' ? (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Conversations</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Download all your medical conversations as a secure JSON file. 
                    This backup includes messages, images references, and conversation metadata.
                  </p>

                  {/* Export Stats */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Conversations:</span>
                        <div className="font-semibold text-gray-900">{conversationCount}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Storage Used:</span>
                        <div className="font-semibold text-gray-900">
                          {(storageInfo.used / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-shield-alt text-green-500"></i>
                      <span>All data stays on your device - nothing sent to servers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-file-medical text-blue-500"></i>
                      <span>Includes all conversation history and medical context</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-clock text-purple-500"></i>
                      <span>Preserves timestamps and conversation flow</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleExport}
                  disabled={isExporting || conversationCount === 0}
                  className="w-full bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isExporting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download"></i>
                      <span>Download Backup</span>
                    </>
                  )}
                </button>

                {conversationCount === 0 && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    No conversations to export
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Conversations</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Restore conversations from a previously exported JSON backup file.
                    Imported conversations will be added to your existing history.
                  </p>

                  {/* Import Instructions */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-exclamation-triangle text-yellow-600 text-sm mt-0.5"></i>
                      <div className="text-xs text-yellow-800">
                        <p className="font-medium mb-1">Important:</p>
                        <ul className="space-y-1">
                          <li>• Only import files exported from MediTeach AI</li>
                          <li>• Imported conversations get new IDs to avoid conflicts</li>
                          <li>• Large imports may take a moment to process</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />

                <button
                  onClick={handleFileSelect}
                  disabled={isImporting}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-[#2E7D95] text-gray-600 hover:text-[#2E7D95] font-medium py-8 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center space-y-2"
                >
                  {isImporting ? (
                    <>
                      <i className="fas fa-spinner fa-spin text-2xl"></i>
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-cloud-upload-alt text-3xl"></i>
                      <span>Select JSON Backup File</span>
                      <span className="text-xs text-gray-500">or drag and drop here</span>
                    </>
                  )}
                </button>

                {/* Import Result */}
                {importResult && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    importResult.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-start space-x-2">
                      <i className={`fas ${
                        importResult.success ? 'fa-check-circle text-green-600' : 'fa-exclamation-circle text-red-600'
                      } text-sm mt-0.5`}></i>
                      <div className="text-xs">
                        {importResult.success ? (
                          <div className="text-green-800">
                            <p className="font-medium mb-1">Import Successful!</p>
                            <p>Imported {importResult.imported} conversations.</p>
                          </div>
                        ) : (
                          <div className="text-red-800">
                            <p className="font-medium mb-1">Import Failed</p>
                            <ul className="space-y-1">
                              {importResult.errors.map((error, index) => (
                                <li key={index}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                <i className="fas fa-database mr-1"></i>
                {storageInfo.percentage.toFixed(1)}% of local storage used
              </span>
              <span>
                <i className="fas fa-shield-alt text-green-500 mr-1"></i>
                Fully private & secure
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConversationExportImport;