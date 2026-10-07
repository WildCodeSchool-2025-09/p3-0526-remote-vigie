import { useAuth } from "@/contexts/auth/AuthContext";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

// Bienvenue affichée quelques secondes après une connexion ou une inscription
// avec Google (US22), déclenchée par navigate("/", { state: { welcome: true } }).
export default function WelcomeToast() {
	const { user } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const [visible, setVisible] = useState(
		(location.state as { welcome?: boolean } | null)?.welcome === true,
	);

	useEffect(() => {
		if (!visible) return;
		// Efface l'info pour que le message ne revienne pas au rechargement.
		navigate(location.pathname, { replace: true, state: null });
		const timer = setTimeout(() => setVisible(false), 4000);
		return () => clearTimeout(timer);
	}, [visible, navigate, location.pathname]);

	if (!visible || user == null) return null;

	return (
		<div className="toast toast-top toast-center z-50">
			<output className="rounded-2xl bg-(--bg-success) px-4 py-3 text-sm font-semibold text-primary shadow-md">
				Bienvenue {user.pseudo} !
			</output>
		</div>
	);
}
