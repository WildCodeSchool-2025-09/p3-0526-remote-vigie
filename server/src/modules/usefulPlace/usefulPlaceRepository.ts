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

export type UsefulPlaceSyncKey = {
	id: number;
	osmType: "node" | "way" | "relation";
	osmId: number;
};

const MAX_USEFUL_PLACES = 1000;
// Taille des lots d'écriture : une ligne fautive n'invalide qu'un lot.
const WRITE_CHUNK_SIZE = 1000;

function chunk<T>(items: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let start = 0; start < items.length; start += size) {
		chunks.push(items.slice(start, start + size));
	}
	return chunks;
}

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

	// Insère ou met à jour par lots (clé unique `osm_type` + `osm_id`) : relancer
	// la synchro ne crée pas de doublons.
	async upsertMany(rows: UsefulPlaceUpsertRow[]): Promise<void> {
		for (const rowsChunk of chunk(rows, WRITE_CHUNK_SIZE)) {
			const placeholders = rowsChunk
				.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)")
				.join(", ");
			const values = rowsChunk.flatMap((row) => [
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

	// Lieux importés d'OpenStreetMap pour une catégorie ; les lignes sans clé OSM
	// (saisies à la main) sont exclues pour ne jamais être retirées par la synchro.
	async readSyncKeys(
		category: UsefulPlaceCategory,
	): Promise<UsefulPlaceSyncKey[]> {
		const [rows] = await databaseClient.query<Rows>(
			`SELECT id, osm_type, osm_id
			FROM useful_place
			WHERE category = ? AND osm_type IS NOT NULL AND osm_id IS NOT NULL`,
			[category],
		);

		return rows.map((row) => ({
			id: row.id,
			osmType: row.osm_type,
			osmId: Number(row.osm_id),
		}));
	}

	async deleteByIds(ids: number[]): Promise<void> {
		for (const idsChunk of chunk(ids, WRITE_CHUNK_SIZE)) {
			await databaseClient.query(
				"DELETE FROM useful_place WHERE id IN (?)",
				[idsChunk],
			);
		}
	}
}

export default new UsefulPlaceRepository();
