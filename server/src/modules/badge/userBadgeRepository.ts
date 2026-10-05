import databaseClient from "../../../database/client";
import type { Result } from "../../../database/client";

// Only CRUD here (Create, Read, Update, Delete)

class UserBadgeRepository {
	// Attribue les badges à l'utilisateur, en ignorant ceux déjà acquis : la clé
	// primaire (user_id, badge_id) élimine les doublons et laisse intacte la date
	// d'obtention d'origine (`earned_at`). Renvoie le nombre de badges réellement
	// nouveaux.
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
