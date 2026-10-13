import type { AuthUser } from "@/types/auth";
import type { Position } from "@/types/incidentForm";
import { isInsideFranceBounds } from "@/utils/franceBounds";

// Repli : pas d'utilisateur connecté, pas d'adresse principale, ou adresse hors
// de la zone de la carte (DOM-TOM).
const PARIS_CENTER: [number, number] = [48.8566, 2.3522];

// Vue de France entière (repli) et vue de quartier (position ou adresse).
export const DEFAULT_START_ZOOM = 6;
export const NEARBY_START_ZOOM = 14;

export type StartViewSource = "device" | "address" | "default";

export type StartView = {
	center: [number, number];
	zoom: number;
	source: StartViewSource;
};

function getPrimaryAddressCenter(
	user: AuthUser | null,
): [number, number] | null {
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

	return null;
}

export function getDefaultMapCenter(user: AuthUser | null): [number, number] {
	return getPrimaryAddressCenter(user) ?? PARIS_CENTER;
}

// Point de départ de la carte, par ordre de priorité : position de l'appareil
// (si elle est dans la zone de la carte), adresse principale, vue par défaut.
export function getStartView(
	user: AuthUser | null,
	devicePosition: Position | null,
): StartView {
	if (
		devicePosition &&
		isInsideFranceBounds(devicePosition.lat, devicePosition.lng)
	) {
		return {
			center: [devicePosition.lat, devicePosition.lng],
			zoom: NEARBY_START_ZOOM,
			source: "device",
		};
	}

	const addressCenter = getPrimaryAddressCenter(user);
	if (addressCenter) {
		return {
			center: addressCenter,
			zoom: NEARBY_START_ZOOM,
			source: "address",
		};
	}

	return {
		center: PARIS_CENTER,
		zoom: DEFAULT_START_ZOOM,
		source: "default",
	};
}
