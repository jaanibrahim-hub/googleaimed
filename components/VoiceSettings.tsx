import React, { useState, useEffect } from 'react';
import VoiceService from '../services/voiceService';
import { VoiceSettings as VoiceSettingsType } from '../types';

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({ isOpen, onClose }) => {
  const [voiceService] = useState(() => VoiceService.getInstance());
  const [settings, setSettings] = useState<VoiceSettingsType>(voiceService.getSettings());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [testText, setTestText] = useState('Hello! This is a test of the voice synthesis system.');
  const [isTestSpeaking, setIsTestSpeaking] = useState(false);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = voiceService.getAvailableVoices();
      setVoices(availableVoices);
      
      // Find current voice or default
      const currentVoice = availableVoices.find(voice => 
        voice.lang.startsWith(settings.language.split('-')[0])
      );
      if (currentVoice) {
        setSelectedVoice(currentVoice.name);
      }
    };

    loadVoices();
    
    // Voices might load asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [settings.language, voiceService]);

  const handleSettingChange = (key: keyof VoiceSettingsType, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    voiceService.updateSettings({ [key]: value });
  };

  const handleTestSpeech = async () => {
    if (isTestSpeaking) {
      voiceService.stopSpeaking();
      setIsTestSpeaking(false);
      return;
    }

    setIsTestSpeaking(true);
    try {
      const selectedVoiceObj = voices.find(voice => voice.name === selectedVoice);
      await voiceService.speak(testText, {
        rate: settings.rate,
        pitch: settings.pitch,
        volume: settings.volume,
        voice: selectedVoiceObj,
      });
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
    { code: 'hi-IN', name: 'Hindi (India)', flag: '🇮🇳' },
    { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', flag: '🇸🇦' },
    { code: 'ru-RU', name: 'Russian (Russia)', flag: '🇷🇺' },
  ];

  const resetToDefaults = () => {
    const defaults = {
      language: 'en-US',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      autoRead: false,
      wakeWordEnabled: false,
    };
    setSettings(prev => ({ ...prev, ...defaults }));
    voiceService.updateSettings(defaults);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            <i className="fas fa-microphone-alt text-blue-500 mr-2"></i>
            Voice Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Voice Recognition Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
              <i className="fas fa-microphone text-green-500 mr-2"></i>
              Voice Recognition
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {languageOptions.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.wakeWordEnabled}
                    onChange={(e) => handleSettingChange('wakeWordEnabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Enable "Hey MediTeach" wake word
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Speech Synthesis Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
              <i className="fas fa-volume-up text-blue-500 mr-2"></i>
              Speech Synthesis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {voices
                    .filter(voice => voice.lang.startsWith(settings.language.split('-')[0]))
                    .map(voice => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoRead}
                    onChange={(e) => handleSettingChange('autoRead', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Auto-read AI responses
                  </span>
                </label>
              </div>
            </div>

            {/* Voice Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speech Rate: {settings.rate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.rate}
                  onChange={(e) => handleSettingChange('rate', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Slow</span>
                  <span>Normal</span>
                  <span>Fast</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch: {settings.pitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.pitch}
                  onChange={(e) => handleSettingChange('pitch', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>Normal</span>
                  <span>High</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume: {Math.round(settings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume}
                  onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Mute</span>
                  <span>Normal</span>
                  <span>Max</span>
                </div>
              </div>
            </div>

            {/* Test Speech */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Test Speech
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter text to test voice settings..."
                />
                <button
                  onClick={handleTestSpeech}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isTestSpeaking
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isTestSpeaking ? (
                    <>
                      <i className="fas fa-stop mr-2"></i>
                      Stop
                    </>
                  ) : (
                    <>
                      <i className="fas fa-play mr-2"></i>
                      Test
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Accessibility Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
              <i className="fas fa-universal-access text-purple-500 mr-2"></i>
              Accessibility Features
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-700">Voice Commands</span>
                  <p className="text-xs text-gray-500">Use voice to control the app</p>
                </div>
                <i className="fas fa-check text-green-500"></i>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-700">Audio Feedback</span>
                  <p className="text-xs text-gray-500">Hear AI responses spoken aloud</p>
                </div>
                <i className="fas fa-check text-green-500"></i>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-700">Hands-Free Mode</span>
                  <p className="text-xs text-gray-500">Complete hands-free operation</p>
                </div>
                <i className="fas fa-check text-green-500"></i>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-700">Medical Pronunciation</span>
                  <p className="text-xs text-gray-500">Proper medical term pronunciation</p>
                </div>
                <i className="fas fa-check text-green-500"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i className="fas fa-undo mr-2"></i>
            Reset to Defaults
          </button>
          <div className="space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <i className="fas fa-check mr-2"></i>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettings;