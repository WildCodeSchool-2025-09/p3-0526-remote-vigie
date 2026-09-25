import type { LocationAddress } from "@/types/incidentForm";
import { apiFetch } from "./apiClient";

type ReverseGeocodeResult =
	| { status: "ok"; locationAddress: LocationAddress }
	| { status: "error" };

export async function reverseGeocode(
	lat: number,
	lng: number,
	signal?: AbortSignal,
): Promise<ReverseGeocodeResult> {
	try {
		const params = new URLSearchParams();
		params.set("lat", String(lat));
		params.set("lng", String(lng));
		const res = await apiFetch(
			`/api/addresses/reverse?${params.toString()}`,
			{ signal },
		);
		if (!res.ok) return { status: "error" };

		return {
			status: "ok",
			locationAddress: await res.json(),
		};
	} catch {
		return { status: "error" };
	}
}
