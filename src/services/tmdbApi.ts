
const apiKeys = {
  tmdb: "62c59007d93c96aa3cca9f3422d51af5",
  youtube: "AIzaSyDXm-Wl4rlMXXhS0hWxoJDMdsc3mllh_ok"
};

const tmdbApiEndpoint = "https://api.themoviedb.org/3";
export const imgPath = "https://image.tmdb.org/t/p/original";

// Cache for API responses
const apiCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export const apiPaths = {
  fetchAllCategories: `${tmdbApiEndpoint}/genre/movie/list?api_key=${apiKeys.tmdb}`,
  fetchMoviesList: (id: number) => `${tmdbApiEndpoint}/discover/movie?api_key=${apiKeys.tmdb}&with_genres=${id}`,
  fetchTrending: `${tmdbApiEndpoint}/trending/all/day?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchPopularMovies: `${tmdbApiEndpoint}/movie/popular?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchLatestMovies: `${tmdbApiEndpoint}/movie/now_playing?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchUpcomingMovies: `${tmdbApiEndpoint}/movie/upcoming?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchTVList: (id: number) => `${tmdbApiEndpoint}/discover/tv?api_key=${apiKeys.tmdb}&with_genres=${id}`,
  fetchPopularTV: `${tmdbApiEndpoint}/tv/popular?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchMovieDetails: (movieId: string) => `${tmdbApiEndpoint}/movie/${movieId}?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchTVDetails: (tvId: string) => `${tmdbApiEndpoint}/tv/${tvId}?api_key=${apiKeys.tmdb}&language=en-US`,
  searchMulti: (query: string) => `${tmdbApiEndpoint}/search/multi?api_key=${apiKeys.tmdb}&language=en-US&query=${encodeURIComponent(query)}`,
  fetchMovieTrailer: (movieId: string) => `${tmdbApiEndpoint}/movie/${movieId}/videos?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchTVTrailer: (tvId: string) => `${tmdbApiEndpoint}/tv/${tvId}/videos?api_key=${apiKeys.tmdb}&language=en-US`
};

// Fetch data from TMDB API with caching
export const fetchFromTMDB = async (url: string) => {
  try {
    // Check if we have a valid cached response
    const cachedData = apiCache.get(url);
    const now = Date.now();
    
    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      console.log('Using cached data for:', url);
      return cachedData.data;
    }
    
    console.log('Fetching fresh data for:', url);
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'force-cache', // Use HTTP caching when possible
    });
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the response
    apiCache.set(url, {
      data,
      timestamp: now
    });
    
    return data;
  } catch (error) {
    console.error("Error fetching from TMDB:", error);
    throw error;
  }
};

// Optimize image loading by using the appropriate size
export const getOptimizedImagePath = (path: string | null, size = 'original') => {
  if (!path) return null;
  
  // Map of available TMDb image sizes
  const sizes = {
    poster: {
      small: 'w185',
      medium: 'w342',
      large: 'w500',
      original: 'original'
    },
    backdrop: {
      small: 'w300',
      medium: 'w780',
      large: 'w1280',
      original: 'original'
    }
  };
  
  // Determine if this is a poster or backdrop based on aspect ratio
  const isBackdrop = path.includes('backdrop');
  const sizeType = isBackdrop ? sizes.backdrop : sizes.poster;
  const optimizedSize = sizeType[size as keyof typeof sizeType] || 'original';
  
  return `https://image.tmdb.org/t/p/${optimizedSize}${path}`;
};

// Preload images for smoother user experience
export const preloadImage = (src: string | null) => {
  if (!src) return;
  
  const img = new Image();
  img.src = src;
};

// Search content with debouncing for performance
let searchTimeout: NodeJS.Timeout;
export const searchContent = async (query: string) => {
  if (!query || query.trim() === '') return { results: [] };
  
  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  return new Promise((resolve) => {
    searchTimeout = setTimeout(async () => {
      try {
        const data = await fetchFromTMDB(apiPaths.searchMulti(query));
        resolve(data);
      } catch (error) {
        console.error("Error searching content:", error);
        resolve({ results: [] });
      }
    }, 300); // 300ms debounce
  });
};

// Fetch content by category and genre
export const fetchContentByCategory = async (category: string, genreId: number) => {
  try {
    let url;
    if (category === 'movie') {
      url = apiPaths.fetchMoviesList(genreId);
    } else if (category === 'tv') {
      url = apiPaths.fetchTVList(genreId);
    } else if (category === 'new') {
      url = apiPaths.fetchLatestMovies;
    } else {
      url = apiPaths.fetchTrending;
    }
    
    const data = await fetchFromTMDB(url);
    
    // Ensure we return the expected Movie[] type
    if (data && data.results) {
      return data.results;
    }
    return [];
  } catch (error) {
    console.error("Error fetching content by category:", error);
    return [];
  }
};

// Format date for display
export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'N/A' : date.getFullYear().toString();
};
