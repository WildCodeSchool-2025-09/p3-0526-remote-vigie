export type IncidentStatus = "in_progress" | "resolved";

export type IncidentDangerLevel = {
	label: string;
	color: string;
	weight: number;
};

export type IncidentAuthor = {
	pseudo: string;
};

export type IncidentType = {
	code: string;
	label: string;
	icon: string;
	color: string;
	safetyInstructions: string | null;
};

export type IncidentCounts = {
	confirm: number;
	deny: number;
};

export type Incident = {
	id: number;
	title: string;
	description: string | null;
	photoUrl: string | null;
	latitude: string;
	longitude: string;
	city: string;
	inseeCode: string;
	status: IncidentStatus;
	createdAt: string;
	editedAt: string | null;
	dangerLevel: IncidentDangerLevel;
	author: IncidentAuthor;
	types: IncidentType[];
	counts: IncidentCounts;
};
