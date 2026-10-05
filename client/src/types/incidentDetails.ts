import type { AuthorBadge } from "@/types/badge";

export type IncidentStatus = "in_progress" | "resolved";

export type IncidentDangerLevel = {
	label: string;
	color: string;
	weight: number;
};

export type IncidentAuthor = {
	id: number;
	pseudo: string;
	// Liste vide pour un visiteur ou un auteur sans badge.
	badges: AuthorBadge[];
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
	city: string | null;
	postalCode: string | null;
	inseeCode: string | null;
	status: IncidentStatus;
	createdAt: string;
	editedAt: string | null;
	expiresAt: string;
	dangerLevel: IncidentDangerLevel;
	author: IncidentAuthor;
	types: IncidentType[];
	counts: IncidentCounts;
	myContribution: "confirm" | "deny" | null;
};
