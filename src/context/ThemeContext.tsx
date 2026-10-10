import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'earthy' | 'sapphire' | 'blackgold';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  isThemeModalOpen: boolean;
  openThemeModal: () => void;
  closeThemeModal: () => void;
  themeConfig: {
    name: string;
    description: string;
    primaryHex: string;
    secondaryHex: string;
    bgHex: string;
  };
}

const THEME_CONFIGS: Record<ThemeMode, ThemeContextType['themeConfig']> = {
  earthy: {
    name: 'Earthy Terracotta & Gold',
    description: 'Warm artisan studio palette with terracotta, warm gold, and ivory',
    primaryHex: '#C85A32',
    secondaryHex: '#D4A373',
    bgHex: '#FAF7F2',
  },
  sapphire: {
    name: 'Royal Sapphire & Sky Blue',
    description: 'Pastel sky blue and royal sapphire theme inspired by artist card design',
    primaryHex: '#1D529E',
    secondaryHex: '#00B4D8',
    bgHex: '#F0F6FF',
  },
  blackgold: {
    name: 'Black & Antique Gold',
    description: 'Luxurious obsidian black with metallic antique gold leaf and champagne glassmorphism',
    primaryHex: '#D4A373',
    secondaryHex: '#E6C594',
    bgHex: '#12100E',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('dot_art_theme');
    if (saved === 'earthy' || saved === 'sapphire' || saved === 'blackgold') {
      return saved as ThemeMode;
    }
    return 'earthy';
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('dot_art_theme', mode);
  };

  const openThemeModal = () => setIsThemeModalOpen(true);
  const closeThemeModal = () => setIsThemeModalOpen(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isThemeModalOpen,
        openThemeModal,
        closeThemeModal,
        themeConfig: THEME_CONFIGS[theme],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
