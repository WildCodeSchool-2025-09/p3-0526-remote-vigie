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
	const [duplicateCandidate, setDuplicateCandidate] =
		useState<NearbyIncident | null>(null);

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

	return {
		duplicateCandidate,
		duplicateType,
		duplicateDistance,
		onIgnoreDuplicate: () => setDuplicateCandidate(null),
	};
}
