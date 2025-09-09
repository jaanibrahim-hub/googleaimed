import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ChatView from './views/ChatView';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineStatus from './components/OfflineStatus';
import PWAUpdateNotification from './components/PWAUpdateNotification';
import { usePWA } from './hooks/usePWA';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const { isInstalled, hasUpdate, update, checkForUpdates } = usePWA();

  useEffect(() => {
    try {
      const storedApiKey = localStorage.getItem('geminiApiKey');
      if (storedApiKey) {
        setApiKey(storedApiKey);
      }
    } catch (error) {
      console.error("Could not access local storage:", error);
    }
  }, []);

  const handleApiKeySubmit = (key: string) => {
    try {
        localStorage.setItem('geminiApiKey', key);
        setApiKey(key);
    } catch (error) {
        console.error("Could not save API key to local storage:", error);
        alert("Could not save your API key. Your browser might be in private mode or has storage disabled.");
    }
  };

  const handleEndSession = () => {
    try {
        localStorage.removeItem('geminiApiKey');
    } catch (error) {
        console.error("Could not remove API key from local storage:", error);
    }
    setApiKey(null);
  };

  const handlePWAInstall = () => {
    console.log('🎉 PWA: App installed successfully!');
    // You could track this event for analytics
  };

  const handlePWAUpdate = async () => {
    console.log('🔄 PWA: Updating app...');
    await update();
  };

  const handleRetryConnection = () => {
    // Retry any failed operations
    checkForUpdates();
    window.location.reload();
  };

  return (
    <div className="h-screen w-screen overflow-hidden text-[#1A2B42] font-['Inter'] relative">
      {/* Main App Content */}
      {apiKey ? (
        <ChatView apiKey={apiKey} onEndSession={handleEndSession} />
      ) : (
        <LandingPage onApiKeySubmit={handleApiKeySubmit} />
      )}

      {/* PWA Components - Only show if not already installed */}
      {!isInstalled && (
        <PWAInstallPrompt onInstall={handlePWAInstall} />
      )}
      
      {/* Offline Status Notification */}
      <OfflineStatus onRetry={handleRetryConnection} />
      
      {/* Update Notification */}
      {hasUpdate && (
        <PWAUpdateNotification onUpdate={handlePWAUpdate} />
      )}
    </div>
  );
};

export default App;
