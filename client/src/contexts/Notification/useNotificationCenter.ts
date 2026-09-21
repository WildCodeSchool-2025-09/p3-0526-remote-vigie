import { useCallback, useEffect, useState } from "react";
import notificationService from "../../services/notificationService";
import type { Notification } from "../../types/notification";
import { useNotifications } from "./NotificationContext";
import {
	getNotificationKey,
	getReadNotifications,
	notificationCache,
	readNotificationsKey,
} from "./readNotifications";

const MIN_LOADING_DURATION_MS = 1200;

const STALE_TIME_MS = 60_000;

function isCacheStale() {
	return Date.now() - notificationCache.fetchedAt > STALE_TIME_MS;
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
				notificationCache.hasValue &&
				nextPage <= notificationCache.page;

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
				const loaded =
					await notificationService.getNotifications(nextPage);
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
						: [
								...notificationCache.notifications,
								...withReadState,
							];
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
				if (!usingCache)
					setError("Impossible de charger les notifications.");
			} finally {
				if (!usingCache) {
					const elapsed = Date.now() - startedAt;
					if (elapsed < MIN_LOADING_DURATION_MS) {
						await new Promise((resolve) =>
							setTimeout(
								resolve,
								MIN_LOADING_DURATION_MS - elapsed,
							),
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
				getNotificationKey(item) ===
				getNotificationKey(notificationToRead),
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
			if (document.visibilityState === "visible")
				void loadNotifications(1);
		};

		window.addEventListener("online", revalidateOnReconnect);
		document.addEventListener("visibilitychange", revalidateOnVisible);
		return () => {
			window.removeEventListener("online", revalidateOnReconnect);
			document.removeEventListener(
				"visibilitychange",
				revalidateOnVisible,
			);
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
