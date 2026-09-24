import databaseClient from "../../../database/client";

import type { Rows } from "../../../database/client";

// Only CRUD here (Create, Read, Update, Delete)

type UsefulPlaceCategory =
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

class UsefulPlaceRepository {
	// READ — all useful places. No pagination/zone filter yet: like
	// useful_number, this table is a small, national reference list fed by
	// a sync script (not by user actions), so a straight SELECT is enough.
	async readAll(): Promise<UsefulPlaceListItem[]> {
		const [rows] = await databaseClient.query<Rows>(
			`SELECT
				id, name, category, latitude, longitude,
				street_line, city, phone_number
			FROM useful_place
			ORDER BY id ASC`,
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
}

export default new UsefulPlaceRepository();
