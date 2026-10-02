// Point de passage unique pour tous les appels à l'API Vigie.
// Le token JWT (Authorization: Bearer <token>) est stocké ici, en dehors
// de React — c'est le seul endroit qui le connaît. AuthContext l'alimente
// via setAuthToken() ; aucun service consommateur (notificationService,
// incidentService...) n'a besoin de changer quoi que ce soit.

let authToken: string | null = null;

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(handler: (() => void) | null) {
	onUnauthorized = handler;
}

export function setAuthToken(token: string | null) {
	authToken = token;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
	const sentToken = authToken;
	const headers = new Headers(options.headers);
	if (sentToken != null) {
		headers.set("Authorization", `Bearer ${sentToken}`);
	}

	const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
		...options,
		headers,
	});

	if (response.status === 401 && sentToken != null) {
		onUnauthorized?.();
	}

	return response;
}
