import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ChatView from './views/ChatView';
import SimpleChatInput from './components/SimpleChatInput';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineStatus from './components/OfflineStatus';
import PWAUpdateNotification from './components/PWAUpdateNotification';
import { usePWA } from './hooks/usePWA';
import { useTheme } from './hooks/useTheme';
import ThemeService from './services/themeService';
import UserPreferencesService from './services/userPreferencesService';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const { isInstalled, hasUpdate, update, checkForUpdates } = usePWA();
  const { theme, isDarkMode } = useTheme();
  




  useEffect(() => {
    try {
      const storedApiKey = localStorage.getItem('geminiApiKey');
      if (storedApiKey) {
        setApiKey(storedApiKey);
      }
    } catch (error) {
      console.error("Could not access local storage:", error);
    }

    // Initialize theme service
    const themeService = ThemeService.getInstance();
    const preferencesService = UserPreferencesService.getInstance();
    const userTheme = preferencesService.getTheme();
    
    // Apply user's theme preference
    themeService.setTheme(userTheme);
    
    // Apply accessibility settings
    themeService.setHighContrast(preferencesService.isHighContrast());
    themeService.setReducedMotion(preferencesService.isReducedMotion());
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
    <div className={`min-h-screen w-screen font-['Inter'] transition-all duration-300 ${
      isDarkMode ? 'dark-theme bg-slate-900 text-slate-100' : 'light-theme bg-gradient-to-br from-blue-50 to-cyan-50 text-slate-800'
    } ${apiKey ? 'h-screen overflow-hidden' : ''}`}>
      
      {/* Debug indicator */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        background: apiKey ? 'green' : 'red',
        color: 'white',
        padding: '5px 10px',
        zIndex: 10000,
        fontSize: '12px'
      }}>
        {apiKey ? `API: ${apiKey.substring(0, 8)}...` : 'NO API KEY'}
      </div>

      {/* Main App Content */}
      {apiKey ? (
        <div className="h-screen w-screen flex bg-gray-100">
          {/* Simple Sidebar */}
          <div className="w-80 bg-white border-r-2 border-gray-200 p-6 flex flex-col shadow-lg">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-4xl">
                🩺
              </div>
              <h3 className="text-xl font-semibold text-blue-600">Dr. MediTeach</h3>
              <p className="text-sm text-gray-500 mt-1">Your AI medical guide</p>
            </div>
            
            <div className="mb-8">
              <h4 className="font-semibold mb-3 text-gray-800">I can help with:</h4>
              <div className="flex flex-col gap-2">
                <span className="bg-blue-50 text-sm text-blue-600 px-3 py-2 rounded-full border border-blue-200">🫀 Heart Conditions</span>
                <span className="bg-blue-50 text-sm text-blue-600 px-3 py-2 rounded-full border border-blue-200">🧠 Neurological Issues</span>
                <span className="bg-blue-50 text-sm text-blue-600 px-3 py-2 rounded-full border border-blue-200">🦴 Orthopedic Care</span>
                <span className="bg-blue-50 text-sm text-blue-600 px-3 py-2 rounded-full border border-blue-200">🔬 Test Results</span>
              </div>
            </div>
            
            <div className="mt-auto">
              <button 
                onClick={handleEndSession}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                End Session
              </button>
            </div>
          </div>

          {/* Simple Chat Interface */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b-2 border-gray-200 p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-800">MediTeach AI Chat</h1>
                <div className="text-sm text-gray-500">Ready to help</div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="max-w-4xl mx-auto">
                {/* Welcome Message */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      AI
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 mb-2">Welcome to MediTeach AI!</div>
                      <div className="text-gray-600">
                        I'm here to help you understand your medical information with compassion and clarity. 
                        Feel free to ask me about any medical condition, upload documents, or seek explanations 
                        about treatments and procedures.
                      </div>
                      <div className="mt-4 flex gap-2 flex-wrap">
                        <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200">
                          Explain my symptoms
                        </button>
                        <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200">
                          Understand my diagnosis
                        </button>
                        <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200">
                          Learn about treatment options
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t-2 border-gray-200 p-6">
              <div className="max-w-4xl mx-auto">
                <SimpleChatInput apiKey={apiKey} />
                <div className="mt-3 text-xs text-gray-500 text-center">
                  For educational purposes. Always consult your healthcare provider.
                </div>
              </div>
            </div>
          </div>
        </div>
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
