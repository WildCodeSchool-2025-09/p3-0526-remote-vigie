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

export type AddressSuggestion = {
	name: string;
	postalCode: string;
	inseeCode: string;
	latitude: number;
	longitude: number;
};

type SearchAddressResult =
	| { status: "ok"; suggestions: AddressSuggestion[] }
	| { status: "error" };

export async function searchAddress(
	query: string,
	signal?: AbortSignal,
): Promise<SearchAddressResult> {
	try {
		const params = new URLSearchParams();
		params.set("q", query);
		const res = await apiFetch(
			`/api/addresses/search?${params.toString()}`,
			{ signal },
		);
		if (!res.ok) return { status: "error" };

		return {
			status: "ok",
			suggestions: await res.json(),
		};
	} catch {
		return { status: "error" };
	}
}
