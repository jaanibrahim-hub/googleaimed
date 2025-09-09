import { OnboardingFlow, OnboardingStep } from '../types';
import { userPreferencesService } from './medicalSpecialties';

const ONBOARDING_STATUS_KEY = 'mediteach-onboarding-status';

// Main onboarding flow for new users
export const mainOnboardingFlow: OnboardingFlow = {
  id: 'main-onboarding',
  title: 'Welcome to MediTeach AI',
  description: 'Learn how to get the most out of your personal medical guide',
  estimatedTime: 3,
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to MediTeach AI! 👋',
      description: 'Your intelligent medical education companion',
      placement: 'center',
      content: `
        <div class="text-center space-y-4">
          <div class="text-6xl mb-4">🏥</div>
          <h2 class="text-2xl font-bold text-[#1A2B42]">Welcome to MediTeach AI</h2>
          <p class="text-gray-600 max-w-md mx-auto">
            Transform complex medical information into easy-to-understand explanations with AI-powered visual guides.
          </p>
          <div class="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <strong>What makes us special:</strong><br/>
            • Visual medical explanations<br/>
            • Specialist-level expertise<br/>
            • Conversation history<br/>
            • Mobile-optimized experience
          </div>
        </div>
      `,
      canSkip: false
    },
    {
      id: 'medical-specialties',
      title: 'Choose Your Medical Focus 🩺',
      description: 'Select a specialty for tailored explanations',
      placement: 'center',
      content: `
        <div class="space-y-4">
          <h3 class="text-xl font-bold text-[#1A2B42]">Medical Specialties</h3>
          <p class="text-gray-600">
            MediTeach AI offers specialized knowledge across 12+ medical fields. 
            Choose a specialty to get expert-level explanations tailored to that field.
          </p>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="flex items-center space-x-2 p-2 bg-red-50 rounded">
              <i class="fas fa-heartbeat text-red-500"></i>
              <span>Cardiology</span>
            </div>
            <div class="flex items-center space-x-2 p-2 bg-purple-50 rounded">
              <i class="fas fa-brain text-purple-500"></i>
              <span>Neurology</span>
            </div>
            <div class="flex items-center space-x-2 p-2 bg-orange-50 rounded">
              <i class="fas fa-dna text-orange-500"></i>
              <span>Endocrinology</span>
            </div>
            <div class="flex items-center space-x-2 p-2 bg-green-50 rounded">
              <i class="fas fa-baby text-green-500"></i>
              <span>Pediatrics</span>
            </div>
          </div>
          <p class="text-xs text-gray-500">
            You can change your specialty anytime or use general medicine mode.
          </p>
        </div>
      `,
      action: {
        type: 'demo',
        demoAction: () => {
          // Will be implemented in the component
          console.log('Demo: Show specialty selector');
        }
      }
    },
    {
      id: 'ask-question',
      title: 'Ask Your First Medical Question 💬',
      description: 'Try asking about a medical condition or symptom',
      targetElement: 'chat-input',
      placement: 'top',
      content: `
        <div class="space-y-3">
          <h3 class="font-bold text-[#1A2B42]">Ask Medical Questions</h3>
          <p class="text-gray-600 text-sm">
            Ask about symptoms, conditions, treatments, or upload medical documents for analysis.
          </p>
          <div class="bg-green-50 p-3 rounded text-sm">
            <strong>Try examples like:</strong><br/>
            • "What does high blood pressure mean?"<br/>
            • "Explain diabetes in simple terms"<br/>
            • "How does chemotherapy work?"
          </div>
        </div>
      `,
      action: {
        type: 'input',
        inputPlaceholder: 'What does high blood pressure mean?'
      }
    },
    {
      id: 'visual-explanations',
      title: 'Visual Medical Explanations 🎨',
      description: 'See how AI creates custom medical illustrations',
      placement: 'center',
      content: `
        <div class="space-y-4">
          <h3 class="text-xl font-bold text-[#1A2B42]">Visual Learning</h3>
          <p class="text-gray-600">
            MediTeach AI generates custom medical illustrations to help you understand complex concepts visually.
          </p>
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <div class="text-center space-y-2">
              <i class="fas fa-eye text-4xl text-blue-500"></i>
              <p class="font-medium">Personalized Visual Guides</p>
              <p class="text-sm text-gray-600">
                Each explanation comes with AI-generated diagrams, illustrations, and visual aids.
              </p>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2 text-xs text-center">
            <div class="p-2 bg-gray-50 rounded">
              <i class="fas fa-image text-gray-500 mb-1"></i>
              <div>Diagrams</div>
            </div>
            <div class="p-2 bg-gray-50 rounded">
              <i class="fas fa-chart-line text-gray-500 mb-1"></i>
              <div>Charts</div>
            </div>
            <div class="p-2 bg-gray-50 rounded">
              <i class="fas fa-user-md text-gray-500 mb-1"></i>
              <div>Avatars</div>
            </div>
          </div>
        </div>
      `,
      isDemo: true
    },
    {
      id: 'upload-documents',
      title: 'Upload Medical Documents 📄',
      description: 'Get personalized analysis of your medical files',
      targetElement: 'file-upload-button',
      placement: 'top',
      content: `
        <div class="space-y-3">
          <h3 class="font-bold text-[#1A2B42]">Upload Documents</h3>
          <p class="text-gray-600 text-sm">
            Upload lab reports, X-rays, MRI scans, or other medical documents for personalized analysis.
          </p>
          <div class="space-y-2 text-xs">
            <div class="flex items-center space-x-2 text-green-600">
              <i class="fas fa-check-circle"></i>
              <span>Lab results and blood tests</span>
            </div>
            <div class="flex items-center space-x-2 text-green-600">
              <i class="fas fa-check-circle"></i>
              <span>X-rays and medical imaging</span>
            </div>
            <div class="flex items-center space-x-2 text-green-600">
              <i class="fas fa-check-circle"></i>
              <span>Medical reports and summaries</span>
            </div>
          </div>
          <div class="bg-blue-50 p-2 rounded text-xs text-blue-800">
            <i class="fas fa-shield-alt mr-1"></i>
            Your documents are processed securely and never stored permanently.
          </div>
        </div>
      `,
      action: {
        type: 'highlight'
      }
    },
    {
      id: 'conversation-history',
      title: 'Your Medical Journey History 📚',
      description: 'All conversations are saved for future reference',
      targetElement: 'history-button',
      placement: 'bottom',
      content: `
        <div class="space-y-3">
          <h3 class="font-bold text-[#1A2B42]">Conversation History</h3>
          <p class="text-gray-600 text-sm">
            Every conversation is automatically saved so you can track your medical learning journey.
          </p>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="flex items-center space-x-2">
              <i class="fas fa-search text-blue-500"></i>
              <span>Search past conversations</span>
            </div>
            <div class="flex items-center space-x-2">
              <i class="fas fa-tags text-green-500"></i>
              <span>Auto-tagged by topic</span>
            </div>
            <div class="flex items-center space-x-2">
              <i class="fas fa-download text-purple-500"></i>
              <span>Export & backup</span>
            </div>
            <div class="flex items-center space-x-2">
              <i class="fas fa-clock text-orange-500"></i>
              <span>Timeline view</span>
            </div>
          </div>
        </div>
      `,
      action: {
        type: 'highlight'
      }
    },
    {
      id: 'quick-actions',
      title: 'Quick Actions & Smart Suggestions 🚀',
      description: 'Use specialty-specific quick actions for faster help',
      targetElement: 'quick-actions',
      placement: 'top',
      content: `
        <div class="space-y-3">
          <h3 class="font-bold text-[#1A2B42]">Quick Actions</h3>
          <p class="text-gray-600 text-sm">
            Get instant help with common medical questions using our smart quick action buttons.
          </p>
          <div class="space-y-2 text-sm">
            <div class="bg-gradient-to-r from-[#E8F4F8] to-[#D1E9F0] p-2 rounded border border-[#B8DCE6]">
              <strong>Specialty-Based Actions:</strong><br/>
              <span class="text-xs text-gray-600">Actions change based on your selected medical specialty</span>
            </div>
          </div>
          <p class="text-xs text-gray-500">
            Click any quick action to get instant, contextual medical explanations.
          </p>
        </div>
      `,
      action: {
        type: 'highlight'
      }
    },
    {
      id: 'mobile-pwa',
      title: 'Install as Mobile App 📱',
      description: 'Get the full app experience on your device',
      placement: 'center',
      content: `
        <div class="space-y-4">
          <h3 class="text-xl font-bold text-[#1A2B42]">Mobile App Experience</h3>
          <p class="text-gray-600">
            Install MediTeach AI on your phone or tablet for quick access to medical guidance anywhere.
          </p>
          <div class="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="flex items-center space-x-2">
                <i class="fas fa-wifi text-green-500"></i>
                <span>Works offline</span>
              </div>
              <div class="flex items-center space-x-2">
                <i class="fas fa-mobile-alt text-blue-500"></i>
                <span>Native app feel</span>
              </div>
              <div class="flex items-center space-x-2">
                <i class="fas fa-bolt text-purple-500"></i>
                <span>Faster loading</span>
              </div>
              <div class="flex items-center space-x-2">
                <i class="fas fa-home text-orange-500"></i>
                <span>Home screen icon</span>
              </div>
            </div>
          </div>
          <div class="text-center">
            <p class="text-xs text-gray-500 mb-2">
              Look for the install prompt or use your browser's "Add to Home Screen" option
            </p>
            <i class="fas fa-arrow-down text-2xl text-gray-400"></i>
          </div>
        </div>
      `,
      isDemo: true
    },
    {
      id: 'privacy-safety',
      title: 'Privacy & Medical Safety 🔒',
      description: 'Understanding our privacy and safety commitment',
      placement: 'center',
      content: `
        <div class="space-y-4">
          <h3 class="text-xl font-bold text-[#1A2B42]">Your Privacy & Safety</h3>
          <div class="grid grid-cols-1 gap-3 text-sm">
            <div class="flex items-start space-x-3 p-3 bg-green-50 rounded">
              <i class="fas fa-shield-alt text-green-500 mt-1"></i>
              <div>
                <strong>Data Privacy:</strong><br/>
                <span class="text-gray-600">All data stays on your device. Nothing is sent to our servers.</span>
              </div>
            </div>
            <div class="flex items-start space-x-3 p-3 bg-blue-50 rounded">
              <i class="fas fa-user-md text-blue-500 mt-1"></i>
              <div>
                <strong>Educational Purpose:</strong><br/>
                <span class="text-gray-600">For educational purposes only. Always consult healthcare professionals.</span>
              </div>
            </div>
            <div class="flex items-start space-x-3 p-3 bg-purple-50 rounded">
              <i class="fas fa-heart text-purple-500 mt-1"></i>
              <div>
                <strong>Supportive Care:</strong><br/>
                <span class="text-gray-600">Designed to support, not replace, professional medical advice.</span>
              </div>
            </div>
          </div>
        </div>
      `,
      canSkip: false
    },
    {
      id: 'getting-started',
      title: 'You\'re Ready to Start! 🎉',
      description: 'Begin your medical learning journey',
      placement: 'center',
      content: `
        <div class="text-center space-y-4">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-2xl font-bold text-[#1A2B42]">You're All Set!</h2>
          <p class="text-gray-600">
            You're now ready to explore medical information with confidence using MediTeach AI.
          </p>
          <div class="bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] text-white p-4 rounded-lg">
            <h4 class="font-bold mb-2">Quick Recap:</h4>
            <div class="text-sm text-left space-y-1">
              <div>✓ Choose medical specialties for expert guidance</div>
              <div>✓ Ask questions and upload medical documents</div>
              <div>✓ Get visual explanations and illustrations</div>
              <div>✓ Access conversation history anytime</div>
              <div>✓ Install as a mobile app for convenience</div>
            </div>
          </div>
          <p class="text-sm text-gray-500">
            Need help? You can replay this tutorial anytime from the settings menu.
          </p>
        </div>
      `,
      canSkip: false
    }
  ]
};

