
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
