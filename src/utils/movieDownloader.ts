
/**
 * Movie Downloader Utility
 * 
 * This utility provides functionality for movie metadata searching and downloading.
 * It leverages public APIs and web scraping techniques to find movie information
 * and download links.
 */

import { apiKeys } from '@/services/tmdbApi';
import { useToast } from '@/hooks/use-toast';

// Movie search endpoints
const TMDB_SEARCH_ENDPOINT = 'https://api.themoviedb.org/3/search/movie';
const FMOVIES_DOMAIN_1 = 'www.fmovies.cms';
const FMOVIES_DOMAIN_2 = 'www.fmovies.net';

// Define the types for search results
interface SearchResult {
  id: string;
  title: string;
  overview: string;
  release_date?: string;
  poster_path?: string | null;
  download_links?: DownloadLink[];
}

interface DownloadLink {
  quality: string;
  url: string;
  size?: string;
  source?: string;
}

// Function to search for a movie
export const searchMovie = async (title: string): Promise<SearchResult[]> => {
  try {
    const url = `${TMDB_SEARCH_ENDPOINT}?api_key=${apiKeys.tmdb}&query=${encodeURIComponent(title)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the results to our format
    return data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      // We'll add download links in a separate step
      download_links: []
    }));
  } catch (error) {
    console.error('Error searching for movie:', error);
    return [];
  }
};

// Function to search fmovies sites for download links
const searchFmoviesSites = async (title: string): Promise<DownloadLink[]> => {
  console.log(`Searching for "${title}" on FMovies sites`);
  const links: DownloadLink[] = [];
  
  try {
    // Note: In a real implementation, this would need to be done through a backend proxy
    // due to CORS restrictions and potential legal/ethical considerations.
    // This is a simplified example for demonstration purposes only.
    
    // In a real implementation, this would involve more sophisticated scraping:
    // 1. First request to search the site for the movie
    // 2. Parse the search results to find the movie page
    // 3. Request the movie page
    // 4. Parse the page to find the download links
    
    // For demonstration purposes, we'll add simulated links
    links.push({
      quality: '1080p',
      url: `https://${FMOVIES_DOMAIN_1}/download/${encodeURIComponent(title)}/1080p`,
      size: '2.4 GB',
      source: FMOVIES_DOMAIN_1
    });
    
    links.push({
      quality: '720p',
      url: `https://${FMOVIES_DOMAIN_2}/download/${encodeURIComponent(title)}/720p`,
      size: '1.2 GB',
      source: FMOVIES_DOMAIN_2
    });
    
    return links;
  } catch (error) {
    console.error('Error searching FMovies sites:', error);
    return [];
  }
};

// Function to find download links
export const findDownloadLinks = async (movieId: string, title: string): Promise<DownloadLink[]> => {
  console.log(`Searching for download links for: ${title} (ID: ${movieId})`);
  
  try {
    // First try to find links on FMovies sites
    const fmoviesLinks = await searchFmoviesSites(title);
    
    if (fmoviesLinks.length > 0) {
      return fmoviesLinks;
    }
    
    // If no links found on FMovies, return simulated links as fallback
    // In a real implementation, you would search multiple sources
    return [
      {
        quality: '1080p',
        url: `https://example.com/movies/${movieId}/download/1080p`,
        size: '2.1 GB',
        source: 'example.com'
      },
      {
        quality: '720p',
        url: `https://example.com/movies/${movieId}/download/720p`,
        size: '1.4 GB',
        source: 'example.com'
      },
      {
        quality: '480p',
        url: `https://example.com/movies/${movieId}/download/480p`,
        size: '800 MB',
        source: 'example.com'
      }
    ];
  } catch (error) {
    console.error('Error finding download links:', error);
    // Return fallback links if an error occurs
    return [
      {
        quality: '1080p',
        url: `https://example.com/movies/${movieId}/download/1080p`,
        size: '2.1 GB',
        source: 'example.com'
      }
    ];
  }
};

// Function to initiate download
export const downloadMovie = async (url: string, filename: string): Promise<void> => {
  try {
    // For a browser environment, we need to create an anchor and trigger a download
    // Note: This approach will only work for same-origin URLs due to CORS restrictions
    // For cross-origin URLs, you would need a proxy server
    
    // In a real implementation, this would be handled through a backend service
    // that would download the file and then serve it to the client
    
    // Simulate success for now
    console.log(`Downloading ${filename} from ${url}`);
    
    // For demo purposes, open the URL in a new tab
    window.open(url, '_blank');
  } catch (error) {
    console.error('Error downloading movie:', error);
    throw error;
  }
};

// Function that combines search and finding download links
export const searchAndFindDownloadLinks = async (title: string): Promise<SearchResult[]> => {
  const searchResults = await searchMovie(title);
  
  // For each result, find download links
  const resultsWithLinks = await Promise.all(
    searchResults.map(async (result) => {
      const links = await findDownloadLinks(result.id, result.title);
      return {
        ...result,
        download_links: links
      };
    })
  );
  
  return resultsWithLinks;
};
