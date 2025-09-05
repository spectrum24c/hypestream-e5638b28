import React from 'react';
import { Check, Palette, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
const Themes = () => {
  const {
    currentTheme,
    setTheme,
    themes
  } = useTheme();
  const getPreviewStyle = (colors: any) => ({
    background: `hsl(${colors.background})`,
    color: `hsl(${colors.foreground})`,
    border: `1px solid hsl(${colors.border})`
  });
  return <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
              <Link to="/">
                <Button variant="outline" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Palette className="h-8 w-8 text-primary" />
                  <h1 className="text-4xl font-bold text-foreground">Themes</h1>
                </div>
                <p className="text-muted-foreground text-lg">
                  Choose your preferred color scheme to personalize your experience
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {themes.map(theme => <div key={theme.id} className="flex flex-col items-center space-y-4 cursor-pointer group" onClick={() => setTheme(theme.id)}>
                  {/* Theme Circle */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 hover:scale-110 transition-all duration-200 flex items-center justify-center relative overflow-hidden" style={{
                  background: `linear-gradient(135deg, hsl(${theme.colors.primary}), hsl(${theme.colors.secondary}))`,
                  borderColor: currentTheme.id === theme.id ? `hsl(${currentTheme.colors.primary})` : `hsl(${theme.colors.border})`
                }}>
                      {/* Color segments */}
                      <div className="absolute inset-0 w-1/2" style={{
                    background: `hsl(${theme.colors.primary})`
                  }} />
                      <div className="absolute inset-0 left-1/2 w-1/2" style={{
                    background: `hsl(${theme.colors.secondary})`
                  }} />
                      <div className="absolute bottom-0 left-1/4 w-1/2 h-1/2" style={{
                    background: `hsl(${theme.colors.accent})`
                  }} />
                      
                      {/* Check mark for selected theme */}
                      {currentTheme.id === theme.id && <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="bg-white rounded-full p-1">
                            <Check className="h-3 w-3 text-black" />
                          </div>
                        </div>}
                    </div>
                  </div>
                  
                  {/* Theme Name and Description */}
                  <div className="text-center">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {theme.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {theme.id === 'default' && 'Classic purple theme'}
                      {theme.id === 'ocean' && 'Cool blue ocean vibes'}
                      {theme.id === 'forest' && 'Natural green colors'}
                      {theme.id === 'sunset' && 'Warm orange hues'}
                      {theme.id === 'rose' && 'Elegant pink tones'}
                      {theme.id === 'midnight' && 'Deep dark theme'}
                    </p>
                  </div>
                  
                  {/* Color palette preview */}
                  <div className="flex gap-1">
                    <div className="h-3 w-3 rounded-full border" style={{
                  background: `hsl(${theme.colors.primary})`
                }} />
                    <div className="h-3 w-3 rounded-full border" style={{
                  background: `hsl(${theme.colors.secondary})`
                }} />
                    <div className="h-3 w-3 rounded-full border" style={{
                  background: `hsl(${theme.colors.accent})`
                }} />
                    <div className="h-3 w-3 rounded-full border" style={{
                  background: `hsl(${theme.colors.muted})`
                }} />
                  </div>
                </div>)}
            </div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                Your theme preference will be saved automatically
              </p>
            </div>
          </div>
        </div>
      </div>
    </>;
};
export default Themes;