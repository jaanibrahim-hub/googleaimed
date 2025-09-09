import React from 'react';

interface HeaderProps {
    imageCount: number;
    onDownloadAll: () => void;
    onEndSession: () => void;
    onShowHistory?: () => void;
    conversationCount?: number;
    currentConversationTitle?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  imageCount, 
  onDownloadAll, 
  onEndSession, 
  onShowHistory,
  conversationCount = 0,
  currentConversationTitle
}) => {
  return (
    <header className="bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] text-white p-5 flex items-center justify-between gap-4 shadow-lg z-10">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-[#2E7D95]">
                <i className="fas fa-stethoscope text-2xl"></i>
            </div>
            <div>
                <h1 className="text-xl font-bold">MediTeach AI</h1>
                <p className="text-sm opacity-90">
                  {currentConversationTitle || 'Transforming medical complexity into understanding'}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
            {onShowHistory && (
              <button
                  onClick={onShowHistory}
                  className="bg-white/20 hover:bg-white/30 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 relative"
                  title="View conversation history"
              >
                  <i className="fas fa-history"></i>
                  <span className="hidden md:inline">History</span>
                  {conversationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {conversationCount > 99 ? '99+' : conversationCount}
                    </span>
                  )}
              </button>
            )}
            
            <button
                onClick={onDownloadAll}
                disabled={imageCount === 0}
                className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white font-semibold px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                title="Download all generated images"
            >
                <i className="fas fa-download"></i>
                <span className="hidden sm:inline">Images ({imageCount})</span>
            </button>
            
             <button
                onClick={onEndSession}
                className="bg-red-500/20 hover:bg-red-500/30 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                title="End session and clear API key"
            >
                <i className="fas fa-sign-out-alt"></i>
                <span className="hidden sm:inline">End Session</span>
            </button>
        </div>
    </header>
  );
};

export default Header;
