import { apiFetch } from "@/services/apiClient";
import type { Bounds } from "@/types/bounds";
import type { UsefulPlace } from "@/types/usefulPlace";

type GetUsefulPlacesResult =
	| { status: "ok"; usefulPlaces: UsefulPlace[] }
	| { status: "error" };

// Without `bounds`, returns every useful place; the map passes its visible zone.
export async function getUsefulPlaces(
	bounds?: Bounds,
): Promise<GetUsefulPlacesResult> {
	try {
		const path = bounds
			? `/api/useful-places?${new URLSearchParams({
					north: String(bounds.north),
					south: String(bounds.south),
					east: String(bounds.east),
					west: String(bounds.west),
				}).toString()}`
			: "/api/useful-places";

		const res = await apiFetch(path);

		if (!res.ok) return { status: "error" };

		return {
			status: "ok",
			usefulPlaces: (await res.json()) as UsefulPlace[],
		};
	} catch {
		return { status: "error" }; // réseau, CORS, JSON illisible
	}
}
