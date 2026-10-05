import type { AuthUser } from "@/types/auth";
import { isInsideFranceBounds } from "@/utils/franceBounds";

// Repli : pas d'utilisateur connecté, pas d'adresse principale, ou adresse hors
// de la zone de la carte (DOM-TOM).
const PARIS_CENTER: [number, number] = [48.8566, 2.3522];

export function getDefaultMapCenter(user: AuthUser | null): [number, number] {
	const primaryAddress = user?.addresses.find(
		(address) => address.is_primary,
	);

	if (primaryAddress) {
		const latitude = Number(primaryAddress.latitude);
		const longitude = Number(primaryAddress.longitude);

		if (isInsideFranceBounds(latitude, longitude)) {
			return [latitude, longitude];
		}
	}

	return PARIS_CENTER;
}
