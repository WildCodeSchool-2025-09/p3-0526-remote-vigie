import databaseClient from "../../../database/client";
import type { Rows } from "../../../database/client";

export type IncidentType = {
	id: number;
	code: string;
	label: string;
	alert_radius_meters: number;
	lifespan_hours: number;
	safety_instructions: string | null;
	icon: string;
	color: string;
	is_selectable: 0 | 1;
	danger_level_id: number;
	danger_level_weight: number;
	danger_level_label: string;
	danger_level_color: string;
};

const SELECT = `
	SELECT
		it.id,
		it.code,
		it.label,
		it.alert_radius_meters,
		it.lifespan_hours,
		it.safety_instructions,
		it.icon,
		it.color,
		it.is_selectable,
		it.danger_level_id,
		dl.weight AS danger_level_weight,
		dl.label AS danger_level_label,
		dl.color AS danger_level_color
	FROM incident_type AS it
	INNER JOIN danger_level AS dl ON dl.id = it.danger_level_id
	ORDER BY dl.weight DESC, it.label ASC
`;

class IncidentTypeRepository {
	async readAll() {
		const [rows] = await databaseClient.query<Rows>(SELECT);
		return rows as IncidentType[];
	}
}

export default new IncidentTypeRepository();
