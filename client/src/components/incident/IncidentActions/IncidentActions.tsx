import Icon from "@/components/Icon/Icon";
import ContributionActions from "@/components/incident/ContributionActions/ContributionActions";
import { useAuth } from "@/contexts/AuthContext";
import type { IncidentCounts, IncidentStatus } from "@/types/incidentDetails";
import { formatDateTime } from "@/utils/formatDate";
import { Link, useLocation, useNavigate } from "react-router";

type Props = {
	incidentId: number;
	status: IncidentStatus;
	expiresAt: string;
	myContribution: "confirm" | "deny" | null;
	onContributed: (result: {
		counts: IncidentCounts;
		expiresAt: string;
		myContribution: "confirm" | "deny";
	}) => void;
};

// Emplacement des actions sur l'incident : Confirmer/Infirmer (US14), et à terme le partage (US15)
export default function IncidentActions({
	incidentId,
	status,
	expiresAt,
	myContribution,
	onContributed,
}: Props) {
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
						className="h-6 w-6 shrink-0 fill-success text-success"
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

				<ContributionActions
					incidentId={incidentId}
					myContribution={null}
					onContributed={onContributed}
					disabled
				/>

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

	// Membre connecté : vote. Le masquage pour l'auteur n'est pas encore fait
	// (prochain item de la checklist US14, « Actions sur la fiche »).
	return (
		<div className="border-t border-primary/10 pt-5">
			<ContributionActions
				incidentId={incidentId}
				myContribution={myContribution}
				onContributed={onContributed}
			/>
		</div>
	);
}
