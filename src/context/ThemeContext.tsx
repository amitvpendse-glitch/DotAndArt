import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'blackgold' | 'sapphire' | 'ochre';

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
  blackgold: {
    name: 'Theme Black+Antique gold',
    description: 'Luxurious obsidian black with metallic antique gold leaf and champagne glassmorphism',
    primaryHex: '#D4A373',
    secondaryHex: '#E6C594',
    bgHex: '#12100E',
  },
  ochre: {
    name: 'Golden Ochre & Warm Sand',
    description: 'Warm · Earthy · Radiant. Earthen brownish-yellow golden ochre with warm sand accents.',
    primaryHex: '#C28B23',
    secondaryHex: '#E5D5BA',
    bgHex: '#FBF8F2',
  },
  sapphire: {
    name: 'Royal Sapphire & sky gold',
    description: 'Refined sapphire blue and sky gold inspired by artist card design',
    primaryHex: '#1D529E',
    secondaryHex: '#D4AF37',
    bgHex: '#F0F6FF',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('dot_art_theme');
    if (saved === 'blackgold' || saved === 'sapphire' || saved === 'ochre') {
      return saved as ThemeMode;
    }
    return 'ochre';
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
