import { useNotifications } from "../../../contexts/Notification/NotificationContext";

function NotificationBadge() {
	const { unreadCount } = useNotifications();
	if (unreadCount === 0) return null;

	return (
		<>
			<span
				className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-(--accent) border-2 border-primary"
				aria-hidden="true"
			/>
			<span className="sr-only">
				{unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue
				{unreadCount > 1 ? "s" : ""}
			</span>
		</>
	);
}

export default NotificationBadge;
