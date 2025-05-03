
import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Notification } from '@/types/movie';
import NotificationsList from './NotificationsList';
import { fetchFromTMDB, apiPaths } from '@/services/tmdbApi';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface NotificationsMenuProps {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: () => void;
}

const NotificationsMenu: React.FC<NotificationsMenuProps> = ({
  notifications: initialNotifications,
  unreadCount: initialUnreadCount,
  markAsRead
}) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const navigate = useNavigate();
  
  // Load notifications from local storage on startup
  useEffect(() => {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      try {
        const parsedNotifications = JSON.parse(storedNotifications);
        if (Array.isArray(parsedNotifications) && parsedNotifications.length > 0) {
          setNotifications(parsedNotifications);
          const unreadCount = parsedNotifications.filter((n: Notification) => !n.read).length;
          setUnreadCount(unreadCount);
        }
      } catch (error) {
        console.error('Error parsing stored notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);
  
  // Function to generate a random notification
  const generateMovieNotification = async () => {
    try {
      // Fetch latest movies
      const data = await fetchFromTMDB(apiPaths.fetchLatestMovies);
      
      if (data && data.results && data.results.length > 0) {
        // Pick a random movie from the results
        const randomIndex = Math.floor(Math.random() * data.results.length);
        const movie = data.results[randomIndex];
        
        // Check if we already have a notification for this movie
        const existingNotification = notifications.find(n => 
          n.movie?.id === movie.id && n.type === 'new'
        );
        
        if (!existingNotification) {
          // Create a notification for this movie
          const newNotification: Notification = {
            id: `movie-${Date.now()}`,
            title: 'New Release',
            message: `"${movie.title}" is now available to stream!`,
            poster_path: movie.poster_path,
            movie: {
              id: movie.id
            },
            read: false,
            createdAt: new Date().toISOString(),
            timestamp: Date.now(),
            isNew: true,
            type: 'new',
            isPersistent: true
          };
          
          // Add the new notification
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error generating movie notification:', error);
    }
  };
  
  // Function to generate movie suggestions based on watched movies
  const generateMovieSuggestions = async () => {
    try {
      // Get watched movie information from localStorage or database
      // For this example we'll use local storage
      const watchedMovies = JSON.parse(localStorage.getItem('watchedMovies') || '[]');
      
      if (watchedMovies.length === 0) return;
      
      // Extract genre IDs from watched movies
      const watchedGenres = new Set<number>();
      watchedMovies.forEach((movie: any) => {
        if (movie.genre_ids) {
          movie.genre_ids.forEach((genreId: number) => watchedGenres.add(genreId));
        }
      });
      
      // If we have watched genres, fetch recommendations based on them
      if (watchedGenres.size > 0) {
        const genreId = Array.from(watchedGenres)[Math.floor(Math.random() * watchedGenres.size)];
        const data = await fetchFromTMDB(apiPaths.fetchMoviesList(genreId));
        
        if (data && data.results && data.results.length > 0) {
          // Filter out movies we've already watched
          const unwatchedMovies = data.results.filter((movie: any) => 
            !watchedMovies.some((watched: any) => watched.id === movie.id)
          );
          
          if (unwatchedMovies.length > 0) {
            // Pick a random unwatched movie
            const movie = unwatchedMovies[Math.floor(Math.random() * unwatchedMovies.length)];
            
            // Check if we already have a suggestion notification for this movie
            const existingNotification = notifications.find(n => 
              n.movie?.id === movie.id && n.type === 'suggestion'
            );
            
            if (!existingNotification) {
              // Create a suggestion notification
              const newNotification: Notification = {
                id: `suggestion-${Date.now()}`,
                title: 'Recommended for You',
                message: `Based on your interests, you might enjoy "${movie.title || movie.name}"!`,
                poster_path: movie.poster_path,
                movie: {
                  id: movie.id
                },
                read: false,
                createdAt: new Date().toISOString(),
                timestamp: Date.now(),
                isNew: false,
                type: 'suggestion',
                isPersistent: true
              };
              
              // Add the new notification
              setNotifications(prev => [newNotification, ...prev]);
              setUnreadCount(prev => prev + 1);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating movie suggestions:', error);
    }
  };
  
  // Add a movie to the watched list
  const addToWatchedMovies = async (movieId: string) => {
    try {
      // Fetch movie details
      const movieDetails = await fetchFromTMDB(
        movieId.toString().startsWith('tv') 
          ? apiPaths.fetchTVDetails(movieId)
          : apiPaths.fetchMovieDetails(movieId)
      );
      
      if (movieDetails) {
        // Get current watched movies
        const watchedMovies = JSON.parse(localStorage.getItem('watchedMovies') || '[]');
        
        // Check if movie is already in watched list
        const existingIndex = watchedMovies.findIndex((m: any) => m.id === movieId);
        if (existingIndex === -1) {
          // Add to watched movies
          watchedMovies.push({
            id: movieId,
            title: movieDetails.title || movieDetails.name,
            genre_ids: movieDetails.genres?.map((g: any) => g.id) || [],
            timestamp: Date.now()
          });
          
          // Save back to localStorage
          localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
          
          // Generate a suggestion after a short delay
          setTimeout(() => {
            generateMovieSuggestions();
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error adding to watched movies:', error);
    }
  };
  
  // Simulate getting a new notification periodically
  useEffect(() => {
    // Don't run this in development to avoid spamming notifications
    if (process.env.NODE_ENV === 'production') {
      // Check for new movies every 5 minutes
      const interval = setInterval(() => {
        generateMovieNotification();
      }, 5 * 60 * 1000);
      
      // Check for suggested movies every 10 minutes
      const suggestionInterval = setInterval(() => {
        generateMovieSuggestions();
      }, 10 * 60 * 1000);
      
      return () => {
        clearInterval(interval);
        clearInterval(suggestionInterval);
      };
    }
  }, []);
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    markAsRead();
  };
  
  const handleNotificationClick = (notification: Notification) => {
    // Mark this notification as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    
    // Update unread count
    if (!notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    // If notification has a movie attached, navigate to the home page with that movie selected
    if (notification.movie && notification.movie.id) {
      // Add to watched movies when clicking on the notification
      addToWatchedMovies(notification.movie.id);
      
      navigate('/', { 
        state: { 
          selectedMovieId: notification.movie.id
        }
      });
    }
    
    // Close the notifications popover by calling markAsRead
    markAsRead();
  };

  return (
    <Popover onOpenChange={(open) => open && markAsRead()}>
      <PopoverTrigger asChild>
        <button className="p-2 text-muted-foreground hover:text-foreground relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2"></span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <NotificationsList 
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllAsRead}
          onNotificationClick={handleNotificationClick}
        />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsMenu;
