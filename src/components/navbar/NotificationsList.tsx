import React from 'react';
import { Button } from '@/components/ui/button';
import { Notification } from '@/types/movie';
import { imgPath } from '@/services/tmdbApi';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
  onClearAll?: () => void;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  onMarkAllAsRead,
  onNotificationClick,
  onClearAll
}) => {
  // Group notifications by type
  const newReleases = notifications.filter(n => n.type === 'new' || !n.type);
  const suggestions = notifications.filter(n => n.type === 'suggestion');
  
  return (
    <div className="space-y-4">
      <div className="font-medium flex justify-between items-center">
        <span>Notifications</span>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={onMarkAllAsRead}
              >
                Mark all as read
              </Button>
              {onClearAll && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-destructive hover:text-destructive"
                  onClick={onClearAll}
                >
                  Clear all
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      
      {notifications.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No notifications
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          {suggestions.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-hype-purple mb-2 px-2">Suggested For You</h4>
              <div className="divide-y divide-border">
                {suggestions.map(notification => (
                  <NotificationItem 
                    key={notification.id}
                    notification={notification}
                    onClick={() => onNotificationClick(notification)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {newReleases.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 px-2">New Releases</h4>
              <div className="divide-y divide-border">
                {newReleases.map(notification => (
                  <NotificationItem 
                    key={notification.id}
                    notification={notification}
                    onClick={() => onNotificationClick(notification)}
                  />
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};

const NotificationItem = ({ notification, onClick }: { 
  notification: Notification, 
  onClick: () => void 
}) => {
  const timeAgo = notification.createdAt 
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
    : '';
  
  return (
    <div 
      className={cn(
        "py-3 cursor-pointer hover:bg-muted/50 rounded-md px-2 transition-colors",
        !notification.read ? 'bg-muted/30' : '',
        notification.isNew ? 'relative' : ''
      )}
      onClick={onClick}
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
          {timeAgo && (
            <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
          )}
        </div>
      </div>
      {notification.isNew && (
        <span className="absolute top-2 right-2 bg-hype-orange text-white px-1.5 py-0.5 text-[10px] font-medium rounded-sm">
          NEW
        </span>
      )}
      {notification.type === 'suggestion' && (
        <span className="absolute top-2 right-2 bg-hype-purple text-white px-1.5 py-0.5 text-[10px] font-medium rounded-sm">
          SUGGESTED
        </span>
      )}
    </div>
  );
};

export default NotificationsList;
