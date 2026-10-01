import NumberRow from "@/components/numbers/NumberRow/NumberRow";
import type { EmergencyNumber } from "@/types/numbers";
import type { RefObject } from "react";

type Props = {
	dialogRef: RefObject<HTMLDialogElement | null>;
	onConfirm: () => void;
};

const DANGER_NUMBERS: EmergencyNumber[] = [
	{
		name: "Urgences européennes",
		number: "112",
		description: "Depuis tout pays de l'Union européenne",
		action: "call",
	},
	{
		name: "Pompiers",
		number: "18",
		description: "Incendie, accident, inondation",
		action: "call",
	},
	{
		name: "SAMU",
		number: "15",
		description: "Urgence médicale",
		action: "call",
	},
];

export default function DangerModal({ dialogRef, onConfirm }: Props) {
	return (
		<dialog
			ref={dialogRef}
			className="modal modal-bottom sm:modal-middle"
			aria-labelledby="danger-title"
			aria-describedby="danger-desc"
		>
			<div className="modal-box rounded-t-3xl bg-base-200 sm:rounded-3xl">
				<h2
					id="danger-title"
					className="font-title text-xl font-bold text-primary"
				>
					Vous êtes en danger ?
				</h2>
				<p id="danger-desc" className="mt-3 text-sm text-primary">
					Vigie alerte vos voisins à proximité. Ce n'est pas un
					service d'urgence : contactez les secours si votre vie est
					menacée.
				</p>
				<ul className="mt-4 flex flex-col gap-2">
					{DANGER_NUMBERS.map((entry) => (
						<li
							key={entry.number}
							className="[&>section]:border [&>section]:border-primary/15"
						>
							<NumberRow entry={entry} />
						</li>
					))}
				</ul>
				<div className="mt-6 flex gap-3">
					<button
						type="button"
						onClick={() => dialogRef.current?.close()}
						className="btn btn-md grow rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10"
					>
						Annuler
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className="btn btn-error btn-md basis-2/3 grow rounded-full border-none font-bold"
					>
						Confirmer l'alerte
					</button>
				</div>
			</div>
			<form method="dialog" className="modal-backdrop">
				<button type="submit">Fermer</button>
			</form>
		</dialog>
	);
}
