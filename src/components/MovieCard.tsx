
import React, { useState } from 'react';
import { getOptimizedImagePath } from '@/services/tmdbApi';

interface MovieCardProps {
  id: string;
  title: string;
  posterPath: string | null;
  releaseDate?: string | null;
  voteAverage?: number;
  isTVShow?: boolean;
  runtime?: number | null;
  numberOfSeasons?: number | null;
  genreIds?: number[];
  overview?: string | null;
  onClick: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({
  id,
  title,
  posterPath,
  releaseDate,
  voteAverage,
  isTVShow = false,
  runtime,
  numberOfSeasons,
  genreIds = [],
  overview,
  onClick
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Use optimized image paths with appropriate size
  const posterUrl = posterPath 
    ? getOptimizedImagePath(posterPath, 'medium') 
    : 'https://via.placeholder.com/300x450?text=No+Poster';
  
  // Format release date to just show year
  const year = releaseDate?.split('-')[0] || 'N/A';
  
  // Format vote average to one decimal place
  const rating = voteAverage !== undefined ? voteAverage.toFixed(1) : 'N/A';
  
  // Format runtime or seasons display
  let durationInfo = '';
  if (isTVShow) {
    durationInfo = numberOfSeasons ? `${numberOfSeasons} Season${numberOfSeasons !== 1 ? 's' : ''}` : '';
  } else {
    durationInfo = runtime ? `${runtime} min` : '';
  }

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className="group flex-shrink-0 w-[160px] sm:w-[176px] md:w-[198px] bg-card rounded-lg overflow-hidden hover:scale-105 transition duration-200 cursor-pointer shadow-lg border border-border/10 hover:border-hype-purple/30"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] w-full bg-gray-800">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-t-transparent border-hype-purple rounded-full animate-spin"></div>
          </div>
        )}
        
        <img 
          src={imageError ? '/placeholder.svg' : posterUrl}
          alt={`${title} poster`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          fetchPriority="low"
          onLoad={handleImageLoad}
          onError={handleImageError}
          decoding="async"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div className="p-2 md:p-3">
        <h3 className="font-bold text-xs md:text-sm mb-1 truncate">{title}</h3>
        <div className="flex justify-between text-gray-400 text-xs mb-1">
          <span>{year}</span>
          <span>★ {rating}</span>
        </div>
        <div className="text-gray-400 text-xs mb-1">
          {durationInfo}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
