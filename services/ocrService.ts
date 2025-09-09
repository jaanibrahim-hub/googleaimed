import { OCRResult, OCRBoundingBox, OCRPage, MedicalDocumentData, LabValue, Medication } from '../types';

// We'll use Tesseract.js for client-side OCR
declare global {
  interface Window {
    Tesseract: any;
  }
}

class OCRService {
  private static instance: OCRService;
  private isInitialized = false;
  private worker: any = null;

  private constructor() {
    this.initializeOCR();
  }

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  private async initializeOCR(): Promise<void> {
    if (this.isInitialized || !window.Tesseract) return;

    try {
      const { createWorker } = window.Tesseract;
      this.worker = await createWorker('eng');
      
      // Configure Tesseract for better medical text recognition
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,()-:;/% ',
        tessedit_pageseg_mode: '6', // Uniform block of text
        preserve_interword_spaces: '1',
      });

      this.isInitialized = true;
      console.log('🔍 OCR Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR service:', error);
    }
  }

  public async processDocument(file: File, progressCallback?: (progress: number) => void): Promise<OCRResult> {
    if (!this.isInitialized) {
      await this.initializeOCR();
    }

    if (!this.worker) {
      throw new Error('OCR service not available');
    }

    try {
      const imageUrl = URL.createObjectURL(file);
      
      const result = await this.worker.recognize(imageUrl, {
        logger: (m: any) => {
          if (m.status === 'recognizing text' && progressCallback) {
            progressCallback(m.progress * 100);
          }
        }
      });

      URL.revokeObjectURL(imageUrl);

      const ocrResult: OCRResult = {
        text: result.data.text,
        confidence: result.data.confidence,
        language: 'eng',
        boundingBoxes: this.extractBoundingBoxes(result.data),
      };

      return ocrResult;
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractBoundingBoxes(data: any): OCRBoundingBox[] {
    const boxes: OCRBoundingBox[] = [];
    
    if (data.words) {
      data.words.forEach((word: any) => {
        if (word.text.trim()) {
          boxes.push({
            text: word.text,
            confidence: word.confidence,
            x: word.bbox.x0,
            y: word.bbox.y0,
            width: word.bbox.x1 - word.bbox.x0,
            height: word.bbox.y1 - word.bbox.y0,
          });
        }
      });
    }

    return boxes;
  }

  public analyzeMedicalDocument(ocrResult: OCRResult, fileName: string): MedicalDocumentData {
    const text = ocrResult.text.toLowerCase();
    const originalText = ocrResult.text;
    
    // Determine document type
    const docType = this.detectDocumentType(text);
    
    // Extract structured data based on document type
    const extractedData: MedicalDocumentData = {
      type: docType,
      patientInfo: this.extractPatientInfo(originalText),
      provider: this.extractProviderInfo(originalText),
      date: this.extractDate(originalText),
      findings: this.extractFindings(originalText),
      values: this.extractLabValues(originalText),
      medications: this.extractMedications(originalText),
      recommendations: this.extractRecommendations(originalText),
    };

    return extractedData;
  }

  private detectDocumentType(text: string): string {
    const labKeywords = ['lab', 'laboratory', 'blood', 'urine', 'chemistry', 'hematology', 'glucose', 'cholesterol', 'hemoglobin'];
    const prescriptionKeywords = ['prescription', 'rx', 'medication', 'take', 'daily', 'mg', 'tablet', 'capsule'];
    const radKeywords = ['radiology', 'x-ray', 'ct', 'mri', 'ultrasound', 'scan', 'imaging'];
    const reportKeywords = ['report', 'history', 'physical', 'examination', 'diagnosis', 'assessment'];

    if (labKeywords.some(keyword => text.includes(keyword))) {
      return 'lab_report';
    } else if (prescriptionKeywords.some(keyword => text.includes(keyword))) {
      return 'prescription';
    } else if (radKeywords.some(keyword => text.includes(keyword))) {
      return 'radiology';
    } else if (reportKeywords.some(keyword => text.includes(keyword))) {
      return 'medical_record';
    }

    return 'other';
  }

  private extractPatientInfo(text: string): { name?: string; dateOfBirth?: string; id?: string } {
    const patientInfo: { name?: string; dateOfBirth?: string; id?: string } = {};

    // Extract patient name (look for patterns like "Patient: John Doe" or "Name: John Doe")
    const nameMatch = text.match(/(?:patient|name):\s*([A-Za-z\s]+)/i);
    if (nameMatch) {
      patientInfo.name = nameMatch[1].trim();
    }

    // Extract date of birth
    const dobMatch = text.match(/(?:dob|date of birth|born):\s*(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i);
    if (dobMatch) {
      patientInfo.dateOfBirth = dobMatch[1];
    }

    // Extract patient ID or MRN
    const idMatch = text.match(/(?:mrn|patient id|id):\s*([A-Za-z0-9]+)/i);
    if (idMatch) {
      patientInfo.id = idMatch[1];
    }

    return patientInfo;
  }

  private extractProviderInfo(text: string): { name?: string; facility?: string } {
    const providerInfo: { name?: string; facility?: string } = {};

    // Extract provider name
    const providerMatch = text.match(/(?:doctor|dr\.?|physician|provider):\s*([A-Za-z\s\.]+)/i);
    if (providerMatch) {
      providerInfo.name = providerMatch[1].trim();
    }

    // Extract facility
    const facilityMatch = text.match(/(?:hospital|clinic|medical center|facility):\s*([A-Za-z\s]+)/i);
    if (facilityMatch) {
      providerInfo.facility = facilityMatch[1].trim();
    }

    return providerInfo;
  }

  private extractDate(text: string): string | undefined {
    // Look for various date formats
    const datePatterns = [
      /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/,
      /\b(\d{4}-\d{2}-\d{2})\b/,
      /\b(\d{1,2}-\d{1,2}-\d{4})\b/,
      /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  private extractLabValues(text: string): LabValue[] {
    const values: LabValue[] = [];
    
    // Common lab value patterns
    const labPatterns = [
      // Pattern: "Glucose: 120 mg/dL (70-100)"
      /([A-Za-z\s]+):\s*(\d+\.?\d*)\s*([A-Za-z\/]+)?\s*\(([^)]+)\)?/g,
      // Pattern: "Hemoglobin 14.2 g/dL"
      /([A-Za-z\s]+)\s+(\d+\.?\d*)\s+([A-Za-z\/]+)/g,
    ];

    for (const pattern of labPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1].trim();
        const value = match[2];
        const unit = match[3] || '';
        const range = match[4] || '';

        // Determine if value is normal, high, or low
        let flag: 'normal' | 'high' | 'low' | 'critical' = 'normal';
        if (range && value) {
          const numValue = parseFloat(value);
          const rangeMatch = range.match(/(\d+\.?\d*)-(\d+\.?\d*)/);
          if (rangeMatch) {
            const min = parseFloat(rangeMatch[1]);
            const max = parseFloat(rangeMatch[2]);
            if (numValue < min) flag = 'low';
            else if (numValue > max) flag = 'high';
          }
        }

        values.push({ name, value, unit, range, flag });
      }
    }

    return values;
  }

  private extractMedications(text: string): Medication[] {
    const medications: Medication[] = [];
    
    // Medication pattern: "Medication Name 10mg twice daily"
    const medPatterns = [
      /([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+\s*mg)\s+(.*?)(?:\n|$)/gi,
      /^([A-Za-z\s]+)\s*-\s*(.+?)$/gm,
    ];

    for (const pattern of medPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1].trim();
        const dosageOrInstructions = match[2]?.trim();
        const instructions = match[3]?.trim();

        if (name && name.length > 2) {
          medications.push({
            name,
            dosage: dosageOrInstructions?.includes('mg') ? dosageOrInstructions : undefined,
            instructions: instructions || dosageOrInstructions,
          });
        }
      }
    }

    return medications;
  }

  private extractFindings(text: string): string[] {
    const findings: string[] = [];
    
    // Look for findings, impressions, or diagnoses
    const findingsPatterns = [
      /(?:findings?|impression|diagnosis):\s*([^.]+\.?)/gi,
      /(?:result|conclusion):\s*([^.]+\.?)/gi,
    ];

    for (const pattern of findingsPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const finding = match[1].trim();
        if (finding && finding.length > 10) {
          findings.push(finding);
        }
      }
    }

    return findings;
  }

  private extractRecommendations(text: string): string[] {
    const recommendations: string[] = [];
    
    // Look for recommendations, instructions, or follow-up
    const recPatterns = [
      /(?:recommend|suggestion|instruction|follow-?up):\s*([^.]+\.?)/gi,
      /(?:next steps?|plan):\s*([^.]+\.?)/gi,
    ];

    for (const pattern of recPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const recommendation = match[1].trim();
        if (recommendation && recommendation.length > 10) {
          recommendations.push(recommendation);
        }
      }
    }

    return recommendations;
  }

  public async destroy(): Promise<void> {
    if (this.worker) {
      try {
        await this.worker.terminate();
        this.worker = null;
        this.isInitialized = false;
        console.log('🔍 OCR Service terminated');
      } catch (error) {
        console.error('Error terminating OCR worker:', error);
      }
    }
  }

  // Utility methods for medical document processing
  public isMedicalDocument(fileName: string, text: string): boolean {
    const medicalKeywords = [
      'patient', 'doctor', 'hospital', 'clinic', 'medical', 'health',
      'diagnosis', 'treatment', 'medication', 'prescription', 'lab',
      'blood', 'urine', 'x-ray', 'ct', 'mri', 'ultrasound'
    ];

    const lowerText = text.toLowerCase();
    const lowerFileName = fileName.toLowerCase();
    
    return medicalKeywords.some(keyword => 
      lowerText.includes(keyword) || lowerFileName.includes(keyword)
    );
  }

  public calculateConfidenceScore(ocrResult: OCRResult): number {
    if (!ocrResult.boundingBoxes || ocrResult.boundingBoxes.length === 0) {
      return ocrResult.confidence;
    }

    const avgConfidence = ocrResult.boundingBoxes.reduce((sum, box) => sum + box.confidence, 0) / ocrResult.boundingBoxes.length;
    return Math.round(avgConfidence);
  }

  public highlightMedicalTerms(text: string): string {
    const medicalTerms = [
      'glucose', 'cholesterol', 'hemoglobin', 'blood pressure', 'heart rate',
      'diagnosis', 'prognosis', 'treatment', 'medication', 'prescription',
      'normal', 'abnormal', 'elevated', 'decreased', 'critical'
    ];

    let highlightedText = text;
    medicalTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, `<mark class="medical-term">$&</mark>`);
    });

    return highlightedText;
  }
}

export default OCRService;