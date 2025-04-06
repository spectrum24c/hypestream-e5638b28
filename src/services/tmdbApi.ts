
const apiKeys = {
  tmdb: "62c59007d93c96aa3cca9f3422d51af5",
  youtube: "AIzaSyDXm-Wl4rlMXXhS0hWxoJDMdsc3mllh_ok"
};

const tmdbApiEndpoint = "https://api.themoviedb.org/3";
export const imgPath = "https://image.tmdb.org/t/p/original";

export const apiPaths = {
  fetchAllCategories: `${tmdbApiEndpoint}/genre/movie/list?api_key=${apiKeys.tmdb}`,
  fetchMoviesList: (id: number) => `${tmdbApiEndpoint}/discover/movie?api_key=${apiKeys.tmdb}&with_genres=${id}`,
  fetchTrending: `${tmdbApiEndpoint}/trending/all/day?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchPopularMovies: `${tmdbApiEndpoint}/movie/popular?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchTVList: (id: number) => `${tmdbApiEndpoint}/discover/tv?api_key=${apiKeys.tmdb}&with_genres=${id}`,
  fetchPopularTV: `${tmdbApiEndpoint}/tv/popular?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchMovieDetails: (movieId: string) => `${tmdbApiEndpoint}/movie/${movieId}?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchTVDetails: (tvId: string) => `${tmdbApiEndpoint}/tv/${tvId}?api_key=${apiKeys.tmdb}&language=en-US`,
  searchMulti: (query: string) => `${tmdbApiEndpoint}/search/multi?api_key=${apiKeys.tmdb}&language=en-US&query=${encodeURIComponent(query)}`,
  fetchMovieTrailer: (movieId: string) => `${tmdbApiEndpoint}/movie/${movieId}/videos?api_key=${apiKeys.tmdb}&language=en-US`,
  fetchTVTrailer: (tvId: string) => `${tmdbApiEndpoint}/tv/${tvId}/videos?api_key=${apiKeys.tmdb}&language=en-US`
};

// Fetch data from TMDB API
export const fetchFromTMDB = async (url: string) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching from TMDB:", error);
    throw error;
  }
};

// Search movies and TV shows
export const searchContent = async (query: string) => {
  if (!query || query.trim() === '') return { results: [] };
  try {
    const data = await fetchFromTMDB(apiPaths.searchMulti(query));
    return data;
  } catch (error) {
    console.error("Error searching content:", error);
    return { results: [] };
  }
};

// Fetch content by category and genre
export const fetchContentByCategory = async (category: string, genreId: number) => {
  try {
    let url;
    if (category === 'movie') {
      url = apiPaths.fetchMoviesList(genreId);
    } else if (category === 'tv') {
      url = apiPaths.fetchTVList(genreId);
    } else {
      url = apiPaths.fetchTrending;
    }
    
    const data = await fetchFromTMDB(url);
    return data.results || [];
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
