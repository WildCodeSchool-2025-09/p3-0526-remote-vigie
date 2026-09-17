import databaseClient from "../../../database/client";
import contributionRepository from "../contribution/contributionRepository";

import type { Rows } from "../../../database/client";

// Only CRUD here (Create, Read, Update, Delete)

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
};

class IncidentRepository {
	async read(id: number): Promise<IncidentDetails | null> {
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
}

export default new IncidentRepository();
