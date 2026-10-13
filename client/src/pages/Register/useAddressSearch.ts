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
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const skipNextSearchRef = useRef(false);

	function selectSuggestion(suggestion: AddressSuggestion) {
		skipNextSearchRef.current = true;
		setSelectedAddress(suggestion);
		setAddressQuery(suggestion.name);
		setAddressSuggestions([]);
		setHighlightedIndex(-1);
	}

	function updateAddressQuery(value: string) {
		skipNextSearchRef.current = false;
		setSelectedAddress(null);
		setAddressQuery(value);
	}

	function enterManualMode() {
		setSelectedAddress(null);
		setAddressServiceUnavailable(false);
		setManualMode(true);
	}

	useEffect(() => {
		if (skipNextSearchRef.current) {
			skipNextSearchRef.current = false;
			return;
		}

		if (addressQuery.length < 3) {
			setAddressSuggestions([]);
			setHighlightedIndex(-1);
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
				setHighlightedIndex(-1);
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
		updateAddressQuery,
		addressSuggestions,
		setAddressSuggestions,
		selectedAddress,
		setSelectedAddress,
		selectSuggestion,
		enterManualMode,
		highlightedIndex,
		setHighlightedIndex,
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
