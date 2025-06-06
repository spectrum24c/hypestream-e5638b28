
import React from 'react';
import { getOptimizedImagePath } from '@/services/tmdbApi';

interface SimilarContentProps {
  items: any[];
  onItemClick: (item: any) => void;
}

const SimilarContent: React.FC<SimilarContentProps> = ({ items, onItemClick }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4 text-white">If you liked this, watch this</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => {
          const title = item.title || item.name || 'Unknown Title';
          const posterPath = item.poster_path 
            ? getOptimizedImagePath(item.poster_path, 'small') 
            : 'https://via.placeholder.com/185x278?text=No+Poster';
          const year = (item.release_date || item.first_air_date)?.split('-')[0] || 'N/A';
          const rating = item.vote_average?.toFixed(1) || 'N/A';

          return (
            <div 
              key={item.id}
              className="bg-card/50 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer border border-border/20 hover:border-hype-purple/30"
              onClick={() => onItemClick(item)}
            >
              <div className="aspect-[2/3] relative">
                <img 
                  src={posterPath}
                  alt={title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="p-2">
                <h4 className="font-medium text-sm text-white truncate mb-1">{title}</h4>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{year}</span>
                  <span>★ {rating}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimilarContent;
