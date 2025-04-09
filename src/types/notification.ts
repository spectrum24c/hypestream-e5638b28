
export interface Notification {
  id: string; // Changed from number to string to match with movie.ts
  title: string;
  message: string;
  poster_path?: string | null;
  movie?: {
    id: string;
  };
  read?: boolean;
  createdAt?: string;
  timestamp?: number;
}
