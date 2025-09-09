import { useState, useEffect, useCallback } from 'react';
import ThemeService from '../services/themeService';
import { ThemeColors } from '../types';

interface UseThemeReturn {
  theme: 'light' | 'dark' | 'auto';
  isDarkMode: boolean;
  colors: ThemeColors;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleTheme: () => void;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  applySpecialtyTheme: (color?: string) => void;
  getGradient: (type: 'primary' | 'secondary' | 'accent' | 'surface') => string;
  getBoxShadow: (intensity?: 'sm' | 'md' | 'lg' | 'xl') => string;
  getThemeAwareColor: (lightColor: string, darkColor: string) => string;
  getOpacityColor: (color: string, opacity: number) => string;
}

export const useTheme = (): UseThemeReturn => {
  const [themeService] = useState(() => ThemeService.getInstance());
  const [theme, setThemeState] = useState<'light' | 'dark' | 'auto'>(themeService.getCurrentTheme());
  const [isDarkMode, setIsDarkMode] = useState(themeService.isDark());
  const [colors, setColors] = useState<ThemeColors>(themeService.getColors());

  // Handle theme changes
  useEffect(() => {
    const handleThemeChange = (data: { theme: 'light' | 'dark' | 'auto'; isDarkMode: boolean }) => {
      setThemeState(data.theme);
      setIsDarkMode(data.isDarkMode);
      setColors(themeService.getColors());
    };

    themeService.on('themeChanged', handleThemeChange);

    return () => {
      themeService.off('themeChanged', handleThemeChange);
    };
  }, [themeService]);

  // Theme management functions
  const setTheme = useCallback((newTheme: 'light' | 'dark' | 'auto') => {
    themeService.setTheme(newTheme);
  }, [themeService]);

  const toggleTheme = useCallback(() => {
    themeService.toggleTheme();
  }, [themeService]);

  const setHighContrast = useCallback((enabled: boolean) => {
    themeService.setHighContrast(enabled);
  }, [themeService]);

  const setReducedMotion = useCallback((enabled: boolean) => {
    themeService.setReducedMotion(enabled);
  }, [themeService]);

  const applySpecialtyTheme = useCallback((color?: string) => {
    themeService.applySpecialtyTheme(color);
  }, [themeService]);

  // Utility functions
  const getGradient = useCallback((type: 'primary' | 'secondary' | 'accent' | 'surface') => {
    return themeService.getGradient(type);
  }, [themeService]);

  const getBoxShadow = useCallback((intensity: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
    return themeService.getBoxShadow(intensity);
  }, [themeService]);

  const getThemeAwareColor = useCallback((lightColor: string, darkColor: string) => {
    return themeService.getThemeAwareColor(lightColor, darkColor);
  }, [themeService]);

  const getOpacityColor = useCallback((color: string, opacity: number) => {
    return themeService.getOpacityColor(color, opacity);
  }, [themeService]);

  return {
    theme,
    isDarkMode,
    colors,
    setTheme,
    toggleTheme,
    setHighContrast,
    setReducedMotion,
    applySpecialtyTheme,
    getGradient,
    getBoxShadow,
    getThemeAwareColor,
    getOpacityColor,
  };
};

export default useTheme;