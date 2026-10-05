import badgeRepository from "./badgeRepository";
import type { Badge } from "./badgeRepository";
import userBadgeRepository from "./userBadgeRepository";
import type { RecentBadge } from "./userBadgeRepository";

export type BadgeCollectionItem = {
	code: string;
	label: string;
	description: string;
	icon: string;
	threshold: number;
	// Date d'obtention : null tant que le badge n'est pas acquis.
	earnedAt: Date | null;
	// Progression : renseignée seulement pour un badge non acquis.
	progress: { current: number; target: number } | null;
};

// Assemble la collection d'un utilisateur : tout le référentiel, avec l'état
// acquis ou non. Pour un badge non acquis, `current` est plafonné au seuil
// (un compteur qui vient de l'atteindre sans que le badge soit encore attribué
// n'affiche pas « 7/5 »). Fonction pure.
function buildCollection(
	badges: Badge[],
	earnedAtByBadgeId: Map<number, Date>,
	counts: Record<string, number>,
): BadgeCollectionItem[] {
	return badges.map((badge) => {
		const earnedAt = earnedAtByBadgeId.get(badge.id) ?? null;

		return {
			code: badge.code,
			label: badge.label,
			description: badge.description,
			icon: badge.icon,
			threshold: badge.threshold,
			earnedAt,
			progress:
				earnedAt === null
					? {
							current: Math.min(
								counts[badge.code] ?? 0,
								badge.threshold,
							),
							target: badge.threshold,
						}
					: null,
		};
	});
}

// Collection de badges de l'utilisateur pour le profil. Les compteurs ne sont
// calculés que pour les badges non acquis : les autres n'affichent pas de progression.
async function readCollection(userId: number): Promise<BadgeCollectionItem[]> {
	const badges = await badgeRepository.readAll();
	const earned = await userBadgeRepository.readByUser(userId);
	const earnedAtByBadgeId = new Map(
		earned.map((item) => [item.badgeId, item.earnedAt]),
	);

	const notEarned = badges.filter(
		(badge) => !earnedAtByBadgeId.has(badge.id),
	);
	const counts = await badgeRepository.countActivityByUser(userId, notEarned);

	return buildCollection(badges, earnedAtByBadgeId, counts);
}

// Badges les plus récents de plusieurs utilisateurs (les auteurs d'une page) :
// une seule lecture par utilisateur distinct, jamais une par commentaire.
async function readRecentBadgesByUsers(
	userIds: number[],
): Promise<Map<number, RecentBadge[]>> {
	const uniqueIds = [...new Set(userIds)];
	const entries = await Promise.all(
		uniqueIds.map(
			async (id) =>
				[id, await userBadgeRepository.readRecentByUser(id)] as const,
		),
	);

	return new Map(entries);
}

// Badges dont le compteur atteint le seuil (fonction pure : testable sans base).
// Un compteur absent vaut 0.
function findReachedBadges(
	badges: Badge[],
	counts: Record<string, number>,
): Badge[] {
	return badges.filter(
		(badge) => (counts[badge.code] ?? 0) >= badge.threshold,
	);
}

// Recalcule l'activité de l'utilisateur, attribue les badges dont le seuil est
// atteint (ceux déjà acquis sont ignorés) et renvoie ces badges. Ne retire jamais
// un badge : « acquis » reste acquis.
async function evaluate(userId: number): Promise<Badge[]> {
	const badges = await badgeRepository.readAll();
	const counts = await badgeRepository.countActivityByUser(userId, badges);
	const reached = findReachedBadges(badges, counts);

	await userBadgeRepository.grantMany(
		userId,
		reached.map((badge) => badge.id),
	);

	return reached;
}

export default {
	evaluate,
	findReachedBadges,
	readCollection,
	buildCollection,
	readRecentBadgesByUsers,
};
