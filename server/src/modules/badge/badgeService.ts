import badgeRepository from "./badgeRepository";
import type { Badge } from "./badgeRepository";
import userBadgeRepository from "./userBadgeRepository";

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

export default { evaluate, findReachedBadges };
