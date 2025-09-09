import { ThemeConfig, ThemeColors } from '../types';

class ThemeService {
  private static instance: ThemeService;
  private currentTheme: 'light' | 'dark' | 'auto' = 'light';
  private isDarkMode = false;
  private listeners: { [event: string]: Function[] } = {};
  private mediaQuery: MediaQueryList;

  private constructor() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.currentTheme = this.loadThemePreference();
    this.initializeTheme();
    this.setupSystemThemeListener();
  }

  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  private loadThemePreference(): 'light' | 'dark' | 'auto' {
    try {
      const saved = localStorage.getItem('theme');
      if (saved && ['light', 'dark', 'auto'].includes(saved)) {
        return saved as 'light' | 'dark' | 'auto';
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
    return 'auto';
  }

  private saveThemePreference(theme: 'light' | 'dark' | 'auto'): void {
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }

  private setupSystemThemeListener(): void {
    this.mediaQuery.addListener((e) => {
      if (this.currentTheme === 'auto') {
        this.updateThemeMode(e.matches);
      }
    });
  }

  private initializeTheme(): void {
    const shouldUseDark = this.shouldUseDarkMode();
    this.updateThemeMode(shouldUseDark);
  }

  private shouldUseDarkMode(): boolean {
    switch (this.currentTheme) {
      case 'dark':
        return true;
      case 'light':
        return false;
      case 'auto':
        return this.mediaQuery.matches;
      default:
        return false;
    }
  }

  private updateThemeMode(isDark: boolean): void {
    this.isDarkMode = isDark;
    this.applyTheme();
    this.emit('themeChanged', { theme: this.currentTheme, isDarkMode: isDark });
  }

  private applyTheme(): void {
    const root = document.documentElement;
    const theme = this.getThemeConfig();
    const colors = this.isDarkMode ? theme.colors.dark : theme.colors.light;

    // Apply CSS custom properties
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    // Update body class
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }

    // Update meta theme-color for mobile browsers
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', colors.primary);
  }

  private getThemeConfig(): ThemeConfig {
    return {
      name: 'MediTeach Health Theme',
      colors: {
        light: {
          primary: '#2E7D95',
          secondary: '#4A90A4',
          accent: '#7FB069',
          background: '#F8FBFF',
          surface: '#FFFFFF',
          text: '#1F2937',
          textSecondary: '#6B7280',
          border: '#E1F0F5',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
        dark: {
          primary: '#4A90A4',
          secondary: '#2E7D95',
          accent: '#9ACA3C',
          background: '#0F172A',
          surface: '#1E293B',
          text: '#F8FAFC',
          textSecondary: '#CBD5E1',
          border: '#334155',
          success: '#22C55E',
          warning: '#EAB308',
          error: '#F87171',
          info: '#60A5FA',
        },
      },
    };
  }

  public setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.currentTheme = theme;
    this.saveThemePreference(theme);
    const shouldUseDark = this.shouldUseDarkMode();
    this.updateThemeMode(shouldUseDark);
  }

  public getCurrentTheme(): 'light' | 'dark' | 'auto' {
    return this.currentTheme;
  }

  public isDark(): boolean {
    return this.isDarkMode;
  }

  public getColors(): ThemeColors {
    const config = this.getThemeConfig();
    return this.isDarkMode ? config.colors.dark : config.colors.light;
  }

  public toggleTheme(): void {
    const newTheme = this.isDarkMode ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  // High contrast mode
  public setHighContrast(enabled: boolean): void {
    if (enabled) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    this.emit('contrastChanged', enabled);
  }

  // Reduced motion mode
  public setReducedMotion(enabled: boolean): void {
    if (enabled) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
    this.emit('motionChanged', enabled);
  }

  // Medical specialty color theming
  public applySpecialtyTheme(specialtyColor?: string): void {
    if (specialtyColor) {
      const root = document.documentElement;
      const adjustedColor = this.adjustColorForTheme(specialtyColor);
      root.style.setProperty('--color-specialty-accent', adjustedColor);
      root.style.setProperty('--color-specialty-light', adjustedColor + '20');
      root.style.setProperty('--color-specialty-border', adjustedColor + '40');
    }
  }

  private adjustColorForTheme(color: string): string {
    // In dark mode, make colors slightly brighter and more vibrant
    if (this.isDarkMode && color.startsWith('#')) {
      // Simple color adjustment for dark theme
      return this.lightenColor(color, 0.1);
    }
    return color;
  }

  private lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  // Generate theme-aware gradients
  public getGradient(type: 'primary' | 'secondary' | 'accent' | 'surface'): string {
    const colors = this.getColors();
    
    switch (type) {
      case 'primary':
        return `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`;
      case 'secondary':
        return `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`;
      case 'accent':
        return `linear-gradient(135deg, ${colors.accent}, ${colors.primary})`;
      case 'surface':
        return this.isDarkMode
          ? `linear-gradient(135deg, ${colors.surface}, #2D3748)`
          : `linear-gradient(135deg, ${colors.surface}, #F7FAFC)`;
      default:
        return `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`;
    }
  }

  // Generate theme-aware box shadows
  public getBoxShadow(intensity: 'sm' | 'md' | 'lg' | 'xl' = 'md'): string {
    const shadowColor = this.isDarkMode ? '0, 0, 0' : '0, 0, 0';
    const shadowOpacity = this.isDarkMode ? '0.5' : '0.1';
    
    const shadows = {
      sm: `0 1px 2px rgba(${shadowColor}, ${shadowOpacity})`,
      md: `0 4px 6px rgba(${shadowColor}, ${shadowOpacity})`,
      lg: `0 10px 15px rgba(${shadowColor}, ${shadowOpacity})`,
      xl: `0 20px 25px rgba(${shadowColor}, ${shadowOpacity})`,
    };
    
    return shadows[intensity];
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

  // Utility methods for components
  public getThemeAwareColor(lightColor: string, darkColor: string): string {
    return this.isDarkMode ? darkColor : lightColor;
  }

  public getOpacityColor(color: string, opacity: number): string {
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
  }

  // Cleanup
  public destroy(): void {
    this.mediaQuery.removeListener(() => {});
    this.listeners = {};
  }
}

export default ThemeService;