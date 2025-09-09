import React, { useState, useEffect } from 'react';
import { Message, Conversation, ShareOptions, ShareableContent } from '../types';
import SharingService from '../services/sharingService';
import { useTheme } from '../hooks/useTheme';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: Message | Conversation | Message[] | null;
  contentType: 'message' | 'conversation' | 'multiple';
  title?: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  content,
  contentType,
  title = 'Share Medical Information'
}) => {
  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    includeImages: true,
    includeMetadata: true,
    format: 'text',
    privacy: 'personal'
  });
  
  const [shareableContent, setShareableContent] = useState<ShareableContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'copy' | 'share' | 'download'>('copy');
  
  const sharingService = SharingService.getInstance();
  const { isDarkMode } = useTheme();

  // Generate shareable content when options change
  useEffect(() => {
    if (content && isOpen) {
      generateShareableContent();
    }
  }, [content, shareOptions, isOpen]);

  const generateShareableContent = async () => {
    if (!content) return;
    
    setIsGenerating(true);
    try {
      let generated: ShareableContent;
      
      if (contentType === 'conversation') {
        generated = sharingService.formatConversation(content as Conversation, shareOptions);
      } else if (contentType === 'multiple') {
        generated = await sharingService.shareMultipleMessages(content as Message[], shareOptions);
      } else {
        const message = content as Message;
        const formattedContent = sharingService.formatMessage(message, shareOptions);
        generated = {
          id: message.id,
          type: 'message',
          title: `Medical Response - ${new Date().toLocaleDateString()}`,
          content: formattedContent,
          metadata: {
            timestamp: message.timestamp || Date.now(),
            hasImages: !!message.imageUrl,
          },
          images: shareOptions.includeImages && message.imageUrl ? [message.imageUrl] : [],
          format: shareOptions.format,
        };
      }
      
      setShareableContent(generated);
    } catch (error) {
      console.error('Failed to generate shareable content:', error);
    }
    setIsGenerating(false);
  };

  const handleCopyToClipboard = async () => {
    if (!shareableContent) return;
    
    const success = await sharingService.copyToClipboard(
      shareableContent.content,
      shareOptions.format === 'html' ? 'html' : 'text'
    );
    
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (!shareableContent) return;
    
    const success = await sharingService.shareContent(shareableContent);
    if (!success) {
      // Fallback to copy if native share fails
      handleCopyToClipboard();
    }
  };

  const handleEmailShare = () => {
    if (!shareableContent) return;
    
    sharingService.shareViaEmail(shareableContent, {
      subject: shareableContent.title
    });
  };

  const handleDownload = () => {
    if (!shareableContent) return;
    
    sharingService.downloadContent(shareableContent);
  };

  const handleImageDownload = async (imageUrl: string) => {
    await sharingService.shareImage(imageUrl, 'Medical Image');
  };

  if (!isOpen || !content) return null;

  const formatOptions = [
    { value: 'text', label: 'Plain Text', icon: 'fas fa-align-left' },
    { value: 'markdown', label: 'Markdown', icon: 'fab fa-markdown' },
    { value: 'html', label: 'HTML', icon: 'fab fa-html5' },
    { value: 'json', label: 'JSON', icon: 'fas fa-code' }
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="theme-modal w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border">
          <h2 className="text-xl font-semibold theme-text flex items-center gap-2">
            <i className="fas fa-share-alt text-blue-500"></i>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b theme-border">
          {[
            { id: 'copy', name: 'Copy & Paste', icon: 'fas fa-copy' },
            { id: 'share', name: 'Share', icon: 'fas fa-share-alt' },
            { id: 'download', name: 'Download', icon: 'fas fa-download' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-6 py-3 font-medium transition-colors flex-1
                ${activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'theme-text-secondary hover:text-blue-500'
                }
              `}
            >
              <i className={`${tab.icon} text-sm`}></i>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Share Options */}
          <div className="space-y-4 mb-6">
            <h3 className="font-medium theme-text">Share Options</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium theme-text mb-2">Format</label>
                <select
                  value={shareOptions.format}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, format: e.target.value as any }))}
                  className="w-full theme-input"
                >
                  {formatOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Privacy Selection */}
              <div>
                <label className="block text-sm font-medium theme-text mb-2">Privacy</label>
                <select
                  value={shareOptions.privacy}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, privacy: e.target.value as any }))}
                  className="w-full theme-input"
                >
                  <option value="personal">Include Personal Info</option>
                  <option value="anonymous">Anonymous (Remove Personal Info)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={shareOptions.includeImages}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, includeImages: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm theme-text">Include Images</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={shareOptions.includeMetadata}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm theme-text">Include Timestamps & Metadata</span>
              </label>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'copy' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium theme-text">Preview & Copy</h4>
                <button
                  onClick={handleCopyToClipboard}
                  disabled={isGenerating}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                    ${copySuccess 
                      ? 'bg-green-500 text-white' 
                      : 'theme-button-primary hover:scale-105'
                    }
                  `}
                >
                  <i className={`fas ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
                  {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>

              {isGenerating ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-3"></div>
                  <span>Generating content...</span>
                </div>
              ) : shareableContent ? (
                <div className="theme-surface border theme-border rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm theme-text font-mono">
                    {shareableContent.content}
                  </pre>
                </div>
              ) : null}
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-4">
              <h4 className="font-medium theme-text">Share Options</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Native Share */}
                {navigator.share && (
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center gap-3 p-4 theme-surface border theme-border rounded-lg hover:shadow-md transition-all"
                  >
                    <i className="fas fa-share-alt text-blue-500 text-xl"></i>
                    <div className="text-left">
                      <div className="font-medium theme-text">Native Share</div>
                      <div className="text-sm theme-text-secondary">Use device sharing</div>
                    </div>
                  </button>
                )}

                {/* Email */}
                <button
                  onClick={handleEmailShare}
                  className="flex items-center gap-3 p-4 theme-surface border theme-border rounded-lg hover:shadow-md transition-all"
                >
                  <i className="fas fa-envelope text-red-500 text-xl"></i>
                  <div className="text-left">
                    <div className="font-medium theme-text">Email</div>
                    <div className="text-sm theme-text-secondary">Send via email</div>
                  </div>
                </button>

                {/* Copy Link */}
                <button
                  onClick={async () => {
                    if (shareableContent) {
                      const link = sharingService.generateShareableLink(shareableContent);
                      if (link) {
                        await sharingService.copyToClipboard(link);
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                      }
                    }
                  }}
                  className="flex items-center gap-3 p-4 theme-surface border theme-border rounded-lg hover:shadow-md transition-all"
                >
                  <i className="fas fa-link text-green-500 text-xl"></i>
                  <div className="text-left">
                    <div className="font-medium theme-text">Copy Link</div>
                    <div className="text-sm theme-text-secondary">Generate shareable link</div>
                  </div>
                </button>

                {/* Social Media Placeholder */}
                <button
                  onClick={() => {
                    const text = encodeURIComponent(`Medical information from MediTeach AI: ${shareableContent?.title}`);
                    const url = encodeURIComponent(window.location.href);
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                  }}
                  className="flex items-center gap-3 p-4 theme-surface border theme-border rounded-lg hover:shadow-md transition-all"
                >
                  <i className="fab fa-twitter text-blue-400 text-xl"></i>
                  <div className="text-left">
                    <div className="font-medium theme-text">Twitter</div>
                    <div className="text-sm theme-text-secondary">Share on Twitter</div>
                  </div>
                </button>
              </div>

              {/* Individual Images */}
              {shareableContent?.images && shareableContent.images.length > 0 && (
                <div className="mt-6">
                  <h5 className="font-medium theme-text mb-3">Share Individual Images</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {shareableContent.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Medical image ${index + 1}`}
                          className="w-full h-24 object-cover rounded border theme-border"
                        />
                        <button
                          onClick={() => handleImageDownload(imageUrl)}
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded"
                        >
                          <i className="fas fa-download text-white"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'download' && (
            <div className="space-y-4">
              <h4 className="font-medium theme-text">Download Options</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formatOptions.map(format => (
                  <button
                    key={format.value}
                    onClick={() => {
                      if (shareableContent) {
                        const content = { ...shareableContent, format: format.value };
                        sharingService.downloadContent(content);
                      }
                    }}
                    className="flex items-center gap-3 p-4 theme-surface border theme-border rounded-lg hover:shadow-md transition-all"
                  >
                    <i className={`${format.icon} text-xl text-blue-500`}></i>
                    <div className="text-left">
                      <div className="font-medium theme-text">{format.label}</div>
                      <div className="text-sm theme-text-secondary">
                        Download as .{format.value === 'text' ? 'txt' : format.value === 'markdown' ? 'md' : format.value}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t theme-border bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2 text-sm theme-text-secondary">
            <i className="fas fa-shield-alt text-green-500"></i>
            <span>
              {shareOptions.privacy === 'anonymous' 
                ? 'Personal information will be removed' 
                : 'Personal information will be included'
              }
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="px-6 py-2 theme-button-primary rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;