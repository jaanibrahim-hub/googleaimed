import { Message, Conversation, ShareOptions, ShareableContent } from '../types';

class SharingService {
  private static instance: SharingService;

  private constructor() {}

  public static getInstance(): SharingService {
    if (!SharingService.instance) {
      SharingService.instance = new SharingService();
    }
    return SharingService.instance;
  }

  // Copy functionality
  public async copyToClipboard(content: string, format: 'text' | 'html' = 'text'): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        if (format === 'html' && navigator.clipboard.write) {
          // For rich content (HTML)
          const blob = new Blob([content], { type: 'text/html' });
          const clipboardItem = new ClipboardItem({ 'text/html': blob });
          await navigator.clipboard.write([clipboardItem]);
        } else {
          // For plain text
          await navigator.clipboard.writeText(content);
        }
        return true;
      } else {
        // Fallback for older browsers
        return this.fallbackCopyToClipboard(content);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return this.fallbackCopyToClipboard(content);
    }
  }

  private fallbackCopyToClipboard(content: string): boolean {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    } catch (error) {
      console.error('Fallback copy failed:', error);
      return false;
    }
  }

  // Format message content for sharing
  public formatMessage(message: Message, options: ShareOptions): string {
    const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleString() : new Date().toLocaleString();
    const sender = message.sender === 'user' ? 'Patient' : 'MediTeach AI';
    
    switch (options.format) {
      case 'markdown':
        return this.formatAsMarkdown(message, sender, timestamp, options);
      case 'html':
        return this.formatAsHTML(message, sender, timestamp, options);
      case 'json':
        return this.formatAsJSON(message, options);
      default:
        return this.formatAsText(message, sender, timestamp, options);
    }
  }

  private formatAsText(message: Message, sender: string, timestamp: string, options: ShareOptions): string {
    let content = `${sender}: ${message.text}`;
    
    if (options.includeMetadata) {
      content = `[${timestamp}] ${content}`;
    }
    
    if (message.suggestions && message.suggestions.length > 0) {
      content += `\n\nSuggestions:\n${message.suggestions.map(s => `• ${s}`).join('\n')}`;
    }
    
    if (options.includeImages && message.imageUrl) {
      content += `\n\nGenerated Image: ${message.imageUrl}`;
    }
    
    return content;
  }

  private formatAsMarkdown(message: Message, sender: string, timestamp: string, options: ShareOptions): string {
    let content = `**${sender}:** ${message.text}`;
    
    if (options.includeMetadata) {
      content = `*${timestamp}*\n\n${content}`;
    }
    
    if (message.suggestions && message.suggestions.length > 0) {
      content += `\n\n### Suggestions:\n${message.suggestions.map(s => `- ${s}`).join('\n')}`;
    }
    
    if (options.includeImages && message.imageUrl) {
      content += `\n\n![Generated Medical Explanation](${message.imageUrl})`;
    }
    
    return content;
  }

  private formatAsHTML(message: Message, sender: string, timestamp: string, options: ShareOptions): string {
    let content = `<div class="medical-message">`;
    
    if (options.includeMetadata) {
      content += `<div class="timestamp" style="color: #666; font-size: 0.9em; margin-bottom: 0.5em;">${timestamp}</div>`;
    }
    
    content += `<div class="message-content">
      <strong class="sender" style="color: ${message.sender === 'ai' ? '#2E7D95' : '#4A90A4'};">${sender}:</strong>
      <div class="text" style="margin-top: 0.5em; line-height: 1.6;">${this.textToHTML(message.text)}</div>
    </div>`;
    
    if (message.suggestions && message.suggestions.length > 0) {
      content += `<div class="suggestions" style="margin-top: 1em; padding: 0.75em; background: #f8f9fa; border-left: 3px solid #2E7D95;">
        <strong>Suggestions:</strong>
        <ul style="margin-top: 0.5em;">
          ${message.suggestions.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>`;
    }
    
    if (options.includeImages && message.imageUrl) {
      content += `<div class="generated-image" style="margin-top: 1em;">
        <img src="${message.imageUrl}" alt="Generated Medical Explanation" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      </div>`;
    }
    
    content += `</div>`;
    return content;
  }

  private formatAsJSON(message: Message, options: ShareOptions): string {
    const data: any = {
      sender: message.sender === 'user' ? 'Patient' : 'MediTeach AI',
      text: message.text,
      id: message.id
    };
    
    if (options.includeMetadata && message.timestamp) {
      data.timestamp = message.timestamp;
      data.date = new Date(message.timestamp).toISOString();
    }
    
    if (message.suggestions && message.suggestions.length > 0) {
      data.suggestions = message.suggestions;
    }
    
    if (options.includeImages && message.imageUrl) {
      data.imageUrl = message.imageUrl;
    }
    
    return JSON.stringify(data, null, 2);
  }

  private textToHTML(text: string): string {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background: #f1f1f1; padding: 2px 4px; border-radius: 3px;">$1</code>');
  }

  // Format conversation for sharing
  public formatConversation(conversation: Conversation, options: ShareOptions): ShareableContent {
    const messages = conversation.messages.map(msg => this.formatMessage(msg, options)).join('\n\n---\n\n');
    
    let content = '';
    if (options.includeMetadata) {
      const metadata = `
Medical Conversation Export
Title: ${conversation.title}
Created: ${new Date(conversation.createdAt).toLocaleString()}
Updated: ${new Date(conversation.updatedAt).toLocaleString()}
Messages: ${conversation.totalMessages}
${conversation.summary ? `Summary: ${conversation.summary}` : ''}
${conversation.tags?.length ? `Tags: ${conversation.tags.join(', ')}` : ''}

---

`;
      content += metadata;
    }
    
    content += messages;
    
    const images = conversation.messages
      .filter(msg => msg.imageUrl)
      .map(msg => msg.imageUrl!);
    
    return {
      id: conversation.id,
      type: 'conversation',
      title: conversation.title,
      content,
      metadata: {
        timestamp: conversation.updatedAt,
        messageCount: conversation.totalMessages,
        hasImages: conversation.hasImages,
      },
      images: options.includeImages ? images : [],
      format: options.format,
    };
  }

  // Native sharing API
  public async shareContent(content: ShareableContent): Promise<boolean> {
    if (navigator.share && this.isMobileDevice()) {
      try {
        const shareData: ShareData = {
          title: content.title,
          text: content.content,
        };
        
        // Add images if supported and available
        if (content.images && content.images.length > 0 && navigator.canShare) {
          const files: File[] = [];
          for (const imageUrl of content.images.slice(0, 3)) { // Limit to 3 images
            try {
              const response = await fetch(imageUrl);
              const blob = await response.blob();
              const file = new File([blob], `medical-image-${Date.now()}.png`, { type: blob.type });
              files.push(file);
            } catch (error) {
              console.warn('Failed to fetch image for sharing:', error);
            }
          }
          
          if (files.length > 0 && navigator.canShare({ files })) {
            shareData.files = files;
          }
        }
        
        await navigator.share(shareData);
        return true;
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Native share failed:', error);
        }
        return false;
      }
    }
    
    return false;
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Generate shareable links
  public generateShareableLink(content: ShareableContent): string {
    try {
      const compressed = this.compressContent(content);
      const encoded = btoa(compressed);
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}?share=${encoded}`;
    } catch (error) {
      console.error('Failed to generate shareable link:', error);
      return '';
    }
  }

  private compressContent(content: ShareableContent): string {
    // Simple compression by removing unnecessary whitespace and using abbreviations
    const simplified = {
      i: content.id,
      t: content.type,
      tl: content.title,
      c: content.content.replace(/\s+/g, ' ').trim(),
      m: content.metadata,
      f: content.format,
    };
    
    return JSON.stringify(simplified);
  }

  // Email sharing
  public shareViaEmail(content: ShareableContent, options: { to?: string; subject?: string } = {}): void {
    const subject = options.subject || `Medical Information: ${content.title}`;
    const body = this.formatForEmail(content);
    const mailto = `mailto:${options.to || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.open(mailto, '_blank');
  }

  private formatForEmail(content: ShareableContent): string {
    let email = `Medical Information from MediTeach AI\n\n`;
    
    if (content.metadata) {
      email += `Generated: ${new Date(content.metadata.timestamp).toLocaleString()}\n`;
      if (content.metadata.specialty) {
        email += `Medical Specialty: ${content.metadata.specialty}\n`;
      }
      email += `\n`;
    }
    
    email += content.content;
    
    email += `\n\n---\nThis information was generated by MediTeach AI for educational purposes only. Always consult with qualified healthcare providers for medical advice.`;
    
    return email;
  }

  // Download functionality
  public downloadContent(content: ShareableContent, filename?: string): void {
    const name = filename || `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${this.getFileExtension(content.format)}`;
    const mimeType = this.getMimeType(content.format);
    
    const blob = new Blob([content.content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  private getFileExtension(format: string): string {
    switch (format) {
      case 'markdown': return 'md';
      case 'html': return 'html';
      case 'json': return 'json';
      default: return 'txt';
    }
  }

  private getMimeType(format: string): string {
    switch (format) {
      case 'markdown': return 'text/markdown';
      case 'html': return 'text/html';
      case 'json': return 'application/json';
      default: return 'text/plain';
    }
  }

  // Image sharing
  public async shareImage(imageUrl: string, title: string = 'Medical Image'): Promise<boolean> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${title.replace(/[^a-z0-9]/gi, '_')}.png`, { type: blob.type });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          files: [file]
        });
        return true;
      } else {
        // Fallback: download the image
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return true;
      }
    } catch (error) {
      console.error('Failed to share image:', error);
      return false;
    }
  }

  // Privacy-safe sharing (removes personal information)
  public sanitizeForSharing(content: string, privacy: 'anonymous' | 'personal'): string {
    if (privacy === 'personal') {
      return content;
    }
    
    // Remove potential personal information for anonymous sharing
    return content
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[Patient Name]') // Names
      .replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, '[Date]') // Dates
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]') // SSN pattern
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[Email]') // Email
      .replace(/\b\d{10}\b/g, '[Phone]') // Phone numbers
      .replace(/\bMRN:?\s*\w+/gi, 'MRN: [Patient ID]') // Medical Record Numbers
      .replace(/\bDOB:?\s*[\d\/\-]+/gi, 'DOB: [Date of Birth]'); // Date of Birth
  }

  // Bulk operations
  public async shareMultipleMessages(messages: Message[], options: ShareOptions): Promise<ShareableContent> {
    const formattedMessages = messages.map(msg => this.formatMessage(msg, options)).join('\n\n---\n\n');
    
    let content = '';
    if (options.includeMetadata) {
      content += `Medical Information Export\nGenerated: ${new Date().toLocaleString()}\nMessages: ${messages.length}\n\n---\n\n`;
    }
    
    content += formattedMessages;
    
    const images = messages
      .filter(msg => msg.imageUrl)
      .map(msg => msg.imageUrl!);
    
    return {
      id: `bulk-${Date.now()}`,
      type: 'message',
      title: `Medical Information (${messages.length} messages)`,
      content: options.privacy === 'anonymous' ? this.sanitizeForSharing(content, 'anonymous') : content,
      metadata: {
        timestamp: Date.now(),
        messageCount: messages.length,
        hasImages: images.length > 0,
      },
      images: options.includeImages ? images : [],
      format: options.format,
    };
  }
}

export default SharingService;