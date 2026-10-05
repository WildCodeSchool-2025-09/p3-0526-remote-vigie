import MapLocationPicker from "@/components/Form/MapLocationPicker/MapLocationPicker";
import NumberRow from "@/components/numbers/NumberRow/NumberRow";
import { useAuth } from "@/contexts/auth/AuthContext";
import type { Position } from "@/types/incidentForm";
import type { EmergencyNumber } from "@/types/numbers";
import { type RefObject, useState } from "react";
import useDangerLocation from "./useDangerLocation";

type Props = {
	dialogRef: RefObject<HTMLDialogElement | null>;
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

export default function DangerModal({ dialogRef }: Props) {
	const { status, position, error, locate, onPositionChange } =
		useDangerLocation();
	const isLocating = status === "locating";
	const { user } = useAuth();
	const primaryAddress = user?.addresses.find(
		(address) => address.is_primary,
	);
	const mapStart: Position = primaryAddress
		? { lat: primaryAddress.latitude, lng: primaryAddress.longitude }
		: { lat: 46.6034, lng: 1.8883 };
	const [hasTileError, setHasTileError] = useState(false);

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
				<output className="sr-only">
					{isLocating && "Localisation en cours..."}
				</output>
				{error && (
					<p
						role="alert"
						className="mt-4 text-sm font-bold text-error"
					>
						{error}
					</p>
				)}
				{status === "error" && (
					<MapLocationPicker
						value={position ?? mapStart}
						onChange={onPositionChange}
						hasTileError={hasTileError}
						onTileError={() => setHasTileError(true)}
						className="mt-4 w-full"
					/>
				)}

				<div className="mt-6 flex gap-3">
					<button
						type="button"
						onClick={() => dialogRef.current?.close()}
						disabled={isLocating}
						className="btn btn-md grow rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10"
					>
						Annuler
					</button>
					<button
						type="button"
						onClick={locate}
						disabled={isLocating}
						className="btn btn-error btn-md basis-2/3 grow rounded-full border-none font-bold"
					>
						{isLocating
							? "Localisation en cours..."
							: "Confirmer l'alerte"}
					</button>
				</div>
			</div>
			<form method="dialog" className="modal-backdrop">
				<button type="submit">Fermer</button>
			</form>
		</dialog>
	);
}
