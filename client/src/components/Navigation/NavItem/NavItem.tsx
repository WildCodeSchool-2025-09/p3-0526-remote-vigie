import Icon from "@/components/Icon/Icon";
import NotificationBadge from "@/components/Notification/NotificationBadge/NotificationBadge";
import type { NavItemConfig } from "@/types/navItems";
import { NavLink, useLocation } from "react-router";

const baseClassName =
	"relative flex flex-col items-center justify-center gap-0.5 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent) focus-visible:rounded-sm";

type Props = NavItemConfig & {
	onClick?: () => void;
};

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
	onClick,
}: Props) {
	const location = useLocation();
	const iconClassName = emphasized ? "size-10" : "size-7";
	const emphasisClassName = emphasized
		? "-translate-y-2 lg:translate-y-0"
		: "";
	const targetSearch = to?.includes("?") ? to.split("?")[1] : "";
	const matchesSearch = location.search.replace(/^\?/, "") === targetSearch;

	const iconElement = showNotificationBadge ? (
		<span className="relative">
			<Icon name={icon} className={iconClassName} aria-hidden="true" />
			<NotificationBadge />
		</span>
	) : (
		<Icon name={icon} className={iconClassName} aria-hidden="true" />
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

	if (onClick != null) {
		return (
			<button
				type="button"
				onClick={onClick}
				className={`${baseClassName} ${emphasisClassName} ${alwaysAccent ? "text-(--accent)" : "text-(--bg-light)/75"}`}
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
