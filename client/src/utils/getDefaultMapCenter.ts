import type { AuthUser } from "@/types/auth";

// Fallback when there is no connected user with a primary address.
const PARIS_CENTER: [number, number] = [48.8566, 2.3522];

export function getDefaultMapCenter(user: AuthUser | null): [number, number] {
	const primaryAddress = user?.addresses.find(
		(address) => address.is_primary,
	);

	if (primaryAddress) {
		return [primaryAddress.latitude, primaryAddress.longitude];
	}

	return PARIS_CENTER;
}
