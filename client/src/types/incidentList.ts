// One incident as returned by GET /api/incidents. Dates are strings (JSON).

export type IncidentListDangerLevel = {
	label: string;
	color: string;
	weight: number;
};

export type IncidentListType = {
	code: string;
	label: string;
	icon: string;
	color: string;
};

export type IncidentListItem = {
	id: number;
	title: string;
	city: string | null;
	latitude: string;
	longitude: string;
	status: "in_progress" | "resolved";
	createdAt: string;
	expiresAt: string;
	dangerLevel: IncidentListDangerLevel;
	type: IncidentListType | null;
};
