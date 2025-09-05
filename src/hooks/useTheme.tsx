import { useEffect } from 'react';

const themes = {
  default: {
    primary: '263 83% 57%',
    secondary: '210 40% 98%',
    accent: '210 40% 96%',
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%'
  },
  ocean: {
    primary: '200 100% 50%',
    secondary: '210 40% 98%',
    accent: '210 40% 96%',
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%'
  },
  forest: {
    primary: '142 71% 45%',
    secondary: '210 40% 98%',
    accent: '210 40% 96%',
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%'
  },
  sunset: {
    primary: '20 90% 55%',
    secondary: '210 40% 98%',
    accent: '210 40% 96%',
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%'
  },
  midnight: {
    primary: '263 83% 57%',
    secondary: '217.2 32.6% 17.5%',
    accent: '217.2 32.6% 17.5%',
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%'
  }
};

export const useTheme = () => {
  useEffect(() => {
    // Load and apply saved theme on app initialization
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    const themeColors = themes[savedTheme as keyof typeof themes] || themes.default;
    
    const root = document.documentElement;
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, []);
};

export default useTheme;