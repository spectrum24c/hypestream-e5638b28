
import React from 'react';
import { Button } from '@/components/ui/button';
import { Notification } from '@/types/notification';
import { imgPath } from '@/services/tmdbApi';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  onMarkAllAsRead,
  onNotificationClick
}) => {
  return (
    <div className="space-y-4">
      <div className="font-medium flex justify-between items-center">
        <span>Notifications</span>
        {notifications.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={onMarkAllAsRead}
          >
            Mark all as read
          </Button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No notifications
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="divide-y divide-border">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`py-3 cursor-pointer hover:bg-muted/50 rounded-md px-2 ${!notification.read ? 'bg-muted/30' : ''}`}
                onClick={() => onNotificationClick(notification)}
              >
                <div className="flex items-center gap-3">
                  {notification.poster_path && (
                    <img 
                      src={`${imgPath}${notification.poster_path}`} 
                      alt="Movie poster" 
                      className="w-12 h-16 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-hype-purple rounded-full"></span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default NotificationsList;
