import type { DangerLevel } from "@/components/Form/DangerLevelPicker/DangerLevelPicker";
import DuplicateWarning from "@/components/Form/DuplicateWarning/DuplicateWarning";
import EmailVerificationNotice from "@/components/Form/EmailVerificationNotice/EmailVerificationNotice";
import { type Address, useAuth } from "@/contexts/AuthContext";
import { getNearbyIncident } from "@/services/incidentService";
import { getIncidentTypes } from "@/services/incidentTypeService";
import type {
	IncidentType,
	NearbyIncident,
	Position,
} from "@/types/incidentForm";
import { distanceInMeters } from "@/utils/distance";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import DetailsStep from "./DetailsStep";
import IncidentFormSkeleton from "./IncidentFormSkeleton";
import IncidentTypeStep from "./IncidentTypeStep";

function computeHighestDangerLevel(
	incidentTypes: IncidentType[],
	selectedTypes: number[],
): number | null {
	const selected = incidentTypes.filter((type) =>
		selectedTypes.includes(type.id),
	);

	if (selected.length === 0) return null;

	return selected.reduce((highest, type) =>
		type.danger_level_weight > highest.danger_level_weight ? type : highest,
	).danger_level_id;
}

export default function IncidentForm() {
	const { user } = useAuth();
	const navigate = useNavigate();

	const [addressOptions, setAddressOptions] = useState<Address[]>([]);
	const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
		null,
	);
	const [position, setPosition] = useState<Position | null>(null);
	const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
	const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
	const [loadingTypes, setLoadingTypes] = useState(true);
	const [typesError, setTypesError] = useState<string | null>(null);
	const [dangerLevel, setDangerLevel] = useState<number | null>(null);
	const [dangerLevelTouched, setDangerLevelTouched] = useState(false);
	const [geolocationError, setGeolocationError] = useState<string | null>(
		null,
	);
	const [duplicateCandidate, setDuplicateCandidate] =
		useState<NearbyIncident | null>(null);
	const duplicateType =
		incidentTypes.find((type) => selectedTypes.includes(type.id)) ?? null;
	const duplicateDistance =
		position && duplicateCandidate
			? distanceInMeters(
					position.lat,
					position.lng,
					Number(duplicateCandidate.latitude),
					Number(duplicateCandidate.longitude),
				)
			: 0;

	const loadIncidentTypes = useCallback((signal?: AbortSignal) => {
		setLoadingTypes(true);
		setTypesError(null);

		getIncidentTypes(signal)
			.then((types) => {
				setIncidentTypes(types);
				setLoadingTypes(false);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				setTypesError(
					"Impossible de charger les types de signalement...",
				);
				setLoadingTypes(false);
			});
	}, []);

	useEffect(() => {
		if (!user?.emailVerified) return;

		const controller = new AbortController();
		loadIncidentTypes(controller.signal);
		return () => controller.abort();
	}, [loadIncidentTypes, user?.emailVerified]);

	useEffect(() => {
		if (selectedTypes.length === 0) {
			setDangerLevel(null);
			setDangerLevelTouched(false);
			return;
		}

		if (dangerLevelTouched) return;

		setDangerLevel(computeHighestDangerLevel(incidentTypes, selectedTypes));
	}, [selectedTypes, incidentTypes, dangerLevelTouched]);

	const dangerLevels = useMemo(() => {
		const map = new Map<number, DangerLevel>();

		for (const type of incidentTypes) {
			if (!map.has(type.danger_level_id)) {
				map.set(type.danger_level_id, {
					id: type.danger_level_id,
					weight: type.danger_level_weight,
					label: type.danger_level_label,
					color: type.danger_level_color,
				});
			}
		}

		return [...map.values()].sort((a, b) => a.weight - b.weight);
	}, [incidentTypes]);

	useEffect(() => {
		function fallbackToPrimaryAddress(error: GeolocationPositionError) {
			if (!user) return;

			switch (error.code) {
				case error.PERMISSION_DENIED:
					setGeolocationError(
						"Vous avez refusé l'accès à votre position, veuillez choisir une adresse :",
					);
					break;
				case error.POSITION_UNAVAILABLE:
					setGeolocationError(
						"Votre position n'a pas pu être déterminée, veuillez choisir une adresse : ",
					);
					break;
				case error.TIMEOUT:
					setGeolocationError(
						"La détection de votre position a pris trop de temps, veuillez choisir une adresse :",
					);
					break;
			}

			setAddressOptions(user.addresses);
			const primaryAddress = user.addresses.find(
				(address) => address.is_primary,
			);
			setSelectedAddressId(primaryAddress?.id ?? null);

			if (!primaryAddress) {
				setPosition({ lat: 46.6034, lng: 1.8883 });
			}
		}
		navigator.geolocation.getCurrentPosition((geoPosition) => {
			setPosition({
				lat: geoPosition.coords.latitude,
				lng: geoPosition.coords.longitude,
			});
		}, fallbackToPrimaryAddress);
	}, [user]);

	useEffect(() => {
		const selectedAddress = addressOptions.find(
			(address) => address.id === selectedAddressId,
		);
		if (!selectedAddress) return;

		setPosition({
			lat: selectedAddress.latitude,
			lng: selectedAddress.longitude,
		});
	}, [addressOptions, selectedAddressId]);

	const selectedTypesInstructions = useMemo(
		() =>
			incidentTypes
				.filter((type) => selectedTypes.includes(type.id))
				.map((type) => ({
					code: type.code,
					label: type.label,
					color: type.color,
					safetyInstructions: type.safety_instructions,
				})),
		[incidentTypes, selectedTypes],
	);

	useEffect(() => {
		setDuplicateCandidate(null);

		if (selectedTypes.length === 0 || !position) return;

		let active = true;

		const timeoutId = setTimeout(async () => {
			const result = await getNearbyIncident(
				position.lat,
				position.lng,
				selectedTypes,
			);

			if (!active) return;

			if (result.status === "ok") {
				setDuplicateCandidate(result.nearbyIncident);
			}
		}, 300);

		return () => {
			active = false;
			clearTimeout(timeoutId);
		};
	}, [selectedTypes, position]);

	// PrivateRoute a déjà filtré les non-connectés : ici `user` existe.
	// S'il n'a pas vérifié son e-mail, on bloque le signalement.
	if (!user?.emailVerified) {
		return <EmailVerificationNotice />;
	}

	return (
		<div className="min-h-screen bg-base-100">
			<header className="relative isolate flex h-44 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-12">
				<img
					src="/src/assets/images/background-incident.jpg"
					alt=""
					aria-hidden="true"
					className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
				/>
				<h1 className="font-title text-2xl font-bold text-accent">
					Nouveau signalement
				</h1>
				<p className="mt-1 text-sm text-white/85">
					Vos voisins concernés seront alertés aussitôt.
				</p>
			</header>
			{loadingTypes || position == null ? (
				<IncidentFormSkeleton />
			) : (
				<div className="relative -mt-8 space-y-4 px-4 pb-6">
					{duplicateCandidate && (
						<DuplicateWarning
							candidate={duplicateCandidate}
							type={duplicateType}
							distanceMeters={duplicateDistance}
							onJoin={() =>
								navigate(`/incident/${duplicateCandidate.id}`)
							}
							onIgnore={() => setDuplicateCandidate(null)}
						/>
					)}
					<IncidentTypeStep
						incidentTypes={incidentTypes}
						selectedTypes={selectedTypes}
						onSelectedTypesChange={setSelectedTypes}
						loadingTypes={loadingTypes}
						typesError={typesError}
						onRetry={() => loadIncidentTypes()}
						selectedTypesInstructions={selectedTypesInstructions}
					/>
					<DetailsStep
						dangerLevels={dangerLevels}
						dangerLevel={dangerLevel}
						onDangerLevelChange={(id) => {
							setDangerLevel(id);
							setDangerLevelTouched(true);
						}}
						addressOptions={addressOptions}
						selectedAddressId={selectedAddressId}
						onSelectedAddressIdChange={setSelectedAddressId}
						position={position}
						onPositionChange={setPosition}
						geolocationError={geolocationError}
					/>

					<section className="rounded-2xl bg-base-200 p-4">…</section>
				</div>
			)}
		</div>
	);
}
