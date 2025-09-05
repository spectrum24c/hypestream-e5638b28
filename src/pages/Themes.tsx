import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
}

const themes: Theme[] = [
  {
    id: 'default',
    name: 'Default Purple',
    description: 'The original purple theme with vibrant accents',
    colors: {
      primary: '263 83% 57%',
      secondary: '210 40% 98%',
      accent: '210 40% 96%',
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%'
    }
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Cool blues inspired by ocean depths',
    colors: {
      primary: '200 100% 50%',
      secondary: '210 40% 98%',
      accent: '210 40% 96%',
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%'
    }
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Natural greens for a calming experience',
    colors: {
      primary: '142 71% 45%',
      secondary: '210 40% 98%',
      accent: '210 40% 96%',
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    description: 'Warm oranges and reds like a beautiful sunset',
    colors: {
      primary: '20 90% 55%',
      secondary: '210 40% 98%',
      accent: '210 40% 96%',
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%'
    }
  },
  {
    id: 'midnight',
    name: 'Midnight Dark',
    description: 'Dark theme with purple accents for night viewing',
    colors: {
      primary: '263 83% 57%',
      secondary: '217.2 32.6% 17.5%',
      accent: '217.2 32.6% 17.5%',
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%'
    }
  }
];

const ThemesPage: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<string>('default');

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    setCurrentTheme(savedTheme);
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--secondary', theme.colors.secondary);
    root.style.setProperty('--accent', theme.colors.accent);
    root.style.setProperty('--background', theme.colors.background);
    root.style.setProperty('--foreground', theme.colors.foreground);
    
    // Save to localStorage
    localStorage.setItem('selectedTheme', theme.id);
    setCurrentTheme(theme.id);
  };

  const getThemePreviewStyle = (theme: Theme) => ({
    background: `hsl(${theme.colors.background})`,
    color: `hsl(${theme.colors.foreground})`,
    borderColor: `hsl(${theme.colors.primary})`
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Themes</h1>
            <p className="text-muted-foreground">
              Choose a theme that matches your style. Changes are applied instantly.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <Card 
              key={theme.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                currentTheme === theme.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => applyTheme(theme)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{theme.name}</CardTitle>
                  {currentTheme === theme.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                <CardDescription>{theme.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div 
                  className="rounded-lg p-4 border-2 transition-colors"
                  style={getThemePreviewStyle(theme)}
                >
                  <div className="space-y-3">
                    <div 
                      className="w-full h-8 rounded"
                      style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                    />
                    <div className="flex gap-2">
                      <div 
                        className="flex-1 h-4 rounded"
                        style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}
                      />
                      <div 
                        className="flex-1 h-4 rounded"
                        style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  variant={currentTheme === theme.id ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    applyTheme(theme);
                  }}
                >
                  {currentTheme === theme.id ? 'Applied' : 'Apply Theme'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ThemesPage;