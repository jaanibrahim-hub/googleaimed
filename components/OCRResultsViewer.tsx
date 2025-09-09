import React, { useState } from 'react';
import { DocumentUpload, OCRResult, MedicalDocumentData, LabValue } from '../types';
import { useTheme } from '../hooks/useTheme';
import OCRService from '../services/ocrService';

interface OCRResultsViewerProps {
  document: DocumentUpload;
  isOpen: boolean;
  onClose: () => void;
}

const OCRResultsViewer: React.FC<OCRResultsViewerProps> = ({
  document,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'analysis' | 'preview'>('analysis');
  const { isDarkMode } = useTheme();
  const ocrService = OCRService.getInstance();

  if (!isOpen || !document.ocrResult) return null;

  const { ocrResult, extractedData } = document;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-500';
    if (confidence >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getLabValueStatus = (value: LabValue) => {
    switch (value.flag) {
      case 'high':
        return { icon: 'fas fa-arrow-up', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
      case 'low':
        return { icon: 'fas fa-arrow-down', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' };
      case 'critical':
        return { icon: 'fas fa-exclamation-triangle', color: 'text-red-600', bg: 'bg-red-200 dark:bg-red-900/50' };
      default:
        return { icon: 'fas fa-check', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' };
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="theme-modal w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border">
          <div className="flex items-center gap-3">
            <i className="fas fa-file-medical-alt text-blue-500 text-xl"></i>
            <div>
              <h2 className="text-xl font-semibold theme-text">OCR Analysis Results</h2>
              <p className="text-sm theme-text-secondary">{document.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={`text-sm font-medium ${getConfidenceColor(ocrService.calculateConfidenceScore(ocrResult))}`}>
                {ocrService.calculateConfidenceScore(ocrResult)}% Confidence
              </div>
              <div className="text-xs theme-text-secondary">
                {ocrResult.text.length} characters extracted
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <i className="fas fa-times text-gray-500"></i>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b theme-border">
          {[
            { id: 'analysis', name: 'Medical Analysis', icon: 'fas fa-analytics' },
            { id: 'text', name: 'Raw Text', icon: 'fas fa-align-left' },
            { id: 'preview', name: 'Document Preview', icon: 'fas fa-image' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-6 py-3 font-medium transition-colors
                ${activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'theme-text-secondary hover:text-blue-500'
                }
              `}
            >
              <i className={`${tab.icon} text-sm`}></i>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'analysis' && extractedData && (
            <div className="space-y-6">
              {/* Patient Information */}
              {extractedData.patientInfo && Object.values(extractedData.patientInfo).some(v => v) && (
                <div className="theme-card p-4 rounded-lg">
                  <h3 className="font-semibold theme-text mb-3 flex items-center gap-2">
                    <i className="fas fa-user-md text-blue-500"></i>
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {extractedData.patientInfo.name && (
                      <div>
                        <span className="theme-text-secondary">Name:</span>
                        <div className="font-medium theme-text">{extractedData.patientInfo.name}</div>
                      </div>
                    )}
                    {extractedData.patientInfo.dateOfBirth && (
                      <div>
                        <span className="theme-text-secondary">Date of Birth:</span>
                        <div className="font-medium theme-text">{extractedData.patientInfo.dateOfBirth}</div>
                      </div>
                    )}
                    {extractedData.patientInfo.id && (
                      <div>
                        <span className="theme-text-secondary">Patient ID:</span>
                        <div className="font-medium theme-text">{extractedData.patientInfo.id}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Provider Information */}
              {extractedData.provider && Object.values(extractedData.provider).some(v => v) && (
                <div className="theme-card p-4 rounded-lg">
                  <h3 className="font-semibold theme-text mb-3 flex items-center gap-2">
                    <i className="fas fa-hospital text-green-500"></i>
                    Healthcare Provider
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {extractedData.provider.name && (
                      <div>
                        <span className="theme-text-secondary">Doctor:</span>
                        <div className="font-medium theme-text">{extractedData.provider.name}</div>
                      </div>
                    )}
                    {extractedData.provider.facility && (
                      <div>
                        <span className="theme-text-secondary">Facility:</span>
                        <div className="font-medium theme-text">{extractedData.provider.facility}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Lab Values */}
              {extractedData.values && extractedData.values.length > 0 && (
                <div className="theme-card p-4 rounded-lg">
                  <h3 className="font-semibold theme-text mb-3 flex items-center gap-2">
                    <i className="fas fa-flask text-purple-500"></i>
                    Laboratory Results ({extractedData.values.length})
                  </h3>
                  <div className="space-y-3">
                    {extractedData.values.map((value, index) => {
                      const status = getLabValueStatus(value);
                      return (
                        <div key={index} className={`p-3 rounded-lg ${status.bg}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium theme-text">{value.name}</div>
                              <div className="text-sm theme-text-secondary">
                                {value.range && `Normal: ${value.range}`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${status.color} flex items-center gap-2`}>
                                <i className={status.icon}></i>
                                {value.value} {value.unit}
                              </div>
                              <div className="text-xs theme-text-secondary capitalize">
                                {value.flag || 'normal'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Medications */}
              {extractedData.medications && extractedData.medications.length > 0 && (
                <div className="theme-card p-4 rounded-lg">
                  <h3 className="font-semibold theme-text mb-3 flex items-center gap-2">
                    <i className="fas fa-pills text-green-500"></i>
                    Medications ({extractedData.medications.length})
                  </h3>
                  <div className="space-y-3">
                    {extractedData.medications.map((med, index) => (
                      <div key={index} className="p-3 theme-surface rounded-lg border theme-border">
                        <div className="font-medium theme-text">{med.name}</div>
                        {med.dosage && (
                          <div className="text-sm theme-text-secondary">Dosage: {med.dosage}</div>
                        )}
                        {med.frequency && (
                          <div className="text-sm theme-text-secondary">Frequency: {med.frequency}</div>
                        )}
                        {med.instructions && (
                          <div className="text-sm theme-text-secondary">Instructions: {med.instructions}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Findings */}
              {extractedData.findings && extractedData.findings.length > 0 && (
                <div className="theme-card p-4 rounded-lg">
                  <h3 className="font-semibold theme-text mb-3 flex items-center gap-2">
                    <i className="fas fa-search text-orange-500"></i>
                    Clinical Findings
                  </h3>
                  <div className="space-y-2">
                    {extractedData.findings.map((finding, index) => (
                      <div key={index} className="p-3 theme-surface rounded border theme-border">
                        <p className="text-sm theme-text">{finding}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {extractedData.recommendations && extractedData.recommendations.length > 0 && (
                <div className="theme-card p-4 rounded-lg">
                  <h3 className="font-semibold theme-text mb-3 flex items-center gap-2">
                    <i className="fas fa-lightbulb text-yellow-500"></i>
                    Recommendations
                  </h3>
                  <div className="space-y-2">
                    {extractedData.recommendations.map((rec, index) => (
                      <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold theme-text">Extracted Text</h3>
                <button
                  onClick={() => navigator.clipboard.writeText(ocrResult.text)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  <i className="fas fa-copy mr-1"></i>
                  Copy Text
                </button>
              </div>
              
              <div className="theme-surface border theme-border rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm theme-text font-mono">
                  {ocrService.highlightMedicalTerms ? 
                    <div dangerouslySetInnerHTML={{ __html: ocrService.highlightMedicalTerms(ocrResult.text) }} />
                    : ocrResult.text
                  }
                </pre>
              </div>

              {ocrResult.boundingBoxes && ocrResult.boundingBoxes.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium theme-text mb-2">Recognition Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-3 theme-surface rounded border theme-border">
                      <div className="text-lg font-semibold text-blue-500">
                        {ocrResult.boundingBoxes.length}
                      </div>
                      <div className="theme-text-secondary">Words Detected</div>
                    </div>
                    <div className="text-center p-3 theme-surface rounded border theme-border">
                      <div className="text-lg font-semibold text-green-500">
                        {Math.round(ocrService.calculateConfidenceScore(ocrResult))}%
                      </div>
                      <div className="theme-text-secondary">Avg Confidence</div>
                    </div>
                    <div className="text-center p-3 theme-surface rounded border theme-border">
                      <div className="text-lg font-semibold text-purple-500">
                        {ocrResult.text.length}
                      </div>
                      <div className="theme-text-secondary">Characters</div>
                    </div>
                    <div className="text-center p-3 theme-surface rounded border theme-border">
                      <div className="text-lg font-semibold text-orange-500">
                        {ocrResult.language || 'EN'}
                      </div>
                      <div className="theme-text-secondary">Language</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4">
              <h3 className="font-semibold theme-text">Document Preview</h3>
              
              {document.preview ? (
                <div className="text-center">
                  <img
                    src={document.preview}
                    alt={document.name}
                    className="max-w-full max-h-96 mx-auto border theme-border rounded-lg shadow-md"
                  />
                </div>
              ) : (
                <div className="text-center py-8 theme-surface rounded-lg border theme-border">
                  <i className="fas fa-file-alt text-4xl theme-text-secondary mb-2"></i>
                  <p className="theme-text-secondary">Preview not available for this file type</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="theme-text-secondary">File Type:</span>
                  <div className="font-medium theme-text">{document.type}</div>
                </div>
                <div>
                  <span className="theme-text-secondary">File Size:</span>
                  <div className="font-medium theme-text">
                    {(document.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <div>
                  <span className="theme-text-secondary">Uploaded:</span>
                  <div className="font-medium theme-text">
                    {new Date(document.uploadedAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="theme-text-secondary">Medical Type:</span>
                  <div className="font-medium theme-text capitalize">
                    {document.medicalType?.replace('_', ' ') || 'Other'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t theme-border bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2 text-sm theme-text-secondary">
            <i className="fas fa-info-circle text-blue-500"></i>
            <span>OCR processed with Tesseract.js</span>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                const blob = new Blob([ocrResult.text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${document.name}_extracted.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 theme-button-secondary rounded-lg transition-colors"
            >
              <i className="fas fa-download mr-2"></i>
              Export Text
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 theme-button-primary rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRResultsViewer;