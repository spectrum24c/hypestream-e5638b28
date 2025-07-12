// Export the apiKeys so they can be imported in other files
export const apiKeys = {
  tmdb: "62c59007d93c96aa3cca9f3422d51af5",
  youtube: "AIzaSyDXm-Wl4rlMXXhS0hWxoJDMdsc3mllh_ok"
};

const tmdbApiEndpoint = "https://api.themoviedb.org/3";
export const imgPath = "https://image.tmdb.org/t/p/original";

// Cache for API responses
const apiCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

// Cache for genres
let movieGenresCache: Genre[] = [];
let tvGenresCache: Genre[] = [];
let genresCacheTimestamp: number | null = null;

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  also_known_as: string[];
}

export interface SearchFilters {
  year?: number;
  primary_release_year?: number;
  first_air_date_year?: number;
}

export interface DiscoverFilters {
  genres?: number[];
  year?: number;
  first_air_date_year?: number;
  release_date_gte?: string;
  release_date_lte?: string;
  first_air_date_gte?: string;
  first_air_date_lte?: string;
  vote_average_gte?: number;
  vote_average_lte?: number;
  with_cast?: string;
  with_crew?: string;
}

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
  fetchTVTrailer: (tvId: string) => `${tmdbApiEndpoint}/tv/${tvId}/videos?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchMovieGenres: `${tmdbApiEndpoint}/genre/movie/list?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchTVGenres: `${tmdbApiEndpoint}/genre/tv/list?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchAnime: `${tmdbApiEndpoint}/discover/tv?api_key=${apiKeys.tmdb}&language=en-US&with_keywords=210024`,
  fetchAnimeByGenre: (genreId: number) => `${tmdbApiEndpoint}/discover/tv?api_key=${apiKeys.tmdb}&language=en-US&with_keywords=210024&with_genres=${genreId}`,
  
  // Cast & Crew endpoints
  fetchMovieCredits: (movieId: string) => `${tmdbApiEndpoint}/movie/${movieId}/credits?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchTVCredits: (tvId: string) => `${tmdbApiEndpoint}/tv/${tvId}/credits?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchPersonDetails: (personId: string) => `${tmdbApiEndpoint}/person/${personId}?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchPersonMovieCredits: (personId: string) => `${tmdbApiEndpoint}/person/${personId}/movie_credits?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchPersonTVCredits: (personId: string) => `${tmdbApiEndpoint}/person/${personId}/tv_credits?api_key=${apiKeys.tmdb}&language=en-US`,
  
  // Advanced search endpoints
  searchMoviesAdvanced: (query: string, filters?: SearchFilters) => {
    let url = `${tmdbApiEndpoint}/search/movie?api_key=${apiKeys.tmdb}&language=en-US&query=${encodeURIComponent(query)}`;
    if (filters?.year) url += `&year=${filters.year}`;
    if (filters?.primary_release_year) url += `&primary_release_year=${filters.primary_release_year}`;
    return url;
  },
  searchTVAdvanced: (query: string, filters?: SearchFilters) => {
    let url = `${tmdbApiEndpoint}/search/tv?api_key=${apiKeys.tmdb}&language=en-US&query=${encodeURIComponent(query)}`;
    if (filters?.first_air_date_year) url += `&first_air_date_year=${filters.first_air_date_year}`;
    return url;
  },
  searchPerson: (query: string) => `${tmdbApiEndpoint}/search/person?api_key=${apiKeys.tmdb}&language=en-US&query=${encodeURIComponent(query)}`,
  
  // Discover with advanced filters
  discoverMovies: (filters: DiscoverFilters) => {
    let url = `${tmdbApiEndpoint}/discover/movie?api_key=${apiKeys.tmdb}&language=en-US&sort_by=popularity.desc`;
    if (filters.genres?.length) url += `&with_genres=${filters.genres.join(',')}`;
    if (filters.year) url += `&year=${filters.year}`;
    if (filters.release_date_gte) url += `&release_date.gte=${filters.release_date_gte}`;
    if (filters.release_date_lte) url += `&release_date.lte=${filters.release_date_lte}`;
    if (filters.vote_average_gte) url += `&vote_average.gte=${filters.vote_average_gte}`;
    if (filters.vote_average_lte) url += `&vote_average.lte=${filters.vote_average_lte}`;
    if (filters.with_cast) url += `&with_cast=${filters.with_cast}`;
    if (filters.with_crew) url += `&with_crew=${filters.with_crew}`;
    return url;
  },
  discoverTV: (filters: DiscoverFilters) => {
    let url = `${tmdbApiEndpoint}/discover/tv?api_key=${apiKeys.tmdb}&language=en-US&sort_by=popularity.desc`;
    if (filters.genres?.length) url += `&with_genres=${filters.genres.join(',')}`;
    if (filters.first_air_date_year) url += `&first_air_date_year=${filters.first_air_date_year}`;
    if (filters.first_air_date_gte) url += `&first_air_date.gte=${filters.first_air_date_gte}`;
    if (filters.first_air_date_lte) url += `&first_air_date.lte=${filters.first_air_date_lte}`;
    if (filters.vote_average_gte) url += `&vote_average.gte=${filters.vote_average_gte}`;
    if (filters.vote_average_lte) url += `&vote_average.lte=${filters.vote_average_lte}`;
    return url;
  },
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
    
    // Special handling for anime category
    if (category === 'anime') {
      url = genreId ? apiPaths.fetchAnimeByGenre(genreId) : apiPaths.fetchAnime;
    } else if (category === 'movie') {
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

// Fetch genres for movies or TV shows
export const fetchGenres = async (type: 'movie' | 'tv'): Promise<Genre[]> => {
  const now = Date.now();
  const cacheExpired = !genresCacheTimestamp || now - genresCacheTimestamp > CACHE_DURATION;
  
  if (type === 'movie' && movieGenresCache.length > 0 && !cacheExpired) {
    return movieGenresCache;
  }
  
  if (type === 'tv' && tvGenresCache.length > 0 && !cacheExpired) {
    return tvGenresCache;
  }
  
  try {
    const url = type === 'movie' ? apiPaths.fetchMovieGenres : apiPaths.fetchTVGenres;
    const data = await fetchFromTMDB(url);
    
    if (data && data.genres) {
      if (type === 'movie') {
        movieGenresCache = data.genres;
      } else {
        tvGenresCache = data.genres;
      }
      
      genresCacheTimestamp = now;
      return data.genres;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching ${type} genres:`, error);
    return [];
  }
};

