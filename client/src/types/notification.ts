export type NotificationType =
	| "comment"
	| "incident_resolved"
	| "incident"
	| "badge"
	| "mention";

export type IncidentTypeCode =
	| "fire"
	| "insect"
	| "flood"
	| "hail"
	| "glaze"
	| "snow"
	| "storm"
	| "wild"
	| "tornado"
	| "rockfall"
	| "animal"
	| "tree";

export type Notification = {
	type: NotificationType;
	source_id: number;
	created_at: string;
	incident_id: number;
	incident_title?: string;
	city: string;
	status: string;
	incident_type?: IncidentTypeCode;
	danger_level?: number;
	is_read?: boolean;
	// Only set for the "badge" type (null for the others)
	badge_code?: string | null;
	badge_label?: string | null;
	badge_icon?: string | null;
};

export type UnreadCountResponse = {
	count: number;
};

export type NotificationContextValue = {
	unreadCount: number;
	refreshUnreadCount: () => Promise<void>;
	markNotificationAsRead: () => void;
};
