import React from 'react';
import { Movie } from '@/types/movie';
import MovieSuggestionCard from './MovieSuggestionCard';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  onMovieClick?: (movie: Movie) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onMovieClick }) => {
  const isUser = message.role === 'user';

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
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[hsl(var(--hype-purple))] to-[hsl(var(--hype-orange))] flex items-center justify-center text-white text-xs font-bold">
              H
            </div>
            <span className="text-xs text-muted-foreground">HYPE</span>
          </div>
        )}
        
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-gradient-to-r from-[hsl(var(--hype-purple))] to-[hsl(var(--hype-orange))] text-white'
              : 'bg-secondary text-secondary-foreground'
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
