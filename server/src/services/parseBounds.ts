export type Bounds = {
	north: number;
	south: number;
	east: number;
	west: number;
};

export type ParsedBounds =
	| { status: "absent" }
	| { status: "invalid" }
	| { status: "ok"; bounds: Bounds };

// Number("") vaut 0 : une chaîne vide ne doit pas devenir une coordonnée.
function toCoordinate(value: unknown): number | null {
	if (typeof value !== "string" || value.trim() === "") return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

// "absent" : aucune borne fournie. "invalid" : bornes incomplètes, illisibles,
// hors plage ou incohérentes. "ok" : les quatre bornes sont valides.
export default function parseBounds(query: {
	north?: unknown;
	south?: unknown;
	east?: unknown;
	west?: unknown;
}): ParsedBounds {
	const noneProvided = [
		query.north,
		query.south,
		query.east,
		query.west,
	].every((value) => value === undefined);
	if (noneProvided) return { status: "absent" };

	const north = toCoordinate(query.north);
	const south = toCoordinate(query.south);
	const east = toCoordinate(query.east);
	const west = toCoordinate(query.west);

	if (north === null || south === null || east === null || west === null) {
		return { status: "invalid" };
	}

	const isValid =
		south >= -90 &&
		north <= 90 &&
		west >= -180 &&
		east <= 180 &&
		south < north &&
		west < east;

	return isValid
		? { status: "ok", bounds: { north, south, east, west } }
		: { status: "invalid" };
}
