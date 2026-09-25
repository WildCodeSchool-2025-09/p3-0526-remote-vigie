import Icon from "@/components/Icon/Icon";
import IncidentCard from "@/components/IncidentCard/IncidentCard";
import type { IncidentListItem } from "@/types/incidentList";

type IncidentListProps = {
	incidents: IncidentListItem[];
	isLoading: boolean;
	hasError: boolean;
	onRetry: () => void;
	limit: number;
};

function IncidentCardSkeleton() {
	return (
		<div
			aria-hidden="true"
			className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
		>
			<div className="skeleton h-14 w-14 shrink-0 rounded-xl" />
			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<div className="skeleton h-4 w-2/3 rounded-full" />
				<div className="skeleton h-3 w-1/3 rounded-full" />
			</div>
		</div>
	);
}

export default function IncidentList({
	incidents,
	isLoading,
	hasError,
	onRetry,
	limit,
}: IncidentListProps) {
	if (isLoading) {
		return (
			<output aria-live="polite" className="flex flex-col gap-3">
				<span className="sr-only">Chargement des incidents…</span>
				{Array.from({ length: 5 }, (_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey:"squelettes statiques, jamais réordonnés".
					<IncidentCardSkeleton key={index} />
				))}
			</output>
		);
	}

	if (hasError) {
		return (
			<div className="flex flex-1 flex-col items-center justify-start">
				<div
					role="alert"
					aria-live="assertive"
					className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-(--bg-error) p-4"
				>
					<div className="flex items-start gap-3">
						<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error">
							<Icon
								name="exclamation"
								className="h-3.5 w-3.5 fill-white"
								aria-hidden="true"
							/>
						</span>
						<div>
							<h2 className="font-title text-lg font-bold text-error">
								Impossible de charger les incidents
							</h2>
							<p className="mt-1 text-sm text-black">
								La connexion au serveur a échoué. Vos alertes ne
								sont pas affectées : elles arriveront
								normalement.
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onRetry}
						className="btn btn-md rounded-full border-none bg-error px-5 font-bold text-white"
					>
						Réessayer
					</button>
				</div>
			</div>
		);
	}

	if (incidents.length === 0) {
		return (
			<div className="flex flex-1 flex-col items-center justify-start">
				<output className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-base-300 p-4 text-center">
					<span className="flex h-16 w-16 items-center justify-center rounded-full bg-(--bg-success)">
						<Icon
							name="check"
							className="h-8 w-8 fill-success"
							aria-hidden="true"
						/>
					</span>
					<div>
						<h2 className="font-title text-lg font-bold text-primary">
							Rien à signaler autour de vous
						</h2>
						<p className="mt-2 text-sm text-black">
							Aucun incident dans votre zone. Vous serez alerté
							dès qu'un voisin signale quelque chose près d'une de
							vos adresses.
						</p>
					</div>
				</output>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<h2 className="font-title text-lg font-bold text-primary">
				Incidents · {incidents.length}
			</h2>

			<ul className="flex flex-col gap-3">
				{incidents.map((incident) => (
					<li key={incident.id}>
						<IncidentCard incident={incident} />
					</li>
				))}
			</ul>

			{incidents.length === limit && (
				<p className="text-xs text-primary/50">
					Seuls les {limit} incidents les plus récents sont affichés.
				</p>
			)}
		</div>
	);
}
