import React, { useState, useEffect } from 'react';

interface Conversation {
  id: string;
  title: string;
  messages: Array<{
    sender: 'user' | 'ai';
    content: string;
    timestamp: number;
  }>;
  createdAt: number;
  lastMessage: string;
}

interface ConversationHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
}

const ConversationHistoryPanel: React.FC<ConversationHistoryPanelProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
  onNewConversation
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = () => {
    try {
      const saved = localStorage.getItem('mediteach_conversations');
      if (saved) {
        setConversations(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const saveConversation = (conversation: Conversation) => {
    try {
      const existing = conversations.find(c => c.id === conversation.id);
      let updated;
      
      if (existing) {
        updated = conversations.map(c => 
          c.id === conversation.id ? conversation : c
        );
      } else {
        updated = [conversation, ...conversations];
      }
      
      setConversations(updated);
      localStorage.setItem('mediteach_conversations', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const deleteConversation = (id: string) => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      const updated = conversations.filter(c => c.id !== id);
      setConversations(updated);
      localStorage.setItem('mediteach_conversations', JSON.stringify(updated));
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
      {/* Sidebar Panel */}
      <div className="w-96 bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Conversation History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              🔍
            </div>
          </div>
        </div>

        {/* New Conversation Button */}
        <div className="px-4 pb-4">
          <button
            onClick={() => {
              onNewConversation();
              onClose();
            }}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <span>➕</span>
            New Conversation
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-4">
          {filteredConversations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation === conversation.id
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  } border`}
                  onClick={() => {
                    setSelectedConversation(conversation.id);
                    onSelectConversation(conversation);
                    onClose();
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-gray-800 text-sm truncate flex-1">
                      {conversation.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {conversation.lastMessage}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{formatDate(conversation.createdAt)}</span>
                    <span>{conversation.messages.length} messages</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} saved
        </div>
      </div>

      {/* Overlay to close */}
      <div className="flex-1" onClick={onClose}></div>
    </div>
  );
};

// Export utility functions for conversation management
export const conversationUtils = {
  saveCurrentConversation: (messages: Array<{sender: 'user' | 'ai', content: string}>) => {
    if (messages.length === 0) return;
    
    const conversation: Conversation = {
      id: Date.now().toString(),
      title: messages[0]?.content.substring(0, 50) + '...' || 'New Conversation',
      messages: messages.map(msg => ({
        ...msg,
        timestamp: Date.now()
      })),
      createdAt: Date.now(),
      lastMessage: messages[messages.length - 1]?.content || ''
    };
    
    try {
      const existing = JSON.parse(localStorage.getItem('mediteach_conversations') || '[]');
      const updated = [conversation, ...existing];
      localStorage.setItem('mediteach_conversations', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }
};

export default ConversationHistoryPanel;