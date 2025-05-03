
export interface Movie {
  id: string;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: string;
  overview?: string;
  runtime?: number | null;
  number_of_seasons?: number | null;
  genre_ids?: number[];
  imdb_id?: string;
}

export interface Notification {
  id: string;
  title: string;
  message?: string;
  poster_path?: string | null;
  image?: string;
  timestamp?: number;
  createdAt?: string;
  read?: boolean;
  movie?: {
    id: string;
  };
  isNew?: boolean;
  type?: 'new' | 'suggestion';
  isPersistent?: boolean;
}

export interface DeviceInfo {
  name: string;
  type: string;
  lastActive: string;
}

export interface WatchHistory {
  id: string;
  movieId: string;
  title: string;
  poster_path: string | null;
  progress: number; // Percentage watched
  timestamp: number;
  media_type: string;
  last_watched: string;
}

export interface UserPreference {
  id: string;
  preferredGenres: number[];
  preferredLanguages: string[];
  enableNotifications: boolean;
}

export interface UserRating {
  id: string;
  movieId: string;
  rating: number; // 1-5 stars
  review?: string;
  timestamp: number;
}

export interface WatchlistItem {
  id: string;
  movieId: string;
  title: string;
  poster_path: string | null;
  added_date: string;
  media_type: string;
}

export interface SocialShare {
  platform: 'facebook' | 'twitter' | 'instagram' | 'email';
  url: string;
  title: string;
  message?: string;
}
