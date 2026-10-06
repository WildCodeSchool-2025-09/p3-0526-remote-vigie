import type { GoogleSignupParams } from "@/types/oauth";

// Lit les infos d'inscription Google placées après le # de l'adresse, ou null
// si on n'arrive pas de Google.
export function readGoogleSignupParams(): GoogleSignupParams | null {
	const params = new URLSearchParams(window.location.hash.slice(1));
	const pendingToken = params.get("pending");
	if (pendingToken == null) return null;

	return {
		pendingToken,
		email: params.get("email") ?? "",
		name: params.get("name") ?? "",
	};
}
