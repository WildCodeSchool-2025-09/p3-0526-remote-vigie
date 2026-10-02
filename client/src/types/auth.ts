export type Address = {
	id: number;
	latitude: number;
	longitude: number;
	is_primary: boolean;
	created_at: string;
	label: string | null;
	street_line: string | null;
	postal_code: string;
	city: string;
};

export type AuthUser = {
	id: number;
	pseudo: string;
	email: string;
	emailVerified: boolean;
	addresses: Address[];
};
