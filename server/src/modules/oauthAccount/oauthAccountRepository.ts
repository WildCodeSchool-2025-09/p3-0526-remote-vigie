import databaseClient from "../../../database/client";
import type { Rows } from "../../../database/client";

class OauthAccountRepository {
	// Compte Vigie déjà lié à cet identifiant du fournisseur, ou null.
	async findUserByProvider(provider: string, providerUserId: string) {
		const [rows] = await databaseClient.query<Rows>(
			`SELECT user.id, user.pseudo, user.email, user.email_verified_at
			FROM oauth_account
			JOIN user ON user.id = oauth_account.user_id
			WHERE oauth_account.provider = ? AND oauth_account.provider_user_id = ?`,
			[provider, providerUserId],
		);
		return rows[0] ?? null;
	}

	// Relie un compte Vigie existant à un compte du fournisseur.
	async link(userId: number, provider: string, providerUserId: string) {
		await databaseClient.query(
			"INSERT INTO oauth_account (user_id, provider, provider_user_id) VALUES (?, ?, ?)",
			[userId, provider, providerUserId],
		);
	}
}

export default new OauthAccountRepository();
