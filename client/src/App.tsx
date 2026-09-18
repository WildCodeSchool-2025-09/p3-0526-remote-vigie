import { NavLink, Outlet } from "react-router";
import "./index.css";
import Icon from "./components/Icon/Icon";
import NotificationBadge from "./components/Notification/NotificationBadge/NotificationBadge";
import { useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/Notification/NotificationContext";

function App() {
	const { user } = useAuth();

	return (
		<NotificationProvider>
			{/* Structure globale */}
			<div className="GLOBAL-LAYOUT flex h-dvh flex-col">
				<div className="grow">
					<Outlet />
				</div>
				{/* Placeholder de la navigation (US16) */}
				<nav className="flex items-center justify-between bg-primary px-4 text-white">
					<span>Navigation</span>
					{user != null && (
						<NavLink
							to="/notifications"
							className="relative flex items-center gap-2 text-white no-underline"
						>
							<span className="relative">
								<Icon name="notification" className="size-6" />
								<NotificationBadge />
							</span>
							Notifications
						</NavLink>
					)}
				</nav>
			</div>
		</NotificationProvider>
	);
}

export default App;
