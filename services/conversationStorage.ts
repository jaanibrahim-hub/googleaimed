import { Conversation, ConversationSummary, Message, Sender } from '../types';

const STORAGE_KEY = 'mediteach-conversations';
const CURRENT_CONVERSATION_KEY = 'mediteach-current-conversation';
const MAX_CONVERSATIONS = 50; // Limit to prevent storage overflow
const MAX_MESSAGES_PER_CONVERSATION = 100;

export class ConversationStorage {
  private static instance: ConversationStorage;
  
  private constructor() {}
  
  static getInstance(): ConversationStorage {
    if (!ConversationStorage.instance) {
      ConversationStorage.instance = new ConversationStorage();
    }
    return ConversationStorage.instance;
  }

  // Generate conversation title from first user message
  private generateTitle(firstMessage: string): string {
    const maxLength = 50;
    let title = firstMessage.replace(/[^\w\s]/g, '').trim();
    
    if (title.length > maxLength) {
      title = title.substring(0, maxLength).trim() + '...';
    }
    
    if (!title) {
      title = 'Medical Consultation';
    }
    
    return title;
  }

  // Extract medical tags from conversation
  private extractTags(messages: Message[]): string[] {
    const medicalKeywords = [
      'diagnosis', 'treatment', 'medication', 'symptoms', 'pain', 'fever',
      'blood', 'pressure', 'heart', 'lung', 'brain', 'cancer', 'diabetes',
      'infection', 'surgery', 'therapy', 'lab', 'test', 'scan', 'x-ray',
      'mri', 'ct', 'ultrasound', 'prescription', 'side effects', 'allergy',
      'chronic', 'acute', 'emergency', 'doctor', 'hospital', 'clinic'
    ];

    const tags = new Set<string>();
    const text = messages.map(m => m.text.toLowerCase()).join(' ');
    
    medicalKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        tags.add(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    });

    // Add tags based on uploaded images
    const hasImages = messages.some(m => m.uploadedImages && m.uploadedImages.length > 0);
    if (hasImages) {
      tags.add('Medical Images');
    }

