import { useEffect, useState } from "react";

import type { Position } from "@/types/incidentForm";

const LOCATION_TIMEOUT_MS = 8000;
// Une position récente du navigateur suffit : on ne cherche qu'à centrer la carte.
const LOCATION_MAX_AGE_MS = 60_000;

export type DeviceLocation =
	| { status: "locating" }
	| { status: "found"; position: Position }
	| { status: "unavailable" };

// Demande une fois la position de l'appareil (refus, indisponibilité ou délai
// dépassé : « unavailable »). Elle reste dans cet état React : ni stockée, ni envoyée.
export function useDeviceLocation(): DeviceLocation {
	const [location, setLocation] = useState<DeviceLocation>(() =>
		"geolocation" in navigator
			? { status: "locating" }
			: { status: "unavailable" },
	);

	useEffect(() => {
		if (!("geolocation" in navigator)) return;

		// Écarte une réponse arrivée après le démontage de la page.
		let isCurrent = true;

		navigator.geolocation.getCurrentPosition(
			(geoPosition) => {
				if (!isCurrent) return;
				setLocation({
					status: "found",
					position: {
						lat: geoPosition.coords.latitude,
						lng: geoPosition.coords.longitude,
					},
				});
			},
			() => {
				if (isCurrent) setLocation({ status: "unavailable" });
			},
			{ timeout: LOCATION_TIMEOUT_MS, maximumAge: LOCATION_MAX_AGE_MS },
		);

		return () => {
			isCurrent = false;
		};
	}, []);

	return location;
}
