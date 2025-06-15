import * as React from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Notification } from '@/types/movie';
import NotificationsList from './NotificationsList';
import { fetchFromTMDB, apiPaths } from '@/services/tmdbApi';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [notifications, setNotifications] = React.useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = React.useState(initialUnreadCount);
  const [userPreferences, setUserPreferences] = React.useState<any>(null);
  const navigate = useNavigate();
  
  // Load user preferences and notifications from local storage on startup
  React.useEffect(() => {
    const storedPreferences = localStorage.getItem('userPreferences');
    if (storedPreferences) {
      try {
        const parsedPreferences = JSON.parse(storedPreferences);
        setUserPreferences(parsedPreferences);
      } catch (error) {
        console.error('Error parsing stored preferences:', error);
      }
    }

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
  React.useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);
  
  // Function to generate a movie notification based on user preferences
  const generateMovieNotification = async () => {
    try {
      if (!userPreferences || !userPreferences.enableNotifications) {
        return;
      }

      // Get preferred genres
      const preferredGenres = userPreferences.preferredGenres || [];
      
      // If user has preferred genres, use one of them to fetch movies
      let data;
      if (preferredGenres.length > 0) {
        // Pick a random genre from user's preferred genres
        const randomGenreIndex = Math.floor(Math.random() * preferredGenres.length);
        const genreId = preferredGenres[randomGenreIndex];
        data = await fetchFromTMDB(apiPaths.fetchMoviesList(genreId));
      } else {
        // Default to latest movies if no genre preferences
        data = await fetchFromTMDB(apiPaths.fetchLatestMovies);
      }
      
      if (data && data.results && data.results.length > 0) {
        // Filter movies by preferred language if set
        let filteredMovies = data.results;
        const preferredLanguages = userPreferences.preferredLanguages || [];
        
        if (preferredLanguages.length > 0) {
          filteredMovies = data.results.filter((movie: any) => 
            preferredLanguages.includes(movie.original_language)
          );
          
          // Fall back to all results if no movies match language preference
          if (filteredMovies.length === 0) {
            filteredMovies = data.results;
          }
        }
        
        // Pick a random movie from the results
        const randomIndex = Math.floor(Math.random() * filteredMovies.length);
        const movie = filteredMovies[randomIndex];
        
        // Save movie details in localStorage for future reference
        localStorage.setItem(`movie_${movie.id}`, JSON.stringify(movie));
        
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
  
  // Function to generate movie suggestions based on watched movies and preferences
  const generateMovieSuggestions = async () => {
    try {
      if (!userPreferences || !userPreferences.enableNotifications) {
        return;
      }
      
      // Get preferred genres from user preferences
      const preferredGenres = userPreferences.preferredGenres || [];
      
      // If we have preferred genres, fetch recommendations based on them
      if (preferredGenres.length > 0) {
        // Pick a random genre from user's preferred genres
        const randomGenreIndex = Math.floor(Math.random() * preferredGenres.length);
        const genreId = preferredGenres[randomGenreIndex];
        
        const data = await fetchFromTMDB(apiPaths.fetchMoviesList(genreId));
        
        if (data && data.results && data.results.length > 0) {
          // Filter movies by preferred language if set
          let filteredMovies = data.results;
          const preferredLanguages = userPreferences.preferredLanguages || [];
          
          if (preferredLanguages.length > 0) {
            filteredMovies = data.results.filter((movie: any) => 
              preferredLanguages.includes(movie.original_language)
            );
            
            // Fall back to all results if no movies match language preference
            if (filteredMovies.length === 0) {
              filteredMovies = data.results;
            }
          }
          
          // Pick a random movie from filtered list
          const movie = filteredMovies[Math.floor(Math.random() * filteredMovies.length)];
          
          // Save movie details in localStorage for future reference
          localStorage.setItem(`movie_${movie.id}`, JSON.stringify(movie));
          
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
  
  // Simulate getting a new notification periodically based on user preferences
  React.useEffect(() => {
    if (!userPreferences || !userPreferences.enableNotifications) {
      return;
    }
    
    // Check for new movies every 5 minutes
    const interval = setInterval(() => {
      generateMovieNotification();
    }, 5 * 60 * 1000);
    
    // Check for suggested movies every 10 minutes
    const suggestionInterval = setInterval(() => {
      generateMovieSuggestions();
    }, 10 * 60 * 1000);
    
    // Generate initial notifications if none exist
    if (notifications.length === 0) {
      generateMovieNotification();
      setTimeout(() => generateMovieSuggestions(), 2000);
    }
    
    return () => {
      clearInterval(interval);
      clearInterval(suggestionInterval);
    };
  }, [userPreferences]);
  
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

  // Check if notifications are enabled
  const notificationsEnabled = userPreferences?.enableNotifications;

  return (
    <Popover onOpenChange={(open) => open && markAsRead()}>
      <PopoverTrigger asChild>
        <button className="p-2 text-muted-foreground hover:text-foreground relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && notificationsEnabled && (
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2"></span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        {notificationsEnabled ? (
          <NotificationsList 
            notifications={notifications}
            onMarkAllAsRead={handleMarkAllAsRead}
            onNotificationClick={handleNotificationClick}
          />
        ) : (
          <Alert className="bg-muted/30">
            <AlertDescription>
              You have turned off notifications, so you won't be able to receive new alerts.
              Visit your settings to enable notifications.
            </AlertDescription>
          </Alert>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsMenu;
