import databaseClient from "../../../database/client";

import type { Executor, Result, Rows } from "../../../database/client";

// Only CRUD here (Create, Read, Update, Delete)

export type PushSubscriptionInput = {
	userId: number;
	endpoint: string;
	p256dhKey: string;
	authKey: string;
	userAgent: string | null;
};

// Ce dont l'envoi d'un push a besoin pour joindre un appareil.
export type PushSubscriptionTarget = {
	endpoint: string;
	p256dh_key: string;
	auth_key: string;
};

class PushSubscriptionRepository {
	// Upsert sur l'adresse d'abonnement : un appareil n'est jamais dupliqué, et il
	// appartient à un seul compte. Si l'adresse existe déjà, le dernier compte qui
	// l'active la reprend. `created_at` garde la date de première inscription.
	async create(
		{
			userId,
			endpoint,
			p256dhKey,
			authKey,
			userAgent,
		}: PushSubscriptionInput,
		executor: Executor = databaseClient,
	): Promise<void> {
		await executor.query<Result>(
			`INSERT INTO push_subscription (user_id, endpoint, p256dh_key, auth_key, user_agent)
			VALUES (?, ?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE
				user_id = VALUES(user_id),
				p256dh_key = VALUES(p256dh_key),
				auth_key = VALUES(auth_key),
				user_agent = VALUES(user_agent)`,
			[userId, endpoint, p256dhKey, authKey, userAgent],
		);
	}

	async findByUser(
		userId: number,
		executor: Executor = databaseClient,
	): Promise<PushSubscriptionTarget[]> {
		const [rows] = await executor.query<Rows>(
			`SELECT endpoint, p256dh_key, auth_key
			FROM push_subscription
			WHERE user_id = ?`,
			[userId],
		);

		return rows as PushSubscriptionTarget[];
	}

	// Nettoyage automatique (relais qui répond 404 ou 410) : décidé par le
	// système, pas de compte à vérifier.
	async deleteByEndpoint(
		endpoint: string,
		executor: Executor = databaseClient,
	): Promise<void> {
		await executor.query<Result>(
			"DELETE FROM push_subscription WHERE endpoint = ?",
			[endpoint],
		);
	}

	// Désactivation depuis le profil : le user_id empêche de retirer l'appareil
	// d'un autre compte en connaissant son adresse. Renvoie false si rien n'a été
	// supprimé.
	async deleteByUserAndEndpoint(
		userId: number,
		endpoint: string,
		executor: Executor = databaseClient,
	): Promise<boolean> {
		const [result] = await executor.query<Result>(
			"DELETE FROM push_subscription WHERE user_id = ? AND endpoint = ?",
			[userId, endpoint],
		);

		return result.affectedRows > 0;
	}
}

export default new PushSubscriptionRepository();
