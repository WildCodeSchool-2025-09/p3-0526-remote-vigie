import Icon from "@/components/Icon/Icon";
import { useAuth } from "@/contexts/AuthContext";
import type { IncidentStatus } from "@/types/incidentDetails";
import { formatDateTime } from "@/utils/formatDate";
import { Link, useLocation, useNavigate } from "react-router";

type Props = {
	status: IncidentStatus;
	expiresAt: string;
};

// Emplacement des actions sur l'incident : Confirmer/Infirmer (US14), et à terme le partage (US15)
export default function IncidentActions({ status, expiresAt }: Props) {
	const { user, loading } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	if (loading) {
		return null;
	}

	// `expires_at` sert de date de résolution : c'est le seul chemin vers "resolved" (cron US12), donc la valeur la porte déjà.
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
					className="btn btn-accent btn-md grow rounded-full border-none px-5 font-bold"
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
						className="btn btn-accent btn-md grow rounded-full border-none px-5 font-bold"
					>
						<Icon
							name="check"
							className="h-4 w-4 fill-primary/20"
							aria-hidden="true"
						/>
						Confirmer
					</button>
					<button
						type="button"
						disabled
						className="btn btn-accent btn-md grow rounded-full border-none px-5 font-bold"
					>
						<Icon
							name="crossSmall"
							className="h-5 w-5 fill-primary/20"
							aria-hidden="true"
						/>
						Infirmer
					</button>
				</div>

				<Link
					to="/login"
					state={{ from: location.pathname }}
					className="btn btn-accent btn-md grow rounded-full border-none px-5 font-bold"
				>
					Se connecter
				</Link>
			</div>
		);
	}

	// Membre connecté : emplacement réservé, comportement du clic = US14.
	return (
		<div className="flex gap-3 border-t border-primary/10 pt-5">
			<button
				type="button"
				className="btn btn-accent btn-md grow rounded-full border-none px-5 font-bold"
			>
				<Icon
					name="check"
					className="h-4 w-4 fill-primary stroke-1 stroke-primary"
					aria-hidden="true"
				/>
				Confirmer
			</button>
			<button
				type="button"
				className="btn btn-accent btn-md grow rounded-full border-none px-5 font-bold"
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
