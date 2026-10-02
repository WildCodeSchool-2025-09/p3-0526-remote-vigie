import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

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
			"SELECT id, pseudo, email, email_verified_at, password_hash FROM user WHERE email_normalized = ?",
			[emailNormalized],
		);
		return rows[0];
	}

	async findByPseudoNormalized(pseudoNormalized: string) {
		const [rows] = await databaseClient.query<Rows>(
			"SELECT id, pseudo, email_verified_at, password_hash FROM user WHERE pseudo_normalized = ?",
			[pseudoNormalized],
		);
		return rows[0];
	}

	async remove(userId: number) {
		await databaseClient.query("DELETE FROM user WHERE id = ?", [userId]);
	}

	async create(data: {
		pseudo: string;
		email: string;
		pseudoNormalized: string;
		emailNormalized: string;
		passwordHash: string;
		cguVersion: string;
		cguAcceptedAt: Date;
		postalCode: string;
		city: string;
		inseeCode: string;
		streetLine: string | null;
		latitude: number;
		longitude: number;
		isApproximate: boolean;
		reclaimUserIds: number[];
	}): Promise<number> {
		const connection = await databaseClient.getConnection();
		try {
			await connection.beginTransaction();

			if (data.reclaimUserIds.length > 0) {
				await connection.query(
					"DELETE FROM user WHERE id IN (?) AND email_verified_at IS NULL",
					[data.reclaimUserIds],
				);
			}

			const [result] = await connection.query<Result>(
				`INSERT INTO user
					(pseudo, email, pseudo_normalized, email_normalized,
					password_hash, cgu_version, cgu_accepted_at)
				VALUES (?, ?, ?, ?, ?, ?, ?)`,
				[
					data.pseudo,
					data.email,
					data.pseudoNormalized,
					data.emailNormalized,
					data.passwordHash,
					data.cguVersion,
					data.cguAcceptedAt,
				],
			);

			const userId = result.insertId;

			await connection.query(
				`INSERT INTO address
					(user_id, postal_code, city, insee_code, street_line,
					latitude, longitude, is_approximate, is_primary)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
				[
					userId,
					data.postalCode,
					data.city,
					data.inseeCode,
					data.streetLine,
					data.latitude,
					data.longitude,
					data.isApproximate,
				],
			);

			await connection.commit();

			return userId;
		} catch (err) {
			await connection.rollback();
			throw err;
		} finally {
			connection.release();
		}
	}

	async setVerificationToken(
		userId: number,
		tokenHash: string,
		expiresAt: Date,
	) {
		await databaseClient.query(
			"UPDATE user SET email_verification_token_hash = ?, email_verification_expires_at = ? WHERE id = ?",
			[tokenHash, expiresAt, userId],
		);
	}

	async findByVerificationTokenHash(tokenHash: string) {
		const [rows] = await databaseClient.query<Rows>(
			"SELECT id FROM user WHERE email_verification_token_hash = ?",
			[tokenHash],
		);
		return rows[0];
	}

	async verifyEmail(tokenHash: string): Promise<boolean> {
		const [result] = await databaseClient.query<Result>(
			`UPDATE user
			SET email_verified_at = NOW(), email_verification_token_hash = NULL, email_verification_expires_at = NULL
		WHERE email_verification_token_hash = ?
			AND email_verification_expires_at > NOW()
			AND email_verified_at IS NULL`,
			[tokenHash],
		);
		return result.affectedRows === 1;
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
