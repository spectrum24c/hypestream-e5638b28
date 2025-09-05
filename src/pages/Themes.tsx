import React from 'react';
import { Check, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import Navbar from '@/components/Navbar';

const Themes = () => {
  const { currentTheme, setTheme, themes } = useTheme();

  const getPreviewStyle = (colors: any) => ({
    background: `hsl(${colors.background})`,
    color: `hsl(${colors.foreground})`,
    border: `1px solid hsl(${colors.border})`
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Palette className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold text-foreground">Themes</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Choose your preferred color scheme to personalize your experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.map((theme) => (
                <Card 
                  key={theme.id} 
                  className="relative cursor-pointer hover:shadow-lg transition-all duration-200 border-2"
                  style={currentTheme.id === theme.id ? { borderColor: `hsl(${currentTheme.colors.primary})` } : {}}
                  onClick={() => setTheme(theme.id)}
                >
                  {currentTheme.id === theme.id && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{theme.name}</CardTitle>
                    <CardDescription>
                      {theme.id === 'default' && 'The classic purple theme'}
                      {theme.id === 'ocean' && 'Cool blue tones inspired by the ocean'}
                      {theme.id === 'forest' && 'Natural green colors from the forest'}
                      {theme.id === 'sunset' && 'Warm orange hues like a sunset'}
                      {theme.id === 'rose' && 'Elegant pink and rose colors'}
                      {theme.id === 'midnight' && 'Deep dark theme for night owls'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {/* Color preview */}
                      <div 
                        className="h-20 rounded-lg p-3 transition-all duration-200"
                        style={getPreviewStyle(theme.colors)}
                      >
                        <div className="flex items-center justify-between h-full">
                          <div className="space-y-1">
                            <div 
                              className="h-2 w-16 rounded"
                              style={{ background: `hsl(${theme.colors.primary})` }}
                            />
                            <div 
                              className="h-2 w-12 rounded"
                              style={{ background: `hsl(${theme.colors.secondary})` }}
                            />
                          </div>
                          <div 
                            className="h-8 w-8 rounded-full"
                            style={{ background: `hsl(${theme.colors.accent})` }}
                          />
                        </div>
                      </div>
                      
                      {/* Color palette */}
                      <div className="flex gap-2">
                        <div 
                          className="h-4 w-4 rounded-full border"
                          style={{ background: `hsl(${theme.colors.primary})` }}
                          title="Primary"
                        />
                        <div 
                          className="h-4 w-4 rounded-full border"
                          style={{ background: `hsl(${theme.colors.secondary})` }}
                          title="Secondary"
                        />
                        <div 
                          className="h-4 w-4 rounded-full border"
                          style={{ background: `hsl(${theme.colors.accent})` }}
                          title="Accent"
                        />
                        <div 
                          className="h-4 w-4 rounded-full border"
                          style={{ background: `hsl(${theme.colors.muted})` }}
                          title="Muted"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                Your theme preference will be saved automatically
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Themes;