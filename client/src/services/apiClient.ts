// Point de passage unique pour tous les appels à l'API Vigie.
// Aujourd'hui : un simple fetch. Le jour où l'US06 livre un vrai JWT
// (Authorization: Bearer <token>, cf. workshop-js-auth), c'est ICI et
// seulement ici qu'on ira le chercher (AuthContext) pour l'attacher —
// aucun service consommateur n'aura à changer.
export function apiFetch(path: string, options: RequestInit = {}) {
	return fetch(`${import.meta.env.VITE_API_URL}${path}`, options);
}
