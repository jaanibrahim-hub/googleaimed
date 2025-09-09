import React, { useState } from 'react';
import { Message, Conversation } from '../types';
import ShareDialog from './ShareDialog';
import SharingService from '../services/sharingService';

interface ShareButtonProps {
  content: Message | Conversation | Message[];
  contentType: 'message' | 'conversation' | 'multiple';
  className?: string;
  variant?: 'icon' | 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  content,
  contentType,
  className = '',
  variant = 'icon',
  size = 'md',
  showLabel = false
}) => {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const sharingService = SharingService.getInstance();

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const handleQuickCopy = async () => {
    let textContent = '';
    
    if (contentType === 'message') {
      const message = content as Message;
      textContent = sharingService.formatMessage(message, {
        includeImages: false,
        includeMetadata: false,
        format: 'text',
        privacy: 'personal'
      });
    } else if (contentType === 'conversation') {
      const conversation = content as Conversation;
      const shareableContent = sharingService.formatConversation(conversation, {
        includeImages: false,
        includeMetadata: true,
        format: 'text',
        privacy: 'personal'
      });
      textContent = shareableContent.content;
    } else if (contentType === 'multiple') {
      const messages = content as Message[];
      const shareableContent = await sharingService.shareMultipleMessages(messages, {
        includeImages: false,
        includeMetadata: true,
        format: 'text',
        privacy: 'personal'
      });
      textContent = shareableContent.content;
    }

    const success = await sharingService.copyToClipboard(textContent);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setShowQuickActions(false);
    }
  };

  const handleQuickShare = async () => {
    let shareableContent;
    
    if (contentType === 'message') {
      const message = content as Message;
      const formatted = sharingService.formatMessage(message, {
        includeImages: true,
        includeMetadata: false,
        format: 'text',
        privacy: 'personal'
      });
      shareableContent = {
        id: message.id,
        type: 'message' as const,
        title: 'Medical Response',
        content: formatted,
        metadata: {
          timestamp: message.timestamp || Date.now(),
          hasImages: !!message.imageUrl,
        },
        images: message.imageUrl ? [message.imageUrl] : [],
        format: 'text' as const,
      };
    } else if (contentType === 'conversation') {
      const conversation = content as Conversation;
      shareableContent = sharingService.formatConversation(conversation, {
        includeImages: true,
        includeMetadata: true,
        format: 'text',
        privacy: 'personal'
      });
    } else {
      const messages = content as Message[];
      shareableContent = await sharingService.shareMultipleMessages(messages, {
        includeImages: true,
        includeMetadata: true,
        format: 'text',
        privacy: 'personal'
      });
    }

    const success = await sharingService.shareContent(shareableContent);
    if (!success) {
      // Fallback to copy
      await handleQuickCopy();
    }
    setShowQuickActions(false);
  };

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className={`
            flex items-center gap-2 p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700
            ${sizeClasses[size]} ${className}
          `}
          title="Share options"
        >
          <i className="fas fa-share-alt"></i>
          {showLabel && <span className="text-sm">Share</span>}
          <i className="fas fa-chevron-down text-xs"></i>
        </button>

        {showQuickActions && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowQuickActions(false)}
            />
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
              <div className="py-1">
                <button
                  onClick={handleQuickCopy}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors theme-text"
                >
                  <i className={`fas ${copySuccess ? 'fa-check text-green-500' : 'fa-copy text-blue-500'}`}></i>
                  {copySuccess ? 'Copied!' : 'Quick Copy'}
                </button>
                
                {navigator.share && (
                  <button
                    onClick={handleQuickShare}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors theme-text"
                  >
                    <i className="fas fa-share text-green-500"></i>
                    Quick Share
                  </button>
                )}
                
                <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    setShowShareDialog(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors theme-text"
                >
                  <i className="fas fa-cog text-purple-500"></i>
                  More Options...
                </button>
              </div>
            </div>
          </>
        )}

        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          content={content}
          contentType={contentType}
        />
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={() => setShowShareDialog(true)}
          className={`
            flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors
            ${className}
          `}
        >
          <i className="fas fa-share-alt"></i>
          {showLabel && <span>Share</span>}
        </button>

        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          content={content}
          contentType={contentType}
        />
      </>
    );
  }

  // Default icon variant
  return (
    <>
      <button
        onClick={() => setShowShareDialog(true)}
        className={`
          flex items-center justify-center rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-700 p-2
          ${sizeClasses[size]} ${className}
        `}
        title="Share this content"
      >
        <i className="fas fa-share-alt text-gray-500 hover:text-blue-500"></i>
      </button>

      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        content={content}
        contentType={contentType}
      />
    </>
  );
};

export default ShareButton;