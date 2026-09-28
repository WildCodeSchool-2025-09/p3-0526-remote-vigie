import {
	type AddressSuggestion,
	searchAddress,
} from "@/services/addressService";
import { useEffect, useRef, useState } from "react";

export default function useAddressSearch() {
	const [manualMode, setManualMode] = useState(false);
	const [city, setCity] = useState("");
	const [postalCode, setPostalCode] = useState("");
	const [addressQuery, setAddressQuery] = useState("");
	const [addressSuggestions, setAddressSuggestions] = useState<
		AddressSuggestion[]
	>([]);
	const [addressServiceUnavailable, setAddressServiceUnavailable] =
		useState(false);
	const [selectedAddress, setSelectedAddress] =
		useState<AddressSuggestion | null>(null);
	const skipNextSearchRef = useRef(false);

	function selectSuggestion(suggestion: AddressSuggestion) {
		skipNextSearchRef.current = true;
		setSelectedAddress(suggestion);
		setAddressQuery(suggestion.name);
		setAddressSuggestions([]);
	}

	useEffect(() => {
		if (skipNextSearchRef.current) {
			skipNextSearchRef.current = false;
			return;
		}

		if (addressQuery.length < 3) {
			setAddressSuggestions([]);
			return;
		}

		const controller = new AbortController();
		const timeoutId = setTimeout(async () => {
			const result = await searchAddress(addressQuery, controller.signal);

			if (result.status === "unavailable") {
				setAddressServiceUnavailable(true);
			}

			if (result.status === "ok") {
				setAddressSuggestions(result.suggestions);
				setAddressServiceUnavailable(false);
			}
		}, 300);

		return () => {
			controller.abort();
			clearTimeout(timeoutId);
		};
	}, [addressQuery]);

	return {
		addressQuery,
		setAddressQuery,
		addressSuggestions,
		setAddressSuggestions,
		selectedAddress,
		setSelectedAddress,
		selectSuggestion,
		addressServiceUnavailable,
		setAddressServiceUnavailable,
		manualMode,
		setManualMode,
		city,
		setCity,
		postalCode,
		setPostalCode,
	};
}
