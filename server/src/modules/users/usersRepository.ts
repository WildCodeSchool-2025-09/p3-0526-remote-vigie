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

	async findByEmailNormalized(emailNormalized: string) {
		const [rows] = await databaseClient.query<Rows>(
			"SELECT id FROM user WHERE email_normalized = ?",
			[emailNormalized],
		);
		return rows[0];
	}

	async findByPseudoNormalized(pseudoNormalized: string) {
		const [rows] = await databaseClient.query<Rows>(
			"SELECT id FROM user WHERE pseudo_normalized = ?",
			[pseudoNormalized],
		);
		return rows[0];
	}
}

export default new UsersRepository();
