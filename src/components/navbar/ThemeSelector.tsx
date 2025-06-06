
import React from 'react';
import { Palette, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useTheme, themes } from '@/contexts/ThemeContext';

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="rounded-full p-2 flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span className="hidden md:inline-block">Theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Choose Theme</h4>
            <p className="text-sm text-muted-foreground">
              Select a design theme for your HypeStream experience
            </p>
          </div>
          <div className="grid gap-2">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  currentTheme.id === theme.id
                    ? 'border-primary bg-accent'
                    : 'border-border hover:bg-accent'
                }`}
                onClick={() => setTheme(theme.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{theme.name}</div>
                    {currentTheme.id === theme.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {theme.description}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ background: theme.gradients.hero }}
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ThemeSelector;
