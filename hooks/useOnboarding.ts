import { useState, useEffect, useCallback } from 'react';
import { OnboardingFlow } from '../types';
import { onboardingService, mainOnboardingFlow } from '../services/onboardingService';

interface UseOnboardingReturn {
  // Onboarding state
  isOnboardingOpen: boolean;
  currentFlow: OnboardingFlow | null;
  hasCompletedOnboarding: boolean;
  shouldShowOnboarding: boolean;
  
  // Onboarding controls
  startOnboarding: (flowId?: string) => void;
  closeOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  
  // Tutorial management
  startTutorial: (tutorialId: string) => void;
  getAllTutorials: () => OnboardingFlow[];
  
  // Progress tracking
  getOnboardingProgress: (flowId: string) => number;
  
  // Auto-start functionality
  checkAndStartOnboarding: () => void;
}

export const useOnboarding = (): UseOnboardingReturn => {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<OnboardingFlow | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    onboardingService.hasCompletedOnboarding()
  );

  // Check if user should see onboarding
  const shouldShowOnboarding = onboardingService.shouldShowOnboarding();

  // Update completion status when it changes
  useEffect(() => {
    const checkCompletionStatus = () => {
      const completed = onboardingService.hasCompletedOnboarding();
      setHasCompletedOnboarding(completed);
    };

    // Check periodically in case it's updated elsewhere
    const interval = setInterval(checkCompletionStatus, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Start onboarding with specific flow
  const startOnboarding = useCallback((flowId: string = 'main-onboarding') => {
    const flow = onboardingService.getOnboardingFlow(flowId);
    if (flow) {
      setCurrentFlow(flow);
      setIsOnboardingOpen(true);
      console.log('🎓 Starting onboarding:', flow.title);
    }
  }, []);

  // Close onboarding
  const closeOnboarding = useCallback(() => {
    setIsOnboardingOpen(false);
    setCurrentFlow(null);
    console.log('👋 Onboarding closed');
  }, []);

  // Complete onboarding
  const completeOnboarding = useCallback(() => {
    onboardingService.markOnboardingCompleted();
    setHasCompletedOnboarding(true);
    setIsOnboardingOpen(false);
    setCurrentFlow(null);
    console.log('✅ Onboarding completed successfully');
  }, []);

  // Reset onboarding (for testing or user request)
  const resetOnboarding = useCallback(() => {
    onboardingService.resetOnboarding();
    setHasCompletedOnboarding(false);
    console.log('🔄 Onboarding reset');
  }, []);

  // Start specific tutorial
  const startTutorial = useCallback((tutorialId: string) => {
    const tutorial = onboardingService.getOnboardingFlow(tutorialId);
    if (tutorial) {
      setCurrentFlow(tutorial);
      setIsOnboardingOpen(true);
      console.log('📚 Starting tutorial:', tutorial.title);
    }
  }, []);

  // Get all available tutorials
  const getAllTutorials = useCallback((): OnboardingFlow[] => {
    return onboardingService.getAllTutorials();
  }, []);

  // Get onboarding progress for a specific flow
  const getOnboardingProgress = useCallback((flowId: string): number => {
    return onboardingService.getOnboardingProgress(flowId);
  }, []);

  // Check and auto-start onboarding for new users
  const checkAndStartOnboarding = useCallback(() => {
    if (shouldShowOnboarding && !isOnboardingOpen) {
      // Add a small delay to ensure the app is fully loaded
      setTimeout(() => {
        startOnboarding('main-onboarding');
      }, 1000);
    }
  }, [shouldShowOnboarding, isOnboardingOpen, startOnboarding]);

  return {
    // Onboarding state
    isOnboardingOpen,
    currentFlow,
    hasCompletedOnboarding,
    shouldShowOnboarding,
    
    // Onboarding controls
    startOnboarding,
    closeOnboarding,
    completeOnboarding,
    resetOnboarding,
    
    // Tutorial management
    startTutorial,
    getAllTutorials,
    
    // Progress tracking
    getOnboardingProgress,
    
    // Auto-start functionality
    checkAndStartOnboarding,
  };
};