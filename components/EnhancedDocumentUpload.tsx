import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DocumentUpload, OCRResult, MedicalDocumentData } from '../types';
import OCRService from '../services/ocrService';
import { useTheme } from '../hooks/useTheme';

interface EnhancedDocumentUploadProps {
  onFilesUploaded: (documents: DocumentUpload[]) => void;
  onOCRComplete?: (document: DocumentUpload) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

const EnhancedDocumentUpload: React.FC<EnhancedDocumentUploadProps> = ({
  onFilesUploaded,
  onOCRComplete,
  maxFiles = 5,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  className = ''
}) => {
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrService] = useState(() => OCRService.getInstance());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDarkMode } = useTheme();

  const generateDocumentId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const detectMedicalType = (fileName: string, text?: string): DocumentUpload['medicalType'] => {
    const name = fileName.toLowerCase();
    const content = text?.toLowerCase() || '';

    if (name.includes('lab') || content.includes('laboratory') || content.includes('blood')) {
      return 'lab_report';
    } else if (name.includes('prescription') || name.includes('rx') || content.includes('medication')) {
      return 'prescription';
    } else if (name.includes('xray') || name.includes('x-ray') || content.includes('radiology')) {
      return 'xray';
    } else if (name.includes('scan') || name.includes('ct') || name.includes('mri')) {
      return 'scan';
    } else if (name.includes('record') || content.includes('medical record')) {
      return 'medical_record';
    }
    
    return 'other';
  };

  const createDocumentPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        // For non-image files, create a document icon
        resolve('document');
      }
    });
  };

  const processFileWithOCR = async (document: DocumentUpload): Promise<DocumentUpload> => {
    if (!document.file.type.startsWith('image/')) {
      return document; // OCR only works with images for now
    }

    try {
      const updatedDoc = { ...document, isProcessing: true };
      setDocuments(prev => prev.map(doc => doc.id === document.id ? updatedDoc : doc));

      const ocrResult = await ocrService.processDocument(document.file, (progress) => {
        // Update progress if needed
        console.log(`OCR Progress for ${document.name}: ${progress}%`);
      });

      const medicalData = ocrService.analyzeMedicalDocument(ocrResult, document.name);
      const medicalType = detectMedicalType(document.name, ocrResult.text);

      const processedDoc: DocumentUpload = {
        ...document,
        isProcessing: false,
        ocrResult,
        extractedData: medicalData,
        medicalType,
      };

      setDocuments(prev => prev.map(doc => doc.id === document.id ? processedDoc : doc));
      onOCRComplete?.(processedDoc);
      
      return processedDoc;
    } catch (error) {
      console.error('OCR processing failed:', error);
      const errorDoc = { ...document, isProcessing: false };
      setDocuments(prev => prev.map(doc => doc.id === document.id ? errorDoc : doc));
      return errorDoc;
    }
  };

  const handleFiles = useCallback(async (files: FileList) => {
    if (documents.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsProcessing(true);
    const newDocuments: DocumentUpload[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const preview = await createDocumentPreview(file);
      
      const document: DocumentUpload = {
        id: generateDocumentId(),
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: Date.now(),
        preview: preview !== 'document' ? preview : undefined,
        medicalType: detectMedicalType(file.name),
        isProcessing: false,
      };

      newDocuments.push(document);
    }

    setDocuments(prev => [...prev, ...newDocuments]);
    onFilesUploaded([...documents, ...newDocuments]);

    // Process OCR for image files
    for (const document of newDocuments) {
      if (document.file.type.startsWith('image/')) {
        await processFileWithOCR(document);
      }
    }

    setIsProcessing(false);
  }, [documents, maxFiles, onFilesUploaded, onOCRComplete, ocrService]);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(event.target.files);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    if (event.dataTransfer.files) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const removeDocument = (id: string) => {
    const updatedDocs = documents.filter(doc => doc.id !== id);
    setDocuments(updatedDocs);
    onFilesUploaded(updatedDocs);
  };

  const getMedicalTypeIcon = (type: DocumentUpload['medicalType']) => {
    switch (type) {
      case 'lab_report': return 'fas fa-flask';
      case 'prescription': return 'fas fa-pills';
      case 'medical_record': return 'fas fa-file-medical-alt';
      case 'xray': return 'fas fa-x-ray';
      case 'scan': return 'fas fa-search';
      default: return 'fas fa-file';
    }
  };

  const getMedicalTypeColor = (type: DocumentUpload['medicalType']) => {
    switch (type) {
      case 'lab_report': return 'text-blue-500';
      case 'prescription': return 'text-green-500';
      case 'medical_record': return 'text-purple-500';
      case 'xray': return 'text-orange-500';
      case 'scan': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`enhanced-document-upload ${className}`}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 cursor-pointer
          ${isDragging 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105' 
            : 'theme-border hover:border-blue-300 theme-surface'
          }
          ${isProcessing ? 'pointer-events-none opacity-70' : ''}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="text-center">
          <div className="mb-4">
            {isProcessing ? (
              <div className="inline-flex items-center gap-2 text-blue-500">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-sm">Processing documents...</span>
              </div>
            ) : (
              <i className={`fas fa-cloud-upload-alt text-4xl ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}></i>
            )}
          </div>
          
          <h3 className="text-lg font-semibold theme-text mb-2">
            Upload Medical Documents
          </h3>
          
          <p className="theme-text-secondary text-sm mb-4">
            Drag and drop files here or click to browse<br />
            Supports images, PDFs, and documents with OCR text extraction
          </p>

          <div className="flex flex-wrap gap-2 justify-center text-xs theme-text-secondary">
            <span className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">Lab Reports</span>
            <span className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">Prescriptions</span>
            <span className="bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">Medical Records</span>
            <span className="bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">X-rays & Scans</span>
          </div>

          <div className="mt-3 text-xs theme-text-secondary">
            Maximum {maxFiles} files • Up to 10MB each
          </div>
        </div>

        {/* Upload Progress Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-xl">
            <div className="text-center">
              <div className="animate-pulse text-blue-500 mb-2">
                <i className="fas fa-cog fa-spin text-2xl"></i>
              </div>
              <p className="text-sm font-medium">Processing with OCR...</p>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="font-medium theme-text flex items-center gap-2">
            <i className="fas fa-files-medical text-blue-500"></i>
            Uploaded Documents ({documents.length})
          </h4>

          <div className="space-y-2">
            {documents.map((document) => (
              <div
                key={document.id}
                className="theme-card p-4 rounded-lg flex items-center gap-4 hover:shadow-md transition-all"
              >
                {/* Document Preview */}
                <div className="flex-shrink-0">
                  {document.preview ? (
                    <img
                      src={document.preview}
                      alt={document.name}
                      className="w-12 h-12 object-cover rounded border theme-border"
                    />
                  ) : (
                    <div className="w-12 h-12 theme-surface border theme-border rounded flex items-center justify-center">
                      <i className={`${getMedicalTypeIcon(document.medicalType)} ${getMedicalTypeColor(document.medicalType)}`}></i>
                    </div>
                  )}
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium theme-text truncate">{document.name}</h5>
                    {document.medicalType && document.medicalType !== 'other' && (
                      <span className={`text-xs px-2 py-1 rounded-full ${getMedicalTypeColor(document.medicalType)} bg-opacity-20`}>
                        {document.medicalType.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm theme-text-secondary">
                    <span>{formatFileSize(document.size)}</span>
                    <span>•</span>
                    <span>{new Date(document.uploadedAt).toLocaleTimeString()}</span>
                    
                    {document.ocrResult && (
                      <>
                        <span>•</span>
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <i className="fas fa-check-circle text-xs"></i>
                          OCR Complete ({ocrService.calculateConfidenceScore(document.ocrResult)}%)
                        </span>
                      </>
                    )}
                  </div>

                  {/* Processing Status */}
                  {document.isProcessing && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full"></div>
                      <span>Processing with OCR...</span>
                    </div>
                  )}

                  {/* Extracted Medical Data Preview */}
                  {document.extractedData && !document.isProcessing && (
                    <div className="mt-2 text-xs theme-text-secondary">
                      {document.extractedData.patientInfo?.name && (
                        <span className="mr-3">👤 {document.extractedData.patientInfo.name}</span>
                      )}
                      {document.extractedData.values && document.extractedData.values.length > 0 && (
                        <span className="mr-3">🔬 {document.extractedData.values.length} lab values</span>
                      )}
                      {document.extractedData.medications && document.extractedData.medications.length > 0 && (
                        <span className="mr-3">💊 {document.extractedData.medications.length} medications</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {document.ocrResult && (
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="View OCR Results"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Could open a modal to show OCR results
                        alert(`OCR Text:\n\n${document.ocrResult!.text.substring(0, 500)}...`);
                      }}
                    >
                      <i className="fas fa-eye text-blue-500 text-sm"></i>
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDocument(document.id);
                    }}
                    className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    title="Remove document"
                  >
                    <i className="fas fa-trash text-red-500 text-sm"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Document Analysis Summary */}
          {documents.some(doc => doc.extractedData) && (
            <div className="mt-4 p-4 theme-surface rounded-lg border theme-border">
              <h5 className="font-medium theme-text mb-3 flex items-center gap-2">
                <i className="fas fa-analytics text-blue-500"></i>
                Document Analysis Summary
              </h5>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-500">
                    {documents.filter(d => d.extractedData?.patientInfo?.name).length}
                  </div>
                  <div className="theme-text-secondary">Patients Identified</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-500">
                    {documents.reduce((sum, d) => sum + (d.extractedData?.values?.length || 0), 0)}
                  </div>
                  <div className="theme-text-secondary">Lab Values</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-500">
                    {documents.reduce((sum, d) => sum + (d.extractedData?.medications?.length || 0), 0)}
                  </div>
                  <div className="theme-text-secondary">Medications</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-500">
                    {documents.filter(d => d.ocrResult).length}
                  </div>
                  <div className="theme-text-secondary">OCR Processed</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedDocumentUpload;