import Icon from "@/components/Icon/Icon";
import { createContribution } from "@/services/incidentService";
import type { IncidentCounts } from "@/types/incidentDetails";
import { useState } from "react";

type ContributionType = "confirm" | "deny";

type Props = {
	incidentId: number;
	myContribution: ContributionType | null;
	onContributed: (result: {
		counts: IncidentCounts;
		expiresAt: string;
		myContribution: ContributionType;
	}) => void;
	disabled?: boolean;
};

const ERROR_MESSAGES: Record<string, string> = {
	invalid: "Ce choix n'est pas valide.",
	forbidden: "Vous ne pouvez pas contribuer à votre propre signalement.",
	notFound: "Ce signalement n'existe plus.",
	resolved: "Cet incident est résolu, il n'accepte plus de contributions.",
	error: "La connexion au serveur a échoué. Réessayez dans un instant.",
};

const FILLED_CLASSES = "btn-accent border-none px-5 font-bold text-primary";
const OUTLINE_CLASSES =
	"border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 px-5";

export default function ContributionActions({
	incidentId,
	myContribution,
	onContributed,
	disabled = false,
}: Props) {
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [announcement, setAnnouncement] = useState("");
	const iconFillClass = disabled ? "fill-primary/20" : "fill-primary";
	const iconStrokeClass = disabled ? "stroke-primary/20" : "stroke-primary";

	async function handleVote(type: ContributionType) {
		setPending(true);
		setError(null);

		const result = await createContribution(String(incidentId), type);

		setPending(false);

		if (result.status === "ok") {
			onContributed({
				counts: result.counts,
				expiresAt: result.expiresAt,
				myContribution: type,
			});
			setAnnouncement(
				`${type === "confirm" ? "Confirmé" : "Infirmé"}. Décomptes mis à jour : ${result.counts.confirm} confirmations, ${result.counts.deny} infirmations.`,
			);
			return;
		}

		setError(ERROR_MESSAGES[result.status]);
	}

	return (
		<div className="flex flex-col gap-2">
			{error != null && (
				<div
					role="alert"
					className="flex w-full items-center gap-3 rounded-2xl bg-error/10 px-5 py-3 animate-pop"
				>
					<Icon
						name="exclamation"
						className="h-6 w-6 shrink-0 fill-error"
						aria-hidden="true"
					/>
					<p className="text-sm font-bold text-error">{error}</p>
				</div>
			)}

			<div className="flex gap-3">
				<button
					type="button"
					disabled={disabled || pending}
					aria-pressed={myContribution === "confirm"}
					onClick={() => handleVote("confirm")}
					className={`btn btn-md grow rounded-full ${
						myContribution === "confirm"
							? FILLED_CLASSES
							: OUTLINE_CLASSES
					}`}
				>
					<Icon
						name="check"
						className={`h-4 w-4 stroke-1 ${iconFillClass} ${iconStrokeClass}`}
						aria-hidden="true"
					/>
					{myContribution === "confirm" ? "Confirmé" : "Confirmer"}
				</button>
				<button
					type="button"
					disabled={disabled || pending}
					aria-pressed={myContribution === "deny"}
					onClick={() => handleVote("deny")}
					className={`btn btn-md grow rounded-full ${
						myContribution === "deny"
							? FILLED_CLASSES
							: OUTLINE_CLASSES
					}`}
				>
					<Icon
						name="crossSmall"
						className={`h-5 w-5 ${iconFillClass}`}
						aria-hidden="true"
					/>
					{myContribution === "deny" ? "Infirmé" : "Infirmer"}
				</button>
			</div>

			<p aria-live="polite" className="sr-only">
				{announcement}
			</p>
		</div>
	);
}
