import type { IncidentCounts } from "@/types/incidentDetails";

type Props = {
	counts: IncidentCounts;
};

export default function IncidentContributions({ counts }: Props) {
	return (
		<div className="grid grid-cols-2 gap-3">
			<div className="rounded-xl bg-base-300 px-4 py-2">
				<p className="text-xs font-bold uppercase tracking-widest text-primary/50">
					Confirmé
				</p>
				<p className="mt-1 text-lg font-bold text-primary">
					{counts.confirm} fois
				</p>
			</div>

			<div className="rounded-xl bg-base-300 px-4 py-2">
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
