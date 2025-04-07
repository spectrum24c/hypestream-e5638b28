
import React from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import NotificationsList from './NotificationsList';
import { Notification } from '@/types/notification';

interface NotificationsMenuProps {
  notifications: Notification[];
  hasUnreadNotifications: boolean;
  showNotifications: boolean;
  onToggleNotifications: (show: boolean) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

const NotificationsMenu: React.FC<NotificationsMenuProps> = ({
  notifications,
  hasUnreadNotifications,
  showNotifications,
  onToggleNotifications,
  onMarkAllAsRead,
  onNotificationClick
}) => {
  return (
    <Popover open={showNotifications} onOpenChange={onToggleNotifications}>
      <PopoverTrigger asChild>
        <button className="p-2 text-muted-foreground hover:text-foreground relative">
          <Bell className="h-5 w-5" />
          {hasUnreadNotifications && notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2"></span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <NotificationsList 
          notifications={notifications}
          onMarkAllAsRead={onMarkAllAsRead}
          onNotificationClick={onNotificationClick}
        />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsMenu;
