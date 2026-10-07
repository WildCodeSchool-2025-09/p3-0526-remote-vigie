import databaseClient from "../../../database/client";
import type { Executor, Result, Rows } from "../../../database/client";
import { DELETED_USER_PSEUDO } from "../../services/deletedUser";
import type { NewGoogleUser } from "../../types/oauth";

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
	// Inscription via Google (US22) : utilisateur sans mot de passe, e-mail déjà
	// vérifié par Google, adresse principale et lien Google créés ensemble.
	async createWithGoogle(data: NewGoogleUser): Promise<number> {
		const connection = await databaseClient.getConnection();
		try {
			await connection.beginTransaction();

			if (data.reclaimUserIds.length > 0) {
				await connection.query(
					// Un compte jamais vérifié avec cet e-mail : personne n'a prouvé
					// posséder l'adresse. Google vient de le prouver, on peut donc le
					// supprimer sans risque (même règle que l'inscription classique).
					"DELETE FROM user WHERE id IN (?) AND email_verified_at IS NULL",
					[data.reclaimUserIds],
				);
			}

			const [result] = await connection.query<Result>(
				`INSERT INTO user
					(pseudo, email, pseudo_normalized, email_normalized,
					email_verified_at, cgu_version, cgu_accepted_at)
				VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
				[
					data.pseudo,
					data.email,
					data.pseudoNormalized,
					data.emailNormalized,
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
					data.address.postalCode,
					data.address.city,
					data.address.inseeCode,
					data.address.streetLine,
					data.address.latitude,
					data.address.longitude,
					data.address.isApproximate,
				],
			);

			await connection.query(
				"INSERT INTO oauth_account (user_id, provider, provider_user_id) VALUES (?, 'google', ?)",
				[userId, data.googleId],
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

	async updatePseudo(
		userId: number,
		pseudo: string,
		pseudoNormalized: string,
	) {
		await databaseClient.query(
			"UPDATE user SET pseudo = ?, pseudo_normalized = ? WHERE id = ?",
			[pseudo, pseudoNormalized, userId],
		);
	}

	// Faux si le compte n'existe plus ou a été anonymisé (suppression, US18) :
	// un token encore valide ne doit plus ouvrir de session.
	async isActive(userId: number) {
		const [rows] = await databaseClient.query<Rows>(
			"SELECT 1 FROM user WHERE id = ? AND anonymized_at IS NULL",
			[userId],
		);
		return rows.length > 0;
	}

	// Suppression de compte (US18) : la ligne est conservée pour que les
	// signalements et commentaires restent, mais plus rien n'identifie la
	// personne. Le pseudo affiché devient « Anonyme » ; les
	// colonnes uniques reçoivent des valeurs dérivées de l'id, ce qui libère le
	// pseudo d'origine. Ces valeurs sont impossibles à saisir à l'inscription
	// (un pseudo ne peut pas contenir de @, un e-mail doit en contenir un),
	// donc personne ne peut les occuper à l'avance et bloquer la suppression.
	async anonymize(userId: number, executor: Executor = databaseClient) {
		await executor.query(
			`UPDATE user
			SET pseudo = ?,
				pseudo_normalized = CONCAT('@supprime-', id),
				email = CONCAT('supprime-', id),
				email_normalized = CONCAT('supprime-', id),
				password_hash = NULL,
				email_verification_token_hash = NULL,
				email_verification_expires_at = NULL,
				anonymized_at = NOW()
			WHERE id = ?`,
			[DELETED_USER_PSEUDO, userId],
		);
	}

	// Suppression de compte (US18) : ce qui appartient à la personne disparaît.
	// Les signalements, les commentaires et les votes (contribution) ne sont
	// volontairement pas touchés : ils restent rattachés au compte anonymisé,
	// ce qui garde les compteurs et les échéances des incidents cohérents.
	async deletePersonalData(
		userId: number,
		executor: Executor = databaseClient,
	) {
		for (const table of [
			"oauth_account",
			"address",
			"user_location",
			"user_badge",
		]) {
			await executor.query(`DELETE FROM ${table} WHERE user_id = ?`, [
				userId,
			]);
		}
	}

	// Suppression de compte (US18) : tout ou rien. Si l'une des deux écritures
	// échoue, rien n'est supprimé et le compte reste intact.
	async destroy(userId: number) {
		const connection = await databaseClient.getConnection();
		try {
			await connection.beginTransaction();

			await this.deletePersonalData(userId, connection);
			await this.anonymize(userId, connection);

			await connection.commit();
		} catch (err) {
			await connection.rollback();
			throw err;
		} finally {
			connection.release();
		}
	}
}

export default new UsersRepository();
