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

export type PushSubscriptionTarget = {
	endpoint: string;
	p256dh_key: string;
	auth_key: string;
};

class PushSubscriptionRepository {
	// Upsert on endpoint: the last account to activate a device takes it over
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

	async deleteByEndpoint(
		endpoint: string,
		executor: Executor = databaseClient,
	): Promise<void> {
		await executor.query<Result>(
			"DELETE FROM push_subscription WHERE endpoint = ?",
			[endpoint],
		);
	}

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
