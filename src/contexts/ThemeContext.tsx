import React, { createContext, useContext, useEffect, useState } from 'react';

interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
  };
}

const themes: Theme[] = [
  {
    id: 'default',
    name: 'Default Purple',
    colors: {
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      primary: '210 40% 98%',
      primaryForeground: '222.2 47.4% 11.2%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      accent: '217.2 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      ring: '212.7 26.8% 83.9%',
      card: '222.2 84% 4.9%',
      cardForeground: '210 40% 98%',
      popover: '222.2 84% 4.9%',
      popoverForeground: '210 40% 98%'
    }
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    colors: {
      background: '210 40% 8%',
      foreground: '210 40% 98%',
      primary: '200 98% 39%',
      primaryForeground: '210 40% 98%',
      secondary: '200 50% 25%',
      secondaryForeground: '210 40% 98%',
      muted: '215 27.9% 16.9%',
      mutedForeground: '215 20.2% 65.1%',
      accent: '216 12.2% 83.9%',
      accentForeground: '215 20.2% 65.1%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '215 27.9% 16.9%',
      input: '215 27.9% 16.9%',
      ring: '216 12.2% 83.9%',
      card: '224 71.4% 4.1%',
      cardForeground: '210 20% 98%',
      popover: '224 71.4% 4.1%',
      popoverForeground: '210 20% 98%'
    }
  },
  {
    id: 'forest',
    name: 'Forest Green',
    colors: {
      background: '120 20% 8%',
      foreground: '120 40% 98%',
      primary: '142 76% 36%',
      primaryForeground: '356 29% 98%',
      secondary: '120 50% 25%',
      secondaryForeground: '120 40% 98%',
      muted: '120 20% 15%',
      mutedForeground: '120 10% 65%',
      accent: '120 20% 15%',
      accentForeground: '120 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '120 20% 15%',
      input: '120 20% 15%',
      ring: '142 76% 36%',
      card: '120 20% 8%',
      cardForeground: '120 40% 98%',
      popover: '120 20% 8%',
      popoverForeground: '120 40% 98%'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    colors: {
      background: '20 20% 8%',
      foreground: '20 40% 98%',
      primary: '25 95% 53%',
      primaryForeground: '20 20% 8%',
      secondary: '20 50% 25%',
      secondaryForeground: '20 40% 98%',
      muted: '20 20% 15%',
      mutedForeground: '20 10% 65%',
      accent: '20 20% 15%',
      accentForeground: '20 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '20 20% 15%',
      input: '20 20% 15%',
      ring: '25 95% 53%',
      card: '20 20% 8%',
      cardForeground: '20 40% 98%',
      popover: '20 20% 8%',
      popoverForeground: '20 40% 98%'
    }
  },
  {
    id: 'rose',
    name: 'Rose Pink',
    colors: {
      background: '340 20% 8%',
      foreground: '340 40% 98%',
      primary: '330 81% 60%',
      primaryForeground: '340 20% 8%',
      secondary: '340 50% 25%',
      secondaryForeground: '340 40% 98%',
      muted: '340 20% 15%',
      mutedForeground: '340 10% 65%',
      accent: '340 20% 15%',
      accentForeground: '340 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '340 20% 15%',
      input: '340 20% 15%',
      ring: '330 81% 60%',
      card: '340 20% 8%',
      cardForeground: '340 40% 98%',
      popover: '340 20% 8%',
      popoverForeground: '340 40% 98%'
    }
  },
  {
    id: 'midnight',
    name: 'Midnight Dark',
    colors: {
      background: '240 10% 3.9%',
      foreground: '0 0% 98%',
      primary: '0 0% 98%',
      primaryForeground: '240 5.9% 10%',
      secondary: '240 3.7% 15.9%',
      secondaryForeground: '0 0% 98%',
      muted: '240 3.7% 15.9%',
      mutedForeground: '240 5% 64.9%',
      accent: '240 3.7% 15.9%',
      accentForeground: '0 0% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '0 85.7% 97.3%',
      border: '240 3.7% 15.9%',
      input: '240 3.7% 15.9%',
      ring: '240 4.9% 83.9%',
      card: '240 10% 3.9%',
      cardForeground: '0 0% 98%',
      popover: '240 10% 3.9%',
      popoverForeground: '0 0% 98%'
    }
  }
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedThemeId = localStorage.getItem('preferred-theme');
    if (savedThemeId) {
      const savedTheme = themes.find(t => t.id === savedThemeId);
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      }
    }
  }, []);

  useEffect(() => {
    // Apply theme colors to CSS variables
    const root = document.documentElement;
    const colors = currentTheme.colors;
    
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.foreground);
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-foreground', colors.primaryForeground);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
    root.style.setProperty('--muted', colors.muted);
    root.style.setProperty('--muted-foreground', colors.mutedForeground);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-foreground', colors.accentForeground);
    root.style.setProperty('--destructive', colors.destructive);
    root.style.setProperty('--destructive-foreground', colors.destructiveForeground);
    root.style.setProperty('--border', colors.border);
    root.style.setProperty('--input', colors.input);
    root.style.setProperty('--ring', colors.ring);
    root.style.setProperty('--card', colors.card);
    root.style.setProperty('--card-foreground', colors.cardForeground);
    root.style.setProperty('--popover', colors.popover);
    root.style.setProperty('--popover-foreground', colors.popoverForeground);
  }, [currentTheme]);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('preferred-theme', themeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};