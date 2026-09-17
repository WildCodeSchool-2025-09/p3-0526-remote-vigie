export type IncidentType = {
	id: number;
	code: string;
	label: string;
	alert_radius_meters: number;
	lifespan_hours: number;
	safety_instructions: string | null;
	icon: string;
	color: string;
	danger_level_id: number;
	danger_level_weight: number;
	danger_level_label: string;
	danger_level_color: string;
};

export type Position = {
	lat: number;
	lng: number;
};

export type NearbyIncident = {
	id: number;
	latitude: string;
	longitude: string;
	baseAlertRadiusMeters: number;
	city: string;
	createdAt: string;
};
