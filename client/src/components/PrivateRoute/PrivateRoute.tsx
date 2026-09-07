import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router";

/**
 * Garde d'accès des routes réservées aux membres connectés.
 * S'utilise comme route de layout dans main.tsx : les routes protégées
 * sont ses `children`, et son <Outlet /> ne les rend que si `user` existe.
 *
 * Aujourd'hui `user` vient du bouchon de AuthContext ; US06 le remplacera
 * par le vrai contexte sans que ce composant change.
 */
export default function PrivateRoute() {
	const { user, loading } = useAuth();

	// On ne sait pas encore si une session existe (cas US06, appel à /api/auth/me).
	if (loading) {
		return null;
	}

	// Pas connecté : on redirige. `replace` évite d'empiler la page protégée
	// dans l'historique (sinon le bouton « Retour » y revient en boucle).
	if (user == null) {
		return <Navigate to="/login" replace />;
	}

	// Connecté : on rend la route enfant (IncidentForm, etc.).
	return <Outlet />;
}
