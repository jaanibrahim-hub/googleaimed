import { useState, useEffect, useCallback } from 'react';
import { MedicalSpecialty, UserPreferences } from '../types';
import { userPreferencesService } from '../services/medicalSpecialties';

interface UseMedicalSpecialtyReturn {
  // Current specialty state
  selectedSpecialty: MedicalSpecialty | null;
  preferences: UserPreferences;
  
  // Specialty management
  setSelectedSpecialty: (specialty: MedicalSpecialty | null) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  
  // Specialty detection and suggestions
  detectSpecialtyFromText: (text: string) => MedicalSpecialty[];
  getQuickActions: () => string[];
  
  // Prompt generation
  generateSpecialtyPrompt: (userQuery: string) => string;
  
  // Utility functions
  getAllSpecialties: () => MedicalSpecialty[];
  getSpecialtyById: (id: string) => MedicalSpecialty | null;
}

export const useMedicalSpecialty = (): UseMedicalSpecialtyReturn => {
  const [selectedSpecialty, setSelectedSpecialtyState] = useState<MedicalSpecialty | null>(null);
  const [preferences, setPreferencesState] = useState<UserPreferences>(
    userPreferencesService.getPreferences()
  );

  // Initialize specialty state
  useEffect(() => {
    const currentSpecialty = userPreferencesService.getSelectedSpecialty();
    setSelectedSpecialtyState(currentSpecialty);
    
    const currentPrefs = userPreferencesService.getPreferences();
    setPreferencesState(currentPrefs);
  }, []);

  // Set selected specialty
  const setSelectedSpecialty = useCallback((specialty: MedicalSpecialty | null) => {
    setSelectedSpecialtyState(specialty);
    userPreferencesService.setSelectedSpecialty(specialty?.id || null);
    
    console.log('🏥 Medical specialty changed:', specialty?.name || 'General Medicine');
  }, []);

  // Update user preferences
  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    const updatedPrefs = { ...preferences, ...prefs };
    setPreferencesState(updatedPrefs);
    userPreferencesService.savePreferences(prefs);
    
    console.log('⚙️ User preferences updated:', prefs);
  }, [preferences]);

  // Detect specialty from text content
  const detectSpecialtyFromText = useCallback((text: string): MedicalSpecialty[] => {
    return userPreferencesService.detectSpecialtyFromText(text);
  }, []);

  // Get quick actions for current specialty
  const getQuickActions = useCallback((): string[] => {
    return userPreferencesService.getQuickActionsForSpecialty(selectedSpecialty?.id || null);
  }, [selectedSpecialty]);

  // Generate specialty-specific prompt enhancement
  const generateSpecialtyPrompt = useCallback((userQuery: string): string => {
    return userPreferencesService.generateSpecialtyPrompt(selectedSpecialty?.id || null, userQuery);
  }, [selectedSpecialty]);

  // Get all available specialties
  const getAllSpecialties = useCallback((): MedicalSpecialty[] => {
    return userPreferencesService.getAllSpecialties();
  }, []);

  // Get specialty by ID
  const getSpecialtyById = useCallback((id: string): MedicalSpecialty | null => {
    return userPreferencesService.getSpecialtyById(id);
  }, []);

  return {
    // Current specialty state
    selectedSpecialty,
    preferences,
    
    // Specialty management
    setSelectedSpecialty,
    updatePreferences,
    
    // Specialty detection and suggestions
    detectSpecialtyFromText,
    getQuickActions,
    
    // Prompt generation
    generateSpecialtyPrompt,
    
    // Utility functions
    getAllSpecialties,
    getSpecialtyById,
  };
};