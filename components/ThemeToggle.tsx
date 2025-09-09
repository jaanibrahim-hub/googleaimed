import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'button' | 'switch' | 'dropdown';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  showLabel = false,
  variant = 'button'
}) => {
  const { theme, isDarkMode, setTheme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const getThemeIcon = (themeType: 'light' | 'dark' | 'auto') => {
    switch (themeType) {
      case 'light':
        return 'fas fa-sun';
      case 'dark':
        return 'fas fa-moon';
      case 'auto':
        return 'fas fa-adjust';
      default:
        return 'fas fa-adjust';
    }
  };

  const getThemeLabel = (themeType: 'light' | 'dark' | 'auto') => {
    switch (themeType) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'auto':
        return 'Auto Theme';
      default:
        return 'Auto Theme';
    }
  };

  if (variant === 'switch') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Theme
          </span>
        )}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleTheme}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
            <i className={`absolute top-1 left-1 w-4 h-4 text-xs flex items-center justify-center transition-all ${
              isDarkMode ? 'opacity-0' : 'opacity-100'
            } fas fa-sun text-yellow-500`}></i>
            <i className={`absolute top-1 right-1 w-4 h-4 text-xs flex items-center justify-center transition-all ${
              isDarkMode ? 'opacity-100' : 'opacity-0'
            } fas fa-moon text-blue-500`}></i>
          </div>
        </label>
        {showLabel && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isDarkMode ? 'Dark' : 'Light'}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`
            theme-button-secondary flex items-center gap-2 px-3 py-2 rounded-lg transition-all
            ${sizeClasses[size]} ${showLabel ? 'pr-8' : ''}
          `}
          title="Change theme"
        >
          <i className={getThemeIcon(theme)}></i>
          {showLabel && (
            <>
              <span className="text-sm font-medium">{getThemeLabel(theme)}</span>
              <i className={`fas fa-chevron-down transition-transform ${showDropdown ? 'rotate-180' : ''}`}></i>
            </>
          )}
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
              <div className="py-1">
                {(['light', 'dark', 'auto'] as const).map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => {
                      setTheme(themeOption);
                      setShowDropdown(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                      ${theme === themeOption ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    <i className={getThemeIcon(themeOption)}></i>
                    <span>{getThemeLabel(themeOption)}</span>
                    {theme === themeOption && (
                      <i className="fas fa-check ml-auto text-blue-600 dark:text-blue-400"></i>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Default button variant
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={toggleTheme}
        className={`
          theme-toggle flex items-center justify-center rounded-full transition-all duration-300
          hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${sizeClasses[size]}
          ${isDarkMode 
            ? 'bg-gray-800 text-yellow-400 border-gray-700 hover:bg-gray-700' 
            : 'bg-white text-blue-600 border-gray-300 hover:bg-blue-50'
          }
        `}
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        <div className="relative overflow-hidden">
          <i className={`
            ${getThemeIcon(isDarkMode ? 'light' : 'dark')} 
            transition-transform duration-300
            ${isDarkMode ? 'rotate-0' : 'rotate-180'}
          `}></i>
          
          {/* Animated background effect */}
          <div className={`
            absolute inset-0 rounded-full transition-all duration-300
            ${isDarkMode 
              ? 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20 scale-0' 
              : 'bg-gradient-to-br from-blue-400/20 to-purple-400/20 scale-0'
            }
            hover:scale-100
          `}></div>
        </div>
      </button>
      
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;