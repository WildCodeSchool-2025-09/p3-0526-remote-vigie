export type Bounds = {
	north: number;
	south: number;
	east: number;
	west: number;
};

// Reads north/south/east/west from the query string. Returns null if any is
// missing or not a finite number, meaning "no zone filter".
export default function parseBounds(query: {
	north?: unknown;
	south?: unknown;
	east?: unknown;
	west?: unknown;
}): Bounds | null {
	const north = Number(query.north);
	const south = Number(query.south);
	const east = Number(query.east);
	const west = Number(query.west);

	if (
		!Number.isFinite(north) ||
		!Number.isFinite(south) ||
		!Number.isFinite(east) ||
		!Number.isFinite(west)
	) {
		return null;
	}

	return { north, south, east, west };
}
