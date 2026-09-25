import { apiFetch } from "@/services/apiClient";
import type { Bounds } from "@/types/bounds";
import type { UsefulPlace } from "@/types/usefulPlace";

type GetUsefulPlacesResult =
	| { status: "ok"; usefulPlaces: UsefulPlace[] }
	| { status: "error" };

// `bounds` is optional: omitted, the API returns every useful place (no
// cap, small reference table). The map (US04) always passes its current
// viewport, so it only asks for what's visible.
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
