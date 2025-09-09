import React, { useRef } from 'react';
import ChatInterface from '../components/ChatInterface';
import Sidebar from '../components/Sidebar';

interface ChatViewProps {
  apiKey: string;
  onEndSession: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ apiKey, onEndSession }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  console.log('🎯 ChatView rendering with API key:', apiKey.substring(0, 10) + '...');

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="md:grid md:grid-cols-[320px_1fr] h-full">
      <div className="hidden md:block">
         <Sidebar onUploadClick={handleUploadClick} />
      </div>
      <main className="flex-1 overflow-hidden h-full">
        <ChatInterface 
          apiKey={apiKey}
          fileInputRef={fileInputRef} 
          onMobileUploadClick={handleUploadClick} 
          onEndSession={onEndSession}
        />
      </main>
    </div>
  );
};

export default ChatView;
