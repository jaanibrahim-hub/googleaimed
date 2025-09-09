import { VoiceSettings, SpeechRecognitionResult } from '../types';

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  grammars: SpeechGrammarList;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

class VoiceService {
  private static instance: VoiceService;
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private settings: VoiceSettings;
  private isListening = false;
  private listeners: { [event: string]: Function[] } = {};

  private constructor() {
    this.synthesis = window.speechSynthesis;
    this.settings = this.getDefaultSettings();
    this.initializeSpeechRecognition();
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  private getDefaultSettings(): VoiceSettings {
    const saved = localStorage.getItem('voiceSettings');
    if (saved) {
      return { ...this.getDefaultVoiceSettings(), ...JSON.parse(saved) };
    }
    return this.getDefaultVoiceSettings();
  }

  private getDefaultVoiceSettings(): VoiceSettings {
    return {
      isListening: false,
      isSupported: this.isSpeechRecognitionSupported() && this.isSpeechSynthesisSupported(),
      language: 'en-US',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      autoRead: false,
      wakeWordEnabled: false,
    };
  }

  private initializeSpeechRecognition(): void {
    if (!this.isSpeechRecognitionSupported()) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.settings.language;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.emit('start');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.emit('end');
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      this.emit('error', event.error);
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        if (result.isFinal) {
          finalTranscript += transcript;
          this.emit('result', {
            transcript: transcript.trim(),
            confidence,
            isFinal: true,
          } as SpeechRecognitionResult);
        } else {
          interimTranscript += transcript;
          this.emit('interim', {
            transcript: transcript.trim(),
            confidence,
            isFinal: false,
          } as SpeechRecognitionResult);
        }
      }
    };
  }

  public isSpeechRecognitionSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public isSpeechSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  public startListening(): void {
    if (!this.recognition || this.isListening) return;
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.emit('error', 'Failed to start listening');
    }
  }

  public stopListening(): void {
    if (!this.recognition || !this.isListening) return;
    
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  public speak(text: string, options?: Partial<SpeechSynthesisUtteranceInit>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSpeechSynthesisSupported()) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply settings
      utterance.rate = options?.rate ?? this.settings.rate;
      utterance.pitch = options?.pitch ?? this.settings.pitch;
      utterance.volume = options?.volume ?? this.settings.volume;
      utterance.lang = options?.lang ?? this.settings.language;

      // Find appropriate voice
      const voices = this.synthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(this.settings.language.split('-')[0])
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        this.emit('speechEnd');
        resolve();
      };

      utterance.onerror = (event) => {
        this.emit('speechError', event.error);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      utterance.onstart = () => {
        this.emit('speechStart');
      };

      this.synthesis.speak(utterance);
    });
  }

  public stopSpeaking(): void {
    if (this.isSpeechSynthesisSupported()) {
      this.synthesis.cancel();
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  public updateSettings(newSettings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem('voiceSettings', JSON.stringify(this.settings));

    // Update recognition language if changed
    if (this.recognition && newSettings.language) {
      this.recognition.lang = newSettings.language;
    }

    this.emit('settingsUpdated', this.settings);
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  // Event system
  public on(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  public off(event: string, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Utility methods
  public cleanTextForSpeech(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
      .replace(/`(.*?)`/g, '$1') // Remove code markdown
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text only
      .replace(/\n+/g, '. ') // Convert line breaks to pauses
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  public formatMedicalText(text: string): string {
    const medicalAbbreviations = {
      'mg': 'milligrams',
      'ml': 'milliliters',
      'kg': 'kilograms',
      'bpm': 'beats per minute',
      'mmHg': 'millimeters of mercury',
      'ECG': 'electrocardiogram',
      'MRI': 'magnetic resonance imaging',
      'CT': 'computed tomography',
      'CBC': 'complete blood count',
      'BP': 'blood pressure',
      'HR': 'heart rate',
      'RR': 'respiratory rate',
      'O2': 'oxygen',
      'CO2': 'carbon dioxide',
      'IV': 'intravenous',
      'PO': 'by mouth',
      'PRN': 'as needed',
      'BID': 'twice daily',
      'TID': 'three times daily',
      'QID': 'four times daily',
    };

    let formattedText = text;
    
    // Replace medical abbreviations
    Object.entries(medicalAbbreviations).forEach(([abbrev, expansion]) => {
      const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
      formattedText = formattedText.replace(regex, expansion);
    });

    return this.cleanTextForSpeech(formattedText);
  }

  // Wake word detection (simplified implementation)
  public enableWakeWord(wakeWord: string = 'hey mediteach'): void {
    if (!this.settings.wakeWordEnabled) return;

    this.on('result', (result: SpeechRecognitionResult) => {
      if (result.isFinal && result.transcript.toLowerCase().includes(wakeWord.toLowerCase())) {
        this.emit('wakeWordDetected', wakeWord);
      }
    });
  }

  public destroy(): void {
    this.stopListening();
    this.stopSpeaking();
    this.listeners = {};
  }
}

export default VoiceService;