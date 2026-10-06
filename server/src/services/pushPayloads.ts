import type { PushPayload } from "./pushService";

// Push content per case. It mirrors the notification center: same titles, same
// text (the city). Plain text (no HTML escaping), relative links and icons.

const ICONS = {
	incident: "/push/incident.png",
	danger: "/push/danger.png",
	resolved: "/push/resolved.png",
	comment: "/push/comment.png",
	mention: "/push/mention.png",
} as const;

const MAX_TITLE_LENGTH = 80;
const MAX_BODY_LENGTH = 160;

function truncate(text: string, max: number): string {
	const chars = Array.from(text);
	return chars.length <= max ? text : `${chars.slice(0, max - 1).join("")}…`;
}

function build(
	title: string,
	body: string,
	icon: string,
	url: string,
): PushPayload {
	return {
		title: truncate(title, MAX_TITLE_LENGTH),
		body: truncate(body, MAX_BODY_LENGTH),
		icon,
		url,
	};
}

function incidentUrl(incidentId: number) {
	return `/incident/${incidentId}`;
}

export function newIncidentPayload({
	incidentId,
	city,
	isDanger = false,
}: {
	incidentId: number;
	city: string | null;
	isDanger?: boolean;
}): PushPayload {
	return build(
		isDanger
			? "Une personne est en danger près de chez vous"
			: "Nouvel incident près de chez vous",
		city ?? "",
		isDanger ? ICONS.danger : ICONS.incident,
		incidentUrl(incidentId),
	);
}

export function incidentResolvedPayload({
	incidentId,
	city,
}: {
	incidentId: number;
	city: string | null;
}): PushPayload {
	return build(
		"Incident résolu",
		city ?? "",
		ICONS.resolved,
		incidentUrl(incidentId),
	);
}

export function commentPayload({
	incidentId,
	city,
}: {
	incidentId: number;
	city: string | null;
}): PushPayload {
	return build(
		"Nouveau commentaire sur votre incident",
		city ?? "",
		ICONS.comment,
		incidentUrl(incidentId),
	);
}

export function mentionPayload({
	incidentId,
	city,
}: {
	incidentId: number;
	city: string | null;
}): PushPayload {
	return build(
		"Vous êtes cité dans un commentaire",
		city ?? "",
		ICONS.mention,
		incidentUrl(incidentId),
	);
}

// The icon is the badge image itself (already in /badges-png)
export function badgePayload({
	label,
	icon,
}: {
	label: string;
	icon: string;
}): PushPayload {
	return build(
		`Vous avez obtenu le badge ${label}`,
		"",
		`/badges-png/${icon}`,
		"/profile/badges",
	);
}
