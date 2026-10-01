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
};

export type UnreadCountResponse = {
	count: number;
};

export type NotificationContextValue = {
	unreadCount: number;
	refreshUnreadCount: () => Promise<void>;
	markNotificationAsRead: () => void;
};
