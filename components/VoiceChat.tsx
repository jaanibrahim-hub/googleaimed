import React, { useState, useEffect, useRef } from 'react';

interface VoiceChatProps {
  onVoiceInput: (text: string) => void;
  onVoiceResponse: (text: string) => void;
  isEnabled: boolean;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ onVoiceInput, onVoiceResponse, isEnabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1,
    pitch: 1,
    volume: 1,
    voice: null as SpeechSynthesisVoice | null
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;

    if (SpeechRecognition && speechSynthesis) {
      setIsSupported(true);
      
      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          onVoiceInput(finalTranscript);
          setIsListening(false);
        } else {
          setTranscript(interimTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
      synthRef.current = speechSynthesis;
      
      // Load available voices
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
        setVoiceSettings(prev => ({
          ...prev,
          voice: englishVoice || voices[0] || null
        }));
      };
      
      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current || !voiceSettings.voice) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voiceSettings.voice;
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
    };
    
    synthRef.current.speak(utterance);
    onVoiceResponse(text);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isEnabled || !isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Voice Input Button */}
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isSpeaking}
        className={`p-2 rounded-full transition-all duration-200 ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : isSpeaking
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'
        }`}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        🎤
      </button>

      {/* Voice Output Button */}
      <button
        onClick={stopSpeaking}
        disabled={!isSpeaking}
        className={`p-2 rounded-full transition-all duration-200 ${
          isSpeaking
            ? 'bg-blue-500 text-white'
            : 'text-gray-400 cursor-not-allowed'
        }`}
        title="Stop speaking"
        style={{ display: isSpeaking ? 'block' : 'none' }}
      >
        🔊
      </button>

      {/* Live Transcript Display */}
      {isListening && transcript && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm">
          {transcript}
          <span className="animate-pulse">|</span>
        </div>
      )}

      {/* Voice Settings (mini) */}
      <div className="relative group">
        <button
          className="p-1 text-xs text-gray-400 hover:text-gray-600"
          title="Voice settings"
        >
          ⚙️
        </button>
        
        {/* Settings Popup */}
        <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-48 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
          <div className="text-xs font-medium text-gray-700 mb-2">Voice Settings</div>
          
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-600">Speed</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.rate}
                onChange={(e) => setVoiceSettings(prev => ({
                  ...prev,
                  rate: parseFloat(e.target.value)
                }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-600">Pitch</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.pitch}
                onChange={(e) => setVoiceSettings(prev => ({
                  ...prev,
                  pitch: parseFloat(e.target.value)
                }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-600">Volume</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={voiceSettings.volume}
                onChange={(e) => setVoiceSettings(prev => ({
                  ...prev,
                  volume: parseFloat(e.target.value)
                }))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for using voice chat functionality
export const useVoiceChat = (onVoiceInput: (text: string) => void) => {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const voiceChatRef = useRef<any>(null);

  const speakText = (text: string) => {
    if (voiceChatRef.current) {
      voiceChatRef.current.speak(text);
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  return {
    voiceEnabled,
    toggleVoice,
    speakText,
    VoiceChatComponent: (props: Omit<VoiceChatProps, 'onVoiceInput' | 'isEnabled'>) => (
      <VoiceChat
        {...props}
        ref={voiceChatRef}
        onVoiceInput={onVoiceInput}
        isEnabled={voiceEnabled}
      />
    )
  };
};

export default VoiceChat;