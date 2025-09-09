import React, { useState, useEffect, useRef } from 'react';
import { OnboardingFlow, OnboardingStep } from '../types';
import { onboardingService } from '../services/onboardingService';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  flow?: OnboardingFlow | null;
  onSpecialtySelectorDemo?: () => void;
  onInputDemo?: (text: string) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  flow,
  onSpecialtySelectorDemo,
  onInputDemo
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const currentStep = flow?.steps[currentStepIndex] || null;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === (flow?.steps.length || 0) - 1;
  const progress = flow ? ((currentStepIndex + 1) / flow.steps.length) * 100 : 0;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setHighlightedElement(null);
    }
  }, [isOpen]);

  // Handle highlighting elements
  useEffect(() => {
    if (currentStep?.targetElement && currentStep?.action?.type === 'highlight') {
      setHighlightedElement(currentStep.targetElement);
    } else {
      setHighlightedElement(null);
    }

    // Cleanup highlight when step changes or modal closes
    return () => setHighlightedElement(null);
  }, [currentStep]);

  // Add/remove highlight class to body for overlay effect
  useEffect(() => {
    if (highlightedElement && isOpen) {
      document.body.classList.add('onboarding-active');
      
      const element = document.querySelector(`[data-onboarding-id="${highlightedElement}"]`);
      if (element) {
        element.classList.add('onboarding-highlight');
      }
    } else {
      document.body.classList.remove('onboarding-active');
    }

    return () => {
      document.body.classList.remove('onboarding-active');
      document.querySelectorAll('.onboarding-highlight').forEach(el => {
        el.classList.remove('onboarding-highlight');
      });
    };
  }, [highlightedElement, isOpen]);

  const handleNext = () => {
    if (!flow || isAnimating) return;

    // Track step completion
    if (currentStep) {
      onboardingService.trackStepCompleted(flow.id, currentStep.id);
    }

    setIsAnimating(true);
    
    setTimeout(() => {
      if (isLastStep) {
        handleComplete();
      } else {
        setCurrentStepIndex(prev => prev + 1);
      }
      setIsAnimating(false);
    }, 200);
  };

  const handlePrevious = () => {
    if (isFirstStep || isAnimating) return;
    
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentStepIndex(prev => prev - 1);
      setIsAnimating(false);
    }, 200);
  };

  const handleSkip = () => {
    if (!flow) return;
    
    // Mark as completed even if skipped
    onboardingService.markOnboardingCompleted();
    onComplete();
  };

  const handleComplete = () => {
    if (!flow) return;
    
    onboardingService.markOnboardingCompleted();
    onComplete();
  };

  const handleActionClick = () => {
    if (!currentStep?.action) return;

    switch (currentStep.action.type) {
      case 'demo':
        if (currentStep.id === 'medical-specialties' && onSpecialtySelectorDemo) {
          onSpecialtySelectorDemo();
        }
        break;
      
      case 'input':
        if (currentStep.action.inputPlaceholder && onInputDemo) {
          onInputDemo(currentStep.action.inputPlaceholder);
        }
        break;
      
      case 'click':
        // Could trigger actual clicks on elements
        if (currentStep.action.element) {
          const element = document.querySelector(currentStep.action.element);
          if (element) {
            (element as HTMLElement).click();
          }
        }
        break;
    }

    // Auto-advance after demo actions
    setTimeout(() => {
      handleNext();
    }, 1500);
  };

  const getModalPosition = () => {
    if (!currentStep?.targetElement || currentStep.placement === 'center') {
      return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }

    // For targeted elements, position modal accordingly
    return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
  };

  const renderStepContent = (content: string) => {
    return (
      <div 
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  if (!isOpen || !flow || !currentStep) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 transition-opacity duration-300">
        
        {/* Modal */}
        <div 
          ref={modalRef}
          className={`bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden transition-all duration-300 ${getModalPosition()} ${
            isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'
          }`}
        >
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-500">
                    Step {currentStepIndex + 1} of {flow.steps.length}
                  </span>
                  {flow.estimatedTime && (
                    <span className="text-xs text-gray-400">
                      • {flow.estimatedTime} min tutorial
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-[#1A2B42] mb-1">
                  {currentStep.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {currentStep.description}
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 ml-4"
                title="Close tutorial"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <div className="min-h-[200px]">
              {typeof currentStep.content === 'string' ? (
                renderStepContent(currentStep.content)
              ) : (
                currentStep.content
              )}
            </div>

            {/* Action Button for Demos */}
            {currentStep.action && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleActionClick}
                  className="bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                >
                  {currentStep.action.type === 'demo' && (
                    <>
                      <i className="fas fa-play mr-2"></i>
                      Try Demo
                    </>
                  )}
                  {currentStep.action.type === 'input' && (
                    <>
                      <i className="fas fa-keyboard mr-2"></i>
                      Try Example
                    </>
                  )}
                  {currentStep.action.type === 'highlight' && (
                    <>
                      <i className="fas fa-eye mr-2"></i>
                      Show Me
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                <i className="fas fa-chevron-left text-xs"></i>
                <span>Previous</span>
              </button>
              
              {currentStep.canSkip !== false && (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
                >
                  Skip Tutorial
                </button>
              )}
            </div>

            <button
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <span>{isLastStep ? 'Complete' : 'Next'}</span>
              {!isLastStep && <i className="fas fa-chevron-right text-xs"></i>}
              {isLastStep && <i className="fas fa-check text-xs"></i>}
            </button>
          </div>
        </div>
      </div>

      {/* Global Styles for Highlighting */}
      <style jsx global>{`
        .onboarding-active {
          overflow: hidden;
        }
        
        .onboarding-highlight {
          position: relative;
          z-index: 60;
          border-radius: 8px;
          box-shadow: 0 0 0 4px rgba(46, 125, 149, 0.3), 
                      0 0 0 8px rgba(46, 125, 149, 0.1),
                      0 0 20px rgba(46, 125, 149, 0.2);
          animation: onboarding-pulse 2s infinite;
        }
        
        @keyframes onboarding-pulse {
          0%, 100% { 
            box-shadow: 0 0 0 4px rgba(46, 125, 149, 0.3), 
                        0 0 0 8px rgba(46, 125, 149, 0.1),
                        0 0 20px rgba(46, 125, 149, 0.2);
          }
          50% { 
            box-shadow: 0 0 0 6px rgba(46, 125, 149, 0.4), 
                        0 0 0 12px rgba(46, 125, 149, 0.15),
                        0 0 25px rgba(46, 125, 149, 0.3);
          }
        }
        
        .onboarding-highlight::before {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border: 2px solid #2E7D95;
          border-radius: 12px;
          pointer-events: none;
        }
      `}</style>
    </>
  );
};

export default OnboardingModal;