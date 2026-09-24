import type { NavItemConfig } from "@/types/navItems";

export const navItems: NavItemConfig[] = [
	{ key: "home", to: "/", end: true, label: "Accueil", icon: "map" },
	{
		key: "report",
		to: "/incident",
		end: true,
		label: "Signaler",
		icon: "alert",
		disabledWhenLoggedOut: true,
	},
	{
		key: "danger",
		to: "/incident?source=danger",
		end: true,
		label: "Danger",
		icon: "danger",
		emphasized: true,
		alwaysAccent: true,
		requiresAuth: true,
	},
	{
		key: "notifications",
		to: "/notifications",
		label: "Notifications",
		icon: "notification",
		requiresAuth: true,
		showNotificationBadge: true,
	},
	{
		key: "profile",
		to: "/profile",
		label: "Profil",
		icon: "profile",
		loggedOutTo: "/login",
		loggedOutLabel: "Connexion",
	},
];
