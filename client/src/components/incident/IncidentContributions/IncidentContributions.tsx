import type { IncidentCounts } from "@/types/incidentDetails";

type Props = {
	counts: IncidentCounts;
};

// TODO — US02 · tâche 2.5 : affichage des décomptes confirmations/infirmations.
// Les boutons Confirmer/Infirmer (leur logique) sont IncidentContributionActions, US14.
export default function IncidentContributions({ counts }: Props) {
	return (
		<div className="grid grid-cols-2 gap-3">
			<div className="rounded-xl bg-base-300 p-3">
				<p className="text-xs font-bold uppercase tracking-widest text-primary/50">
					Confirmé
				</p>
				<p className="mt-1 text-lg font-bold text-primary">
					{counts.confirm} fois
				</p>
			</div>

			<div className="rounded-xl bg-base-300 p-3">
				<p className="text-xs font-bold uppercase tracking-widest text-primary/50">
					Infirmé
				</p>
				<p className="mt-1 text-lg font-bold text-primary">
					{counts.deny} fois
				</p>
			</div>
		</div>
	);
}
