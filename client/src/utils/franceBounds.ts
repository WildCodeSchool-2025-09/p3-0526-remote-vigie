// Mêmes valeurs que FRANCE_BOUNDS dans server/src/services/usefulPlaceSyncService.ts
// (à garder synchronisées).
// [sud-ouest, nord-est]
export const FRANCE_BOUNDS: [[number, number], [number, number]] = [
	[41.0, -5.5],
	[51.5, 9.8],
];

export function isInsideFranceBounds(
	latitude: number,
	longitude: number,
): boolean {
	const [[south, west], [north, east]] = FRANCE_BOUNDS;

	return (
		latitude >= south &&
		latitude <= north &&
		longitude >= west &&
		longitude <= east
	);
}
