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
  title,
  posterPath,
  releaseDate,
  voteAverage,
  isTVShow = false,
  runtime,
  numberOfSeasons,
  onClick,
  isNewSeason = false,
  latestSeasonYear
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const posterUrl = posterPath
    ? getOptimizedImagePath(posterPath, 'medium')
    : '/placeholder.svg';

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
      role="button"
      tabIndex={0}
      aria-label={`${title}${year !== 'N/A' ? `, ${year}` : ''}. Press Enter to view details.`}
      className="group relative flex-shrink-0 w-[160px] sm:w-[176px] md:w-[198px] cursor-pointer bg-card rounded-md overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform duration-300 hover:scale-[1.03] hover:z-10"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="relative w-full aspect-[2/3] bg-muted overflow-hidden rounded-md">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
          </div>
        )}

        <img
          src={imageError ? '/placeholder.svg' : posterUrl}
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          decoding="async"
        />

        {isNewSeason && (
          <div className="absolute top-2 left-2 bg-primary px-2 py-1 rounded text-xs font-bold text-primary-foreground z-30">
            NEW SEASON
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
      </div>

      <div className="p-2 md:p-3">
        <h3 className="font-semibold text-xs md:text-sm mb-1 truncate text-foreground">{title}</h3>
        <div className="flex justify-between text-muted-foreground text-xs mb-1">
          <span>{year}</span>
          <span className="text-rating tabular-nums">★ {rating}</span>
        </div>
        <div className="text-muted-foreground text-xs mb-1">{durationInfo}</div>
      </div>
    </div>
  );
};

export default MovieCard;
