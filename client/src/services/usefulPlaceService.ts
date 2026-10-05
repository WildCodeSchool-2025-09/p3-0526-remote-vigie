import { apiFetch } from "@/services/apiClient";
import type { Bounds } from "@/types/bounds";
import type { UsefulPlace } from "@/types/usefulPlace";

type GetUsefulPlacesResult =
	| { status: "ok"; usefulPlaces: UsefulPlace[] }
	| { status: "error" };

// Même valeur que MAX_USEFUL_PLACES côté serveur (usefulPlaceRepository.ts).
export const USEFUL_PLACES_LIMIT = 1000;

export async function getUsefulPlaces(
	bounds: Bounds,
): Promise<GetUsefulPlacesResult> {
	try {
		const params = new URLSearchParams({
			north: String(bounds.north),
			south: String(bounds.south),
			east: String(bounds.east),
			west: String(bounds.west),
		});

		const res = await apiFetch(`/api/useful-places?${params.toString()}`);

		if (!res.ok) return { status: "error" };

		return {
			status: "ok",
			usefulPlaces: (await res.json()) as UsefulPlace[],
		};
	} catch {
		return { status: "error" }; // réseau, CORS, JSON illisible
	}
}
