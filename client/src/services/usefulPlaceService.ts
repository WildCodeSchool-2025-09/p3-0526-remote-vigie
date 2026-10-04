import { apiFetch } from "@/services/apiClient";
import type { Bounds } from "@/types/bounds";
import type { UsefulPlace } from "@/types/usefulPlace";

type GetUsefulPlacesResult =
	| { status: "ok"; usefulPlaces: UsefulPlace[] }
	| { status: "error" };

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
