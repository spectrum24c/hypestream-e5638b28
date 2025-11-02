import React, { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatbotSettingsProps {
  onClose: () => void;
  onSettingsChange: (personalityLevel: number, theme: string) => void;
}

const THEME_OPTIONS = [
  { value: 'default', label: 'Default', colors: 'from-primary to-primary/80' },
  { value: 'purple', label: 'Purple Dream', colors: 'from-purple-600 to-pink-500' },
  { value: 'ocean', label: 'Ocean Blue', colors: 'from-blue-600 to-cyan-500' },
  { value: 'sunset', label: 'Sunset', colors: 'from-orange-600 to-red-500' },
  { value: 'forest', label: 'Forest', colors: 'from-green-600 to-emerald-500' },
];

const PERSONALITY_DESCRIPTIONS = [
  'Minimal - Straight to the point',
  'Casual - Friendly and relaxed',
  'Balanced - Mix of fun and professional',
  'Enthusiastic - Upbeat and energetic',
  'Maximum - Full HYPE mode! 🎬✨',
];

const ChatbotSettings: React.FC<ChatbotSettingsProps> = ({ onClose, onSettingsChange }) => {
  const [personalityLevel, setPersonalityLevel] = useState(3);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chatbot_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPersonalityLevel(data.personality_level);
        setSelectedTheme(data.theme);
        onSettingsChange(data.personality_level, data.theme);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save settings",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('chatbot_settings')
        .upsert({
          user_id: user.id,
          personality_level: personalityLevel,
          theme: selectedTheme,
        });

      if (error) throw error;

      onSettingsChange(personalityLevel, selectedTheme);
      
      toast({
        title: "Settings Saved",
        description: "Your HYPE preferences have been updated!",
      });

      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <h3 className="font-bold text-foreground text-lg">HYPE Settings</h3>
            <p className="text-sm text-muted-foreground">Customize your AI assistant</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="hover:bg-secondary h-10 w-10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-2xl mx-auto w-full">
        {/* Personality Level */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Personality Level</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {PERSONALITY_DESCRIPTIONS[personalityLevel - 1]}
            </p>
          </div>
          <Slider
            value={[personalityLevel]}
            onValueChange={(value) => setPersonalityLevel(value[0])}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Minimal</span>
            <span>Maximum</span>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Chat Theme</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a color theme for your chat
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {THEME_OPTIONS.map((theme) => (
              <button
                key={theme.value}
                onClick={() => setSelectedTheme(theme.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTheme === theme.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`h-12 w-full rounded bg-gradient-to-r ${theme.colors} mb-2`} />
                <p className="text-sm font-medium text-center">{theme.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border">
        <div className="flex gap-3 max-w-2xl mx-auto w-full">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={saveSettings}
            disabled={isLoading}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotSettings;
