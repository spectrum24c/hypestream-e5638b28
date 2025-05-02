
import React, { useEffect, useState } from 'react';
import { imgPath, fetchGenres } from '@/services/tmdbApi';

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
  onClick
}) => {
  const [genres, setGenres] = useState<string[]>([]);
  
  useEffect(() => {
    const loadGenres = async () => {
      if (genreIds && genreIds.length > 0) {
        const genreList = await fetchGenres(isTVShow ? 'tv' : 'movie');
        const matchedGenres = genreList
          .filter(genre => genreIds.includes(genre.id))
          .map(genre => genre.name)
          .slice(0, 2); // Only show up to 2 genres to save space
        
        setGenres(matchedGenres);
      }
    };
    
    loadGenres();
  }, [genreIds, isTVShow]);

  const posterUrl = posterPath 
    ? `${imgPath}${posterPath}` 
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

  // Format genres for display
  const genresText = genres.length > 0 ? genres.join(' • ') : '';

  return (
    <div 
      className="flex-shrink-0 w-[160px] sm:w-[176px] md:w-[198px] bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition duration-200 cursor-pointer shadow-lg"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] w-full">
        <img 
          src={posterUrl} 
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-2 md:p-3">
        <h3 className="font-bold text-xs md:text-sm mb-1 truncate">{title}</h3>
        <div className="flex justify-between text-gray-400 text-xs mb-1">
          <span>{year}</span>
          <span>★ {rating}</span>
        </div>
        <div className="text-gray-400 text-xs mb-1">
          {durationInfo}
          {durationInfo && genresText && ' • '}
          {genresText && <span className="text-gray-300">{genresText}</span>}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
