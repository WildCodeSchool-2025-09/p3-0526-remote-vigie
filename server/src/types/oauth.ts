import type { ResolvedAddress } from "./address";

export type GoogleProfile = {
	googleId: string;
	email: string;
	emailVerified: boolean;
	name: string | null;
};
// Contenu du jeton d'inscription Google : l'identité vérifiée par Google.
export type GoogleSignupData = Omit<GoogleProfile, "emailVerified">;
// Données pour créer un compte Vigie à partir d'une inscription Google.
export type NewGoogleUser = {
	googleId: string;
	pseudo: string;
	email: string;
	pseudoNormalized: string;
	emailNormalized: string;
	cguVersion: string;
	cguAcceptedAt: Date;
	address: ResolvedAddress;
	reclaimUserIds: number[];
};
