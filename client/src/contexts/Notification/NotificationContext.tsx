import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import notificationService from "../../services/notificationService";
import type { NotificationContextValue } from "../../types/notification";
import { useAuth } from "../AuthContext";
import {
	getNotificationKey,
	getReadNotifications,
	resetNotificationCache,
} from "./readNotifications";

const NotificationContext = createContext<NotificationContextValue | null>(
	null,
);

export function NotificationProvider({
	children,
}: { children: React.ReactNode }) {
	const [unreadCount, setUnreadCount] = useState(0);
	const { user } = useAuth();

	const markNotificationAsRead = () => {
		setUnreadCount((current) => Math.max(0, current - 1));
	};

	const refreshUnreadCount = useCallback(async () => {
		try {
			const [serverCount, notifications] = await Promise.all([
				notificationService.getUnreadCount(),
				notificationService.getNotifications(),
			]);

			const readNotifications = getReadNotifications();

			const stillUnreadCount = notifications.filter((notification) => {
				const isRead =
					notification.is_read ??
					readNotifications.has(getNotificationKey(notification));
				return !isRead;
			}).length;

			setUnreadCount(Math.min(serverCount, stillUnreadCount));
		} catch {
			setUnreadCount(0);
		}
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: user?.id must stay a dependency to reset the cache on session change (login/logout)
	useEffect(() => {
		resetNotificationCache();
		void refreshUnreadCount();
	}, [user?.id, refreshUnreadCount]);

	return (
		<NotificationContext.Provider
			value={{ unreadCount, refreshUnreadCount, markNotificationAsRead }}
		>
			{children}
		</NotificationContext.Provider>
	);
}

export function useNotifications() {
	const context = useContext(NotificationContext);
	if (!context)
		throw new Error(
			"useNotifications doit être utilisé dans un NotificationProvider",
		);
	return context;
}
