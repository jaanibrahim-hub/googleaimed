import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallPromptProps {
  onInstall?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onInstall }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed or running in standalone mode
    const checkInstallStatus = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInstalled = isStandaloneMode || isInWebAppiOS;
      
      setIsStandalone(isStandaloneMode);
      setIsInstalled(isInstalled);
      
      // Don't show install prompt if already installed
      if (isInstalled) {
        setShowInstallPrompt(false);
        return;
      }
    };

    checkInstallStatus();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      console.log('📱 PWA: beforeinstallprompt event fired');
      
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      setDeferredPrompt(event);
      
      // Show our custom install prompt after a delay
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 3000); // Show after 3 seconds of usage
    };

    // Listen for app installation
    const handleAppInstalled = () => {
      console.log('📱 PWA: App was installed successfully');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      onInstall?.();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled, onInstall]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('📱 PWA: No deferred prompt available');
      return;
    }

    // Hide our custom prompt
    setShowInstallPrompt(false);

    // Show the browser's install prompt
    try {
      await deferredPrompt.prompt();
      
      // Wait for the user's response
      const choiceResult = await deferredPrompt.userChoice;
      console.log('📱 PWA: User choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('📱 PWA: User accepted the install prompt');
      } else {
        console.log('📱 PWA: User dismissed the install prompt');
      }
    } catch (error) {
      console.error('📱 PWA: Error showing install prompt:', error);
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed, dismissed this session, or no prompt available
  if (isInstalled || 
      sessionStorage.getItem('pwa-prompt-dismissed') || 
      !showInstallPrompt || 
      !deferredPrompt) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
        {/* Install Prompt Card */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full transform transition-all duration-300 ease-out animate-slide-up">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] rounded-xl flex items-center justify-center shadow-lg">
                  <i className="fas fa-stethoscope text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1A2B42]">Install MediTeach AI</h3>
                  <p className="text-sm text-gray-500">Get the app experience</p>
                </div>
              </div>
              <button 
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Dismiss install prompt"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            
            {/* Benefits List */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-wifi text-green-600 text-xs"></i>
                </div>
                <span>Work offline with cached conversations</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-mobile-alt text-blue-600 text-xs"></i>
                </div>
                <span>Native app experience on your device</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-bolt text-purple-600 text-xs"></i>
                </div>
                <span>Faster loading and better performance</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-home text-orange-600 text-xs"></i>
                </div>
                <span>Quick access from your home screen</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 pt-2 space-y-3">
            <button
              onClick={handleInstallClick}
              className="w-full bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <i className="fas fa-download"></i>
              <span>Install App</span>
            </button>
            
            <button
              onClick={handleDismiss}
              className="w-full text-gray-600 font-medium py-2 px-4 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
          </div>
          
          {/* Trust Indicators */}
          <div className="px-6 pb-6 pt-0">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <i className="fas fa-shield-alt text-green-500"></i>
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <i className="fas fa-user-shield text-blue-500"></i>
                <span>Private</span>
              </div>
              <div className="flex items-center space-x-1">
                <i className="fas fa-heart text-red-500"></i>
                <span>Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default PWAInstallPrompt;