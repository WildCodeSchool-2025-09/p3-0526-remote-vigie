// Identité renvoyée par Google après connexion, réduite à ce que Vigie utilise.
export type GoogleProfile = {
	googleId: string;
	email: string;
	emailVerified: boolean;
	name: string | null;
};
