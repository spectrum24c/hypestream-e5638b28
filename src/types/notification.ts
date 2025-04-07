
export interface Notification {
  id: number;
  title: string;
  message: string;
  poster_path?: string;
  movie?: {
    id: string;
  };
  read?: boolean;
  createdAt?: string;
}
