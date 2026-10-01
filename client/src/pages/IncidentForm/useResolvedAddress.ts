import { reverseGeocode } from "@/services/addressService";
import type { LocationAddress, Position } from "@/types/incidentForm";
import { useEffect, useState } from "react";

export default function useResolvedAddress(position: Position | null) {
	const [resolvedAddress, setResolvedAddress] =
		useState<LocationAddress | null>(null);

	useEffect(() => {
		setResolvedAddress(null);

		if (!position) return;

		const controller = new AbortController();
		const timeoutId = setTimeout(async () => {
			const result = await reverseGeocode(
				position.lat,
				position.lng,
				controller.signal,
			);

			if (result.status === "ok") {
				setResolvedAddress(result.locationAddress);
			}
		}, 300);

		return () => {
			controller.abort();
			clearTimeout(timeoutId);
		};
	}, [position]);

	return resolvedAddress;
}
