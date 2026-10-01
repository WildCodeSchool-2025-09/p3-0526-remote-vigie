import { NavLink, useLocation } from "react-router";
import type { NavItemConfig } from "../../../types/navItems";
import Icon from "../../Icon/Icon";
import NotificationBadge from "../../Notification/NotificationBadge/NotificationBadge";

const baseClassName =
	"relative flex flex-col items-center justify-center gap-0.5 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent) focus-visible:rounded-sm";

function NavItem({
	to,
	end,
	label,
	icon,
	emphasized = false,
	alwaysAccent = false,
	disabled = false,
	disabledTitle,
	showNotificationBadge = false,
}: NavItemConfig) {
	const location = useLocation();
	const iconClassName = emphasized ? "size-10" : "size-7";
	const emphasisClassName = emphasized
		? "-translate-y-2 lg:translate-y-0"
		: "";
	const targetSearch = to?.includes("?") ? to.split("?")[1] : "";
	const matchesSearch = location.search.replace(/^\?/, "") === targetSearch;

	const iconElement = showNotificationBadge ? (
		<span className="relative">
			<Icon name={icon} className={iconClassName} />
			<NotificationBadge />
		</span>
	) : (
		<Icon name={icon} className={iconClassName} />
	);

	if (disabled) {
		return (
			<button
				type="button"
				disabled
				aria-disabled="true"
				title={disabledTitle}
				className={`${baseClassName} ${emphasisClassName} text-(--bg-light)/40 cursor-not-allowed`}
			>
				{iconElement}
				<span>{label}</span>
			</button>
		);
	}

	if (to == null) return null;

	return (
		<NavLink
			to={to}
			end={end}
			className={({ isActive }) =>
				`${baseClassName} ${emphasisClassName} no-underline ${alwaysAccent || (isActive && matchesSearch) ? "text-(--accent)" : "text-(--bg-light)/75"}`
			}
		>
			{iconElement}
			<span>{label}</span>
		</NavLink>
	);
}

export default NavItem;
