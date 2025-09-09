import { UserPreferences } from '../types';

class UserPreferencesService {
  private static instance: UserPreferencesService;
  private preferences: UserPreferences;
  private listeners: { [event: string]: Function[] } = {};

  private constructor() {
    this.preferences = this.loadPreferences();
  }

  public static getInstance(): UserPreferencesService {
    if (!UserPreferencesService.instance) {
      UserPreferencesService.instance = new UserPreferencesService();
    }
    return UserPreferencesService.instance;
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      selectedSpecialty: null,
      responseComplexity: 'intermediate',
      visualPreference: true,
      language: 'en-US',
      autoSave: true,
      hasCompletedOnboarding: false,
      voiceEnabled: false,
      voiceLanguage: 'en-US',
      voiceRate: 1.0,
      voicePitch: 1.0,
      autoReadResponses: false,
      wakeWordEnabled: false,
    };
  }

  private loadPreferences(): UserPreferences {
    try {
      const saved = localStorage.getItem('userPreferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...this.getDefaultPreferences(), ...parsed };
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
    return this.getDefaultPreferences();
  }

  private savePreferences(): void {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(this.preferences));
      this.emit('preferencesUpdated', this.preferences);
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  public getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  public updatePreferences(updates: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
  }

  public resetPreferences(): void {
    this.preferences = this.getDefaultPreferences();
    this.savePreferences();
  }

  // Specific preference getters and setters
  public getSelectedSpecialty(): string | null {
    return this.preferences.selectedSpecialty;
  }

  public setSelectedSpecialty(specialty: string | null): void {
    this.updatePreferences({ selectedSpecialty: specialty });
  }

  public getResponseComplexity(): 'basic' | 'intermediate' | 'advanced' {
    return this.preferences.responseComplexity;
  }

  public setResponseComplexity(complexity: 'basic' | 'intermediate' | 'advanced'): void {
    this.updatePreferences({ responseComplexity: complexity });
  }

  public getLanguage(): string {
    return this.preferences.language;
  }

  public setLanguage(language: string): void {
    this.updatePreferences({ language, voiceLanguage: language });
  }

  public isVoiceEnabled(): boolean {
    return this.preferences.voiceEnabled;
  }

  public setVoiceEnabled(enabled: boolean): void {
    this.updatePreferences({ voiceEnabled: enabled });
  }

  public getVoiceSettings() {
    return {
      language: this.preferences.voiceLanguage,
      rate: this.preferences.voiceRate,
      pitch: this.preferences.voicePitch,
      autoRead: this.preferences.autoReadResponses,
      wakeWordEnabled: this.preferences.wakeWordEnabled,
    };
  }

  public updateVoiceSettings(settings: {
    language?: string;
    rate?: number;
    pitch?: number;
    autoRead?: boolean;
    wakeWordEnabled?: boolean;
  }): void {
    this.updatePreferences({
      voiceLanguage: settings.language ?? this.preferences.voiceLanguage,
      voiceRate: settings.rate ?? this.preferences.voiceRate,
      voicePitch: settings.pitch ?? this.preferences.voicePitch,
      autoReadResponses: settings.autoRead ?? this.preferences.autoReadResponses,
      wakeWordEnabled: settings.wakeWordEnabled ?? this.preferences.wakeWordEnabled,
    });
  }

  public hasCompletedOnboarding(): boolean {
    return this.preferences.hasCompletedOnboarding;
  }

  public setOnboardingCompleted(completed: boolean): void {
    this.updatePreferences({ hasCompletedOnboarding: completed });
  }

  public isAutoSaveEnabled(): boolean {
    return this.preferences.autoSave;
  }

  public setAutoSave(enabled: boolean): void {
    this.updatePreferences({ autoSave: enabled });
  }

  public hasVisualPreference(): boolean {
    return this.preferences.visualPreference;
  }

  public setVisualPreference(enabled: boolean): void {
    this.updatePreferences({ visualPreference: enabled });
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

  // Export/Import functionality
  public exportPreferences(): string {
    return JSON.stringify(this.preferences, null, 2);
  }

  public importPreferences(preferencesJson: string): boolean {
    try {
      const imported = JSON.parse(preferencesJson);
      // Validate that imported data has required structure
      const defaults = this.getDefaultPreferences();
      const merged = { ...defaults, ...imported };
      
      this.preferences = merged;
      this.savePreferences();
      return true;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }

  // Accessibility helpers
  public getAccessibilitySettings() {
    return {
      voiceEnabled: this.preferences.voiceEnabled,
      autoReadResponses: this.preferences.autoReadResponses,
      wakeWordEnabled: this.preferences.wakeWordEnabled,
      visualPreference: this.preferences.visualPreference,
      language: this.preferences.language,
    };
  }

  public updateAccessibilitySettings(settings: {
    voiceEnabled?: boolean;
    autoReadResponses?: boolean;
    wakeWordEnabled?: boolean;
    visualPreference?: boolean;
  }): void {
    this.updatePreferences({
      voiceEnabled: settings.voiceEnabled ?? this.preferences.voiceEnabled,
      autoReadResponses: settings.autoReadResponses ?? this.preferences.autoReadResponses,
      wakeWordEnabled: settings.wakeWordEnabled ?? this.preferences.wakeWordEnabled,
      visualPreference: settings.visualPreference ?? this.preferences.visualPreference,
    });
  }

  // Medical context helpers
  public getMedicalPreferences() {
    return {
      selectedSpecialty: this.preferences.selectedSpecialty,
      responseComplexity: this.preferences.responseComplexity,
      visualPreference: this.preferences.visualPreference,
      language: this.preferences.language,
    };
  }

  public updateMedicalPreferences(settings: {
    selectedSpecialty?: string | null;
    responseComplexity?: 'basic' | 'intermediate' | 'advanced';
    visualPreference?: boolean;
  }): void {
    this.updatePreferences(settings);
  }
}

export default UserPreferencesService;