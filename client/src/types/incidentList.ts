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

// Body of GET /api/incidents; `truncated` is true when more incidents exist than returned.
export type IncidentListResponse = {
	incidents: IncidentListItem[];
	truncated: boolean;
};

// Sort criteria accepted by GET /api/incidents (`sort`).
// `date` et `severity` : les plus récents / les plus graves d'abord.
export type IncidentSort = "date" | "date_asc" | "severity" | "severity_asc";
