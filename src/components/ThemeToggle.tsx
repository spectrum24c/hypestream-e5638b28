
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Sun 
        size={18} 
        className={`${theme === 'light' ? 'text-hype-orange' : 'text-muted-foreground'}`} 
      />
      <Switch 
        id="theme-toggle" 
        checked={theme === "dark" ? false : true}
        onCheckedChange={toggleTheme}
      />
      <Moon 
        size={18} 
        className={`${theme === 'dark' ? 'text-hype-purple' : 'text-muted-foreground'}`} 
      />
    </div>
  );
}
