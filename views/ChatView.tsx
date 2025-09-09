import React, { useRef } from 'react';
import ChatInterface from '../components/ChatInterface';
import Sidebar from '../components/Sidebar';

interface ChatViewProps {
  apiKey: string;
  onEndSession: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ apiKey, onEndSession }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="hidden md:block w-80 flex-shrink-0">
         <Sidebar onUploadClick={handleUploadClick} />
      </div>
      <main className="flex-1 flex flex-col overflow-hidden">
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
