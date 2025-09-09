import React, { useState, useEffect } from 'react';

interface OfflineStatusProps {
  onRetry?: () => void;
}

const OfflineStatus: React.FC<OfflineStatusProps> = ({ onRetry }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network: Back online');
      setIsOnline(true);
      
      if (wasOffline) {
        // Show "back online" message briefly
        setShowOfflineMessage(true);
        setTimeout(() => {
          setShowOfflineMessage(false);
          setWasOffline(false);
        }, 3000);
      }
    };

    const handleOffline = () => {
      console.log('📵 Network: Gone offline');
      setIsOnline(false);
      setWasOffline(true);
      setShowOfflineMessage(true);
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  // Don't show anything if online and wasn't recently offline
  if (isOnline && !showOfflineMessage) {
    return null;
  }

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ${
      showOfflineMessage ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className={`mx-auto max-w-md rounded-xl shadow-lg border-2 p-4 ${
        isOnline 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-orange-50 border-orange-200 text-orange-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isOnline ? 'bg-green-100' : 'bg-orange-100'
            }`}>
              <i className={`fas ${
                isOnline ? 'fa-wifi text-green-600' : 'fa-wifi-slash text-orange-600'
              }`}></i>
            </div>
            <div>
              <h4 className="font-semibold text-sm">
                {isOnline ? 'Back Online!' : 'You\'re Offline'}
              </h4>
              <p className="text-xs opacity-75">
                {isOnline 
                  ? 'All features are now available' 
                  : 'Limited functionality available'
                }
              </p>
            </div>
          </div>

          {!isOnline && (
            <div className="flex items-center space-x-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-lg hover:bg-orange-300 transition-colors"
                >
                  <i className="fas fa-redo mr-1"></i>
                  Retry
                </button>
              )}
              <button
                onClick={() => setShowOfflineMessage(false)}
                className="text-orange-600 hover:text-orange-800 transition-colors p-1"
                aria-label="Dismiss offline message"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>
          )}
        </div>

        {/* Offline capabilities */}
        {!isOnline && (
          <div className="mt-3 pt-3 border-t border-orange-200">
            <p className="text-xs font-medium mb-2">Available offline:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <i className="fas fa-comments text-orange-600"></i>
                <span>View cached conversations</span>
              </div>
              <div className="flex items-center space-x-1">
                <i className="fas fa-images text-orange-600"></i>
                <span>Saved medical images</span>
              </div>
              <div className="flex items-center space-x-1">
                <i className="fas fa-book text-orange-600"></i>
                <span>Medical knowledge base</span>
              </div>
              <div className="flex items-center space-x-1">
                <i className="fas fa-download text-orange-600"></i>
                <span>Export conversations</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineStatus;