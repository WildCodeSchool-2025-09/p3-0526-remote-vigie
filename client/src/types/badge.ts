export type BadgeProgress = {
	current: number;
	target: number;
};

// Small-format badge under an author's pseudo
export type AuthorBadge = {
	code: string;
	label: string;
	description: string;
	icon: string;
	earnedAt: string;
};

// Badge of the profile collection
export type Badge = {
	code: string;
	label: string;
	description: string;
	icon: string;
	threshold: number;
	earnedAt: string | null;
	progress: BadgeProgress | null;
};
