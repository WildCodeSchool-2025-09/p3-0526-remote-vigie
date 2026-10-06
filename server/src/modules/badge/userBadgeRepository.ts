import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

// Only CRUD here (Create, Read, Update, Delete)

export type EarnedBadge = {
	badgeId: number;
	earnedAt: Date;
};

// Small-format badge under an author's pseudo
export type RecentBadge = {
	code: string;
	label: string;
	description: string;
	icon: string;
	earnedAt: Date;
};

const RECENT_BADGES_LIMIT = 5;

class UserBadgeRepository {
	async readByUser(userId: number): Promise<EarnedBadge[]> {
		const [rows] = await databaseClient.query<Rows>(
			"SELECT badge_id, earned_at FROM user_badge WHERE user_id = ?",
			[userId],
		);

		return rows.map((row) => ({
			badgeId: row.badge_id,
			earnedAt: row.earned_at,
		}));
	}

	// The badge id breaks ties between badges earned in the same second
	async readRecentByUser(userId: number): Promise<RecentBadge[]> {
		const [rows] = await databaseClient.query<Rows>(
			`SELECT b.code, b.label, b.description, b.icon, ub.earned_at
			FROM user_badge AS ub
			INNER JOIN badge AS b ON b.id = ub.badge_id
			WHERE ub.user_id = ?
			ORDER BY ub.earned_at DESC, b.id DESC
			LIMIT ?`,
			[userId, RECENT_BADGES_LIMIT],
		);

		return rows.map((row) => ({
			code: row.code,
			label: row.label,
			description: row.description,
			icon: row.icon,
			earnedAt: row.earned_at,
		}));
	}

	// INSERT IGNORE: an already earned badge is skipped, its date is unchanged
	async grantMany(userId: number, badgeIds: number[]): Promise<number> {
		if (badgeIds.length === 0) return 0;

		const [result] = await databaseClient.query<Result>(
			"INSERT IGNORE INTO user_badge (user_id, badge_id) VALUES ?",
			[badgeIds.map((badgeId) => [userId, badgeId])],
		);

		return result.affectedRows;
	}
}

export default new UserBadgeRepository();