// Advanced search with filters
export const searchWithFilters = async (query: string, filters: DiscoverFilters & { mediaType?: 'movie' | 'tv' | 'both' }) => {
  try {
    const results: any[] = [];
    
    if (!filters.mediaType || filters.mediaType === 'both' || filters.mediaType === 'movie') {
      const movieUrl = apiPaths.discoverMovies({
        ...filters,
        year: filters.year,
        release_date_gte: filters.release_date_gte,
        release_date_lte: filters.release_date_lte,
      });
      const movieData = await fetchFromTMDB(movieUrl);
      if (movieData?.results) {
        results.push(...movieData.results.map((item: any) => ({ ...item, media_type: 'movie' })));
      }
    }
    
    if (!filters.mediaType || filters.mediaType === 'both' || filters.mediaType === 'tv') {
      const tvUrl = apiPaths.discoverTV({
        ...filters,
        first_air_date_year: filters.first_air_date_year,
        first_air_date_gte: filters.first_air_date_gte,
        first_air_date_lte: filters.first_air_date_lte,
      });
      const tvData = await fetchFromTMDB(tvUrl);
      if (tvData?.results) {
        results.push(...tvData.results.map((item: any) => ({ ...item, media_type: 'tv' })));
      }
    }
    
    // If there's a search query, filter results by title/name
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      return results.filter(item => 
        (item.title?.toLowerCase().includes(searchTerm) || 
         item.name?.toLowerCase().includes(searchTerm))
      );
    }
    
    return results;
  } catch (error) {
    console.error("Error in advanced search:", error);
    return [];
  }
};

// Fetch cast and crew for movies/TV shows
export const fetchCredits = async (id: string, type: 'movie' | 'tv') => {
  try {
    const url = type === 'movie' ? apiPaths.fetchMovieCredits(id) : apiPaths.fetchTVCredits(id);
    const data = await fetchFromTMDB(url);
    return {
      cast: data?.cast || [],
      crew: data?.crew || []
    };
  } catch (error) {
    console.error(`Error fetching ${type} credits:`, error);
    return { cast: [], crew: [] };
  }
};

// Fetch person details and their works
export const fetchPersonData = async (personId: string) => {
  try {
    const [details, movieCredits, tvCredits] = await Promise.all([
      fetchFromTMDB(apiPaths.fetchPersonDetails(personId)),
      fetchFromTMDB(apiPaths.fetchPersonMovieCredits(personId)),
      fetchFromTMDB(apiPaths.fetchPersonTVCredits(personId))
    ]);
    
    return {
      details: details || null,
      movieCredits: movieCredits || { cast: [], crew: [] },
      tvCredits: tvCredits || { cast: [], crew: [] }
    };
  } catch (error) {
    console.error("Error fetching person data:", error);
    return {
      details: null,
      movieCredits: { cast: [], crew: [] },
      tvCredits: { cast: [], crew: [] }
    };
  }
};
