import { useId, useState } from "react";
import Icon from "@/components/Icon/Icon";

// Contrat volontairement minimal : ce composant est partagé (US01 le formulaire
// de signalement, US02 la fiche détail). Il affiche les types qu'on lui donne —
// filtrer parmi "tous les types" (formulaire) ou "les types de cet incident"
// (fiche) est la responsabilité de l'appelant, pas la sienne.
export type SafetyInstructionsItem = {
	label: string;
	color: string;
	safetyInstructions: string | null;
};

type Props = {
	incidentTypes: SafetyInstructionsItem[];
};

export default function SafetyInstructions({ incidentTypes }: Props) {
	const [isOpen, setIsOpen] = useState(true);
	const panelId = useId();

	const instructions = incidentTypes.filter(
		(type) => type.safetyInstructions != null,
	);

	if (instructions.length === 0) {
		return null;
	}

	return (
		<div className="rounded-2xl bg-(--primary-light) mt-4 p-4">
			<button
				type="button"
				onClick={() => setIsOpen((open) => !open)}
				aria-expanded={isOpen}
				aria-controls={panelId}
				className="flex w-full items-center justify-between gap-2 text-left cursor-pointer"
			>
				<span className="flex items-center gap-2">
					<Icon
						name="shield"
						className="h-4 w-4 fill-success"
						aria-hidden="true"
					/>
					<h2 className="font-title text-lg font-bold text-primary">
						Consignes de sécurité ({instructions.length})
					</h2>
				</span>
				<Icon
					name={isOpen ? "angleSmallUp" : "angleSmallDown"}
					className="h-4 w-4 fill-primary/60"
					aria-hidden="true"
				/>
			</button>

			{isOpen && (
				<div
					id={panelId}
					className="mt-3 space-y-3 border-t border-primary/10 pt-3 text-sm leading-relaxed"
				>
					{instructions.map((type) => (
						<p key={type.label}>
							<span
								className="font-bold"
								style={{ color: type.color }}
							>
								{type.label}
							</span>
							<span className="text-black">
								{" "}
								— {type.safetyInstructions}
							</span>
						</p>
					))}
				</div>
			)}
		</div>
	);
}
