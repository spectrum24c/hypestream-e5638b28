
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
  isNewSeason?: boolean;
  latestSeasonYear?: string;
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
  onClick,
  isNewSeason = false,
  latestSeasonYear
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const posterUrl = posterPath 
    ? getOptimizedImagePath(posterPath, 'medium') 
    : 'https://via.placeholder.com/300x450?text=No+Poster';
  
  const year = (isTVShow && latestSeasonYear) ? latestSeasonYear : (releaseDate?.split('-')[0] || 'N/A');
  const rating = voteAverage !== undefined ? voteAverage.toFixed(1) : 'N/A';
  
  let durationInfo = '';
  if (isTVShow) {
    durationInfo = numberOfSeasons ? `${numberOfSeasons} Season${numberOfSeasons !== 1 ? 's' : ''}` : '';
  } else {
    durationInfo = runtime ? `${runtime} min` : '';
  }

  return (
    <div 
      className="group flex-shrink-0 w-[160px] sm:w-[176px] md:w-[198px] rounded-md overflow-hidden transition-all duration-300 cursor-pointer bg-card hover:scale-105 hover:shadow-elevated hover:z-10"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] w-full bg-muted">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
          </div>
        )}
        
        <img 
          src={imageError ? '/placeholder.svg' : posterUrl}
          alt={title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          decoding="async"
        />
        
        {isNewSeason && (
          <div className="absolute top-2 left-2 bg-primary px-2 py-1 rounded text-xs font-bold text-primary-foreground z-10">
            NEW SEASON
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-2 md:p-3">
        <h3 className="font-semibold text-xs md:text-sm mb-1 truncate text-foreground">{title}</h3>
        <div className="flex justify-between text-muted-foreground text-xs mb-1">
          <span>{year}</span>
          <span className="text-accent">★ {rating}</span>
        </div>
        <div className="text-muted-foreground text-xs mb-1">
          {durationInfo}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;