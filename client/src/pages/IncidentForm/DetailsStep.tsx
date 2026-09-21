import AddressPicker from "@/components/Form/AddressPicker/AddressPicker";
import DangerLevelPicker, {
	type DangerLevel,
} from "@/components/Form/DangerLevelPicker/DangerLevelPicker";
import InputFields from "@/components/Form/InputFields/InputFields";
import MapLocationPicker from "@/components/Form/MapLocationPicker/MapLocationPicker";
import PhotoField from "@/components/Form/PhotoField/PhotoField";
import Icon from "@/components/Icon/Icon";
import type { Address } from "@/contexts/AuthContext";
import type { LocationAddress, Position } from "@/types/incidentForm";
import { useEffect, useId, useState } from "react";

type DetailsStepProps = {
	dangerLevels: DangerLevel[];
	dangerLevel: number | null;
	onDangerLevelChange: (id: number) => void;
	dangerLevelError: string | null;
	addressOptions: Address[];
	selectedAddressId: number | null;
	onSelectedAddressIdChange: (id: number) => void;
	position: Position | null;
	onPositionChange: (position: Position) => void;
	geolocationError: string | null;
	resolvedAddress: LocationAddress | null;
	title: string;
	onTitleChange: (title: string) => void;
	placeholder: string;
	description: string;
	onDescriptionChange: (description: string) => void;
	photoUrl: string | null;
	onPhotoUrlChange: (photoUrl: string | null) => void;
};

export default function DetailsStep({
	dangerLevels,
	dangerLevel,
	onDangerLevelChange,
	dangerLevelError,
	addressOptions,
	selectedAddressId,
	onSelectedAddressIdChange,
	position,
	onPositionChange,
	geolocationError,
	resolvedAddress,
	title,
	onTitleChange,
	placeholder,
	description,
	onDescriptionChange,
	photoUrl,
	onPhotoUrlChange,
}: DetailsStepProps) {
	const [isOpen, setIsOpen] = useState(false);
	const panelId = useId();
	const [isChoosingPosition, setIsChoosingPosition] = useState(false);
	const [hasTileError, setHasTileError] = useState(false);

	useEffect(() => {
		if (dangerLevelError) setIsOpen(true);
	}, [dangerLevelError]);
	const positionLabel = position
		? resolvedAddress
			? `${resolvedAddress.streetLine}, ${resolvedAddress.city}`
			: `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
		: null;

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
						error={dangerLevelError}
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
									hasTileError={hasTileError}
									onTileError={() => setHasTileError(true)}
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
								<div
									role="img"
									aria-label={`Carte centrée sur ${positionLabel}`}
									className="w-20 shrink-0"
								>
									<MapLocationPicker
										key="summary"
										value={position}
										onChange={onPositionChange}
										draggable={false}
										hasTileError={hasTileError}
										onTileError={() =>
											setHasTileError(true)
										}
									/>
								</div>
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
										{resolvedAddress
											? `${resolvedAddress.streetLine}, ${resolvedAddress.city}`
											: `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`}
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
					{hasTileError && (
						<div className="mt-4 flex flex-col gap-4 rounded-3xl bg-(--bg-error) p-4">
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
										Erreur sur la carte
									</h2>
									<p className="mt-1 text-sm text-black">
										Le chargement de la carte a échoué.
									</p>
								</div>
							</div>
							<button
								type="button"
								className="btn btn-md w-full rounded-full border-none bg-error px-5 font-bold text-white"
								onClick={() => setHasTileError(false)}
							>
								Réessayer
							</button>
						</div>
					)}{" "}
					<InputFields
						title={title}
						onTitleChange={onTitleChange}
						placeholder={placeholder}
						description={description}
						onDescriptionChange={onDescriptionChange}
					/>
					<PhotoField value={photoUrl} onChange={onPhotoUrlChange} />
				</div>
			)}
		</section>
	);
}
