import React from 'react';
import { useConversationHistory } from '../hooks/useConversationHistory';
import { useMedicalSpecialty } from '../hooks/useMedicalSpecialty';
import OnboardingTrigger from './OnboardingTrigger';

interface WelcomeProps {
  onShowHistory?: () => void;
  onShowSpecialtySelector?: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onShowHistory, onShowSpecialtySelector }) => {
  const { hasHistory, conversationCount } = useConversationHistory();
  const { selectedSpecialty } = useMedicalSpecialty();
    return (
        <div className="flex justify-center items-center h-full p-4">
            <div className="theme-card p-8 sm:p-12 max-w-2xl text-center medical-card">
                <div className="text-6xl mb-6">🏥</div>
                <h2 className="text-3xl font-bold theme-text mb-4">Welcome to MediTeach AI</h2>
                <p className="theme-text-secondary mb-8 text-lg">
                    I'm here to help you understand your medical information with compassion and clarity.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div className="flex items-start gap-4 p-4 theme-surface rounded-lg theme-border border">
                        <i className="fas fa-comments medical-accent text-xl mt-1"></i>
                        <div>
                            <h3 className="font-semibold theme-text">Ask Questions</h3>
                            <p className="text-sm theme-text-secondary">About your medical conditions and treatments.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 theme-surface rounded-lg theme-border border">
                        <i className="fas fa-upload medical-accent text-xl mt-1"></i>
                         <div>
                            <h3 className="font-semibold theme-text">Upload Documents</h3>
                            <p className="text-sm theme-text-secondary">For personalized visual explanations.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 theme-surface rounded-lg theme-border border">
                        <i className="fas fa-eye medical-accent text-xl mt-1"></i>
                         <div>
                            <h3 className="font-semibold theme-text">Get Visuals</h3>
                            <p className="text-sm theme-text-secondary">That make complex topics easy to understand.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4 p-4 theme-surface rounded-lg theme-border border">
                        <i className="fas fa-heart medical-accent text-xl mt-1"></i>
                         <div>
                            <h3 className="font-semibold theme-text">Receive Support</h3>
                            <p className="text-sm theme-text-secondary">Throughout your entire medical journey.</p>
                        </div>
                    </div>
                </div>

                {/* Interactive Tutorial CTA */}
                <div className="mt-8 p-4 theme-gradient-secondary rounded-xl border-2 theme-border">
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <h4 className="font-semibold text-white mb-1">
                                New to MediTeach AI?
                            </h4>
                            <p className="text-sm text-white/80">
                                Take our interactive 3-minute tutorial to learn all the powerful features.
                            </p>
                        </div>
                        <OnboardingTrigger className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                            <span>Start Tutorial</span>
                        </OnboardingTrigger>
                    </div>
                </div>
                
                {/* Medical Specialty CTA */}
                {onShowSpecialtySelector && (
                    <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="text-left">
                                <h4 className="font-semibold text-blue-900 mb-1">
                                    {selectedSpecialty ? `${selectedSpecialty.name} Specialist Mode` : 'Choose Your Medical Specialty'}
                                </h4>
                                <p className="text-sm text-blue-700">
                                    {selectedSpecialty 
                                        ? `Getting tailored responses for ${selectedSpecialty.description.toLowerCase()}`
                                        : 'Get specialized medical explanations tailored to your area of interest'
                                    }
                                </p>
                            </div>
                            <button
                                onClick={onShowSpecialtySelector}
                                className={`font-medium px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                                    selectedSpecialty
                                        ? 'bg-white border-2 text-gray-700 hover:bg-gray-50'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                                style={selectedSpecialty ? {
                                    borderColor: selectedSpecialty.color,
                                    color: selectedSpecialty.color
                                } : {}}
                            >
                                {selectedSpecialty ? (
                                    <>
                                        <i className={selectedSpecialty.icon}></i>
                                        <span>Change</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-stethoscope"></i>
                                        <span>Select Specialty</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Conversation History CTA */}
                {hasHistory && onShowHistory && (
                    <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="text-left">
                                <h4 className="font-semibold text-green-900 mb-1">
                                    Continue Your Medical Journey
                                </h4>
                                <p className="text-sm text-green-700">
                                    You have {conversationCount} saved conversation{conversationCount !== 1 ? 's' : ''} with medical insights and explanations.
                                </p>
                            </div>
                            <button
                                onClick={onShowHistory}
                                className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                            >
                                <i className="fas fa-history"></i>
                                <span>View History</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Welcome;
