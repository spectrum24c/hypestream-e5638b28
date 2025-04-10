
import React from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Notification } from '@/types/notification';
import NotificationsList from './NotificationsList';

interface NotificationsMenuProps {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: () => void;
}

const NotificationsMenu: React.FC<NotificationsMenuProps> = ({
  notifications,
  unreadCount,
  markAsRead
}) => {
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
          onMarkAllAsRead={markAsRead}
          onNotificationClick={() => {}}
        />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsMenu;
