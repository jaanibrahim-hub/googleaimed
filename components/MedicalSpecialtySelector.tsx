import React, { useState, useEffect } from 'react';
import { MedicalSpecialty, UserPreferences } from '../types';
import { medicalSpecialties, userPreferencesService } from '../services/medicalSpecialties';

interface MedicalSpecialtySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSpecialtyChange?: (specialty: MedicalSpecialty | null) => void;
}

const MedicalSpecialtySelector: React.FC<MedicalSpecialtySelectorProps> = ({
  isOpen,
  onClose,
  onSpecialtyChange
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(userPreferencesService.getPreferences());
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentPrefs = userPreferencesService.getPreferences();
      setPreferences(currentPrefs);
      setSelectedSpecialty(currentPrefs.selectedSpecialty);
    }
  }, [isOpen]);

  const filteredSpecialties = medicalSpecialties.filter(specialty =>
    specialty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    specialty.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    specialty.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSpecialtySelect = (specialtyId: string | null) => {
    setSelectedSpecialty(specialtyId);
    userPreferencesService.setSelectedSpecialty(specialtyId);
    
    const specialty = specialtyId ? userPreferencesService.getSpecialtyById(specialtyId) : null;
    onSpecialtyChange?.(specialty);
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    const updatedPrefs = { ...preferences, [key]: value };
    setPreferences(updatedPrefs);
    userPreferencesService.savePreferences({ [key]: value });
  };

  const handleSaveAndClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Choose Your Medical Specialty</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-1"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <p className="text-white text-opacity-90 mb-4">
              Select a medical specialty to receive tailored explanations and expert insights specific to your area of interest.
            </p>

            {/* Search Bar */}
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-white opacity-75"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search specialties..."
                className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-75 focus:bg-opacity-30 focus:outline-none"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex h-[60vh]">
            {/* Specialty List */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* General/No Specialty Option */}
              <div
                onClick={() => handleSpecialtySelect(null)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all mb-4 ${
                  selectedSpecialty === null
                    ? 'border-[#2E7D95] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center text-white">
                    <i className="fas fa-globe text-xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">General Medical Guidance</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Comprehensive medical explanations without specialty focus
                    </p>
                  </div>
                  {selectedSpecialty === null && (
                    <i className="fas fa-check-circle text-[#2E7D95] text-xl"></i>
                  )}
                </div>
              </div>

              {/* Specialty Options */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredSpecialties.map((specialty) => (
                  <div
                    key={specialty.id}
                    onClick={() => handleSpecialtySelect(specialty.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedSpecialty === specialty.id
                        ? 'border-[#2E7D95] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${specialty.color}, ${specialty.color}dd)` }}
                      >
                        <i className={`${specialty.icon} text-xl`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-1">{specialty.name}</h3>
                            <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                              {specialty.description}
                            </p>
                            
                            {/* Sample Conditions */}
                            <div className="mb-2">
                              <p className="text-xs font-medium text-gray-500 mb-1">Common areas:</p>
                              <div className="flex flex-wrap gap-1">
                                {specialty.commonConditions.slice(0, 3).map((condition, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                  >
                                    {condition}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          {selectedSpecialty === specialty.id && (
                            <i className="fas fa-check-circle text-[#2E7D95] text-xl ml-2 flex-shrink-0"></i>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredSpecialties.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-search text-4xl mb-4 opacity-50"></i>
                  <p>No specialties found matching "{searchQuery}"</p>
                  <p className="text-sm mt-2">Try a different search term or browse all specialties</p>
                </div>
              )}
            </div>

            {/* Selected Specialty Details */}
            {selectedSpecialty && (
              <div className="w-80 border-l border-gray-200 bg-gray-50 p-6">
                {(() => {
                  const specialty = medicalSpecialties.find(s => s.id === selectedSpecialty);
                  if (!specialty) return null;

                  return (
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div 
                          className="w-16 h-16 rounded-lg flex items-center justify-center text-white"
                          style={{ background: `linear-gradient(135deg, ${specialty.color}, ${specialty.color}dd)` }}
                        >
                          <i className={`${specialty.icon} text-2xl`}></i>
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-gray-900">{specialty.name}</h3>
                          <p className="text-sm text-gray-600">{specialty.description}</p>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                        <div className="space-y-2">
                          {specialty.quickActions.map((action, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                              <i className="fas fa-chevron-right text-xs text-gray-400"></i>
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Common Conditions */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Areas of Focus</h4>
                        <div className="space-y-2">
                          {specialty.commonConditions.map((condition, index) => (
                            <div key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                              <i className="fas fa-circle text-xs text-gray-400 mt-1.5"></i>
                              <span>{condition}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Benefits */}
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">With This Specialty Selected:</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <i className="fas fa-check text-green-500"></i>
                            <span>Specialized medical explanations</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <i className="fas fa-check text-green-500"></i>
                            <span>Relevant visual illustrations</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <i className="fas fa-check text-green-500"></i>
                            <span>Tailored quick actions</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <i className="fas fa-check text-green-500"></i>
                            <span>Focused medical guidance</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <i className="fas fa-cog"></i>
                  <span>Advanced Settings</span>
                  <i className={`fas fa-chevron-${showPreferences ? 'up' : 'down'} text-xs`}></i>
                </button>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAndClose}
                  className="px-6 py-2 bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Apply Changes
                </button>
              </div>
            </div>

            {/* Advanced Settings */}
            {showPreferences && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Response Complexity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response Complexity
                    </label>
                    <select
                      value={preferences.responseComplexity}
                      onChange={(e) => handlePreferenceChange('responseComplexity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E7D95] focus:border-transparent"
                    >
                      <option value="basic">Basic - Simple explanations</option>
                      <option value="intermediate">Intermediate - Balanced detail</option>
                      <option value="advanced">Advanced - Comprehensive information</option>
                    </select>
                  </div>

                  {/* Visual Preference */}
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={preferences.visualPreference}
                        onChange={(e) => handlePreferenceChange('visualPreference', e.target.checked)}
                        className="w-4 h-4 text-[#2E7D95] border-gray-300 rounded focus:ring-[#2E7D95]"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Enhanced Visuals</span>
                        <p className="text-xs text-gray-500">Generate detailed medical illustrations</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MedicalSpecialtySelector;