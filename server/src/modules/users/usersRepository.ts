import databaseClient from "../../../database/client";
import type { Rows } from "../../../database/client";

class UsersRepository {
	async read(userId: number) {
		const [rows] = await databaseClient.query<Rows>(
			"SELECT * FROM user WHERE id = ?",
			[userId],
		);
		return rows[0];
	}

	async updateLastSeenAt(userId: number) {
		await databaseClient.query(
			"UPDATE user SET last_seen_at = NOW() WHERE id = ?",
			[userId],
		);
	}
}

export default new UsersRepository();
