import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import notificationService from "../../services/notificationService";
import type { NotificationContextValue } from "../../types/notification";

const dismissedNotificationsKey = "vigie:dismissed-notifications";

function getDismissedNotifications() {
  try {
    return new Set(
      JSON.parse(
        sessionStorage.getItem(dismissedNotificationsKey) ?? "[]",
      ) as string[],
    );
  } catch {
    return new Set<string>();
  }
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

export function NotificationProvider({
  children,
}: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const markNotificationAsRead = () => {
    setUnreadCount((current) => Math.max(0, current - 1));
  };

  const refreshUnreadCount = useCallback(async () => {
    try {
      const [serverCount, notifications] = await Promise.all([
        notificationService.getUnreadCount(),
        notificationService.getNotifications(),
      ]);

      const dismissedNotifications = getDismissedNotifications();

      const visibleUnreadCount = notifications.filter(
        (notification) =>
          !dismissedNotifications.has(
            `${notification.type}:${notification.source_id}`,
          ),
      ).length;

      setUnreadCount(Math.min(serverCount, visibleUnreadCount));
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, refreshUnreadCount, markNotificationAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error(
      "useNotifications doit être utilisé dans un NotificationProvider",
    );
  return context;
}