    return Array.from(tags).slice(0, 5); // Limit to 5 tags
  }

  // Generate conversation summary
  private generateSummary(messages: Message[]): string {
    const userMessages = messages.filter(m => m.sender === Sender.User);
    const aiMessages = messages.filter(m => m.sender === Sender.AI);
    
    if (userMessages.length === 0) return 'New conversation';
    
    const firstUserMessage = userMessages[0].text;
    const lastAiMessage = aiMessages[aiMessages.length - 1]?.text || '';
    
    const summary = `Discussion about: ${firstUserMessage.substring(0, 100)}${
      firstUserMessage.length > 100 ? '...' : ''
    }`;
    
    return summary;
  }

  // Save conversation to localStorage
  saveConversation(conversation: Conversation): void {
    try {
      const conversations = this.getAllConversations();
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      
      if (existingIndex >= 0) {
        conversations[existingIndex] = conversation;
      } else {
        conversations.unshift(conversation); // Add to beginning
        
        // Keep only MAX_CONVERSATIONS
        if (conversations.length > MAX_CONVERSATIONS) {
          conversations.splice(MAX_CONVERSATIONS);
        }
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
      console.log('💾 Conversation saved:', conversation.id);
    } catch (error) {
      console.error('Failed to save conversation:', error);
      this.handleStorageError(error);
    }
  }

  // Create new conversation from messages
  createConversation(messages: Message[], characterDescription?: string): Conversation {
    const now = Date.now();
    const id = `conv_${now}_${Math.random().toString(36).substr(2, 9)}`;
    
    const firstUserMessage = messages.find(m => m.sender === Sender.User);
    const title = firstUserMessage ? this.generateTitle(firstUserMessage.text) : 'New Conversation';
    
    const conversation: Conversation = {
      id,
      title,
      messages: messages.slice(-MAX_MESSAGES_PER_CONVERSATION), // Keep recent messages
      createdAt: now,
      updatedAt: now,
      summary: this.generateSummary(messages),
      tags: this.extractTags(messages),
      characterDescription,
      totalMessages: messages.length,
      hasImages: messages.some(m => m.uploadedImages && m.uploadedImages.length > 0 || m.imageUrl)
    };

    this.saveConversation(conversation);
    return conversation;
  }

  // Update existing conversation
  updateConversation(conversationId: string, messages: Message[], characterDescription?: string): Conversation | null {
    try {
      const conversations = this.getAllConversations();
      const existingIndex = conversations.findIndex(c => c.id === conversationId);
      
      if (existingIndex >= 0) {
        const existing = conversations[existingIndex];
        const updated: Conversation = {
          ...existing,
          messages: messages.slice(-MAX_MESSAGES_PER_CONVERSATION),
          updatedAt: Date.now(),
          summary: this.generateSummary(messages),
          tags: this.extractTags(messages),
          characterDescription: characterDescription || existing.characterDescription,
          totalMessages: messages.length,
          hasImages: messages.some(m => m.uploadedImages && m.uploadedImages.length > 0 || m.imageUrl)
        };
        
        this.saveConversation(updated);
        return updated;
      }
    } catch (error) {
      console.error('Failed to update conversation:', error);
    }
    return null;
  }

  // Get all conversations
  getAllConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const conversations: Conversation[] = JSON.parse(data);
      return conversations.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      return [];
    }
  }

  // Get conversation summaries for list view
  getConversationSummaries(): ConversationSummary[] {
    return this.getAllConversations().map(conv => ({
      id: conv.id,
      title: conv.title,
      summary: conv.summary || '',
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: conv.totalMessages,
      hasImages: conv.hasImages,
      tags: conv.tags || [],
      lastMessage: conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].text : ''
    }));
  }

  // Get specific conversation
  getConversation(id: string): Conversation | null {
    const conversations = this.getAllConversations();
    return conversations.find(c => c.id === id) || null;
  }

  // Delete conversation
  deleteConversation(id: string): boolean {
    try {
      const conversations = this.getAllConversations();
      const filtered = conversations.filter(c => c.id !== id);
      
      if (filtered.length !== conversations.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        console.log('🗑️ Conversation deleted:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      return false;
    }
  }

  // Search conversations
  searchConversations(query: string): ConversationSummary[] {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return this.getConversationSummaries();

    return this.getConversationSummaries().filter(conv => 
      conv.title.toLowerCase().includes(normalizedQuery) ||
      conv.summary.toLowerCase().includes(normalizedQuery) ||
      conv.lastMessage?.toLowerCase().includes(normalizedQuery) ||
      conv.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
    );
  }

  // Filter conversations by tags
  filterByTags(tags: string[]): ConversationSummary[] {
    if (tags.length === 0) return this.getConversationSummaries();
    
    return this.getConversationSummaries().filter(conv =>
      tags.some(tag => conv.tags.includes(tag))
    );
  }

  // Get all unique tags
  getAllTags(): string[] {
    const allTags = new Set<string>();
    this.getAllConversations().forEach(conv => {
      conv.tags?.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  }

  // Save current conversation ID
  setCurrentConversation(id: string | null): void {
    if (id) {
      localStorage.setItem(CURRENT_CONVERSATION_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_CONVERSATION_KEY);
    }
  }

  // Get current conversation ID
  getCurrentConversationId(): string | null {
    return localStorage.getItem(CURRENT_CONVERSATION_KEY);
  }

  // Export conversations as JSON
  exportConversations(): string {
    const conversations = this.getAllConversations();
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      conversations
    };
    return JSON.stringify(exportData, null, 2);
  }

  // Import conversations from JSON
  importConversations(jsonData: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const data = JSON.parse(jsonData);
      const errors: string[] = [];
      let imported = 0;

      if (!data.conversations || !Array.isArray(data.conversations)) {
        return { success: false, imported: 0, errors: ['Invalid format: No conversations array found'] };
      }

      data.conversations.forEach((conv: any, index: number) => {
        try {
          // Validate conversation structure
          if (!conv.id || !conv.title || !Array.isArray(conv.messages)) {
            errors.push(`Conversation ${index + 1}: Invalid structure`);
            return;
          }

          // Generate new ID to avoid conflicts
          const newConv: Conversation = {
            ...conv,
            id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: conv.createdAt || Date.now(),
            updatedAt: Date.now()
          };

          this.saveConversation(newConv);
          imported++;
        } catch (error) {
          errors.push(`Conversation ${index + 1}: ${error}`);
        }
      });

      return { success: imported > 0, imported, errors };
    } catch (error) {
      return { success: false, imported: 0, errors: [`Parse error: ${error}`] };
    }
  }

  // Clear all conversations
  clearAllConversations(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CURRENT_CONVERSATION_KEY);
      console.log('🧹 All conversations cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear conversations:', error);
      return false;
    }
  }

  // Handle storage quota errors
  private handleStorageError(error: any): void {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.warn('💾 Storage quota exceeded, clearing old conversations');
      
      // Remove oldest conversations
      const conversations = this.getAllConversations();
      const keepCount = Math.floor(MAX_CONVERSATIONS * 0.7); // Keep 70%
      const toKeep = conversations.slice(0, keepCount);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toKeep));
    }
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const data = localStorage.getItem(STORAGE_KEY) || '[]';
      const used = new Blob([data]).size;
      const available = 5 * 1024 * 1024; // Assume 5MB localStorage limit
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch {
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

// Export singleton instance
export const conversationStorage = ConversationStorage.getInstance();