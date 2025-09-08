import React, { useState, useEffect } from 'react';

const MedicalLoadingSpinner: React.FC = () => {
    const loadingStages = [
        "🔍 Analyzing your medical documents...",
        "🧠 Processing medical information...", 
        "🎨 Creating your personalized explanation...",
        "💙 Adding encouraging visual elements...",
        "✨ Finalizing your health education guide..."
    ];
    
    const [currentStage, setCurrentStage] = useState(loadingStages[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStage(prevStage => {
                const currentIndex = loadingStages.indexOf(prevStage);
                const nextIndex = (currentIndex + 1) % loadingStages.length;
                return loadingStages[nextIndex];
            });
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex justify-center items-center space-x-3 py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-[#2E7D95]"></div>
            <p className="text-[#2E7D95] font-medium transition-opacity duration-500">
                {currentStage}
            </p>
        </div>
    );
};

export default MedicalLoadingSpinner;
