export type BadgeProgress = {
	current: number;
	target: number;
};

// Badge affiché en petit format sous le pseudo d'un auteur (cinq plus récents).
export type AuthorBadge = {
	code: string;
	label: string;
	// Contenu de l'infobulle, avec l'intitulé.
	description: string;
	icon: string;
	earnedAt: string;
};

// Badge de la collection du profil (GET /api/badges/me).
export type Badge = {
	code: string;
	label: string;
	description: string;
	// Nom du fichier PNG, servi depuis /badges-png/.
	icon: string;
	threshold: number;
	// Date ISO d'obtention : null tant que le badge n'est pas acquis.
	earnedAt: string | null;
	// Progression : null pour un badge acquis.
	progress: BadgeProgress | null;
};
