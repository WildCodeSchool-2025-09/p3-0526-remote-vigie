import { Link, useLocation, useNavigate } from "react-router";
import Icon from "@/components/Icon/Icon";
import { useAuth } from "@/contexts/AuthContext";
import type { IncidentStatus } from "@/types/incidentDetails";
import { formatDateTime } from "@/utils/formatDate";

type Props = {
	status: IncidentStatus;
	expiresAt: string;
};

// Emplacement des actions sur l'incident : Confirmer/Infirmer (US14), et à
// terme le partage (US15) — d'où un nom générique plutôt que centré sur les
// seules contributions. Le clic des boutons de vote est hors périmètre ici ;
// ce composant ne gère que : qui peut voir quoi (visiteur vs membre), le
// retour sur la fiche après connexion, et le remplacement des actions par un
// rappel de clôture une fois l'incident résolu.
export default function IncidentActions({ status, expiresAt }: Props) {
	const { user, loading } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	if (loading) {
		return null;
	}

	// Un incident résolu ne se confirme/infirme plus (US02 · AC "Statuts") :
	// on remplace les actions par la date de clôture + un retour à l'accueil.
	// `expires_at` est la seule source fiable ici : dans ce modèle, le seul
	// chemin vers "resolved" est la tâche planifiée d'US12 qui bascule le
	// statut quand `expires_at` est dépassé — la valeur porte donc déjà le
	// moment de résolution (à la fréquence du cron près).
	if (status === "resolved") {
		return (
			<div className="flex flex-col gap-3 border-t border-primary/10 pt-4">
				<div className="flex items-start gap-3 rounded-3xl bg-base-300 p-4">
					<Icon
						name="checkCircle"
						className="h-6 w-6 shrink-0 fill-success"
						aria-hidden="true"
					/>
					<p className="mt-1 text-sm text-primary/80">
						Incident résolu le {formatDateTime(expiresAt)} — fiche
						conservée en archive.
					</p>
				</div>

				<button
					type="button"
					onClick={() => navigate("/")}
					className="btn btn-lg w-full rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10"
				>
					Retour à l'accueil
				</button>
			</div>
		);
	}

	if (user == null) {
		return (
			<div className="flex flex-col gap-3 border-t border-primary/10 pt-4">
				<p className="text-sm text-primary/60">
					Connectez-vous pour confirmer ou infirmer ce signalement.
				</p>

				<div className="flex gap-3">
					<button
						type="button"
						disabled
						className="btn btn-lg grow gap-2 rounded-full border-2 border-primary bg-white/30 text-primary shadow-none disabled:opacity-40"
					>
						<Icon
							name="check"
							className="h-5 w-5 fill-primary"
							aria-hidden="true"
						/>
						Confirmer
					</button>
					<button
						type="button"
						disabled
						className="btn btn-lg grow gap-2 rounded-full border-2 border-primary bg-white/30 text-primary shadow-none disabled:opacity-40"
					>
						<Icon
							name="crossSmall"
							className="h-5 w-5 fill-primary"
							aria-hidden="true"
						/>
						Infirmer
					</button>
				</div>

				<Link
					to="/login"
					state={{ from: location.pathname }}
					className="btn btn-accent btn-lg rounded-full border-none px-5 font-bold"
				>
					Se connecter
				</Link>
			</div>
		);
	}

	// Membre connecté : emplacement réservé, comportement du clic = US14.
	return (
		<div className="flex gap-3 border-t border-primary/10 pt-4">
			<button
				type="button"
				className="btn btn-lg grow gap-2 rounded-full border-2 border-primary bg-white/30 text-primary shadow-none hover:bg-primary/10"
			>
				<Icon
					name="check"
					className="h-5 w-5 fill-primary"
					aria-hidden="true"
				/>
				Confirmer
			</button>
			<button
				type="button"
				className="btn btn-lg grow gap-2 rounded-full border-2 border-primary bg-white/30 text-primary shadow-none hover:bg-primary/10"
			>
				<Icon
					name="crossSmall"
					className="h-5 w-5 fill-primary"
					aria-hidden="true"
				/>
				Infirmer
			</button>
		</div>
	);
}
