import type { AuthUser } from "@/contexts/AuthContext";

// Paris — fallback used whenever there's no connected user with a valid
// address to center on instead (today: always, until US05/US06 exist for
// real; AuthContext's stub already carries addresses, so the "connected
// user" branch below is real code, not dead code waiting on future work).
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
