import Icon from "@/components/Icon/Icon";
import ContributionActions from "@/components/incident/ContributionActions/ContributionActions";
import ShareButton from "@/components/incident/ShareButton/ShareButton";
import { useAuth } from "@/contexts/auth/AuthContext";
import type {
	Incident,
	IncidentCounts,
	IncidentStatus,
} from "@/types/incidentDetails";
import { formatDateTime } from "@/utils/formatDate";
import { Link, useLocation, useNavigate } from "react-router";

type Props = Pick<Incident, "types" | "city" | "latitude" | "longitude"> & {
	incidentId: number;
	authorId: number;
	status: IncidentStatus;
	expiresAt: string;
	myContribution: "confirm" | "deny" | null;
	onContributed: (result: {
		counts: IncidentCounts;
		expiresAt: string;
		myContribution: "confirm" | "deny";
	}) => void;
};

// Emplacement des actions sur l'incident : Confirmer/Infirmer (US14), Partager (US15)
export default function IncidentActions({
	incidentId,
	authorId,
	types,
	city,
	latitude,
	longitude,
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

	const shareButton = (
		<ShareButton
			id={incidentId}
			types={types}
			city={city}
			latitude={latitude}
			longitude={longitude}
		/>
	);

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

				<div className="flex gap-3">
					<button
						type="button"
						onClick={() => navigate("/")}
						className="btn btn-accent btn-md grow rounded-full border-none px-5 font-bold"
					>
						Retour à l'accueil
					</button>
					{shareButton}
				</div>
			</div>
		);
	}

	if (user != null && user.id === authorId) {
		return (
			<div className="border-t border-primary/10 pt-4">{shareButton}</div>
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
					trailingAction={shareButton}
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

	return (
		<div className="border-t border-primary/10 pt-5">
			<ContributionActions
				incidentId={incidentId}
				myContribution={myContribution}
				onContributed={onContributed}
				trailingAction={shareButton}
			/>
		</div>
	);
}
