import React from 'react';
import { Palette, Check, Sparkles, X, Droplets, Moon } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface ThemeSelectorProps {
  externalOpen?: boolean;
  onCloseExternal?: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ externalOpen, onCloseExternal }) => {
  const { theme, setTheme, isThemeModalOpen, closeThemeModal } = useTheme();

  const isOpen = externalOpen !== undefined ? externalOpen : isThemeModalOpen;

  const handleClose = () => {
    if (onCloseExternal) {
      onCloseExternal();
    } else {
      closeThemeModal();
    }
  };

  const themes: {
    id: ThemeMode;
    label: string;
    tag: string;
    icon: React.ReactNode;
    previewColors: string[];
    desc: string;
  }[] = [
    {
      id: 'earthy',
      label: 'Earthy Terracotta & Gold',
      tag: 'Classic Studio',
      icon: <Sparkles className="w-4 h-4 text-[#C85A32]" />,
      previewColors: ['#C85A32', '#D4A373', '#FAF7F2', '#2C2724'],
      desc: 'Warm artisan terracotta, gold leaf, and ivory glassmorphism.',
    },
    {
      id: 'sapphire',
      label: 'Royal Sapphire & Sky Blue',
      tag: 'Studio Card Theme',
      icon: <Droplets className="w-4 h-4 text-[#1D529E]" />,
      previewColors: ['#1D529E', '#00B4D8', '#F0F6FF', '#0F2537'],
      desc: 'Refined sapphire blue, pastel sky, and ice glass inspired by artist card.',
    },
    {
      id: 'blackgold',
      label: 'Theme Black + Antique Gold',
      tag: 'Luxurious Midnight',
      icon: <Moon className="w-4 h-4 text-[#D4A373]" />,
      previewColors: ['#12100E', '#D4A373', '#E6C594', '#1A1714'],
      desc: 'Midnight obsidian black background with metallic antique gold leaf accents.',
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative max-w-md w-full my-auto glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border border-theme-glass bg-theme-card text-theme-primary flex flex-col max-h-[88vh]">
        {/* Header - Fixed at Top */}
        <div className="shrink-0 flex items-center justify-between pb-3.5 border-b border-theme-glass">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-theme-accent/15 border border-theme-glass">
              <Palette className="w-5 h-5 text-theme-accent" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-theme-primary leading-tight">
                Website Theme & Style
              </h3>
              <p className="text-[11px] text-theme-muted font-medium">
                Choose your aesthetic color combination
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-theme-glass text-theme-muted hover:text-theme-primary transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Theme Options Grid - All 3 Themes Completely Visible */}
        <div className="overflow-y-auto flex-1 my-3 py-1 pr-1 space-y-3 min-h-0">
          {themes.map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  handleClose();
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isActive
                    ? 'bg-theme-accent/15 border-theme-accent shadow-md ring-2 ring-theme-accent/40'
                    : 'bg-theme-page/60 border-theme-glass hover:bg-theme-page hover:border-theme-accent/50'
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {t.icon}
                    <span className="font-serif font-bold text-sm text-theme-primary">{t.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-theme-accent/15 text-theme-accent font-semibold border border-theme-glass shrink-0">
                      {t.tag}
                    </span>
                  </div>
                  <p className="text-xs text-theme-muted font-light leading-snug">{t.desc}</p>

                  {/* Color Palette Swatches */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {t.previewColors.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-4 h-4 rounded-full border border-white/20 shadow-xs shrink-0"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {isActive && (
                  <div className="w-7 h-7 rounded-full bg-theme-accent text-white flex items-center justify-center shrink-0 shadow-md">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Footer - Fixed at Bottom */}
        <div className="shrink-0 pt-3 text-center border-t border-theme-glass">
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-theme-accent text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            Apply Style & Close
          </button>
        </div>
      </div>
    </div>
  );
};
