import type { PushPayload } from "./pushService";
import withPreposition from "./title";

// Push content per case: plain text (no HTML escaping), relative links and icons

const ICONS = {
	incident: "/push/incident.png",
	danger: "/push/danger.png",
	resolved: "/push/resolved.png",
	comment: "/push/comment.png",
	mention: "/push/mention.png",
} as const;

const MAX_TITLE_LENGTH = 80;
const MAX_BODY_LENGTH = 160;

const DANGER_REMINDER = "En cas de danger de mort : 112, 15 ou 18.";

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

function placeOf(city: string | null): string {
	return city ? withPreposition(city) : "en dehors de l'agglomération";
}

export function newIncidentPayload({
	incidentId,
	types,
	city,
	isDanger = false,
}: {
	incidentId: number;
	types: string[];
	city: string | null;
	isDanger?: boolean;
}): PushPayload {
	const place = placeOf(city);

	if (isDanger) {
		// Truncate only the head: the emergency numbers must stay
		const head = truncate(
			`Signalement ${place}.`,
			MAX_BODY_LENGTH - DANGER_REMINDER.length - 1,
		);
		return build(
			"Une personne est en danger près de chez vous",
			`${head} ${DANGER_REMINDER}`,
			ICONS.danger,
			incidentUrl(incidentId),
		);
	}

	return build(
		"Nouvel incident près de chez vous",
		`${types.join(", ")} ${place}`,
		ICONS.incident,
		incidentUrl(incidentId),
	);
}

export function incidentResolvedPayload({
	incidentId,
	incidentTitle,
}: {
	incidentId: number;
	incidentTitle: string;
}): PushPayload {
	return build(
		"Incident résolu",
		incidentTitle,
		ICONS.resolved,
		incidentUrl(incidentId),
	);
}

// The comment text is left out on purpose: it could be read on a locked screen
export function commentPayload({
	incidentId,
	incidentTitle,
	authorPseudo,
}: {
	incidentId: number;
	incidentTitle: string;
	authorPseudo: string;
}): PushPayload {
	return build(
		"Nouveau commentaire sur votre incident",
		`${authorPseudo} a commenté « ${incidentTitle} »`,
		ICONS.comment,
		incidentUrl(incidentId),
	);
}

export function mentionPayload({
	incidentId,
	incidentTitle,
	authorPseudo,
}: {
	incidentId: number;
	incidentTitle: string;
	authorPseudo: string;
}): PushPayload {
	return build(
		"Vous êtes cité dans un commentaire",
		`${authorPseudo} vous a cité sur « ${incidentTitle} »`,
		ICONS.mention,
		incidentUrl(incidentId),
	);
}

export function badgePayload({
	label,
	description,
	icon,
}: {
	label: string;
	description: string;
	icon: string;
}): PushPayload {
	return build(
		`Vous avez obtenu le badge ${label}`,
		description,
		`/badges-png/${icon}`,
		"/profile/badges",
	);
}
