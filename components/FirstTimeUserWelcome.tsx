import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../hooks/useOnboarding';

const FirstTimeUserWelcome: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const { shouldShowOnboarding, startOnboarding } = useOnboarding();

  useEffect(() => {
    // Show welcome banner for first-time users
    if (shouldShowOnboarding) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 2000); // Show after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [shouldShowOnboarding]);

  const handleStartTutorial = () => {
    setShowWelcome(false);
    startOnboarding('main-onboarding');
  };

  const handleDismiss = () => {
    setShowWelcome(false);
    // Don't show again for this session
    sessionStorage.setItem('welcome-dismissed', 'true');
  };

  if (!showWelcome || sessionStorage.getItem('welcome-dismissed')) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-40 animate-slide-down">
      <div className="mx-auto max-w-md bg-white rounded-xl shadow-lg border-2 border-[#2E7D95] overflow-hidden">
        <div className="bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <i className="fas fa-graduation-cap text-lg"></i>
              </div>
              <div>
                <h3 className="font-bold">Welcome to MediTeach AI!</h3>
                <p className="text-sm text-white text-opacity-90">
                  Your intelligent medical guide
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white hover:text-gray-200 transition-colors p-1"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="text-gray-600 text-sm mb-4">
            Transform complex medical information into easy-to-understand visual explanations. 
            Take our quick tutorial to discover all the powerful features!
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={handleStartTutorial}
              className="flex-1 bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <i className="fas fa-play"></i>
              <span>Start Tutorial (3 min)</span>
            </button>
            
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <i className="fas fa-clock"></i>
              <span>3 minutes</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="fas fa-eye"></i>
              <span>Interactive demos</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="fas fa-graduation-cap"></i>
              <span>Learn by doing</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FirstTimeUserWelcome;