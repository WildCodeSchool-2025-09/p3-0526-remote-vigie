export type Bounds = {
	north: number;
	south: number;
	east: number;
	west: number;
};

// Reads north/south/east/west from a request's query string. Returns null
// when any of the four is missing or not a finite number — callers then
// treat the request as "no zone filter" rather than erroring out, since
// these four params are always optional (used by the map, never by the
// plain incident/useful-place lists).
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
