import React, { useRef, useState } from 'react';

interface DocumentUploadButtonProps {
  onDocumentAnalyzed?: (analysis: string) => void;
  apiKey?: string;
}

const DocumentUploadButton: React.FC<DocumentUploadButtonProps> = ({ onDocumentAnalyzed, apiKey }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const analyzeDocument = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          let documentText = '';
          
          if (file.type === 'text/plain') {
            documentText = content;
          } else if (file.type === 'application/pdf') {
            // For PDFs, we'll extract basic info
            documentText = `PDF Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
          } else if (file.type.startsWith('image/')) {
            // For images, we'll use basic analysis
            documentText = `Medical Image: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
          } else {
            documentText = `Medical Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
          }

          const analysis = `I've received your medical document "${file.name}". Here's what I can help you with:

📄 **Document Information:**
- Type: ${file.type || 'Unknown'}
- Size: ${(file.size / 1024).toFixed(1)} KB
- Name: ${file.name}

🔍 **Medical Analysis Capabilities:**
- Lab results interpretation
- Medical report explanation
- Diagnostic image insights
- Treatment plan clarification
- Medication information

Please ask me specific questions about this document, such as:
- "What do these lab values mean?"
- "Explain this diagnosis in simple terms"
- "What should I know about this treatment?"
- "Are these results normal?"

💡 **Note:** While I can provide educational information about medical documents, always consult with your healthcare provider for official medical advice and interpretation.`;

          resolve(analysis);
        } catch (error) {
          reject(error);
        }
      };
      
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check file type
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'image/jpeg',
      'image/png', 
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a supported file type: PDF, Word document, text file, or image.');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const analysis = await analyzeDocument(file);
      onDocumentAnalyzed?.(analysis);
    } catch (error) {
      console.error('Error processing document:', error);
      onDocumentAnalyzed?.('I encountered an error processing your document. Please try again or contact support if the issue persists.');
    } finally {
      setIsProcessing(false);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
        style={{ display: 'none' }}
      />
      <button 
        onClick={handleFileClick}
        disabled={isProcessing}
        className={`p-2 rounded-full transition-colors ${
          isProcessing 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-500 hover:text-blue-500'
        }`}
        title="Upload medical document"
      >
        {isProcessing ? '📤' : '📎'}
      </button>
    </>
  );
};

export default DocumentUploadButton;