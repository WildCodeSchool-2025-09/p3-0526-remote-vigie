// Geographic bounding box of the map's current viewport, read from
// react-leaflet's `map.getBounds()`. Shared shape between incidentService
// and usefulPlaceService — both filter their GET by the same 4 params.

export type Bounds = {
	north: number;
	south: number;
	east: number;
	west: number;
};
