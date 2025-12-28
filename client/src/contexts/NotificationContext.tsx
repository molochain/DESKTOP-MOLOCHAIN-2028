import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  metadata?: any;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ 
  children,
  userId 
}: { 
  children: React.ReactNode;
  userId?: number;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  // Initialize with sample notifications for demonstration
  useEffect(() => {
    if (!userId) return;
    
    // Set sample notifications
    setNotifications([
      {
        id: 1,
        type: 'info',
        title: 'Welcome to MoloChain',
        message: 'Your logistics platform is ready to use',
        read: false,
        createdAt: new Date().toISOString()
      }
    ]);
  }, [userId]);

  const markAsRead = async (notificationId: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true, readAt: new Date().toISOString() }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markAsRead(notification.id);
      }
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}