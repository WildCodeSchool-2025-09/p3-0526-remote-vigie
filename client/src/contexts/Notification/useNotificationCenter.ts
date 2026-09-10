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
      const dismissedNotifications = getDismissedNotifications();
      const visibleNotifications = loaded.filter(
        (notification) =>
          !dismissedNotifications.has(getNotificationKey(notification)),
      );
      const nextNotifications =
        nextPage === 1
          ? visibleNotifications.map((notification) => ({
              ...notification,
              is_read: notification.is_read ?? false,
            }))
          : [
              ...notificationCache.notifications,
              ...visibleNotifications.map((notification) => ({
                ...notification,
                is_read: notification.is_read ?? false,
              })),
            ];
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

  const markOneAsRead = (notificationToDismiss: Notification) => {
    const notification = notificationCache.notifications.find(
      (item) =>
        getNotificationKey(item) === getNotificationKey(notificationToDismiss),
    );
    if (!notification) return;

    const dismissedNotifications = getDismissedNotifications();
    dismissedNotifications.add(getNotificationKey(notification));
    sessionStorage.setItem(
      dismissedNotificationsKey,
      JSON.stringify([...dismissedNotifications]),
    );
    notificationCache.notifications = notificationCache.notifications.filter(
      (item) => getNotificationKey(item) !== getNotificationKey(notification),
    );
    setNotifications(notificationCache.notifications);
    if (notification.is_read === false) markNotificationAsRead();
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
