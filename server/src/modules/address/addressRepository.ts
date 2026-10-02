import databaseClient from "../../../database/client";
import type { Rows } from "../../../database/client";

class AddressRepository {
	async findAddressesInRadius(
		longitude: number,
		latitude: number,
		radiusMeters: number,
		excludeUserId: number,
	) {
		const [rows] = await databaseClient.query<Rows>(
			`SELECT
	address.id AS address_id,
	address.label,
	address.street_line,
	address.city,
	user.id AS user_id,
	user.email,
	user.pseudo
FROM address
INNER JOIN user ON user.id = address.user_id
WHERE address.user_id != ?
AND ST_Distance_Sphere(
	POINT(address.longitude, address.latitude),
	POINT(?, ?)
) <= ?`,
			[excludeUserId, longitude, latitude, radiusMeters],
		);

		return rows;
	}

	async findOldestInseeCode(userId: number): Promise<string | null> {
		const [rows] = await databaseClient.query<Rows>(
			`SELECT insee_code
FROM address
WHERE user_id = ?
ORDER BY created_at ASC, id ASC
LIMIT 1`,
			[userId],
		);

		return rows[0]?.insee_code ?? null;
	}
}

export default new AddressRepository();
