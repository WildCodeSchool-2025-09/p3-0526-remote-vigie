import { OAuth2Client } from "google-auth-library";
import type { GoogleProfile } from "../types/oauth";

// Client OAuth configuré avec les identifiants du projet Google Cloud (.env).
const client = new OAuth2Client(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URI,
);

// Adresse de la page de connexion Google vers laquelle on redirige l'utilisateur.
// `state` est un code aléatoire qu'on revérifiera au retour (anti-CSRF).
export function getGoogleAuthUrl(state: string): string {
	return client.generateAuthUrl({
		scope: ["openid", "email", "profile"],
		state,
		prompt: "select_account",
	});
}

// Au retour de Google : échange le `code` contre l'identité de l'utilisateur,
// après avoir vérifié la signature du jeton envoyé par Google.
export async function getGoogleProfile(
	code: string,
): Promise<GoogleProfile | null> {
	const { tokens } = await client.getToken(code);

	if (tokens.id_token == null) return null;

	const ticket = await client.verifyIdToken({
		idToken: tokens.id_token,
		audience: process.env.GOOGLE_CLIENT_ID,
	});

	const payload = ticket.getPayload();
	if (payload?.email == null) return null;

	return {
		googleId: payload.sub,
		email: payload.email,
		emailVerified: payload.email_verified === true,
		name: payload.name ?? null,
	};
}
