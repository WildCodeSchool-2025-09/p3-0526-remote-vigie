import type { AddressInput, ResolvedAddress } from "../types/address";
import geocodingService from "./geocodingService";

// Complète une adresse d'inscription : si les coordonnées ou le code INSEE
// manquent (saisie manuelle), on prend le centre de la commune et l'adresse
// est marquée approximative. Renvoie null si la commune est introuvable ;
// laisse remonter l'erreur si le service d'adresse ne répond pas.
export async function resolveAddress(
	address: AddressInput,
): Promise<ResolvedAddress | null> {
	const { latitude, longitude, inseeCode } = address;
	const streetLine = address.streetLine ?? null;

	if (latitude != null && longitude != null && inseeCode != null) {
		return {
			city: address.city,
			postalCode: address.postalCode,
			inseeCode,
			streetLine,
			latitude,
			longitude,
			isApproximate: address.isApproximate ?? true,
		};
	}

	const centroid = await geocodingService.geocodeCentroid(
		address.city,
		address.postalCode,
	);
	if (centroid == null) return null;

	return {
		city: address.city,
		postalCode: address.postalCode,
		inseeCode: centroid.inseeCode,
		streetLine,
		latitude: centroid.latitude,
		longitude: centroid.longitude,
		isApproximate: true,
	};
}
