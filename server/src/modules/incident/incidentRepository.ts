import database from "../../../database/client";
import type { Rows } from "../../../database/client";

type IncidentListItem = {
	id: number;
	title: string;
	city: string;
	status: "in_progress" | "resolved";
	created_at: Date;
	expires_at: Date;
	danger_level_label: string;
	danger_level_color: string;
};

class IncidentRepository {
	// READ — la liste des incidents en cours, du plus récent au plus ancien
	async readAll() {
		const [rows] = await database.query<Rows>(
			`SELECT
			   i.id,
			   i.title,
			   i.city,
			   i.status,
			   i.created_at,
			   i.expires_at,
			   dl.label AS danger_level_label,
			   dl.color AS danger_level_color
			 FROM incident AS i
			 INNER JOIN danger_level AS dl ON dl.id = i.danger_level_id
			 WHERE i.status = 'in_progress'
			 ORDER BY i.created_at DESC`,
		);

		return rows as IncidentListItem[];
	}
}

export default new IncidentRepository();
