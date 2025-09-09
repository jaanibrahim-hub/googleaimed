import React from 'react';
import { useOnboarding } from '../hooks/useOnboarding';

interface OnboardingTriggerProps {
  className?: string;
  variant?: 'button' | 'menu-item' | 'link';
  children?: React.ReactNode;
}

const OnboardingTrigger: React.FC<OnboardingTriggerProps> = ({
  className = '',
  variant = 'button',
  children
}) => {
  const { startOnboarding, getAllTutorials } = useOnboarding();
  const tutorials = getAllTutorials();

  const handleStartMainOnboarding = () => {
    startOnboarding('main-onboarding');
  };

  const baseClasses = {
    button: 'px-4 py-2 bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2',
    'menu-item': 'w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2',
    link: 'text-[#2E7D95] hover:text-[#4A90A4] underline cursor-pointer flex items-center space-x-1'
  };

  return (
    <button
      onClick={handleStartMainOnboarding}
      className={`${baseClasses[variant]} ${className}`}
      title="Start interactive tutorial"
    >
      <i className="fas fa-graduation-cap"></i>
      {children || <span>Tutorial</span>}
    </button>
  );
};

export default OnboardingTrigger;