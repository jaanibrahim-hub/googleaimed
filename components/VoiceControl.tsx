import React, { useState, useEffect, useCallback } from 'react';
import VoiceService from '../services/voiceService';
import { VoiceSettings, SpeechRecognitionResult } from '../types';

interface VoiceControlProps {
  onVoiceInput?: (transcript: string) => void;
  onVoiceCommand?: (command: string) => void;
  className?: string;
  disabled?: boolean;
}

const VoiceControl: React.FC<VoiceControlProps> = ({
  onVoiceInput,
  onVoiceCommand,
  className = '',
  disabled = false,
}) => {
  const [voiceService] = useState(() => VoiceService.getInstance());
  const [settings, setSettings] = useState<VoiceSettings>(voiceService.getSettings());
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  // Voice commands
  const voiceCommands = {
    'clear chat': () => onVoiceCommand?.('clear'),
    'new conversation': () => onVoiceCommand?.('new'),
    'stop listening': () => handleStopListening(),
    'stop speaking': () => voiceService.stopSpeaking(),
    'read last message': () => onVoiceCommand?.('read-last'),
    'help': () => onVoiceCommand?.('help'),
    'settings': () => onVoiceCommand?.('settings'),
  };

  const handleStartListening = useCallback(() => {
    if (disabled || !settings.isSupported) return;
    
    setError(null);
    setInterimTranscript('');
    voiceService.startListening();
  }, [disabled, settings.isSupported, voiceService]);

  const handleStopListening = useCallback(() => {
    voiceService.stopListening();
  }, [voiceService]);

  const handleToggleListening = useCallback(() => {
    if (isListening) {
      handleStopListening();
    } else {
      handleStartListening();
    }
  }, [isListening, handleStartListening, handleStopListening]);

  const processVoiceCommand = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    
    // Check for exact command matches
    for (const [command, action] of Object.entries(voiceCommands)) {
      if (lowerTranscript === command || lowerTranscript.endsWith(command)) {
        action();
        return true;
      }
    }

    // Check for partial matches or variations
    if (lowerTranscript.includes('clear') && lowerTranscript.includes('chat')) {
      voiceCommands['clear chat']();
      return true;
    }
    
    if (lowerTranscript.includes('new') && lowerTranscript.includes('conversation')) {
      voiceCommands['new conversation']();
      return true;
    }

    if (lowerTranscript.includes('stop') && (lowerTranscript.includes('listening') || lowerTranscript.includes('recording'))) {
      voiceCommands['stop listening']();
      return true;
    }

    return false;
  }, [onVoiceCommand]);

  useEffect(() => {
    const handleStart = () => {
      setIsListening(true);
      setError(null);
    };

    const handleEnd = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    const handleError = (errorMessage: string) => {
      setError(errorMessage);
      setIsListening(false);
      setInterimTranscript('');
    };

    const handleResult = (result: SpeechRecognitionResult) => {
      if (result.isFinal) {
        const transcript = result.transcript.trim();
        if (transcript) {
          // Check if it's a voice command first
          if (!processVoiceCommand(transcript)) {
            // If not a command, treat as input
            onVoiceInput?.(transcript);
          }
        }
        setInterimTranscript('');
      }
    };

    const handleInterim = (result: SpeechRecognitionResult) => {
      setInterimTranscript(result.transcript);
    };

    const handleSpeechStart = () => {
      setIsSpeaking(true);
    };

    const handleSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const handleSettingsUpdate = (newSettings: VoiceSettings) => {
      setSettings(newSettings);
    };

    // Add event listeners
    voiceService.on('start', handleStart);
    voiceService.on('end', handleEnd);
    voiceService.on('error', handleError);
    voiceService.on('result', handleResult);
    voiceService.on('interim', handleInterim);
    voiceService.on('speechStart', handleSpeechStart);
    voiceService.on('speechEnd', handleSpeechEnd);
    voiceService.on('settingsUpdated', handleSettingsUpdate);

    // Audio level monitoring (simplified)
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;
    let animationFrame: number;

    const monitorAudioLevel = () => {
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setVolume(average / 255 * 100);
      }
      if (isListening) {
        animationFrame = requestAnimationFrame(monitorAudioLevel);
      }
    };

    if (isListening && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          audioContext = new AudioContext();
          const source = audioContext.createMediaStreamSource(stream);
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          dataArray = new Uint8Array(analyser.frequencyBinCount);
          source.connect(analyser);
          monitorAudioLevel();
        })
        .catch(console.error);
    }

    return () => {
      // Remove event listeners
      voiceService.off('start', handleStart);
      voiceService.off('end', handleEnd);
      voiceService.off('error', handleError);
      voiceService.off('result', handleResult);
      voiceService.off('interim', handleInterim);
      voiceService.off('speechStart', handleSpeechStart);
      voiceService.off('speechEnd', handleSpeechEnd);
      voiceService.off('settingsUpdated', handleSettingsUpdate);

      // Clean up audio monitoring
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [voiceService, onVoiceInput, processVoiceCommand, isListening]);

  if (!settings.isSupported) {
    return (
      <div className={`voice-control-unsupported ${className}`}>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Voice features not supported in this browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`voice-control ${className}`} data-element="voice-control">
      <div className="flex items-center gap-2">
        {/* Main voice button */}
        <button
          onClick={handleToggleListening}
          disabled={disabled}
          className={`
            relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
            ${isListening 
              ? 'bg-red-500 border-red-500 text-white shadow-lg animate-pulse' 
              : 'bg-white border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${isSpeaking ? 'border-green-500 bg-green-50' : ''}
          `}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'} text-sm`}></i>
          
          {/* Volume indicator */}
          {isListening && (
            <div 
              className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping"
              style={{ 
                animationDuration: `${Math.max(0.5, 2 - volume / 50)}s`,
                opacity: Math.max(0.3, volume / 100)
              }}
            ></div>
          )}
        </button>

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="flex items-center gap-1 text-green-600 text-sm">
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-green-500 rounded animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-3 bg-green-500 rounded animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-3 bg-green-500 rounded animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>Speaking...</span>
          </div>
        )}

        {/* Interim transcript */}
        {interimTranscript && (
          <div className="flex-1 max-w-xs">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-800">
              <i className="fas fa-microphone text-blue-500 mr-2"></i>
              <span className="italic">{interimTranscript}</span>
              <span className="ml-1 animate-pulse">●</span>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="flex items-center gap-1 text-red-600 text-sm">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Voice commands help */}
        <div className="relative group">
          <button 
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            title="Voice commands help"
          >
            <i className="fas fa-question text-xs"></i>
          </button>
          
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <h4 className="font-semibold text-sm text-gray-800 mb-2">Voice Commands:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• "Clear chat" - Clear conversation</li>
              <li>• "New conversation" - Start new chat</li>
              <li>• "Stop listening" - Stop voice input</li>
              <li>• "Stop speaking" - Stop speech</li>
              <li>• "Read last message" - Read AI response</li>
              <li>• "Help" - Show help</li>
              <li>• "Settings" - Open settings</li>
            </ul>
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Say any medical question naturally or use commands above.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
        {settings.autoRead && (
          <div className="flex items-center gap-1">
            <i className="fas fa-volume-up"></i>
            <span>Auto-read enabled</span>
          </div>
        )}
        
        {settings.wakeWordEnabled && (
          <div className="flex items-center gap-1">
            <i className="fas fa-magic"></i>
            <span>Wake word active</span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <i className="fas fa-language"></i>
          <span>{settings.language}</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceControl;