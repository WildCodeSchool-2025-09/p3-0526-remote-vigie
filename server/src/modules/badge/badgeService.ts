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
	earnedAt: Date | null;
	progress: { current: number; target: number } | null;
};

// Profile collection: progress capped at the threshold
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

// Recent badges of authors, one read per distinct author
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

// Badges whose counter reaches the threshold
function findReachedBadges(
	badges: Badge[],
	counts: Record<string, number>,
): Badge[] {
	return badges.filter(
		(badge) => (counts[badge.code] ?? 0) >= badge.threshold,
	);
}

// Grants the reached badges; an earned badge is never removed
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
