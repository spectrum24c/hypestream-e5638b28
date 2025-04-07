
import React from 'react';
import { Button } from '@/components/ui/button';
import { Notification } from '@/types/notification';
import { imgPath } from '@/services/tmdbApi';

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
        <div className="divide-y divide-border">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className="py-3 cursor-pointer hover:bg-muted/50 rounded-md px-2"
              onClick={() => onNotificationClick(notification)}
            >
              <div className="flex items-center gap-3">
                {notification.poster_path && (
                  <img 
                    src={`${imgPath}${notification.poster_path}`} 
                    alt="" 
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
                <div>
                  <h4 className="text-sm font-medium">{notification.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
