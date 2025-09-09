import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message, Sender } from '../types';
import { conversationStorage } from '../services/conversationStorage';

interface UseConversationHistoryReturn {
  // Current conversation state
  currentConversation: Conversation | null;
  currentConversationId: string | null;
  
  // Conversation management
  startNewConversation: () => void;
  loadConversation: (conversationId: string) => void;
  saveCurrentConversation: (messages: Message[], characterDescription?: string) => void;
  
  // Auto-save functionality
  enableAutoSave: (messages: Message[], characterDescription?: string) => void;
  disableAutoSave: () => void;
  
  // Conversation history
  hasHistory: boolean;
  conversationCount: number;
  
  // Utility functions
  deleteConversation: (conversationId: string) => boolean;
  clearAllHistory: () => boolean;
  
  // Storage info
  storageInfo: {
    used: number;
    available: number;
    percentage: number;
  };
}

export const useConversationHistory = (): UseConversationHistoryReturn => {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversationCount, setConversationCount] = useState(0);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Initialize conversation state
  useEffect(() => {
    // Try to load the last active conversation
    const lastConversationId = conversationStorage.getCurrentConversationId();
    if (lastConversationId) {
      const conversation = conversationStorage.getConversation(lastConversationId);
      if (conversation) {
        setCurrentConversation(conversation);
        setCurrentConversationId(lastConversationId);
      } else {
        // Clean up invalid reference
        conversationStorage.setCurrentConversation(null);
      }
    }

    // Update conversation count
    updateConversationCount();
  }, []);

  const updateConversationCount = useCallback(() => {
    const count = conversationStorage.getAllConversations().length;
    setConversationCount(count);
  }, []);

  // Start a new conversation
  const startNewConversation = useCallback(() => {
    setCurrentConversation(null);
    setCurrentConversationId(null);
    conversationStorage.setCurrentConversation(null);
    
    // Clear any pending auto-save
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
    
    console.log('🆕 Started new conversation');
  }, [autoSaveTimeout]);

  // Load an existing conversation
  const loadConversation = useCallback((conversationId: string) => {
    const conversation = conversationStorage.getConversation(conversationId);
    
    if (conversation) {
      setCurrentConversation(conversation);
      setCurrentConversationId(conversationId);
      conversationStorage.setCurrentConversation(conversationId);
      
      console.log('📂 Loaded conversation:', conversation.title);
      return conversation;
    } else {
      console.warn('⚠️ Conversation not found:', conversationId);
      startNewConversation();
      return null;
    }
  }, [startNewConversation]);

  // Save current conversation
  const saveCurrentConversation = useCallback((messages: Message[], characterDescription?: string) => {
    if (messages.length === 0) return;

    try {
      let savedConversation: Conversation;

      if (currentConversationId) {
        // Update existing conversation
        const updated = conversationStorage.updateConversation(
          currentConversationId,
          messages,
          characterDescription
        );
        
        if (updated) {
          savedConversation = updated;
          setCurrentConversation(updated);
        } else {
          // If update failed, create new conversation
          savedConversation = conversationStorage.createConversation(messages, characterDescription);
          setCurrentConversation(savedConversation);
          setCurrentConversationId(savedConversation.id);
          conversationStorage.setCurrentConversation(savedConversation.id);
        }
      } else {
        // Create new conversation
        savedConversation = conversationStorage.createConversation(messages, characterDescription);
        setCurrentConversation(savedConversation);
        setCurrentConversationId(savedConversation.id);
        conversationStorage.setCurrentConversation(savedConversation.id);
      }

      updateConversationCount();
      console.log('💾 Conversation saved:', savedConversation.title);
      
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }, [currentConversationId, updateConversationCount]);

  // Enable auto-save with debouncing
  const enableAutoSave = useCallback((messages: Message[], characterDescription?: string) => {
    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new timeout for auto-save (debounced by 2 seconds)
    const timeout = setTimeout(() => {
      saveCurrentConversation(messages, characterDescription);
    }, 2000);

    setAutoSaveTimeout(timeout);
  }, [autoSaveTimeout, saveCurrentConversation]);

  // Disable auto-save
  const disableAutoSave = useCallback(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
  }, [autoSaveTimeout]);

  // Delete a conversation
  const deleteConversation = useCallback((conversationId: string) => {
    const success = conversationStorage.deleteConversation(conversationId);
    
    if (success) {
      // If we deleted the current conversation, start a new one
      if (conversationId === currentConversationId) {
        startNewConversation();
      }
      
      updateConversationCount();
      console.log('🗑️ Conversation deleted');
    }
    
    return success;
  }, [currentConversationId, startNewConversation, updateConversationCount]);

  // Clear all conversation history
  const clearAllHistory = useCallback(() => {
    const success = conversationStorage.clearAllConversations();
    
    if (success) {
      startNewConversation(); // Start fresh
      updateConversationCount();
      console.log('🧹 All conversation history cleared');
    }
    
    return success;
  }, [startNewConversation, updateConversationCount]);

  // Get storage information
  const storageInfo = conversationStorage.getStorageInfo();

  // Check if there's any conversation history
  const hasHistory = conversationCount > 0;

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  return {
    // Current conversation state
    currentConversation,
    currentConversationId,
    
    // Conversation management
    startNewConversation,
    loadConversation,
    saveCurrentConversation,
    
    // Auto-save functionality
    enableAutoSave,
    disableAutoSave,
    
    // Conversation history
    hasHistory,
    conversationCount,
    
    // Utility functions
    deleteConversation,
    clearAllHistory,
    
    // Storage info
    storageInfo,
  };
};

// Helper hook for automatic conversation saving
export const useAutoSaveConversation = (
  messages: Message[],
  characterDescription?: string
) => {
  const { enableAutoSave, disableAutoSave, saveCurrentConversation } = useConversationHistory();

  // Auto-save when messages change (with debouncing)
  useEffect(() => {
    if (messages.length > 0) {
      enableAutoSave(messages, characterDescription);
    }

    return () => {
      disableAutoSave();
    };
  }, [messages, characterDescription, enableAutoSave, disableAutoSave]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (messages.length > 0) {
      disableAutoSave(); // Cancel any pending auto-save
      saveCurrentConversation(messages, characterDescription);
    }
  }, [messages, characterDescription, disableAutoSave, saveCurrentConversation]);

  return { saveNow };
};