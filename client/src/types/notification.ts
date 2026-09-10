export type NotificationType =
  | "comment"
  | "incident_resolved"
  | "incident"
  | "badge"
  | "mention";

export type Notification = {
  type: NotificationType;
  source_id: number;
  created_at: string;
  incident_id: number;
  city: string;
  status: string;
  incident_type?: string;
  danger_level?: number;
  is_read?: boolean;
};

export type UnreadCountResponse = {
  count: number;
};

export type NotificationContextValue = {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markNotificationAsRead: () => void;
};
