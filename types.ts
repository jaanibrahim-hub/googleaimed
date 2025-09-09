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