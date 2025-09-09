export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  imageUrl?: string;
  uploadedImages?: {
    name: string;
    url: string;
  }[];
  suggestions?: string[];
  timestamp?: number;
  isUser?: boolean;
  content?: string;
  images?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  summary?: string;
  tags?: string[];
  characterDescription?: string;
  totalMessages: number;
  hasImages: boolean;
}

export interface ConversationSummary {
  id: string;
  title: string;
  summary: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  hasImages: boolean;
  tags: string[];
  lastMessage?: string;
}

export interface MedicalSpecialty {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  keywords: string[];
  commonConditions: string[];
  quickActions: string[];
}

export interface UserPreferences {
  selectedSpecialty: string | null;
  responseComplexity: 'basic' | 'intermediate' | 'advanced';
  visualPreference: boolean;
  language: string;
  autoSave: boolean;
  hasCompletedOnboarding: boolean;
  voiceEnabled: boolean;
  voiceLanguage: string;
  voiceRate: number;
  voicePitch: number;
  autoReadResponses: boolean;
  wakeWordEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode | string;
  targetElement?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    type: 'click' | 'input' | 'demo' | 'highlight';
    element?: string;
    demoAction?: () => void;
    inputPlaceholder?: string;
  };
  canSkip?: boolean;
  isDemo?: boolean;
}

export interface OnboardingFlow {
  id: string;
  title: string;
  description: string;
  steps: OnboardingStep[];
  estimatedTime: number; // in minutes
}

export interface VoiceSettings {
  isListening: boolean;
  isSupported: boolean;
  language: string;
  rate: number;
  pitch: number;
  volume: number;
  autoRead: boolean;
  wakeWordEnabled: boolean;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeConfig {
  name: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
}

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes?: OCRBoundingBox[];
  language?: string;
  pages?: OCRPage[];
}

export interface OCRBoundingBox {
  text: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRPage {
  pageNumber: number;
  text: string;
  confidence: number;
  boundingBoxes: OCRBoundingBox[];
}

export interface DocumentUpload {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
  uploadedAt: number;
  ocrResult?: OCRResult;
  isProcessing?: boolean;
  preview?: string;
  medicalType?: 'lab_report' | 'prescription' | 'medical_record' | 'xray' | 'scan' | 'other';
  extractedData?: MedicalDocumentData;
}

export interface MedicalDocumentData {
  patientInfo?: {
    name?: string;
    dateOfBirth?: string;
    id?: string;
  };
  provider?: {
    name?: string;
    facility?: string;
  };
  date?: string;
  type: string;
  findings?: string[];
  values?: LabValue[];
  medications?: Medication[];
  recommendations?: string[];
}

export interface LabValue {
  name: string;
  value: string;
  unit?: string;
  range?: string;
  flag?: 'normal' | 'high' | 'low' | 'critical';
}

export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  instructions?: string;
}

export interface ShareOptions {
  includeImages: boolean;
  includeMetadata: boolean;
  format: 'text' | 'markdown' | 'html' | 'json';
  privacy: 'anonymous' | 'personal';
}

export interface ShareableContent {
  id: string;
  type: 'message' | 'conversation' | 'image' | 'document';
  title: string;
  content: string;
  metadata?: {
    timestamp: number;
    specialty?: string;
    messageCount?: number;
    hasImages?: boolean;
  };
  images?: string[];
  format: ShareOptions['format'];
}

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

export interface ShareMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  action: (content: ShareableContent, options: ShareOptions) => Promise<void>;
  supported: boolean;
}