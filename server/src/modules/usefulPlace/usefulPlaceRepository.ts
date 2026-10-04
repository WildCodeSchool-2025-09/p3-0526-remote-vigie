import databaseClient from "../../../database/client";
import type { Bounds } from "../../services/parseBounds";

import type { Rows } from "../../../database/client";

// Only CRUD here (Create, Read, Update, Delete)

export type UsefulPlaceCategory =
	| "fire_station"
	| "veterinary"
	| "hospital"
	| "pharmacy"
	| "police";

type UsefulPlaceListItem = {
	id: number;
	name: string;
	category: UsefulPlaceCategory;
	latitude: string;
	longitude: string;
	streetLine: string | null;
	city: string | null;
	phoneNumber: string | null;
};

export type UsefulPlaceUpsertRow = {
	name: string;
	category: UsefulPlaceCategory;
	latitude: number;
	longitude: number;
	streetLine: string | null;
	city: string | null;
	phoneNumber: string | null;
	osmType: "node" | "way" | "relation";
	osmId: number;
};

const MAX_USEFUL_PLACES = 1000;

class UsefulPlaceRepository {
	// La carte ne demande que la zone visible ; la limite protège la réponse.
	async readAll(bounds: Bounds): Promise<UsefulPlaceListItem[]> {
		const [rows] = await databaseClient.query<Rows>(
			`SELECT
				id, name, category, latitude, longitude,
				street_line, city, phone_number
			FROM useful_place
			WHERE latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?
			ORDER BY id ASC
			LIMIT ?`,
			[
				bounds.south,
				bounds.north,
				bounds.west,
				bounds.east,
				MAX_USEFUL_PLACES,
			],
		);

		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			category: row.category,
			latitude: row.latitude,
			longitude: row.longitude,
			streetLine: row.street_line,
			city: row.city,
			phoneNumber: row.phone_number,
		}));
	}

	// Insère ou met à jour (clé unique `osm_type` + `osm_id`) : relancer la
	// synchro ne crée pas de doublons.
	async upsertMany(rows: UsefulPlaceUpsertRow[]): Promise<void> {
		if (rows.length === 0) return;

		const placeholders = rows
			.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)")
			.join(", ");
		const values = rows.flatMap((row) => [
			row.name,
			row.category,
			row.latitude,
			row.longitude,
			row.streetLine,
			row.city,
			row.phoneNumber,
			row.osmType,
			row.osmId,
		]);

		await databaseClient.query(
			`INSERT INTO useful_place
				(name, category, latitude, longitude, street_line, city, phone_number, osm_type, osm_id)
			VALUES ${placeholders}
			ON DUPLICATE KEY UPDATE
				name = VALUES(name),
				category = VALUES(category),
				latitude = VALUES(latitude),
				longitude = VALUES(longitude),
				street_line = VALUES(street_line),
				city = VALUES(city),
				phone_number = VALUES(phone_number)`,
			values,
		);
	}
}

export default new UsefulPlaceRepository();
