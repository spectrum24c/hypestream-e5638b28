
import React, { useState } from 'react';
import { imgPath } from '@/services/tmdbApi';
import { Download, Loader2 } from 'lucide-react';
import { downloadMovie, findDownloadLinks } from '@/utils/movieDownloader';
import { useToast } from '@/hooks/use-toast';

interface MovieCardProps {
  id: string;
  title: string;
  posterPath: string | null;
  releaseDate?: string | null;
  voteAverage?: number;
  isTVShow?: boolean;
  runtime?: number | null;
  numberOfSeasons?: number | null;
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
  onClick
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
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

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    
    try {
      // Show toast notification
      toast({
        title: "Searching for download options",
        description: `Looking for "${title}" download links...`,
      });
      
      // Find download links
      const downloadLinks = await findDownloadLinks(id, title);
      
      if (downloadLinks.length > 0) {
        // For demo purposes, just use the first link
        // In a real app, you might want to show a dropdown of quality options
        const link = downloadLinks[0];
        
        // Start the download
        await downloadMovie(link.url, `${title} (${year}) - ${link.quality}.mp4`);
        
        toast({
          title: "Download initiated",
          description: `${title} (${link.quality}) - Source: ${link.source || 'Unknown'} download started`,
        });
      } else {
        toast({
          title: "No download links found",
          description: "Could not find download links for this title",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "An error occurred while processing your download",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

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
        <button 
          onClick={handleDownload}
          className="absolute bottom-2 right-2 bg-hype-purple/80 hover:bg-hype-purple p-1.5 rounded-full text-white"
          aria-label="Download"
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
        </button>
      </div>
      <div className="p-2 md:p-3">
        <h3 className="font-bold text-xs md:text-sm mb-1 truncate">{title}</h3>
        <div className="flex justify-between text-gray-400 text-xs">
          <span>{year}</span>
          <span>★ {rating}</span>
        </div>
        {durationInfo && (
          <div className="text-gray-400 text-xs mt-1">
            {durationInfo}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
