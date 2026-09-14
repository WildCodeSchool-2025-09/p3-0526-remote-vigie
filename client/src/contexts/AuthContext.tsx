import { createContext, useContext } from "react";

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

type AuthContextValue = {
	user: AuthUser | null;
	loading: boolean;
};

// 🔧 Bouchon de dev — tient lieu de réponse de GET /api/auth/me en attendant l'US06.
// Modifier ces valeurs pour tester les cas d'US01 :
//   emailVerified: true  → le formulaire s'affiche
//   emailVerified: false → écran « vérifie ton e-mail »
//   STUB_USER = null      → redirection vers /login
const STUB_USER: AuthUser | null = {
	id: 1,
	pseudo: "test",
	email: "test@example.com",
	emailVerified: true,
	addresses: [
		{
			id: 1,
			latitude: 48.8566,
			longitude: 2.3522,
			is_primary: true,
			created_at: "2026-06-01T09:00:00.000Z",
			label: "Maison",
			street_line: "12 rue de Rivoli",
			postal_code: "75004",
			city: "Paris",
		},
		{
			id: 2,
			latitude: 45.764,
			longitude: 4.8357,
			is_primary: false,
			created_at: "2026-01-10T09:00:00.000Z",
			label: null,
			street_line: "5 place Bellecour",
			postal_code: "69002",
			city: "Lyon",
		},
	],
};

// TODO US06 : remplacer ce fichier par un vrai AuthProvider (appelle GET /api/auth/me
// au montage, expose login()/logout(), englobe <App/> dans main.tsx).
// useAuth / PrivateRoute / IncidentForm ne changeront pas.
const AuthContext = createContext<AuthContextValue>({
	user: STUB_USER,
	loading: false,
});

export function useAuth() {
	return useContext(AuthContext);
}
