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
}

export default new AddressRepository();