// Feature-specific mini tutorials
export const featureTutorials: OnboardingFlow[] = [
  {
    id: 'specialty-tutorial',
    title: 'Medical Specialties Guide',
    description: 'Learn how to use medical specialties effectively',
    estimatedTime: 2,
    steps: [
      {
        id: 'specialty-overview',
        title: 'Medical Specialties Overview',
        description: 'Understanding specialty-focused responses',
        placement: 'center',
        content: 'Detailed specialty tutorial content...'
      }
    ]
  },
  {
    id: 'document-upload-tutorial',
    title: 'Document Upload Guide',
    description: 'How to upload and analyze medical documents',
    estimatedTime: 1.5,
    steps: [
      {
        id: 'upload-overview',
        title: 'Document Upload Overview',
        description: 'Learn to upload medical files effectively',
        placement: 'center',
        content: 'Document upload tutorial content...'
      }
    ]
  }
];

export class OnboardingService {
  private static instance: OnboardingService;
  
  private constructor() {}
  
  static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService();
    }
    return OnboardingService.instance;
  }

  // Check if user has completed onboarding
  hasCompletedOnboarding(): boolean {
    try {
      const preferences = userPreferencesService.getPreferences();
      return preferences.hasCompletedOnboarding || false;
    } catch {
      return false;
    }
  }

  // Mark onboarding as completed
  markOnboardingCompleted(): void {
    try {
      userPreferencesService.savePreferences({ hasCompletedOnboarding: true });
      console.log('✅ Onboarding completed successfully');
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
    }
  }

  // Reset onboarding status (for testing or user request)
  resetOnboarding(): void {
    try {
      userPreferencesService.savePreferences({ hasCompletedOnboarding: false });
      console.log('🔄 Onboarding reset');
    } catch (error) {
      console.error('Failed to reset onboarding status:', error);
    }
  }

  // Get onboarding flow by ID
  getOnboardingFlow(flowId: string): OnboardingFlow | null {
    if (flowId === 'main-onboarding') {
      return mainOnboardingFlow;
    }
    
    return featureTutorials.find(tutorial => tutorial.id === flowId) || null;
  }

  // Get all available tutorials
  getAllTutorials(): OnboardingFlow[] {
    return [mainOnboardingFlow, ...featureTutorials];
  }

  // Check if user should see onboarding
  shouldShowOnboarding(): boolean {
    // Show onboarding for new users or if explicitly requested
    const hasCompleted = this.hasCompletedOnboarding();
    const isNewUser = !hasCompleted;
    
    // You could add additional logic here, such as:
    // - Show onboarding after major updates
    // - Show onboarding if user hasn't used the app in a while
    // - Show specific feature tutorials when new features are added
    
    return isNewUser;
  }

  // Track onboarding step completion for analytics
  trackStepCompleted(flowId: string, stepId: string): void {
    try {
      const completedSteps = this.getCompletedSteps(flowId);
      if (!completedSteps.includes(stepId)) {
        completedSteps.push(stepId);
        this.saveCompletedSteps(flowId, completedSteps);
      }
      
      console.log(`📊 Onboarding step completed: ${flowId}/${stepId}`);
    } catch (error) {
      console.error('Failed to track step completion:', error);
    }
  }

  // Get completed steps for a flow
  private getCompletedSteps(flowId: string): string[] {
    try {
      const data = localStorage.getItem(`${ONBOARDING_STATUS_KEY}-${flowId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Save completed steps
  private saveCompletedSteps(flowId: string, steps: string[]): void {
    try {
      localStorage.setItem(`${ONBOARDING_STATUS_KEY}-${flowId}`, JSON.stringify(steps));
    } catch (error) {
      console.error('Failed to save completed steps:', error);
    }
  }

  // Calculate onboarding progress
  getOnboardingProgress(flowId: string): number {
    const flow = this.getOnboardingFlow(flowId);
    if (!flow) return 0;
    
    const completedSteps = this.getCompletedSteps(flowId);
    return Math.round((completedSteps.length / flow.steps.length) * 100);
  }
}

// Export singleton instance
export const onboardingService = OnboardingService.getInstance();