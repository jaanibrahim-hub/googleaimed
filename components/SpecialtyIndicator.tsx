import React from 'react';
import { MedicalSpecialty } from '../types';

interface SpecialtyIndicatorProps {
  specialty: MedicalSpecialty | null;
  onClick?: () => void;
  showDetails?: boolean;
  className?: string;
}

const SpecialtyIndicator: React.FC<SpecialtyIndicatorProps> = ({
  specialty,
  onClick,
  showDetails = false,
  className = ''
}) => {
  if (!specialty) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm ${className}`}
        title="Select medical specialty for tailored responses"
      >
        <i className="fas fa-stethoscope text-gray-500"></i>
        <span className="text-gray-600">General Medicine</span>
        {onClick && <i className="fas fa-chevron-down text-xs text-gray-400"></i>}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
        onClick ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'
      } ${className}`}
      style={{
        background: `linear-gradient(135deg, ${specialty.color}15, ${specialty.color}25)`,
        border: `1px solid ${specialty.color}40`
      }}
      title={`Active specialty: ${specialty.name}`}
    >
      <div 
        className="w-6 h-6 rounded flex items-center justify-center text-white flex-shrink-0"
        style={{ backgroundColor: specialty.color }}
      >
        <i className={`${specialty.icon} text-xs`}></i>
      </div>
      
      <div className="flex-1 text-left min-w-0">
        <div className="font-medium text-gray-900 truncate">{specialty.name}</div>
        {showDetails && (
          <div className="text-xs text-gray-600 truncate">{specialty.description}</div>
        )}
      </div>
      
      {onClick && <i className="fas fa-chevron-down text-xs text-gray-400 flex-shrink-0"></i>}
    </button>
  );
};

export default SpecialtyIndicator;