import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode, AccentColor } from '../types';
import { getThemeMode, setThemeMode, getAccentColor, setAccentColor } from '../services/storageService';

export interface AccentColorItem {
  id: AccentColor;
  name: string;
  hex: string;
  hoverHex: string;
  lightBg: string;
  borderHex: string;
}

export const ACCENT_COLORS: Record<AccentColor, AccentColorItem> = {
  blue: {
    id: 'blue',
    name: 'Xanh dương',
    hex: '#007AFF',
    hoverHex: '#0062CC',
    lightBg: 'rgba(0, 122, 255, 0.12)',
    borderHex: 'rgba(0, 122, 255, 0.25)'
  },
  purple: {
    id: 'purple',
    name: 'Tím',
    hex: '#AF52DE',
    hoverHex: '#9333EA',
    lightBg: 'rgba(175, 82, 222, 0.12)',
    borderHex: 'rgba(175, 82, 222, 0.25)'
  },
  pink: {
    id: 'pink',
    name: 'Hồng',
    hex: '#FF2D55',
    hoverHex: '#E02447',
    lightBg: 'rgba(255, 45, 85, 0.12)',
    borderHex: 'rgba(255, 45, 85, 0.25)'
  },
  orange: {
    id: 'orange',
    name: 'Cam',
    hex: '#FF9500',
    hoverHex: '#D97706',
    lightBg: 'rgba(255, 149, 0, 0.12)',
    borderHex: 'rgba(255, 149, 0, 0.25)'
  },
  green: {
    id: 'green',
    name: 'Xanh lá',
    hex: '#34C759',
    hoverHex: '#28A745',
    lightBg: 'rgba(52, 199, 89, 0.12)',
    borderHex: 'rgba(52, 199, 89, 0.25)'
  }
};

interface ThemeContextType {
  theme: ThemeMode;
  accent: AccentColor;
  accentConfig: AccentColorItem;
  setTheme: (mode: ThemeMode) => void;
  setAccent: (color: AccentColor) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setInternalTheme] = useState<ThemeMode>(() => getThemeMode());
  const [accent, setInternalAccent] = useState<AccentColor>(() => getAccentColor());

  const accentConfig = ACCENT_COLORS[accent] || ACCENT_COLORS.blue;
  const isDark = theme === 'dark';

  const handleSetTheme = (newMode: ThemeMode) => {
    setInternalTheme(newMode);
    setThemeMode(newMode);
  };

  const handleSetAccent = (newAccent: AccentColor) => {
    setInternalAccent(newAccent);
    setAccentColor(newAccent);
  };

  // Synchronize CSS custom variables & class on root
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    root.style.setProperty('--color-accent', accentConfig.hex);
    root.style.setProperty('--color-accent-hover', accentConfig.hoverHex);
    root.style.setProperty('--color-accent-light', accentConfig.lightBg);
    root.style.setProperty('--color-accent-border', accentConfig.borderHex);
  }, [theme, accentConfig, isDark]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        accent,
        accentConfig,
        setTheme: handleSetTheme,
        setAccent: handleSetAccent,
        isDark
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
