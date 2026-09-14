import { useCallback, useEffect, useState } from "react";
import notificationService from "../../services/notificationService";
import { useNotifications } from "./NotificationContext";
import type { Notification } from "../../types/notification";

const notificationCache = {
  hasValue: false,
  notifications: [] as Notification[],
  page: 1,
  hasMore: false,
};
const readNotificationsKey = "vigie:read-notifications";

function getReadNotifications() {
  try {
    return new Set(
      JSON.parse(sessionStorage.getItem(readNotificationsKey) ?? "[]") as string[],
    );
  } catch {
    return new Set<string>();
  }
}

function getNotificationKey(notification: Notification) {
  return `${notification.type}:${notification.source_id}`;
}

export function useNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshUnreadCount, markNotificationAsRead } = useNotifications();

  const loadNotifications = useCallback(async (nextPage = 1) => {
    if (notificationCache.hasValue && nextPage <= notificationCache.page) {
      setNotifications(notificationCache.notifications);
      setPage(notificationCache.page);
      setHasMore(notificationCache.hasMore);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const loaded = await notificationService.getNotifications(nextPage);
      const readNotifications = getReadNotifications();
      const withReadState = loaded.map((notification) => ({
        ...notification,
        is_read:
          notification.is_read ??
          readNotifications.has(getNotificationKey(notification)),
      }));
      const nextNotifications =
        nextPage === 1
          ? withReadState
          : [...notificationCache.notifications, ...withReadState];
      const nextHasMore = loaded.length === 20;

      notificationCache.hasValue = true;
      notificationCache.notifications = nextNotifications;
      notificationCache.page = nextPage;
      notificationCache.hasMore = nextHasMore;

      setNotifications(nextNotifications);
      setPage(nextPage);
      setHasMore(nextHasMore);
    } catch {
      setError("Impossible de charger les notifications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAllAsRead = async () => {
    await notificationService.markNotificationsSeen();
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, is_read: true })),
    );
    notificationCache.notifications = notificationCache.notifications.map(
      (notification) => ({ ...notification, is_read: true }),
    );
    await refreshUnreadCount();
  };

  const markOneAsRead = (notificationToRead: Notification) => {
    const notification = notificationCache.notifications.find(
      (item) =>
        getNotificationKey(item) === getNotificationKey(notificationToRead),
    );
    if (!notification) return;

    const readNotifications = getReadNotifications();
    readNotifications.add(getNotificationKey(notification));
    sessionStorage.setItem(
      readNotificationsKey,
      JSON.stringify([...readNotifications]),
    );

    const wasUnread = notification.is_read === false;
    notificationCache.notifications = notificationCache.notifications.map(
      (item) =>
        getNotificationKey(item) === getNotificationKey(notification)
          ? { ...item, is_read: true }
          : item,
    );
    setNotifications(notificationCache.notifications);
    if (wasUnread) markNotificationAsRead();
  };

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    page,
    hasMore,
    isLoading,
    error,
    loadNotifications,
    markAllAsRead,
    markOneAsRead,
  };
}
