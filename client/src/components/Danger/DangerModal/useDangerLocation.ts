import type { Position } from "@/types/incidentForm";
import { useState } from "react";

type Status = "idle" | "locating" | "success" | "error";

export default function useDangerLocation() {
	const [status, setStatus] = useState<Status>("idle");
	const [position, setPosition] = useState<Position | null>(null);
	const [error, setError] = useState<string | null>(null);

	function locate() {
		setStatus("locating");
		setError(null);

		navigator.geolocation.getCurrentPosition(
			(geoPosition) => {
				setPosition({
					lat: geoPosition.coords.latitude,
					lng: geoPosition.coords.longitude,
				});
				setStatus("success");
			},
			(geoError) => {
				switch (geoError.code) {
					case geoError.PERMISSION_DENIED:
						setError(
							"Vous avez refusé l'accès à votre position. Indiquez où vous êtes sur la carte.",
						);
						break;
					case geoError.POSITION_UNAVAILABLE:
						setError(
							"Votre position n'a pas pu être déterminée. Indiquez où vous êtes sur la carte.",
						);
						break;
					case geoError.TIMEOUT:
						setError(
							"La détection de votre position a pris trop de temps. Indiquez où vous êtes sur la carte.",
						);
						break;
				}
				setStatus("error");
			},
			{ enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
		);
	}

	return { status, position, error, locate, onPositionChange: setPosition };
}
