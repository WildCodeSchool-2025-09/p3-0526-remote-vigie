import databaseClient from "../../../database/client";

import type { Result, Rows } from "../../../database/client";

// Only CRUD here (Create, Read, Update, Delete)

class ContributionRepository {
	async create(
		incidentId: number,
		userId: number,
		type: "confirm" | "deny",
	): Promise<void> {
		await databaseClient.query<Result>(
			`INSERT INTO contribution (incident_id, user_id, type)
			VALUES (?, ?, ?)
			ON DUPLICATE KEY UPDATE type = VALUES(type)`,
			[incidentId, userId, type],
		);
	}

	async countByIncident(
		incidentId: number,
	): Promise<{ confirm: number; deny: number }> {
		const [rows] = await databaseClient.query<Rows>(
			`SELECT type, COUNT(*) AS total
			FROM contribution
			WHERE incident_id = ?
			GROUP BY type`,
			[incidentId],
		);

		const rawCounts = rows as { type: "confirm" | "deny"; total: number }[];
		const counts = { confirm: 0, deny: 0 };
		for (const line of rawCounts) {
			counts[line.type] = Number(line.total);
		}

		return counts;
	}
}

export default new ContributionRepository();
