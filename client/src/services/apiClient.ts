// Point de passage unique pour tous les appels à l'API Vigie.
// Le token JWT (Authorization: Bearer <token>) est stocké ici, en dehors
// de React — c'est le seul endroit qui le connaît. AuthContext l'alimente
// via setAuthToken() ; aucun service consommateur (notificationService,
// incidentService...) n'a besoin de changer quoi que ce soit.

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
	authToken = token;
}

export function apiFetch(path: string, options: RequestInit = {}) {
	const headers = new Headers(options.headers);
	if (authToken != null) {
		headers.set("Authorization", `Bearer ${authToken}`);
	}

	return fetch(`${import.meta.env.VITE_API_URL}${path}`, {
		...options,
		headers,
	});
}
