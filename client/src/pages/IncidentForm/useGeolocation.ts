import type { Address, AuthUser } from "@/contexts/AuthContext";
import type { Position } from "@/types/incidentForm";
import { useEffect, useRef, useState } from "react";

export default function useGeolocation(user: AuthUser | null) {
	const [addressOptions, setAddressOptions] = useState<Address[]>([]);
	const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
		null,
	);
	const [position, setPosition] = useState<Position | null>(null);
	const [geolocationError, setGeolocationError] = useState<string | null>(
		null,
	);
	const hasManualSelectionRef = useRef(false);

	useEffect(() => {
		function fallbackToPrimaryAddress(error: GeolocationPositionError) {
			if (!user) return;

			switch (error.code) {
				case error.PERMISSION_DENIED:
					setGeolocationError(
						"Vous avez refusé l'accès à votre position, veuillez choisir une adresse :",
					);
					break;
				case error.POSITION_UNAVAILABLE:
					setGeolocationError(
						"Votre position n'a pas pu être déterminée, veuillez choisir une adresse : ",
					);
					break;
				case error.TIMEOUT:
					setGeolocationError(
						"La détection de votre position a pris trop de temps, veuillez choisir une adresse :",
					);
					break;
			}

			setAddressOptions(user.addresses);
			const primaryAddress = user.addresses.find(
				(address) => address.is_primary,
			);
			setSelectedAddressId(primaryAddress?.id ?? null);

			if (!primaryAddress) {
				setPosition({ lat: 46.6034, lng: 1.8883 });
			}
		}
		navigator.geolocation.getCurrentPosition((geoPosition) => {
			if (hasManualSelectionRef.current) return;

			setPosition({
				lat: geoPosition.coords.latitude,
				lng: geoPosition.coords.longitude,
			});
		}, fallbackToPrimaryAddress);
	}, [user]);

	useEffect(() => {
		const selectedAddress = addressOptions.find(
			(address) => address.id === selectedAddressId,
		);
		if (!selectedAddress) return;

		setPosition({
			lat: selectedAddress.latitude,
			lng: selectedAddress.longitude,
		});
	}, [addressOptions, selectedAddressId]);

	function onSelectedAddressIdChange(id: number | null) {
		hasManualSelectionRef.current = true;
		setSelectedAddressId(id);
	}

	return {
		position,
		onPositionChange: setPosition,
		addressOptions,
		selectedAddressId,
		onSelectedAddressIdChange,
		geolocationError,
	};
}
