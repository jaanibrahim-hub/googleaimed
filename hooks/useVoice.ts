import { useState, useEffect, useCallback, useRef } from 'react';
import VoiceService from '../services/voiceService';
import { VoiceSettings, SpeechRecognitionResult } from '../types';

interface UseVoiceOptions {
  autoStart?: boolean;
  autoRead?: boolean;
  onCommand?: (command: string) => void;
  onError?: (error: string) => void;
  enableWakeWord?: boolean;
  wakeWord?: string;
}

interface UseVoiceReturn {
  // State
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  interimTranscript: string;
  settings: VoiceSettings;
  error: string | null;
  
  // Actions
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  speak: (text: string, options?: Partial<SpeechSynthesisUtteranceInit>) => Promise<void>;
  stopSpeaking: () => void;
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
  
  // Utilities
  cleanTextForSpeech: (text: string) => string;
  formatMedicalText: (text: string) => string;
}

export const useVoice = (options: UseVoiceOptions = {}): UseVoiceReturn => {
  const {
    autoStart = false,
    autoRead = false,
    onCommand,
    onError,
    enableWakeWord = false,
    wakeWord = 'hey mediteach'
  } = options;

  const voiceService = useRef(VoiceService.getInstance());
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [settings, setSettings] = useState<VoiceSettings>(voiceService.current.getSettings());
  const [error, setError] = useState<string | null>(null);

  // Voice command handlers
  const handleVoiceCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    
    // Built-in commands
    if (lowerCommand === 'stop listening' || lowerCommand === 'stop recording') {
      voiceService.current.stopListening();
      return;
    }
    
    if (lowerCommand === 'stop speaking' || lowerCommand === 'stop reading') {
      voiceService.current.stopSpeaking();
      return;
    }
    
    // Pass to external handler
    onCommand?.(command);
  }, [onCommand]);

  // Process speech recognition results
  const processSpeechResult = useCallback((result: SpeechRecognitionResult) => {
    if (!result.isFinal) return result.transcript;
    
    const transcript = result.transcript.trim();
    
    // Check for voice commands first
    const isCommand = [
      'clear chat',
      'new conversation',
      'stop listening',
      'stop speaking',
      'read last message',
      'help',
      'settings'
    ].some(cmd => transcript.toLowerCase().includes(cmd.toLowerCase()));
    
    if (isCommand) {
      handleVoiceCommand(transcript);
      return null; // Don't return transcript for commands
    }
    
    return transcript;
  }, [handleVoiceCommand]);

  // Initialize voice service and event listeners
  useEffect(() => {
    const service = voiceService.current;

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
      onError?.(errorMessage);
    };

    const handleResult = (result: SpeechRecognitionResult) => {
      processSpeechResult(result);
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

    const handleSpeechError = (error: string) => {
      setIsSpeaking(false);
      setError(error);
      onError?.(error);
    };

    const handleSettingsUpdate = (newSettings: VoiceSettings) => {
      setSettings(newSettings);
    };

    const handleWakeWordDetected = () => {
      if (enableWakeWord && !isListening) {
        service.startListening();
      }
    };

    // Add event listeners
    service.on('start', handleStart);
    service.on('end', handleEnd);
    service.on('error', handleError);
    service.on('result', handleResult);
    service.on('interim', handleInterim);
    service.on('speechStart', handleSpeechStart);
    service.on('speechEnd', handleSpeechEnd);
    service.on('speechError', handleSpeechError);
    service.on('settingsUpdated', handleSettingsUpdate);
    service.on('wakeWordDetected', handleWakeWordDetected);

    // Enable wake word if requested
    if (enableWakeWord) {
      service.enableWakeWord(wakeWord);
    }

    // Auto-start if requested
    if (autoStart && service.isSpeechRecognitionSupported()) {
      service.startListening();
    }

    return () => {
      // Remove event listeners
      service.off('start', handleStart);
      service.off('end', handleEnd);
      service.off('error', handleError);
      service.off('result', handleResult);
      service.off('interim', handleInterim);
      service.off('speechStart', handleSpeechStart);
      service.off('speechEnd', handleSpeechEnd);
      service.off('speechError', handleSpeechError);
      service.off('settingsUpdated', handleSettingsUpdate);
      service.off('wakeWordDetected', handleWakeWordDetected);
    };
  }, [autoStart, enableWakeWord, wakeWord, onError, processSpeechResult, isListening]);

  // Action handlers
  const startListening = useCallback(() => {
    setError(null);
    voiceService.current.startListening();
  }, []);

  const stopListening = useCallback(() => {
    voiceService.current.stopListening();
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const speak = useCallback(async (text: string, options?: Partial<SpeechSynthesisUtteranceInit>) => {
    try {
      const cleanText = voiceService.current.formatMedicalText(text);
      await voiceService.current.speak(cleanText, options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Speech synthesis failed';
      setError(errorMessage);
      onError?.(errorMessage);
      throw error;
    }
  }, [onError]);

  const stopSpeaking = useCallback(() => {
    voiceService.current.stopSpeaking();
  }, []);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    voiceService.current.updateSettings(newSettings);
  }, []);

  // Utility functions
  const cleanTextForSpeech = useCallback((text: string) => {
    return voiceService.current.cleanTextForSpeech(text);
  }, []);

  const formatMedicalText = useCallback((text: string) => {
    return voiceService.current.formatMedicalText(text);
  }, []);

  // Auto-read functionality
  useEffect(() => {
    if (autoRead && settings.autoRead) {
      // This could be used to automatically read new messages
      // Implementation depends on how messages are passed to the hook
    }
  }, [autoRead, settings.autoRead]);

  return {
    // State
    isListening,
    isSpeaking,
    isSupported: settings.isSupported,
    interimTranscript,
    settings,
    error,
    
    // Actions
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    updateSettings,
    
    // Utilities
    cleanTextForSpeech,
    formatMedicalText,
  };
};

export default useVoice;