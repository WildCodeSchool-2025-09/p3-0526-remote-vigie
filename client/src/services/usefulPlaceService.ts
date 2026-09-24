import { apiFetch } from "@/services/apiClient";
import type { UsefulPlace } from "@/types/usefulPlace";

type GetUsefulPlacesResult =
	| { status: "ok"; usefulPlaces: UsefulPlace[] }
	| { status: "error" };

export async function getUsefulPlaces(): Promise<GetUsefulPlacesResult> {
	try {
		const res = await apiFetch("/api/useful-places");

		if (!res.ok) return { status: "error" };

		return {
			status: "ok",
			usefulPlaces: (await res.json()) as UsefulPlace[],
		};
	} catch {
		return { status: "error" }; // réseau, CORS, JSON illisible
	}
}
