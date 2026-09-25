import {
	type AddressSuggestion,
	searchAddress,
} from "@/services/addressService";
import { useEffect, useState } from "react";

export default function useAddressSearch() {
	const [addressQuery, setAddressQuery] = useState("");
	const [addressSuggestions, setAddressSuggestions] = useState<
		AddressSuggestion[]
	>([]);
	const [selectedAddress, setSelectedAddress] =
		useState<AddressSuggestion | null>(null);
	useEffect(() => {
		if (addressQuery.length < 3) {
			setAddressSuggestions([]);
			return;
		}

		const controller = new AbortController();
		const timeoutId = setTimeout(async () => {
			const result = await searchAddress(addressQuery, controller.signal);

			if (result.status === "ok") {
				setAddressSuggestions(result.suggestions);
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
	};
}
