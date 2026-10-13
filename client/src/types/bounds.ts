// Map's visible zone (from `map.getBounds()`), sent as north/south/east/west.

export type Bounds = {
	north: number;
	south: number;
	east: number;
	west: number;
};
