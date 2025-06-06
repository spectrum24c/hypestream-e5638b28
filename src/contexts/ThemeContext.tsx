
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
  };
  gradients: {
    hero: string;
    button: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'default',
    name: 'HypeStream Original',
    description: 'The classic HypeStream look',
    colors: {
      primary: '210 40% 98%',
      secondary: '217.2 32.6% 17.5%',
      accent: '217.2 32.6% 17.5%',
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      muted: '215 20.2% 65.1%',
    },
    gradients: {
      hero: 'linear-gradient(to right, hsl(277 99% 53%), hsl(25 95% 53%))',
      button: 'linear-gradient(to right, hsl(277 99% 53%), hsl(25 95% 53%))',
    }
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Cool ocean-inspired theme',
    colors: {
      primary: '210 40% 98%',
      secondary: '217 19% 27%',
      accent: '201 96% 32%',
      background: '220 39% 11%',
      foreground: '210 40% 98%',
      muted: '215 20.2% 65.1%',
    },
    gradients: {
      hero: 'linear-gradient(to right, hsl(201 96% 32%), hsl(189 86% 42%))',
      button: 'linear-gradient(to right, hsl(201 96% 32%), hsl(189 86% 42%))',
    }
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Warm sunset colors',
    colors: {
      primary: '210 40% 98%',
      secondary: '217 19% 27%',
      accent: '12 76% 61%',
      background: '240 10% 3.9%',
      foreground: '210 40% 98%',
      muted: '215 20.2% 65.1%',
    },
    gradients: {
      hero: 'linear-gradient(to right, hsl(12 76% 61%), hsl(351 83% 61%))',
      button: 'linear-gradient(to right, hsl(12 76% 61%), hsl(351 83% 61%))',
    }
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Nature-inspired green theme',
    colors: {
      primary: '210 40% 98%',
      secondary: '217 19% 27%',
      accent: '120 60% 50%',
      background: '220 26% 14%',
      foreground: '210 40% 98%',
      muted: '215 20.2% 65.1%',
    },
    gradients: {
      hero: 'linear-gradient(to right, hsl(120 60% 50%), hsl(142 71% 45%))',
      button: 'linear-gradient(to right, hsl(120 60% 50%), hsl(142 71% 45%))',
    }
  }
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [isLoading, setIsLoading] = useState(true);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--background', theme.colors.background);
    root.style.setProperty('--foreground', theme.colors.foreground);
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--secondary', theme.colors.secondary);
    root.style.setProperty('--accent', theme.colors.accent);
    root.style.setProperty('--muted-foreground', theme.colors.muted);
    
    // Apply gradient variables
    root.style.setProperty('--gradient-hero', theme.gradients.hero);
    root.style.setProperty('--gradient-button', theme.gradients.button);
  };

  const setTheme = async (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    setCurrentTheme(theme);
    applyTheme(theme);
    
    // Save to localStorage for all users
    localStorage.setItem('selectedTheme', themeId);
    
    // Save to Supabase for authenticated users
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ selected_theme: themeId })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error saving theme to database:', error);
    }
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        let savedThemeId = 'default';
        
        // First try localStorage
        const localTheme = localStorage.getItem('selectedTheme');
        if (localTheme) {
          savedThemeId = localTheme;
        }

        // Then try to get from user profile if authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            // Try to get theme from user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('selected_theme')
              .eq('id', user.id)
              .single();
            
            if (profile?.selected_theme) {
              savedThemeId = profile.selected_theme;
            }
          } catch (error) {
            console.log('Using localStorage theme');
          }
        }
        
        const theme = themes.find(t => t.id === savedThemeId) || themes[0];
        setCurrentTheme(theme);
        applyTheme(theme);
      } catch (error) {
        console.error('Error loading theme:', error);
        // Fall back to default theme
        setCurrentTheme(themes[0]);
        applyTheme(themes[0]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};
