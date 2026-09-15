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
// Durée minimale d'affichage du skeleton, pour que l'effet reste perceptible
// même quand la requête (succès ou échec) répond quasi instantanément.
const MIN_LOADING_DURATION_MS = 1200;
// Au-delà de ce délai, les données en cache sont considérées périmées : on les
// affiche quand même immédiatement (pas de skeleton), mais on relance un
// rafraîchissement silencieux en tâche de fond (stale-while-revalidate).
const STALE_TIME_MS = 60_000;
const readNotificationsKey = "vigie:read-notifications";

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
        // Cache disponible : affichage immédiat, sans skeleton.
        setNotifications(notificationCache.notifications);
        setPage(notificationCache.page);
        setHasMore(notificationCache.hasMore);
        setIsLoading(false);

        if (!options.force && !isCacheStale()) return; // encore frais, rien à refaire
        // Périmé (ou revalidation forcée, ex. reconnexion réseau) : on
        // rafraîchit en tâche de fond sans perturber l'affichage existant.
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
        // Une revalidation silencieuse qui échoue ne doit pas remplacer des
        // données déjà affichées par un message d'erreur — seul un premier
        // chargement sans cache doit bloquer sur l'état d'erreur.
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

  // Revalidation façon "stale-while-revalidate", comme React Query/SWR par
  // défaut : on rafraîchit silencieusement quand la connexion revient (même
  // si le cache est encore "frais" — une coupure réseau est un signal fort),
  // et quand l'onglet redevient visible si le cache est périmé.
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
