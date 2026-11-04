import { getNearbyIncident } from "@/services/incidentService";
import type {
	IncidentType,
	NearbyIncident,
	Position,
} from "@/types/incidentForm";
import { distanceInMeters } from "@/utils/distance";
import { useEffect, useState } from "react";

export default function useDuplicateDetection(
	selectedTypes: number[],
	position: Position | null,
	incidentTypes: IncidentType[],
) {
	const [dismissedId, setDismissedId] = useState<number | null>(null);
	const [duplicateCandidate, setDuplicateCandidate] =
		useState<NearbyIncident | null>(null);

	useEffect(() => {
		if (selectedTypes.length === 0 || !position) {
			setDuplicateCandidate(null);
			return;
		}
		let active = true;

		const timeoutId = setTimeout(async () => {
			const result = await getNearbyIncident(
				position.lat,
				position.lng,
				selectedTypes,
			);

			if (!active) return;

			if (result.status === "ok") {
				const found = result.nearbyIncident;
				setDuplicateCandidate(
					found && found.id !== dismissedId ? found : null,
				);
			}
		}, 300);

		return () => {
			active = false;
			clearTimeout(timeoutId);
		};
	}, [selectedTypes, position, dismissedId]);

	const duplicateType =
		incidentTypes.find(
			(type) =>
				selectedTypes.includes(type.id) &&
				(duplicateCandidate?.typeIds.includes(type.id) ?? false),
		) ?? null;

	const duplicateDistance =
		position && duplicateCandidate
			? distanceInMeters(
					position.lat,
					position.lng,
					Number(duplicateCandidate.latitude),
					Number(duplicateCandidate.longitude),
				)
			: 0;

	return {
		duplicateCandidate,
		duplicateType,
		duplicateDistance,
		onIgnoreDuplicate: () => {
			setDismissedId(duplicateCandidate?.id ?? null);
			setDuplicateCandidate(null);
		},
	};
}
