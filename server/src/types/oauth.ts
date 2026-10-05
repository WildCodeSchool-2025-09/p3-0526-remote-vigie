export type GoogleProfile = {
	googleId: string;
	email: string;
	emailVerified: boolean;
	name: string | null;
};
// Contenu du jeton d'inscription Google : l'identité vérifiée par Google.
export type GoogleSignupData = Omit<GoogleProfile, "emailVerified">;
