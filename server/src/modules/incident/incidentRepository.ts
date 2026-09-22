import databaseClient from "../../../database/client";

import type { Result, Rows } from "../../../database/client";

// Only CRUD here (Create, Read, Update, Delete)

// Shape returned by readAllForList(): one row per incident, with its danger
// level and its "principal" type — the one carrying the highest gravity.
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
	city: string | null;
	postalCode: string | null;
	inseeCode: string | null;
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

type NearbyIncident = {
	id: number;
	typeIds: number[];
	latitude: string;
	longitude: string;
	baseAlertRadiusMeters: number;
	city: string | null;
	createdAt: Date;
};

class IncidentRepository {
	// READ — all incidents, most recent first, capped at `limit`. No status/
	// expiry filtering here: that's US10's responsibility (it should default
	// to active/non-expired to keep today's UX). Two queries: the incidents,
	// then their types, reduced in JS to keep the highest-gravity type per
	// incident.
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

		// Types of these incidents, ordered so the highest-gravity type comes
		// first for each incident (tie-break on incident_type.id).
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

		// First type seen for an incident id is its principal (highest-gravity) type.
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

	async read(id: number): Promise<IncidentDetails | null> {
		const [rows] = await databaseClient.query<Rows>(
			`SELECT
				i.id, i.user_id, i.title, i.description, i.photo_url,
				i.latitude, i.longitude, i.city, i.postal_code, i.insee_code,
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

		const [countRows] = await databaseClient.query<Rows>(
			`SELECT type, COUNT(*) AS total
			FROM contribution
			WHERE incident_id = ?
			GROUP BY type`,
			[id],
		);

		const rawCounts = countRows as {
			type: "confirm" | "deny";
			total: number;
		}[];
		const counts = { confirm: 0, deny: 0 };
		for (const line of rawCounts) {
			counts[line.type] = Number(line.total);
		}

		return {
			id: row.id,
			title: row.title,
			description: row.description,
			photoUrl: row.photo_url,
			latitude: row.latitude,
			longitude: row.longitude,
			city: row.city,
			postalCode: row.postal_code,
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

	async readNearbyOngoingByTypes(
		typeIds: number[],
	): Promise<NearbyIncident[]> {
		const [rows] = await databaseClient.query<Rows>(
			`SELECT DISTINCT
			i.id, i.latitude, i.longitude, i.base_alert_radius_meters,
			i.city, i.created_at
			FROM incident AS i
			INNER JOIN incident_incident_type AS iit ON iit.incident_id = i.id
			WHERE i.status = 'in_progress'
			AND iit.incident_type_id IN (?)`,
			[typeIds],
		);

		if (rows.length === 0) return [];

		const [typeRows] = await databaseClient.query<Rows>(
			`SELECT incident_id, incident_type_id
			FROM incident_incident_type
			WHERE incident_id IN (?)`,
			[rows.map((row) => row.id)],
		);

		const typesByIncident = new Map<number, number[]>();
		for (const row of typeRows) {
			const ids = typesByIncident.get(row.incident_id) ?? [];
			ids.push(row.incident_type_id);
			typesByIncident.set(row.incident_id, ids);
		}

		return rows.map((r) => ({
			id: r.id,
			typeIds: typesByIncident.get(r.id) ?? [],
			latitude: r.latitude,
			longitude: r.longitude,
			baseAlertRadiusMeters: r.base_alert_radius_meters,
			city: r.city,
			createdAt: r.created_at,
		}));
	}

	async readRecentByUser(userId: number): Promise<NearbyIncident[]> {
		const [rows] = await databaseClient.query<Rows>(
			`SELECT DISTINCT
			i.id, i.latitude, i.longitude, i.base_alert_radius_meters,
			i.city, i.created_at
			FROM incident AS i
			WHERE i.user_id = ?
			AND i.created_at >= NOW() - INTERVAL 10 SECOND`,
			[userId],
		);

		if (rows.length === 0) return [];

		const [typeRows] = await databaseClient.query<Rows>(
			`SELECT incident_id, incident_type_id
			FROM incident_incident_type
			WHERE incident_id IN (?)`,
			[rows.map((row) => row.id)],
		);

		const typesByIncident = new Map<number, number[]>();
		for (const row of typeRows) {
			const ids = typesByIncident.get(row.incident_id) ?? [];
			ids.push(row.incident_type_id);
			typesByIncident.set(row.incident_id, ids);
		}

		return rows.map((r) => ({
			id: r.id,
			typeIds: typesByIncident.get(r.id) ?? [],
			latitude: r.latitude,
			longitude: r.longitude,
			baseAlertRadiusMeters: r.base_alert_radius_meters,
			city: r.city,
			createdAt: r.created_at,
		}));
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

	async countRecentByUser(userId: number): Promise<number> {
		const [rows] = await databaseClient.query<Rows>(
			`SELECT COUNT(*) AS total
		FROM incident
		WHERE user_id = ?
		AND created_at >= NOW() - INTERVAL 1 HOUR`,
			[userId],
		);

		return Number(rows[0].total);
	}

	async create(data: {
		userId: number;
		dangerLevelId: number;
		title: string;
		description: string | null;
		photoUrl: string | null;
		latitude: number;
		longitude: number;
		lifespanHours: number;
		alertRadiusMeters: number;
		city: string | null;
		postalCode: string | null;
		inseeCode: string | null;
		typeIds: number[];
	}): Promise<number> {
		const connection = await databaseClient.getConnection();
		try {
			await connection.beginTransaction();

			const [result] = await connection.query<Result>(
				`INSERT INTO incident
			(user_id, danger_level_id, title, description, photo_url,
			latitude, longitude, base_lifespan_hours, base_alert_radius_meters,
			city, postal_code, insee_code, expires_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW() + INTERVAL ? HOUR)`,
				[
					data.userId,
					data.dangerLevelId,
					data.title,
					data.description,
					data.photoUrl,
					data.latitude,
					data.longitude,
					data.lifespanHours,
					data.alertRadiusMeters,
					data.city,
					data.postalCode,
					data.inseeCode,
					data.lifespanHours,
				],
			);

			const incidentId = result.insertId;

			const values = data.typeIds.map((typeId) => [incidentId, typeId]);
			await connection.query(
				"INSERT INTO incident_incident_type (incident_id, incident_type_id) VALUES ?",
				[values],
			);

			await connection.commit();

			return incidentId;
		} catch (err) {
			await connection.rollback();
			throw err;
		} finally {
			connection.release();
		}
	}
}

export default new IncidentRepository();
