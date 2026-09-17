import { useCallback, useEffect, useState } from "react";
import notificationService from "../../services/notificationService";
import { useNotifications } from "./NotificationContext";
import type { Notification } from "../../types/notification";

const notificationCache = {
  hasValue: false,
  notifications: [] as Notification[],
  page: 1,
  hasMore: false,
  fetchedAt: 0,
};

const MIN_LOADING_DURATION_MS = 1200;

const STALE_TIME_MS = 60_000;
const readNotificationsKey = "vigie:read-notifications";

type PreviewState = Partial<{
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
}>;

// Dev only - "incident", "comment" et "incident_resolved" viennent déjà du
// seed (server/database/fixtures) pour le premier utilisateur : pas besoin de
// les mocker ici. "badge" et "mention" n'existent pas encore côté backend
// (hors périmètre, voir CLAUDE.md), donc on les garde en dur pour l'aperçu.
const previewNotifications: Notification[] = [
  {
    type: "badge",
    source_id: 4,
    created_at: new Date().toISOString(),
    incident_id: 0,
    city: "",
    status: "",
    is_read: false,
  },
  {
    type: "mention",
    source_id: 5,
    created_at: new Date().toISOString(),
    incident_id: 1,
    incident_title: "Départ de feu",
    city: "Vernon",
    status: "in_progress",
    is_read: true,
  },
];

void previewNotifications;

function isCacheStale() {
  return Date.now() - notificationCache.fetchedAt > STALE_TIME_MS;
}

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

  const loadNotifications = useCallback(
    async (nextPage = 1, options: { force?: boolean } = {}) => {
      const usingCache =
        notificationCache.hasValue && nextPage <= notificationCache.page;

      if (usingCache) {
        setNotifications(notificationCache.notifications);
        setPage(notificationCache.page);
        setHasMore(notificationCache.hasMore);
        setIsLoading(false);

        if (!options.force && !isCacheStale()) return; 
      } else {
        setIsLoading(true);
      }

      const startedAt = Date.now();
      setError(null);
      try {
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
        notificationCache.fetchedAt = Date.now();

        setNotifications(nextNotifications);
        setPage(nextPage);
        setHasMore(nextHasMore);
      } catch {

        if (!usingCache) setError("Impossible de charger les notifications.");
      } finally {
        if (!usingCache) {
          const elapsed = Date.now() - startedAt;
          if (elapsed < MIN_LOADING_DURATION_MS) {
            await new Promise((resolve) =>
              setTimeout(resolve, MIN_LOADING_DURATION_MS - elapsed),
            );
          }
        }
        setIsLoading(false);
      }
    },
    [],
  );

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

  useEffect(() => {
    const revalidateOnReconnect = () => {
      void loadNotifications(1, { force: true });
    };
    const revalidateOnVisible = () => {
      if (document.visibilityState === "visible") void loadNotifications(1);
    };

    window.addEventListener("online", revalidateOnReconnect);
    document.addEventListener("visibilitychange", revalidateOnVisible);
    return () => {
      window.removeEventListener("online", revalidateOnReconnect);
      document.removeEventListener("visibilitychange", revalidateOnVisible);
    };
  }, [loadNotifications]);

  // Dev only - ce sont des mokes - pour prévisualiser un état UI sans dépendre du réseau,
  // commente la ligne active ci-dessous et décommente celle de l'état voulu
  // (une seule ligne "const preview" doit rester active à la fois).
  const preview: PreviewState | undefined = undefined; // état normal
  // const preview: PreviewState | undefined = { isLoading: false, error: "Impossible de charger les notifications." }; // état erreur
  // const preview: PreviewState | undefined = { isLoading: false, error: null, notifications: [] }; // état "aucune notification"
  // const preview: PreviewState | undefined = { isLoading: true }; // état skeleton
  // const preview: PreviewState | undefined = { isLoading: false, error: null, notifications: [...notifications, ...previewNotifications] }; // + badge/mention (non seedables), en plus des vraies notifications

  return {
    notifications,
    page,
    hasMore,
    isLoading,
    error,
    loadNotifications,
    markAllAsRead,
    markOneAsRead,
    ...(preview ?? {}),
  };
}
