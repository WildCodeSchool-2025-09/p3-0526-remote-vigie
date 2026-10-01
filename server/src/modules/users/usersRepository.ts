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
	async findByIdentifier(identifier: string) {
		const normalized = identifier.toLowerCase();
		const [rows] = await databaseClient.query<Rows>(
			"SELECT id, pseudo, email, email_verified_at, password_hash FROM user WHERE email_normalized = ? OR pseudo_normalized = ?",
			[normalized, normalized],
		);
		return rows[0] ?? null;
	}
}

export default new UsersRepository();
