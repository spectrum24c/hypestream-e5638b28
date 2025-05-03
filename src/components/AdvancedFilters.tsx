
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Check, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Genre {
  id: number;
  name: string;
}

interface FilterOptions {
  years: [number, number];
  ratings: [number, number];
  genres: number[];
}

interface AdvancedFiltersProps {
  genres: Genre[];
  onApplyFilters: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  activeFilters?: FilterOptions;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  genres,
  onApplyFilters,
  onClearFilters,
  activeFilters
}) => {
  const currentYear = new Date().getFullYear();
  const defaultFilters: FilterOptions = {
    years: [1990, currentYear],
    ratings: [0, 10],
    genres: []
  };
  
  const [filters, setFilters] = useState<FilterOptions>(activeFilters || defaultFilters);
  const [isOpen, setIsOpen] = useState(false);
  
  const hasActiveFilters = () => {
    return (
      filters.years[0] !== defaultFilters.years[0] ||
      filters.years[1] !== defaultFilters.years[1] ||
      filters.ratings[0] !== defaultFilters.ratings[0] ||
      filters.ratings[1] !== defaultFilters.ratings[1] ||
      filters.genres.length > 0
    );
  };
  
  const handleYearsChange = (value: number[]) => {
    setFilters({
      ...filters,
      years: [value[0], value[1]] as [number, number]
    });
  };
  
  const handleRatingsChange = (value: number[]) => {
    setFilters({
      ...filters,
      ratings: [value[0], value[1]] as [number, number]
    });
  };
  
  const toggleGenre = (genreId: number) => {
    if (filters.genres.includes(genreId)) {
      setFilters({
        ...filters,
        genres: filters.genres.filter(id => id !== genreId)
      });
    } else {
      setFilters({
        ...filters,
        genres: [...filters.genres, genreId]
      });
    }
  };
  
  const handleApply = () => {
    onApplyFilters(filters);
    setIsOpen(false);
  };
  
  const handleClear = () => {
    const resetFilters = { ...defaultFilters };
    setFilters(resetFilters);
    onClearFilters();
  };

  const getSelectedGenreNames = () => {
    return filters.genres
      .map(id => genres.find(g => g.id === id)?.name)
      .filter(Boolean) as string[];
  };
  
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant={hasActiveFilters() ? "default" : "outline"} 
              className={cn(
                "flex items-center gap-2",
                hasActiveFilters() && "bg-hype-purple hover:bg-hype-purple/90"
              )}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters() && (
                <Badge className="h-5 w-5 p-0 flex items-center justify-center bg-white text-black text-xs font-bold rounded-full">
                  {filters.genres.length + (filters.years[0] !== defaultFilters.years[0] || filters.years[1] !== defaultFilters.years[1] ? 1 : 0) + (filters.ratings[0] !== defaultFilters.ratings[0] || filters.ratings[1] !== defaultFilters.ratings[1] ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-4" align="start">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Release Year</h4>
                <div className="px-2">
                  <Slider
                    min={1900}
                    max={currentYear}
                    step={1}
                    value={[filters.years[0], filters.years[1]]}
                    onValueChange={handleYearsChange}
                    className="my-4"
                  />
                  <div className="flex justify-between text-sm">
                    <span>{filters.years[0]}</span>
                    <span>{filters.years[1]}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Rating</h4>
                <div className="px-2">
                  <Slider
                    min={0}
                    max={10}
                    step={0.1}
                    value={[filters.ratings[0], filters.ratings[1]]}
                    onValueChange={handleRatingsChange}
                    className="my-4"
                  />
                  <div className="flex justify-between text-sm">
                    <span>{filters.ratings[0].toFixed(1)}</span>
                    <span>{filters.ratings[1].toFixed(1)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Genres</h4>
                <div className="grid grid-cols-2 gap-1 max-h-[200px] overflow-y-auto">
                  {genres.map((genre) => (
                    <div
                      key={genre.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer text-sm",
                        filters.genres.includes(genre.id)
                          ? "bg-hype-purple/20 text-hype-purple"
                          : "hover:bg-muted"
                      )}
                      onClick={() => toggleGenre(genre.id)}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-sm border flex items-center justify-center",
                        filters.genres.includes(genre.id)
                          ? "bg-hype-purple border-hype-purple"
                          : "border-input"
                      )}>
                        {filters.genres.includes(genre.id) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span>{genre.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClear}
                >
                  Clear All
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleApply}
                  className="bg-hype-purple hover:bg-hype-purple/90"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {hasActiveFilters() && (
          <div className="flex flex-wrap gap-2">
            {filters.years[0] !== defaultFilters.years[0] || filters.years[1] !== defaultFilters.years[1] ? (
              <Badge variant="outline" className="bg-muted/50 flex items-center gap-1">
                Years: {filters.years[0]} - {filters.years[1]}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => {
                    setFilters({
                      ...filters,
                      years: defaultFilters.years
                    });
                    onApplyFilters({
                      ...filters,
                      years: defaultFilters.years
                    });
                  }}
                />
              </Badge>
            ) : null}
            
            {filters.ratings[0] !== defaultFilters.ratings[0] || filters.ratings[1] !== defaultFilters.ratings[1] ? (
              <Badge variant="outline" className="bg-muted/50 flex items-center gap-1">
                Rating: {filters.ratings[0].toFixed(1)} - {filters.ratings[1].toFixed(1)}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => {
                    setFilters({
                      ...filters,
                      ratings: defaultFilters.ratings
                    });
                    onApplyFilters({
                      ...filters,
                      ratings: defaultFilters.ratings
                    });
                  }}
                />
              </Badge>
            ) : null}
            
            {getSelectedGenreNames().map((name) => (
              <Badge key={name} variant="outline" className="bg-muted/50 flex items-center gap-1">
                {name}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => {
                    const genreId = genres.find(g => g.name === name)?.id;
                    if (genreId) {
                      const newGenres = filters.genres.filter(id => id !== genreId);
                      setFilters({
                        ...filters,
                        genres: newGenres
                      });
                      onApplyFilters({
                        ...filters,
                        genres: newGenres
                      });
                    }
                  }}
                />
              </Badge>
            ))}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs px-2" 
              onClick={handleClear}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFilters;
