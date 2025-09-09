import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, WidthType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { Message, Conversation } from '../types';

export interface ExportOptions {
  format: 'pdf' | 'docx';
  includeMetadata: boolean;
  includeImages: boolean;
  includeTimestamps: boolean;
  title?: string;
  author?: string;
  subject?: string;
  theme: 'light' | 'dark';
  pageSize: 'A4' | 'Letter';
  fontSize: 'small' | 'medium' | 'large';
}

class ExportService {
  private static instance: ExportService;

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  private constructor() {}

  /**
   * Export conversation as PDF
   */
  public async exportToPDF(
    conversation: Conversation,
    options: ExportOptions
  ): Promise<void> {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: options.pageSize === 'A4' ? 'a4' : 'letter'
      });

      // Set font sizes based on preference
      const fontSizes = {
        small: { title: 16, heading: 12, body: 10, caption: 8 },
        medium: { title: 20, heading: 14, body: 12, caption: 10 },
        large: { title: 24, heading: 16, body: 14, caption: 12 }
      };
      const fonts = fontSizes[options.fontSize];

      let yPosition = 20;
      const pageHeight = pdf.internal.pageSize.height;
      const pageWidth = pdf.internal.pageSize.width;
      const margins = { left: 20, right: 20, top: 20, bottom: 20 };
      const contentWidth = pageWidth - margins.left - margins.right;

      // Add title
      pdf.setFontSize(fonts.title);
      pdf.setFont('helvetica', 'bold');
      const title = options.title || conversation.title || 'Medical AI Conversation';
      pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Add metadata if requested
      if (options.includeMetadata) {
        pdf.setFontSize(fonts.caption);
        pdf.setFont('helvetica', 'normal');
        const metadata = [
          `Exported: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
          `Messages: ${conversation.messages.length}`,
          `Created: ${conversation.createdAt ? new Date(conversation.createdAt).toLocaleDateString() : 'Unknown'}`
        ];

        if (options.author) {
          metadata.push(`Author: ${options.author}`);
        }

        for (const line of metadata) {
          pdf.text(line, margins.left, yPosition);
          yPosition += 6;
        }
        yPosition += 10;
      }

      // Process messages
      for (let i = 0; i < conversation.messages.length; i++) {
        const message = conversation.messages[i];
        
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        // Add message header
        pdf.setFontSize(fonts.heading);
        pdf.setFont('helvetica', 'bold');
        const sender = message.sender === 'user' ? 'Patient/User' : 'MediTeach AI';
        
        // Set color based on theme and sender
        if (options.theme === 'dark') {
          if (message.sender === 'user') {
            pdf.setTextColor(59, 130, 246); // Blue for user
          } else {
            pdf.setTextColor(34, 197, 94); // Green for AI
          }
        } else {
          if (message.sender === 'user') {
            pdf.setTextColor(37, 99, 235); // Darker blue for user in light theme
          } else {
            pdf.setTextColor(22, 163, 74); // Darker green for AI in light theme
          }
        }
        
        pdf.text(sender, margins.left, yPosition);
        
        // Add timestamp if requested
        if (options.includeTimestamps && message.timestamp) {
          pdf.setFontSize(fonts.caption);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(128, 128, 128);
          const timeStr = new Date(message.timestamp).toLocaleTimeString();
          pdf.text(timeStr, pageWidth - margins.right, yPosition, { align: 'right' });
        }
        
        yPosition += 8;

        // Reset color for content
        if (options.theme === 'dark') {
          pdf.setTextColor(240, 240, 240);
        } else {
          pdf.setTextColor(0, 0, 0);
        }

        // Add message content
        pdf.setFontSize(fonts.body);
        pdf.setFont('helvetica', 'normal');
        
        const lines = this.splitTextToLines(message.text, contentWidth, fonts.body, pdf);
        
        for (const line of lines) {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, margins.left, yPosition);
          yPosition += 6;
        }

        // Add images if present and requested
        if (options.includeImages && (message.imageUrl || message.uploadedImages)) {
          const imageUrls = [];
          if (message.imageUrl) imageUrls.push(message.imageUrl);
          if (message.uploadedImages) {
            imageUrls.push(...message.uploadedImages.map(img => img.url));
          }
          
          for (const imageUrl of imageUrls) {
            try {
              // For now, add a placeholder for images
              // In a full implementation, you'd convert and embed the actual images
              yPosition += 5;
              pdf.setFontSize(fonts.caption);
              pdf.setTextColor(128, 128, 128);
              pdf.text(`[Image: ${imageUrl}]`, margins.left, yPosition);
              yPosition += 6;
            } catch (error) {
              console.warn('Could not include image:', error);
            }
          }
        }

        yPosition += 10; // Space between messages
      }

      // Add footer to each page
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(fonts.caption);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Page ${i} of ${pageCount} - MediTeach AI Export`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      const filename = this.generateFilename(conversation, 'pdf');
      pdf.save(filename);

    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('Failed to export conversation as PDF');
    }
  }

  /**
   * Export conversation as Word document
   */
  public async exportToWord(
    conversation: Conversation,
    options: ExportOptions
  ): Promise<void> {
    try {
      const children = [];

      // Add title
      const title = options.title || conversation.title || 'Medical AI Conversation';
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: options.fontSize === 'large' ? 32 : options.fontSize === 'medium' ? 28 : 24,
            }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      // Add metadata if requested
      if (options.includeMetadata) {
        const metadataLines = [
          `Exported: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
          `Messages: ${conversation.messages.length}`,
          `Created: ${conversation.createdAt ? new Date(conversation.createdAt).toLocaleDateString() : 'Unknown'}`,
        ];

        if (options.author) {
          metadataLines.push(`Author: ${options.author}`);
        }

        for (const line of metadataLines) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  italics: true,
                  size: options.fontSize === 'large' ? 20 : options.fontSize === 'medium' ? 18 : 16,
                  color: '666666',
                }),
              ],
              spacing: { after: 120 },
            })
          );
        }

        children.push(
          new Paragraph({
            children: [],
            spacing: { after: 400 },
          })
        );
      }

      // Process messages
      for (let i = 0; i < conversation.messages.length; i++) {
        const message = conversation.messages[i];

        // Message header
        const senderName = message.sender === 'user' ? 'Patient/User' : 'MediTeach AI';
        const senderColor = message.sender === 'user' ? '3B82F6' : '16A34A'; // Blue for user, green for AI
        
        const headerRuns = [
          new TextRun({
            text: senderName,
            bold: true,
            color: senderColor,
            size: options.fontSize === 'large' ? 24 : options.fontSize === 'medium' ? 22 : 20,
          }),
        ];

        // Add timestamp if requested
        if (options.includeTimestamps && message.timestamp) {
          headerRuns.push(
            new TextRun({
              text: ` - ${new Date(message.timestamp).toLocaleTimeString()}`,
              italics: true,
              color: '808080',
              size: options.fontSize === 'large' ? 18 : options.fontSize === 'medium' ? 16 : 14,
            })
          );
        }

        children.push(
          new Paragraph({
            children: headerRuns,
            spacing: { before: 200, after: 100 },
          })
        );

        // Message content
        const contentParagraphs = message.text.split('\n').filter(line => line.trim());
        
        for (const paragraph of contentParagraphs) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: paragraph,
                  size: options.fontSize === 'large' ? 22 : options.fontSize === 'medium' ? 20 : 18,
                }),
              ],
              spacing: { after: 120 },
              indent: { left: 360 }, // Indent message content
            })
          );
        }

        // Add images if present and requested
        if (options.includeImages && (message.imageUrl || message.uploadedImages)) {
          const imageUrls = [];
          if (message.imageUrl) imageUrls.push(message.imageUrl);
          if (message.uploadedImages) {
            imageUrls.push(...message.uploadedImages.map(img => img.url));
          }
          
          for (const imageUrl of imageUrls) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `[Image: ${imageUrl}]`,
                    italics: true,
                    color: '808080',
                    size: options.fontSize === 'large' ? 18 : options.fontSize === 'medium' ? 16 : 14,
                  }),
                ],
                spacing: { after: 120 },
                indent: { left: 720 }, // More indent for image references
              })
            );
          }
        }

        // Add space between messages
        children.push(
          new Paragraph({
            children: [],
            spacing: { after: 200 },
          })
        );
      }

      // Create document
      const doc = new Document({
        creator: 'MediTeach AI',
        title: title,
        description: options.subject || 'Medical AI conversation export',
        styles: {
          paragraphStyles: [
            {
              id: 'default',
              name: 'Default',
              basedOn: 'Normal',
              next: 'Normal',
              run: {
                size: options.fontSize === 'large' ? 22 : options.fontSize === 'medium' ? 20 : 18,
                font: 'Arial',
              },
              paragraph: {
                spacing: {
                  line: 276, // 1.15 line spacing
                },
              },
            },
          ],
        },
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440,    // 1 inch
                  right: 1440,  // 1 inch
                  bottom: 1440, // 1 inch
                  left: 1440,   // 1 inch
                },
              },
            },
            children,
          },
        ],
      });

      // Generate and save document
      const blob = await Packer.toBlob(doc);
      const filename = this.generateFilename(conversation, 'docx');
      saveAs(blob, filename);

    } catch (error) {
      console.error('Error exporting to Word:', error);
      throw new Error('Failed to export conversation as Word document');
    }
  }

  /**
   * Main export function that routes to appropriate format
   */
  public async exportConversation(
    conversation: Conversation,
    options: ExportOptions
  ): Promise<void> {
    try {
      if (options.format === 'pdf') {
        await this.exportToPDF(conversation, options);
      } else if (options.format === 'docx') {
        await this.exportToWord(conversation, options);
      } else {
        throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * Helper function to split text into lines that fit within the specified width
   */
  private splitTextToLines(text: string, maxWidth: number, fontSize: number, pdf: jsPDF): string[] {
    const lines: string[] = [];
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        lines.push('');
        continue;
      }

      const words = paragraph.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = pdf.getTextWidth(testLine);

        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Word is too long, break it
            lines.push(word);
          }
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }
    }

    return lines;
  }

  /**
   * Generate filename for export
   */
  private generateFilename(conversation: Conversation, format: string): string {
    const title = conversation.title || 'medical-conversation';
    const sanitizedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9-\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    const timestamp = new Date().toISOString().split('T')[0];
    return `mediteach-${sanitizedTitle}-${timestamp}.${format}`;
  }

  /**
   * Get available export formats
   */
  public getAvailableFormats(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'pdf',
        label: 'PDF Document',
        description: 'Portable document format, ideal for sharing and printing'
      },
      {
        value: 'docx',
        label: 'Word Document',
        description: 'Microsoft Word format, editable and collaborative'
      }
    ];
  }

  /**
   * Validate export options
   */
  public validateExportOptions(options: Partial<ExportOptions>): ExportOptions {
    const defaults: ExportOptions = {
      format: 'pdf',
      includeMetadata: true,
      includeImages: true,
      includeTimestamps: true,
      theme: 'light',
      pageSize: 'A4',
      fontSize: 'medium'
    };

    return { ...defaults, ...options };
  }

  /**
   * Estimate export size/complexity
   */
  public estimateExportSize(conversation: Conversation, options: ExportOptions): {
    pages: number;
    fileSize: string;
    processingTime: string;
  } {
    const messageCount = conversation.messages.length;
    const totalChars = conversation.messages.reduce((sum, msg) => sum + msg.content.length, 0);
    const imageCount = conversation.messages.reduce(
      (sum, msg) => sum + (msg.images?.length || 0), 0
    );

    // Rough estimates
    const estimatedPages = Math.ceil(totalChars / 2000) + Math.ceil(imageCount * 0.5);
    const estimatedSize = options.format === 'pdf' 
      ? Math.ceil(estimatedPages * 50) // ~50KB per page for PDF
      : Math.ceil(estimatedPages * 25); // ~25KB per page for Word
    
    const processingTime = Math.max(2, Math.ceil(messageCount * 0.1)); // Minimum 2 seconds

    return {
      pages: estimatedPages,
      fileSize: estimatedSize < 1024 ? `${estimatedSize} KB` : `${(estimatedSize / 1024).toFixed(1)} MB`,
      processingTime: `${processingTime} seconds`
    };
  }
}

export const exportService = ExportService.getInstance();
export default exportService;