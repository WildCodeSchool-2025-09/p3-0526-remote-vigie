import databaseClient from "../../../database/client";
import contributionRepository from "../contribution/contributionRepository";

import type { Executor, Rows } from "../../../database/client";

// Only CRUD here (Create, Read, Update, Delete)

type IncidentListItem = {
	id: number;
	title: string;
	city: string;
	status: "in_progress" | "resolved";
	createdAt: Date;
	expiresAt: Date;
	dangerLevel: { label: string; color: string; weight: number };
	type: { code: string; label: string; icon: string; color: string } | null;
};

type IncidentDetails = {
	id: number;
	title: string;
	description: string | null;
	photoUrl: string | null;
	latitude: string;
	longitude: string;
	city: string;
	inseeCode: string;
	status: "in_progress" | "resolved";
	createdAt: Date;
	editedAt: Date | null;
	expiresAt: Date;
	dangerLevel: { label: string; color: string; weight: number };
	author: { id: number; pseudo: string };
	types: {
		code: string;
		label: string;
		icon: string;
		color: string;
		safetyInstructions: string | null;
	}[];
	counts: { confirm: number; deny: number };
	myContribution: "confirm" | "deny" | null;
};

class IncidentRepository {
	async readAllForList(limit: number): Promise<IncidentListItem[]> {
		const [incidentRows] = await databaseClient.query<Rows>(
			`SELECT
				i.id, i.title, i.city, i.status,
				i.created_at, i.expires_at,
				d.label  AS danger_level_label,
				d.color  AS danger_level_color,
				d.weight AS danger_level_weight
			FROM incident AS i
			INNER JOIN danger_level AS d ON d.id = i.danger_level_id
			ORDER BY i.created_at DESC, i.id DESC
			LIMIT ?`,
			[limit],
		);

		if (incidentRows.length === 0) {
			return [];
		}

		const ids = incidentRows.map((row) => row.id as number);

		const [typeRows] = await databaseClient.query<Rows>(
			`SELECT
				iit.incident_id,
				t.code, t.label, t.icon, t.color
			FROM incident_incident_type AS iit
			INNER JOIN incident_type AS t   ON t.id   = iit.incident_type_id
			INNER JOIN danger_level  AS tdl ON tdl.id = t.danger_level_id
			WHERE iit.incident_id IN (?)
			ORDER BY iit.incident_id, tdl.weight DESC, t.id ASC`,
			[ids],
		);

		const principalTypeByIncident = new Map<
			number,
			{ code: string; label: string; icon: string; color: string }
		>();
		for (const row of typeRows) {
			if (!principalTypeByIncident.has(row.incident_id)) {
				principalTypeByIncident.set(row.incident_id, {
					code: row.code,
					label: row.label,
					icon: row.icon,
					color: row.color,
				});
			}
		}

		return incidentRows.map((row) => ({
			id: row.id,
			title: row.title,
			city: row.city,
			status: row.status,
			createdAt: row.created_at,
			expiresAt: row.expires_at,
			dangerLevel: {
				label: row.danger_level_label,
				color: row.danger_level_color,
				weight: row.danger_level_weight,
			},
			type: principalTypeByIncident.get(row.id) ?? null,
		}));
	}

	async read(
		id: number,
		userId: number | null,
	): Promise<IncidentDetails | null> {
		const [rows] = await databaseClient.query<Rows>(
			`SELECT
				i.id, i.user_id, i.title, i.description, i.photo_url,
				i.latitude, i.longitude, i.city, i.insee_code,
				i.status, i.created_at, i.edited_at, i.expires_at,
				d.label AS danger_level_label,
				d.color AS danger_level_color,
				d.weight AS danger_level_weight,
				u.pseudo AS author_pseudo
			FROM incident AS i
			INNER JOIN danger_level AS d ON d.id = i.danger_level_id
			INNER JOIN user AS u ON u.id = i.user_id
			WHERE i.id = ?`,
			[id],
		);

		const row = rows[0];

		if (row == null) {
			return null;
		}

		const [typeRows] = await databaseClient.query<Rows>(
			`SELECT t.code, t.label, t.icon, t.color, t.safety_instructions
			FROM incident_incident_type AS iit
			INNER JOIN incident_type AS t ON t.id = iit.incident_type_id
			WHERE iit.incident_id = ?`,
			[id],
		);

		const counts = await contributionRepository.countByIncident(id);
		const myContribution =
			userId == null
				? null
				: await contributionRepository.findByUser(id, userId);

		return {
			id: row.id,
			title: row.title,
			description: row.description,
			photoUrl: row.photo_url,
			latitude: row.latitude,
			longitude: row.longitude,
			city: row.city,
			inseeCode: row.insee_code,
			status: row.status,
			createdAt: row.created_at,
			editedAt: row.edited_at,
			expiresAt: row.expires_at,
			dangerLevel: {
				label: row.danger_level_label,
				color: row.danger_level_color,
				weight: row.danger_level_weight,
			},
			author: { id: row.user_id, pseudo: row.author_pseudo },
			types: typeRows.map((t) => ({
				code: t.code,
				label: t.label,
				icon: t.icon,
				color: t.color,
				safetyInstructions: t.safety_instructions,
			})),
			counts,
			myContribution,
		};
	}

	async findOwnerAndStatus(
		id: number,
	): Promise<{ userId: number; status: "in_progress" | "resolved" } | null> {
		const [rows] = await databaseClient.query<Rows>(
			"SELECT user_id, status FROM incident WHERE id = ?",
			[id],
		);

		const row = rows[0];
		return row == null ? null : { userId: row.user_id, status: row.status };
	}

	async update(
		id: number,
		data: {
			title: string;
			description: string | null;
			photoUrl: string | null;
		},
	): Promise<void> {
		await databaseClient.query(
			`UPDATE incident
			SET title = ?, description = ?, photo_url = ?, edited_at = NOW()
			WHERE id = ?`,
			[data.title, data.description, data.photoUrl, id],
		);
	}

	async lockBaseLifespan(
		id: number,
		executor: Executor,
	): Promise<{ baseLifespanHours: number; createdAt: Date }> {
		const [rows] = await executor.query<Rows>(
			"SELECT base_lifespan_hours, created_at FROM incident WHERE id = ? FOR UPDATE",
			[id],
		);

		const row = rows[0];
		return {
			baseLifespanHours: row.base_lifespan_hours,
			createdAt: row.created_at,
		};
	}

	async updateExpiry(
		id: number,
		expiresAt: Date,
		executor: Executor = databaseClient,
	): Promise<void> {
		await executor.query(
			"UPDATE incident SET expires_at = ? WHERE id = ?",
			[expiresAt, id],
		);
	}
}

export default new IncidentRepository();
