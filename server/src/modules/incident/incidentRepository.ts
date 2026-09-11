import databaseClient from "../../../database/client";

import type { Rows } from "../../../database/client";

// Only CRUD here (Create, Read, Update, Delete)

// Shape returned by readAllActive(): one row per active incident, with its
// danger level and its "principal" type — the one carrying the highest gravity.
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

class IncidentRepository {
	// READ — active incidents (in progress AND not expired), most recent first,
	// capped at `limit`. Two queries: the incidents, then their types, reduced
	// in JS to keep the highest-gravity type per incident.
	async readAllActive(limit: number): Promise<IncidentListItem[]> {
		const [incidentRows] = await databaseClient.query<Rows>(
			`SELECT
				i.id, i.title, i.city, i.status,
				i.created_at, i.expires_at,
				d.label  AS danger_level_label,
				d.color  AS danger_level_color,
				d.weight AS danger_level_weight
			FROM incident AS i
			INNER JOIN danger_level AS d ON d.id = i.danger_level_id
			WHERE i.status = 'in_progress' AND i.expires_at > NOW()
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
}

export default new IncidentRepository();
