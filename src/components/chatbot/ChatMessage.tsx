import React from 'react';
import { Movie } from '@/types/movie';
import MovieSuggestionCard from './MovieSuggestionCard';
import robotIcon from '@/assets/robot.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  onMovieClick?: (movie: Movie) => void;
  chatTheme?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onMovieClick, chatTheme = 'default' }) => {
  const isUser = message.role === 'user';

  const getThemeColors = () => {
    const themes = {
      default: 'bg-primary text-primary-foreground',
      purple: 'bg-gradient-to-br from-purple-600 to-pink-500 text-white',
      ocean: 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white',
      sunset: 'bg-gradient-to-br from-orange-600 to-red-500 text-white',
      forest: 'bg-gradient-to-br from-green-600 to-emerald-500 text-white',
    };
    return themes[chatTheme as keyof typeof themes] || themes.default;
  };

  // Extract movie data from content if present
  const parseMovieSuggestions = (content: string) => {
    const movieMatches = content.match(/\*\*([^*]+)\*\*\s*\((\d{4})\)/g);
    if (!movieMatches) return null;

    return movieMatches.map((match, idx) => {
      const titleMatch = match.match(/\*\*([^*]+)\*\*/);
      const yearMatch = match.match(/\((\d{4})\)/);
      
      if (!titleMatch || !yearMatch) return null;

      return {
        id: `suggestion-${idx}`,
        title: titleMatch[1],
        year: yearMatch[1],
      };
    }).filter(Boolean);
  };

  const suggestions = !isUser ? parseMovieSuggestions(message.content) : null;

  // Remove movie data from content for display
  const displayContent = message.content.replace(/\*\*([^*]+)\*\*\s*\((\d{4})\)/g, (match) => {
    return match.replace(/\*\*/g, '');
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-5 h-5 ${getThemeColors()} flex items-center justify-center shadow-md`} style={{ borderRadius: '15px' }}>
              <img src={robotIcon} alt="HYPE" className="h-3 w-3" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">HYPE</span>
          </div>
        )}

        <div
          className={`rounded-2xl px-5 py-3 ${
            isUser
              ? `${getThemeColors()} shadow-lg`
              : 'bg-secondary/80 text-secondary-foreground border border-border/50'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{displayContent}</p>
          
          {suggestions && suggestions.length > 0 && (
            <div className="mt-3 space-y-2">
              {suggestions.map((suggestion, idx) => (
                suggestion && (
                  <MovieSuggestionCard
                    key={idx}
                    title={suggestion.title}
                    year={suggestion.year}
                    onMovieClick={onMovieClick}
                  />
                )
              ))}
            </div>
          )}
        </div>
        
        <div className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
