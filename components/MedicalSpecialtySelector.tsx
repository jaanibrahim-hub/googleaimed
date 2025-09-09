import React, { useState } from 'react';

interface MedicalSpecialty {
  id: string;
  name: string;
  icon: string;
  description: string;
  keywords: string[];
  quickQuestions: string[];
}

const medicalSpecialties: MedicalSpecialty[] = [
  {
    id: 'general',
    name: 'General Medicine',
    icon: '🩺',
    description: 'General health questions and common medical conditions',
    keywords: ['health', 'symptoms', 'general', 'wellness'],
    quickQuestions: [
      'What are the symptoms of the flu?',
      'How can I improve my overall health?',
      'What should I know about preventive care?'
    ]
  },
  {
    id: 'cardiology',
    name: 'Cardiology',
    icon: '🫀',
    description: 'Heart and cardiovascular system',
    keywords: ['heart', 'blood pressure', 'chest pain', 'cardiovascular'],
    quickQuestions: [
      'What is high blood pressure?',
      'How can I keep my heart healthy?',
      'What are the signs of heart disease?'
    ]
  },
  {
    id: 'neurology',
    name: 'Neurology',
    icon: '🧠',
    description: 'Brain, nervous system, and neurological conditions',
    keywords: ['brain', 'headache', 'memory', 'neurological'],
    quickQuestions: [
      'What causes migraines?',
      'How does the brain work?',
      'What are the signs of a stroke?'
    ]
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    icon: '🦴',
    description: 'Bones, joints, and musculoskeletal system',
    keywords: ['bone', 'joint', 'muscle', 'pain', 'arthritis'],
    quickQuestions: [
      'How can I prevent osteoporosis?',
      'What causes joint pain?',
      'How do I treat a sprain?'
    ]
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    icon: '🩹',
    description: 'Skin, hair, and nail conditions',
    keywords: ['skin', 'rash', 'acne', 'dermatology'],
    quickQuestions: [
      'How can I prevent skin cancer?',
      'What causes eczema?',
      'How do I take care of my skin?'
    ]
  },
  {
    id: 'endocrinology',
    name: 'Endocrinology',
    icon: '🔬',
    description: 'Hormones and endocrine system disorders',
    keywords: ['diabetes', 'thyroid', 'hormones', 'metabolism'],
    quickQuestions: [
      'What is diabetes?',
      'How does the thyroid work?',
      'What are hormone disorders?'
    ]
  },
  {
    id: 'gastroenterology',
    name: 'Gastroenterology',
    icon: '🫁',
    description: 'Digestive system and gastrointestinal conditions',
    keywords: ['stomach', 'digestion', 'intestine', 'gastro'],
    quickQuestions: [
      'What causes stomach pain?',
      'How can I improve digestion?',
      'What is IBS?'
    ]
  },
  {
    id: 'pulmonology',
    name: 'Pulmonology',
    icon: '🫁',
    description: 'Lungs and respiratory system',
    keywords: ['lungs', 'breathing', 'asthma', 'respiratory'],
    quickQuestions: [
      'What is asthma?',
      'How can I improve lung health?',
      'What causes breathing problems?'
    ]
  }
];

interface MedicalSpecialtySelectorProps {
  onSpecialtySelected: (specialty: MedicalSpecialty) => void;
  currentSpecialty: MedicalSpecialty | null;
}

const MedicalSpecialtySelector: React.FC<MedicalSpecialtySelectorProps> = ({
  onSpecialtySelected,
  currentSpecialty
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<MedicalSpecialty | null>(
    currentSpecialty || medicalSpecialties[0]
  );

  const handleSpecialtyClick = (specialty: MedicalSpecialty) => {
    setSelectedSpecialty(specialty);
    onSpecialtySelected(specialty);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Current Specialty Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-500 transition-colors w-full text-left"
      >
        <span className="text-2xl">{selectedSpecialty?.icon}</span>
        <div className="flex-1">
          <div className="font-medium text-gray-800">{selectedSpecialty?.name}</div>
          <div className="text-xs text-gray-500">Medical Specialty</div>
        </div>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-sm text-gray-600 p-2 border-b border-gray-100 mb-2">
              Choose your area of interest for tailored responses
            </div>
            
            {medicalSpecialties.map((specialty) => (
              <button
                key={specialty.id}
                onClick={() => handleSpecialtyClick(specialty)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg text-left hover:bg-blue-50 transition-colors ${
                  selectedSpecialty?.id === specialty.id ? 'bg-blue-100 border border-blue-300' : ''
                }`}
              >
                <span className="text-2xl flex-shrink-0">{specialty.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 mb-1">{specialty.name}</div>
                  <div className="text-xs text-gray-600 leading-relaxed">
                    {specialty.description}
                  </div>
                </div>
                {selectedSpecialty?.id === specialty.id && (
                  <span className="text-blue-500 flex-shrink-0">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Questions for Selected Specialty */}
      {selectedSpecialty && (
        <div className="mt-4">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Quick questions for {selectedSpecialty.name}:
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSpecialty.quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => {
                  // This would trigger sending the question
                  const event = new CustomEvent('quickQuestion', { detail: question });
                  window.dispatchEvent(event);
                }}
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export { medicalSpecialties, type MedicalSpecialty };
export default MedicalSpecialtySelector;