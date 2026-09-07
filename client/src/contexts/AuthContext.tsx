import { createContext, useContext } from "react";

export type AuthUser = {
	id: number;
	pseudo: string;
	email: string;
	emailVerified: boolean;
	//addresses (TO DO US05/US24)
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
	emailVerified: false,
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
