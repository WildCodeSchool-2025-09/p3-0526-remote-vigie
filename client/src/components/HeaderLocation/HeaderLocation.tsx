import { useEffect, useState } from "react";

import type { DeviceLocation } from "@/pages/Home/useDeviceLocation";
import { reverseGeocode } from "@/services/addressService";

// Commune de l'appareil (« Alès (30100) »), à droite d'un header `relative`.
// Pas de position, pas de commune (forêt, campagne : la BAN n'en renvoie pas) ou
// échec réseau : on n'affiche rien plutôt qu'un texte d'erreur dans le header.
// Positionné à la hauteur du logo de Home (header pb-16).
export default function HeaderLocation({
	deviceLocation,
}: {
	deviceLocation: DeviceLocation;
}) {
	const [label, setLabel] = useState<string | null>(null);

	const lat =
		deviceLocation.status === "found" ? deviceLocation.position.lat : null;
	const lng =
		deviceLocation.status === "found" ? deviceLocation.position.lng : null;

	useEffect(() => {
		if (lat == null || lng == null) return;

		const controller = new AbortController();
		reverseGeocode(lat, lng, controller.signal).then((result) => {
			if (controller.signal.aborted) return;
			if (result.status !== "ok" || result.locationAddress.city == null) {
				setLabel(null);
				return;
			}
			// Code postal, pas INSEE : c'est celui que l'utilisateur reconnaît.
			const { city, postalCode } = result.locationAddress;
			setLabel(postalCode ? `${city} (${postalCode})` : city);
		});

		return () => controller.abort();
	}, [lat, lng]);

	if (label == null) return null;

	return (
		<p className="absolute right-4 bottom-18 text-xs font-bold tracking-wide text-accent">
			{label}
		</p>
	);
}
