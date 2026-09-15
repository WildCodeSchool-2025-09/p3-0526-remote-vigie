import AddressPicker from "@/components/Form/AddressPicker/AddressPicker";
import DangerLevelPicker, {
	type DangerLevel,
} from "@/components/Form/DangerLevelPicker/DangerLevelPicker";
import MapLocationPicker from "@/components/Form/MapLocationPicker/MapLocationPicker";
import Icon from "@/components/Icon/Icon";
import type { Address } from "@/contexts/AuthContext";
import type { Position } from "@/types/incidentForm";
import { useId, useState } from "react";

type DetailsStepProps = {
	dangerLevels: DangerLevel[];
	dangerLevel: number | null;
	onDangerLevelChange: (id: number) => void;
	addressOptions: Address[];
	selectedAddressId: number | null;
	onSelectedAddressIdChange: (id: number) => void;
	position: Position | null;
	onPositionChange: (position: Position) => void;
	geolocationError: string | null;
};

export default function DetailsStep({
	dangerLevels,
	dangerLevel,
	onDangerLevelChange,
	addressOptions,
	selectedAddressId,
	onSelectedAddressIdChange,
	position,
	onPositionChange,
	geolocationError,
}: DetailsStepProps) {
	const [isOpen, setIsOpen] = useState(false);
	const panelId = useId();
	const [isChoosingPosition, setIsChoosingPosition] = useState(false);
	return (
		<section className="rounded-2xl bg-base-200 p-4">
			<button
				type="button"
				onClick={() => setIsOpen((open) => !open)}
				aria-expanded={isOpen}
				aria-controls={panelId}
				className="flex w-full items-center justify-between gap-2 text-left cursor-pointer"
			>
				<span className="flex items-center gap-2 pb-4">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-content">
						2
					</span>
					<h2 className="font-title text-lg font-bold text-primary">
						Détails
					</h2>
				</span>
				<span className="flex items-center gap-2 pb-4">
					<span className="text-neutral">Facultatif</span>
					<Icon
						name={isOpen ? "angleSmallUp" : "angleSmallDown"}
						className="h-4 w-4 fill-primary/60"
						aria-hidden="true"
					/>
				</span>
			</button>

			{isOpen && (
				<div id={panelId}>
					<DangerLevelPicker
						label="Quelle est la gravité de la situation ?"
						dangerLevels={dangerLevels}
						value={dangerLevel}
						onChange={onDangerLevelChange}
					/>
					{addressOptions.length > 0 && (
						<AddressPicker
							label={
								geolocationError ??
								"Impossible de vous localiser, veuillez choisir une adresse"
							}
							addresses={addressOptions}
							value={selectedAddressId}
							onChange={onSelectedAddressIdChange}
						/>
					)}

					{position &&
						(isChoosingPosition ? (
							<div className="mt-6">
								<MapLocationPicker
									key="picker"
									value={position}
									onChange={onPositionChange}
								/>
								<button
									type="button"
									className="btn btn-accent btn-md mt-4 w-full rounded-full border-none px-5 font-bold"
									onClick={() => setIsChoosingPosition(false)}
								>
									<Icon
										name="check"
										className="h-4 w-4 fill-primary"
										aria-hidden="true"
									/>
									Valider la position
								</button>
							</div>
						) : (
							<div className="mt-6 flex items-start gap-2 text-left">
								<MapLocationPicker
									key="summary"
									value={position}
									onChange={onPositionChange}
									draggable={false}
									className="w-20 shrink-0"
								/>
								<div className="text-left">
									{addressOptions.length === 0 &&
										(geolocationError ? (
											<p className="font-bold text-primary">
												Localisation impossible,
												veuillez choisir une position
												sur la carte :
											</p>
										) : (
											<p className="font-bold text-primary">
												Position détectée
											</p>
										))}

									<p className="text-sm text-primary">
										{position.lat.toFixed(5)},{" "}
										{position.lng.toFixed(5)}
									</p>
									<button
										type="button"
										className="text-left text-sm font-bold text-primary underline"
										onClick={() =>
											setIsChoosingPosition(true)
										}
									>
										{addressOptions.length > 0
											? "Ajuster la localisation"
											: "Choisir un autre point"}
									</button>
								</div>
							</div>
						))}
				</div>
			)}
		</section>
	);
}
