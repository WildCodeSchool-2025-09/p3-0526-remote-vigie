// Shape of one useful place as returned by GET /api/useful-places.

export type UsefulPlaceCategory =
	| "fire_station"
	| "veterinary"
	| "hospital"
	| "pharmacy"
	| "police";

export type UsefulPlace = {
	id: number;
	name: string;
	category: UsefulPlaceCategory;
	latitude: string;
	longitude: string;
	streetLine: string | null;
	city: string | null;
	phoneNumber: string | null;
};
