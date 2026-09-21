import type { Notification, UnreadCountResponse } from "../types/notification";
import { apiFetch } from "./apiClient";

async function getNotifications(page = 1, limit = 20): Promise<Notification[]> {
	const response = await apiFetch(
		`/api/notifications?page=${page}&limit=${limit}`,
	);
	if (!response.ok)
		throw new Error("Erreur lors de la récupération des notifications");
	return response.json() as Promise<Notification[]>;
}

async function getUnreadCount() {
	const response = await apiFetch("/api/notifications/unread-count");
	if (!response.ok)
		throw new Error("Erreur lors de la récupération du compteur");
	const data = (await response.json()) as UnreadCountResponse;
	return data.count as number;
}

async function markNotificationsSeen() {
	await apiFetch("/api/notifications/seen", { method: "PUT" });
}

export default {
	getNotifications,
	getUnreadCount,
	markNotificationsSeen,
};
