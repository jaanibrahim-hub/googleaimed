import React, { useState, useEffect, useMemo } from 'react';
import { ConversationSummary } from '../types';
import { conversationStorage } from '../services/conversationStorage';

interface ConversationHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  currentConversationId?: string | null;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
  onNewConversation,
  currentConversationId
}) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'messages'>('date');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load conversations
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = () => {
    setIsLoading(true);
    try {
      const summaries = conversationStorage.getConversationSummaries();
      setConversations(summaries);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = conversationStorage.searchConversations(searchQuery);
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(conv =>
        selectedTags.some(tag => conv.tags.includes(tag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'messages':
          return b.messageCount - a.messageCount;
        case 'date':
        default:
          return b.updatedAt - a.updatedAt;
      }
    });

    return filtered;
  }, [conversations, searchQuery, selectedTags, sortBy]);

  // Get all available tags
  const availableTags = useMemo(() => {
    return conversationStorage.getAllTags();
  }, [conversations]);

  const handleDeleteConversation = (conversationId: string) => {
    const success = conversationStorage.deleteConversation(conversationId);
    if (success) {
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversationId === conversationId) {
        onNewConversation(); // Start new conversation if current was deleted
      }
    }
    setShowDeleteConfirm(null);
  };

  const handleClearAllConversations = () => {
    if (window.confirm('Are you sure you want to delete all conversation history? This cannot be undone.')) {
      const success = conversationStorage.clearAllConversations();
      if (success) {
        setConversations([]);
        onNewConversation();
      }
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
        <div 
          className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] text-white p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Conversation History</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-1"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-white opacity-75"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-75 focus:bg-opacity-30 focus:outline-none"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'messages')}
                className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded px-2 py-1 text-sm text-white"
              >
                <option value="date" className="text-gray-800">Latest</option>
                <option value="title" className="text-gray-800">Title</option>
                <option value="messages" className="text-gray-800">Messages</option>
              </select>

              <button
                onClick={onNewConversation}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <i className="fas fa-plus text-xs"></i>
                <span>New</span>
              </button>
            </div>
          </div>

          {/* Tag Filter */}
          {availableTags.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by topics:</h3>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-[#2E7D95] text-white border-[#2E7D95]'
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E7D95]"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                {conversations.length === 0 ? (
                  <>
                    <i className="fas fa-comments text-4xl mb-4 opacity-50"></i>
                    <p className="mb-2">No conversations yet</p>
                    <p className="text-sm">Start a new medical consultation to build your history</p>
                  </>
                ) : (
                  <>
                    <i className="fas fa-search text-4xl mb-4 opacity-50"></i>
                    <p className="mb-2">No matches found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      currentConversationId === conversation.id ? 'bg-blue-50 border-l-4 border-[#2E7D95]' : ''
                    }`}
                    onClick={() => {
                      onSelectConversation(conversation.id);
                      onClose();
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1">
                        {conversation.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(conversation.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-2 p-1"
                        title="Delete conversation"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>

                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {conversation.summary}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <i className="fas fa-comments"></i>
                          <span>{conversation.messageCount}</span>
                        </span>
                        {conversation.hasImages && (
                          <span className="flex items-center space-x-1">
                            <i className="fas fa-image text-blue-500"></i>
                            <span>Images</span>
                          </span>
                        )}
                      </div>
                      <span>{formatDate(conversation.updatedAt)}</span>
                    </div>

                    {conversation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {conversation.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {conversation.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{conversation.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>{conversations.length} conversations</span>
              <span>
                {conversationStorage.getStorageInfo().percentage.toFixed(1)}% storage used
              </span>
            </div>
            <button
              onClick={handleClearAllConversations}
              className="text-red-600 hover:text-red-800 text-xs font-medium transition-colors"
              disabled={conversations.length === 0}
            >
              <i className="fas fa-trash mr-1"></i>
              Clear All History
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Conversation?</h3>
              <p className="text-gray-600 text-sm mb-6">
                This conversation will be permanently deleted and cannot be recovered.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteConversation(showDeleteConfirm)}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConversationHistory;