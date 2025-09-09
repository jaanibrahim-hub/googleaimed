import React, { useState, useEffect } from 'react';

interface PWAUpdateNotificationProps {
  onUpdate?: () => void;
}

const PWAUpdateNotification: React.FC<PWAUpdateNotificationProps> = ({ onUpdate }) => {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Check for service worker updates
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          setRegistration(reg);

          // Check for updates on page load
          reg.update();

          // Listen for waiting service worker
          const handleWaiting = () => {
            if (reg.waiting) {
              console.log('🔄 PWA: New version available');
              setShowUpdateNotification(true);
            }
          };

          // Check immediately
          handleWaiting();

          // Listen for state changes
          reg.addEventListener('updatefound', () => {
            console.log('🔍 PWA: Update found, installing...');
            const newWorker = reg.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'waiting') {
                  console.log('⏳ PWA: New version installed, waiting to activate');
                  setShowUpdateNotification(true);
                }
              });
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          console.log('📢 PWA: Update message received from service worker');
          setShowUpdateNotification(true);
        }
      });

      // Listen for controller change (new service worker took control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 PWA: New service worker took control');
        if (!isUpdating) {
          window.location.reload();
        }
      });
    }
  }, [isUpdating]);

  const handleUpdateClick = async () => {
    if (!registration?.waiting) {
      console.log('⚠️ PWA: No waiting service worker found');
      return;
    }

    setIsUpdating(true);
    console.log('🚀 PWA: Activating new service worker...');

    // Tell the waiting service worker to skip waiting and become active
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Handle the update callback
    onUpdate?.();

    // Hide notification
    setShowUpdateNotification(false);
  };

  const handleDismiss = () => {
    setShowUpdateNotification(false);
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-update-dismissed', 'true');
  };

  // Don't show if dismissed this session or no update available
  if (!showUpdateNotification || 
      sessionStorage.getItem('pwa-update-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="mx-auto max-w-md bg-white rounded-xl shadow-lg border-2 border-blue-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fas fa-download text-lg"></i>
              <h4 className="font-semibold">Update Available</h4>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white hover:text-gray-200 transition-colors p-1"
              aria-label="Dismiss update notification"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            A new version of MediTeach AI is ready with improvements and bug fixes.
          </p>

          {/* What's New */}
          <div className="mb-4">
            <h5 className="font-medium text-sm text-[#1A2B42] mb-2">What's New:</h5>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <i className="fas fa-check-circle text-green-500 text-xs"></i>
                <span>Enhanced offline functionality</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-check-circle text-green-500 text-xs"></i>
                <span>Improved performance and stability</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-check-circle text-green-500 text-xs"></i>
                <span>Better caching for medical images</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-check-circle text-green-500 text-xs"></i>
                <span>Updated medical knowledge base</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleUpdateClick}
              disabled={isUpdating}
              className="flex-1 bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isUpdating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-rocket"></i>
                  <span>Update Now</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Later
            </button>
          </div>

          {/* Size info */}
          <p className="text-xs text-gray-400 mt-3 text-center">
            <i className="fas fa-info-circle mr-1"></i>
            Update size: ~2MB • Takes 10-30 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdateNotification;