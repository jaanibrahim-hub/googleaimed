import React, { useState } from 'react';
import { Conversation } from '../types';
import ExportDialog from './ExportDialog';

interface ExportButtonProps {
  conversation: Conversation;
  className?: string;
  variant?: 'icon' | 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  conversation, 
  className = '', 
  variant = 'icon', 
  size = 'md',
  showLabel = false 
}) => {
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Check if conversation has messages to export
  const hasMessages = conversation.messages && conversation.messages.length > 0;

  if (!hasMessages) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const iconSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const ExportIcon = () => (
    <svg 
      className={iconSizeClasses[size]} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
      />
    </svg>
  );

  const handleExportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowExportDialog(true);
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleExportClick}
          className={`
            ${sizeClasses[size]}
            flex items-center justify-center
            text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-700
            rounded-md transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
            ${className}
          `}
          title="Export conversation"
          aria-label="Export conversation"
        >
          <ExportIcon />
        </button>
        {showExportDialog && (
          <ExportDialog
            isOpen={showExportDialog}
            onClose={() => setShowExportDialog(false)}
            conversation={conversation}
          />
        )}
      </>
    );
  }

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleExportClick}
          className={`
            bg-gradient-to-r from-[#E8F4F8] to-[#D1E9F0] border border-[#B8DCE6] text-xs text-[#2E7D95] px-3 py-1 rounded-full hover:from-[#2E7D95] hover:to-[#4A90A4] hover:text-white transition-all
            inline-flex items-center justify-center gap-2
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
            ${className}
          `}
        >
          <ExportIcon />
          {showLabel && <span className="font-medium">Export</span>}
        </button>
        {showExportDialog && (
          <ExportDialog
            isOpen={showExportDialog}
            onClose={() => setShowExportDialog(false)}
            conversation={conversation}
          />
        )}
      </>
    );
  }

  if (variant === 'dropdown') {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              ${sizeClasses[size]}
              flex items-center justify-center
              text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700
              rounded-md transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
              ${className}
            `}
            title="Export options"
            aria-label="Export options"
          >
            <ExportIcon />
            <svg 
              className={`ml-1 ${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 z-20 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                <button
                  onClick={(e) => {
                    handleExportClick(e);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Export as PDF
                </button>
                
                <button
                  onClick={(e) => {
                    handleExportClick(e);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export as Word
                </button>
                
                <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
                
                <div className="px-4 py-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {showExportDialog && (
          <ExportDialog
            isOpen={showExportDialog}
            onClose={() => setShowExportDialog(false)}
            conversation={conversation}
          />
        )}
      </>
    );
  }

  return null;
};

export default ExportButton;