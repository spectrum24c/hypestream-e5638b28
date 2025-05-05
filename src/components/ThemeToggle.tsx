
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex items-center ${isMobile ? 'justify-center' : ''} gap-2`}>
      <Sun 
        size={isMobile ? 16 : 18} 
        className={`${theme === 'light' ? 'text-hype-orange' : 'text-muted-foreground'}`} 
      />
      <Switch 
        id="theme-toggle" 
        checked={theme === "light"} 
        onCheckedChange={toggleTheme}
        className={isMobile ? 'scale-90' : ''}
      />
      <Moon 
        size={isMobile ? 16 : 18} 
        className={`${theme === 'dark' ? 'text-hype-purple' : 'text-muted-foreground'}`} 
      />
    </div>
  );
}
