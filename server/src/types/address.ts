// Adresse telle que saisie à l'inscription : coordonnées et code INSEE
// absents en cas de saisie manuelle (ville + code postal).
export type AddressInput = {
	city: string;
	postalCode: string;
	inseeCode?: string;
	latitude?: number;
	longitude?: number;
	streetLine?: string;
	isApproximate?: boolean;
};

// Adresse complète, prête à être enregistrée.
export type ResolvedAddress = {
	city: string;
	postalCode: string;
	inseeCode: string;
	streetLine: string | null;
	latitude: number;
	longitude: number;
	isApproximate: boolean;
};
