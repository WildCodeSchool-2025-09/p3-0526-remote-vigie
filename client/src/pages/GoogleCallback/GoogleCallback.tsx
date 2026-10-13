import { useAuth } from "@/contexts/auth/AuthContext";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

// Page d'arrivée après la connexion Google (US22) : le serveur y renvoie le
// navigateur avec le token Vigie après le # de l'adresse (#token=…).
export default function GoogleCallback() {
	const { loginWithToken } = useAuth();
	const navigate = useNavigate();
	const handled = useRef(false);

	useEffect(() => {
		// En développement, React lance les effets deux fois : on ne traite
		// le token qu'une seule fois.
		if (handled.current) return;
		handled.current = true;

		const token = new URLSearchParams(window.location.hash.slice(1)).get(
			"token",
		);
		// Efface le token de la barre d'adresse et de l'historique.
		window.history.replaceState(null, "", window.location.pathname);

		if (token == null) {
			navigate("/login?oauth=error", { replace: true });
			return;
		}

		loginWithToken(token)
			.then(() =>
				navigate("/", { replace: true, state: { welcome: true } }),
			)
			.catch(() => navigate("/login?oauth=error", { replace: true }));
	}, [loginWithToken, navigate]);

	return (
		<main className="flex min-h-full items-center justify-center bg-base-100 p-4">
			<output className="flex flex-col items-center gap-3 text-primary">
				<span
					className="loading loading-spinner loading-lg"
					aria-hidden="true"
				/>
				Connexion en cours…
			</output>
		</main>
	);
}
