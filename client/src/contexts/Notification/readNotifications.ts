import type { Notification } from "../../types/notification";

export const readNotificationsKey = "vigie:read-notifications";

export function getNotificationKey(notification: Notification) {
	return `${notification.type}:${notification.source_id}`;
}

export function getReadNotifications() {
	try {
		return new Set(
			JSON.parse(
				sessionStorage.getItem(readNotificationsKey) ?? "[]",
			) as string[],
		);
	} catch {
		return new Set<string>();
	}
}

export function clearReadNotifications() {
	sessionStorage.removeItem(readNotificationsKey);
}

export const notificationCache = {
	hasValue: false,
	notifications: [] as Notification[],
	page: 1,
	hasMore: false,
	fetchedAt: 0,
};

export function resetNotificationCache() {
	notificationCache.hasValue = false;
	notificationCache.notifications = [];
	notificationCache.page = 1;
	notificationCache.hasMore = false;
	notificationCache.fetchedAt = 0;
	clearReadNotifications();
}
