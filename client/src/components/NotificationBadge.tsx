import { useNotifications } from "../contexts/Notification/NotificationContext";

function NotificationBadge() {
  const { unreadCount } = useNotifications();
  if (unreadCount === 0) return null;

  return (
    <span className="badge badge-error badge-sm absolute -top-2 -right-2">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );
}

export default NotificationBadge;
