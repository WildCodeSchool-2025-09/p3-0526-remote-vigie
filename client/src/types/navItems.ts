import type { IconName } from "@/assets/icons";

export type NavItemConfig = {
	key: string;
	label: string;
	icon: IconName;
	to?: string;
	end?: boolean;
	emphasized?: boolean;
	alwaysAccent?: boolean;
	requiresAuth?: boolean;
	disabledWhenLoggedOut?: boolean;
	disabled?: boolean;
	disabledTitle?: string;
	showNotificationBadge?: boolean;
	loggedOutTo?: string;
	loggedOutLabel?: string;
};
