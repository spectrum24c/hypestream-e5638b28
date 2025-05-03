
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserPreference } from '@/types/movie';
import { Check, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface UserPreferencesProps {
  preferences: UserPreference;
  genres: { id: number; name: string }[];
  languages: { code: string; name: string }[];
  onSave: (preferences: UserPreference) => Promise<void>;
}

const UserPreferences: React.FC<UserPreferencesProps> = ({
  preferences,
  genres,
  languages,
  onSave
}) => {
  const [preferredGenres, setPreferredGenres] = useState<number[]>(preferences.preferredGenres || []);
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>(preferences.preferredLanguages || []);
  const [enableNotifications, setEnableNotifications] = useState<boolean>(preferences.enableNotifications);
  const [genreSearch, setGenreSearch] = useState('');
  const [langSearch, setLangSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Apply notification preference to global state
  useEffect(() => {
    // Set the notification preference in localStorage
    localStorage.setItem('notificationsEnabled', enableNotifications ? 'true' : 'false');
  }, [enableNotifications]);

  const filteredGenres = genres.filter((genre) => 
    genre.name.toLowerCase().includes(genreSearch.toLowerCase())
  );

  const filteredLanguages = languages.filter((lang) => 
    lang.name.toLowerCase().includes(langSearch.toLowerCase())
  );

  const handleGenreToggle = (genreId: number) => {
    if (preferredGenres.includes(genreId)) {
      setPreferredGenres(preferredGenres.filter(id => id !== genreId));
    } else {
      setPreferredGenres([...preferredGenres, genreId]);
    }
  };

  const handleLanguageToggle = (langCode: string) => {
    if (preferredLanguages.includes(langCode)) {
      setPreferredLanguages(preferredLanguages.filter(code => code !== langCode));
    } else {
      setPreferredLanguages([...preferredLanguages, langCode]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onSave({
        ...preferences,
        preferredGenres,
        preferredLanguages,
        enableNotifications
      });
      
      toast({
        title: "Preferences saved",
        description: "Your preferences have been updated successfully",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your preferences",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Preferences</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notifications</h3>
          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={enableNotifications}
              onCheckedChange={setEnableNotifications}
            />
            <Label htmlFor="notifications">Enable content recommendations and new release notifications</Label>
          </div>
        </div>

        <div className={`space-y-4 ${!enableNotifications && "opacity-50 pointer-events-none"}`}>
          <h3 className="text-lg font-medium">Preferred Genres</h3>
          <p className="text-sm text-muted-foreground">Choose genres you enjoy to get personalized recommendations</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {preferredGenres.map(genreId => {
              const genre = genres.find(g => g.id === genreId);
              return genre ? (
                <Badge 
                  key={genre.id} 
                  variant="outline" 
                  className="flex items-center gap-1 bg-hype-purple/20 border-hype-purple/50"
                >
                  {genre.name}
                  <button 
                    type="button" 
                    onClick={() => handleGenreToggle(genre.id)}
                    className="ml-1 hover:bg-hype-purple/30 rounded-full p-0.5"
                  >
                    <span className="sr-only">Remove</span>
                    ✕
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search genres"
                value={genreSearch}
                onChange={(e) => setGenreSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-muted/20 rounded-md">
              {filteredGenres.map(genre => (
                <div 
                  key={genre.id}
                  className={`flex items-center px-2 py-1.5 rounded-md text-sm cursor-pointer ${
                    preferredGenres.includes(genre.id) 
                      ? 'bg-hype-purple/20 text-hype-purple' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleGenreToggle(genre.id)}
                >
                  <div className={`w-4 h-4 mr-2 rounded border flex items-center justify-center ${
                    preferredGenres.includes(genre.id) 
                      ? 'bg-hype-purple border-hype-purple' 
                      : 'border-muted-foreground'
                  }`}>
                    {preferredGenres.includes(genre.id) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  {genre.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`space-y-4 ${!enableNotifications && "opacity-50 pointer-events-none"}`}>
          <h3 className="text-lg font-medium">Preferred Languages</h3>
          <p className="text-sm text-muted-foreground">Select languages for content</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {preferredLanguages.map(langCode => {
              const language = languages.find(l => l.code === langCode);
              return language ? (
                <Badge 
                  key={language.code} 
                  variant="outline" 
                  className="flex items-center gap-1 bg-hype-purple/20 border-hype-purple/50"
                >
                  {language.name}
                  <button 
                    type="button" 
                    onClick={() => handleLanguageToggle(language.code)}
                    className="ml-1 hover:bg-hype-purple/30 rounded-full p-0.5"
                  >
                    <span className="sr-only">Remove</span>
                    ✕
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search languages"
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-muted/20 rounded-md">
              {filteredLanguages.map(language => (
                <div 
                  key={language.code}
                  className={`flex items-center px-2 py-1.5 rounded-md text-sm cursor-pointer ${
                    preferredLanguages.includes(language.code) 
                      ? 'bg-hype-purple/20 text-hype-purple' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleLanguageToggle(language.code)}
                >
                  <div className={`w-4 h-4 mr-2 rounded border flex items-center justify-center ${
                    preferredLanguages.includes(language.code) 
                      ? 'bg-hype-purple border-hype-purple' 
                      : 'border-muted-foreground'
                  }`}>
                    {preferredLanguages.includes(language.code) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  {language.name}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <Button
          type="submit"
          className="bg-hype-purple hover:bg-hype-purple/90"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </form>
    </div>
  );
};

export default UserPreferences;
