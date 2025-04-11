
import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Notification } from '@/types/notification';
import NotificationsList from './NotificationsList';
import { fetchFromTMDB, apiPaths } from '@/services/tmdbApi';

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
  
  // Function to generate a random notification
  const generateMovieNotification = async () => {
    try {
      // Fetch latest movies
      const data = await fetchFromTMDB(apiPaths.fetchLatestMovies);
      
      if (data && data.results && data.results.length > 0) {
        // Pick a random movie from the results
        const randomIndex = Math.floor(Math.random() * data.results.length);
        const movie = data.results[randomIndex];
        
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
          timestamp: Date.now()
        };
        
        // Add the new notification
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error generating movie notification:', error);
    }
  };
  
  // Only generate new notifications when manually triggered (removed automatic generation)
  // This fixes the issue with notifications constantly being added
  
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
    
    // Additional logic for handling notification click (e.g., navigate to movie)
    console.log('Notification clicked:', notification);
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
