import { NavLink } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";
import Icon from "../../Icon/Icon";
import NotificationBadge from "../../Notification/NotificationBadge/NotificationBadge";

function NavBar() {
	const { user } = useAuth();

	return (
		<nav
			className="sticky bottom-0 z-10 grid h-20 grid-cols-5 bg-(--primary) pt-4"
			aria-label="Navigation principale"
		>
			<NavLink
				to="/"
				end
				className={({ isActive }) =>
					`relative flex flex-col items-center justify-center gap-0.5 text-xs font-bold no-underline ${isActive ? "text-(--accent)" : "text-(--bg-light)/75"}`
				}
			>
				<Icon name="map" className="size-7" />
				<span>Accueil</span>
			</NavLink>
			<NavLink
				to="/incident/1"
				className={({ isActive }) =>
					`relative flex flex-col items-center justify-center gap-0.5 text-xs font-bold no-underline ${isActive ? "text-(--accent)" : "text-(--bg-light)/75"}`
				}
			>
				<Icon name="alert" className="size-7" />
				<span>Signaler</span>
			</NavLink>
			<NavLink
				to="/incident"
				end
				className={({ isActive }) =>
					`relative -translate-y-2 flex flex-col items-center justify-center gap-0.5 text-xs font-bold no-underline ${isActive ? "text-(--accent)" : "text-(--bg-light)/75"}`
				}
			>
				<Icon name="danger" className="size-10" />
				<span>Danger</span>
			</NavLink>
			{user != null && (
				<NavLink
					to="/notifications"
					className={({ isActive }) =>
						`relative flex flex-col items-center justify-center gap-0.5 text-xs font-bold no-underline ${isActive ? "text-(--accent)" : "text-(--bg-light)/75"}`
					}
				>
					<span className="relative">
						<Icon name="notification" className="size-7" />
						<NotificationBadge />
					</span>
					<span>Notifs</span>
				</NavLink>
			)}
			<NavLink
				to="/profile"
				className={({ isActive }) =>
					`relative flex flex-col items-center justify-center gap-0.5 text-xs font-bold no-underline ${isActive ? "text-(--accent)" : "text-(--bg-light)/75"}`
				}
			>
				<Icon name="profile" className="size-7" />
				<span>Profil</span>
			</NavLink>
		</nav>
	);
}

export default NavBar;
