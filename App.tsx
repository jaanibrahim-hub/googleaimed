import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ChatView from './views/ChatView';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);

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

  return (
    <div className="h-screen w-screen overflow-hidden text-[#1A2B42] font-['Inter']">
      {apiKey ? (
        <ChatView apiKey={apiKey} onEndSession={handleEndSession} />
      ) : (
        <LandingPage onApiKeySubmit={handleApiKeySubmit} />
      )}
    </div>
  );
};

export default App;
