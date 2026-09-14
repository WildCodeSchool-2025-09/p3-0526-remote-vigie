import { useNotifications } from "../contexts/Notification/NotificationContext";

function NotificationBadge() {
  const { unreadCount } = useNotifications();
  if (unreadCount === 0) return null;

  return (
    <>
      <span
        className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-(--accent)"
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
