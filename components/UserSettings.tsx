import React, { useState, useEffect } from 'react';
import UserPreferencesService from '../services/userPreferencesService';
import VoiceService from '../services/voiceService';
import { UserPreferences, MedicalSpecialty } from '../types';
import { medicalSpecialties } from '../services/medicalSpecialties';
import VoiceSettings from './VoiceSettings';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../hooks/useTheme';

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ isOpen, onClose }) => {
  const [preferencesService] = useState(() => UserPreferencesService.getInstance());
  const [voiceService] = useState(() => VoiceService.getInstance());
  const [preferences, setPreferences] = useState<UserPreferences>(preferencesService.getPreferences());
  const [activeTab, setActiveTab] = useState('general');
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [isTestSpeaking, setIsTestSpeaking] = useState(false);
  const { theme, setTheme: setAppTheme, setHighContrast, setReducedMotion } = useTheme();

  useEffect(() => {
    const handlePreferencesUpdate = (newPreferences: UserPreferences) => {
      setPreferences(newPreferences);
    };

    preferencesService.on('preferencesUpdated', handlePreferencesUpdate);

    return () => {
      preferencesService.off('preferencesUpdated', handlePreferencesUpdate);
    };
  }, [preferencesService]);

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    preferencesService.updatePreferences({ [key]: value });
    
    // Apply theme changes immediately
    if (key === 'theme') {
      setAppTheme(value);
    } else if (key === 'highContrast') {
      setHighContrast(value);
    } else if (key === 'reducedMotion') {
      setReducedMotion(value);
    }
  };

  const handleResetPreferences = () => {
    if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
      preferencesService.resetPreferences();
    }
  };

  const handleExportPreferences = () => {
    const exported = preferencesService.exportPreferences();
    const blob = new Blob([exported], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mediteach-preferences.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportPreferences = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (preferencesService.importPreferences(content)) {
          alert('Preferences imported successfully!');
        } else {
          alert('Failed to import preferences. Please check the file format.');
        }
      } catch (error) {
        alert('Failed to import preferences. Invalid file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleTestText = async () => {
    if (isTestSpeaking) {
      voiceService.stopSpeaking();
      setIsTestSpeaking(false);
      return;
    }

    setIsTestSpeaking(true);
    try {
      await voiceService.speak('This is a test of your voice settings. Welcome to MediTeach AI, your personal medical guide.');
    } catch (error) {
      console.error('Test speech failed:', error);
    }
    setIsTestSpeaking(false);
  };

  const languageOptions = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
    { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
    { code: 'fr-FR', name: 'French (France)', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German (Germany)', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian (Italy)', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
    { code: 'ja-JP', name: 'Japanese (Japan)', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean (South Korea)', flag: '🇰🇷' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  ];

  const tabs = [
    { id: 'general', name: 'General', icon: 'fas fa-cog' },
    { id: 'medical', name: 'Medical', icon: 'fas fa-heartbeat' },
    { id: 'accessibility', name: 'Accessibility', icon: 'fas fa-universal-access' },
    { id: 'voice', name: 'Voice', icon: 'fas fa-microphone-alt' },
    { id: 'data', name: 'Data & Privacy', icon: 'fas fa-shield-alt' },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              <i className="fas fa-cog text-blue-500 mr-2"></i>
              Settings
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <div className="flex h-96">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200">
              <nav className="p-4 space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <i className={`${tab.icon} text-sm`}></i>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-800">General Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interface Language
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {languageOptions.map(lang => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Response Complexity
                      </label>
                      <select
                        value={preferences.responseComplexity}
                        onChange={(e) => handlePreferenceChange('responseComplexity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="basic">Basic - Simple explanations</option>
                        <option value="intermediate">Intermediate - Balanced detail</option>
                        <option value="advanced">Advanced - Comprehensive information</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Visual Preference</span>
                        <p className="text-xs text-gray-500">Generate images and visual explanations</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.visualPreference}
                          onChange={(e) => handlePreferenceChange('visualPreference', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Auto-save Conversations</span>
                        <p className="text-xs text-gray-500">Automatically save your conversations</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.autoSave}
                          onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Theme Preference
                      </label>
                      <div className="space-y-3">
                        <ThemeToggle 
                          variant="dropdown" 
                          showLabel={true} 
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                          💡 Auto theme switches between light and dark based on your system settings
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Settings */}
              {activeTab === 'medical' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-800">Medical Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Medical Specialty
                      </label>
                      <select
                        value={preferences.selectedSpecialty || ''}
                        onChange={(e) => handlePreferenceChange('selectedSpecialty', e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">No specialty preference</option>
                        {medicalSpecialties.map(specialty => (
                          <option key={specialty.id} value={specialty.id}>
                            {specialty.name} - {specialty.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">
                        <i className="fas fa-info-circle mr-2"></i>
                        Medical Disclaimer
                      </h4>
                      <p className="text-sm text-blue-700">
                        MediTeach AI provides educational information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Accessibility Settings */}
              {activeTab === 'accessibility' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-800">Accessibility Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Voice Input/Output</span>
                        <p className="text-xs text-gray-500">Enable voice commands and speech synthesis</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.voiceEnabled}
                          onChange={(e) => handlePreferenceChange('voiceEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Auto-read AI Responses</span>
                        <p className="text-xs text-gray-500">Automatically speak AI responses aloud</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.autoReadResponses}
                          onChange={(e) => handlePreferenceChange('autoReadResponses', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Wake Word "Hey MediTeach"</span>
                        <p className="text-xs text-gray-500">Activate voice input with wake word</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.wakeWordEnabled}
                          onChange={(e) => handlePreferenceChange('wakeWordEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-700">High Contrast Mode</span>
                        <p className="text-xs text-gray-500">Increase contrast for better visibility</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.highContrast}
                          onChange={(e) => handlePreferenceChange('highContrast', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Reduced Motion</span>
                        <p className="text-xs text-gray-500">Minimize animations and transitions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.reducedMotion}
                          onChange={(e) => handlePreferenceChange('reducedMotion', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Theme Accessibility
                      </label>
                      <div className="space-y-3">
                        <ThemeToggle 
                          variant="dropdown" 
                          showLabel={true} 
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 bg-purple-50 p-2 rounded">
                          🌙 Dark mode can reduce eye strain during extended use
                        </div>
                      </div>
                    </div>

                    {preferences.voiceEnabled && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <button
                          onClick={handleTestText}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors mr-3 ${
                            isTestSpeaking
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          {isTestSpeaking ? (
                            <>
                              <i className="fas fa-stop mr-2"></i>
                              Stop Test
                            </>
                          ) : (
                            <>
                              <i className="fas fa-play mr-2"></i>
                              Test Voice
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setShowVoiceSettings(true)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          <i className="fas fa-cog mr-2"></i>
                          Voice Settings
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Voice Settings */}
              {activeTab === 'voice' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-800">Voice Settings</h3>
                  <div className="text-center py-8">
                    <i className="fas fa-microphone-alt text-6xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500 mb-4">Configure detailed voice settings</p>
                    <button
                      onClick={() => setShowVoiceSettings(true)}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <i className="fas fa-cog mr-2"></i>
                      Open Voice Settings
                    </button>
                  </div>
                </div>
              )}

              {/* Data & Privacy */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-800">Data & Privacy</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-2">
                        <i className="fas fa-shield-alt mr-2"></i>
                        Privacy Protection
                      </h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• All data is stored locally on your device</li>
                        <li>• No personal medical information is sent to external servers</li>
                        <li>• Conversations are encrypted in local storage</li>
                        <li>• You have full control over your data</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleExportPreferences}
                        className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <i className="fas fa-download mr-2"></i>
                        Export Settings
                      </button>

                      <div>
                        <label className="block w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer text-center">
                          <i className="fas fa-upload mr-2"></i>
                          Import Settings
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImportPreferences}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <button
                        onClick={handleResetPreferences}
                        className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <i className="fas fa-trash-restore mr-2"></i>
                        Reset to Defaults
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <i className="fas fa-check mr-2"></i>
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Voice Settings Modal */}
      <VoiceSettings
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
      />
    </>
  );
};

export default UserSettings;