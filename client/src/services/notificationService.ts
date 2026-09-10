import type { Notification, UnreadCountResponse } from "../types/notification";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3310";

async function getNotifications(page = 1, limit = 20): Promise<Notification[]> {
  const response = await fetch(
    `${API_URL}/api/notifications?page=${page}&limit=${limit}`,
    { credentials: "include" },
  );
  if (!response.ok)
    throw new Error("Erreur lors de la récupération des notifications");
  return response.json() as Promise<Notification[]>;
}

async function getUnreadCount() {
  const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
    credentials: "include",
  });
  if (!response.ok)
    throw new Error("Erreur lors de la récupération du compteur");
  const data = (await response.json()) as UnreadCountResponse;
  return data.count as number;
}

async function markNotificationsSeen() {
  await fetch(`${API_URL}/api/notifications/seen`, {
    method: "PUT",
    credentials: "include",
  });
}

export default {
  getNotifications,
  getUnreadCount,
  markNotificationsSeen,
};
