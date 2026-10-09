import L from "leaflet";
import { memo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker, Popup } from "react-leaflet";

import { type IconName, icons } from "@/assets/icons";
import type { UsefulPlace, UsefulPlaceCategory } from "@/types/usefulPlace";
import {
	POPUP_AUTO_PAN_BOTTOM_RIGHT,
	POPUP_AUTO_PAN_TOP_LEFT,
	POPUP_MAX_WIDTH,
} from "@/utils/popupAutoPan";

// Classes écrites en entier : Tailwind ne génère que les noms qu'il lit dans le code.
const CATEGORY_STYLES: Record<
	UsefulPlaceCategory,
	{ label: string; icon: IconName; fillClass: string; textClass: string }
> = {
	fire_station: {
		label: "Caserne de pompiers",
		icon: "fireStation",
		fillClass: "fill-(--place-fire-station)",
		textClass: "text-(--place-fire-station)",
	},
	police: {
		label: "Police",
		icon: "policeStation",
		fillClass: "fill-(--place-police)",
		textClass: "text-(--place-police)",
	},
	hospital: {
		label: "Hôpital",
		icon: "hospital",
		fillClass: "fill-(--place-hospital)",
		textClass: "text-(--place-hospital)",
	},
	pharmacy: {
		label: "Pharmacie",
		icon: "pharmacy",
		fillClass: "fill-(--place-pharmacy)",
		textClass: "text-(--place-pharmacy)",
	},
	veterinary: {
		label: "Vétérinaire",
		icon: "veterinary",
		fillClass: "fill-(--place-veterinary)",
		textClass: "text-(--place-veterinary)",
	},
};

// Doit correspondre à `size-[24px]` ci-dessous.
const MARKER_SIZE = 24;

// Plusieurs ombres blanches superposées forment une fine auréole opaque.
const HALO_CLASS =
	"[filter:drop-shadow(0_0_1px_white)_drop-shadow(0_0_1px_white)_drop-shadow(0_0_1px_white)]";

function createUsefulPlaceIcon(category: UsefulPlaceCategory) {
	const { icon, fillClass } = CATEGORY_STYLES[category];
	const SvgIcon = icons[icon];

	const html = renderToStaticMarkup(
		<SvgIcon
			className={`size-[24px] ${fillClass} ${HALO_CLASS}`}
			aria-hidden="true"
		/>,
	);

	return L.divIcon({
		html,
		className: "",
		iconSize: [MARKER_SIZE, MARKER_SIZE],
		iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
	});
}

const CATEGORY_ICONS = Object.fromEntries(
	(Object.keys(CATEGORY_STYLES) as UsefulPlaceCategory[]).map((category) => [
		category,
		createUsefulPlaceIcon(category),
	]),
) as Record<UsefulPlaceCategory, L.DivIcon>;

function UsefulPlaceMarker({ place }: { place: UsefulPlace }) {
	const { label, textClass } = CATEGORY_STYLES[place.category];
	const address = [place.streetLine, place.city].filter(Boolean).join(", ");

	return (
		<Marker
			position={[Number(place.latitude), Number(place.longitude)]}
			icon={CATEGORY_ICONS[place.category]}
			title={`${label} : ${place.name}`}
			// Sous les marqueurs d'incident.
			zIndexOffset={-1000}
		>
			<Popup
				autoPanPaddingTopLeft={POPUP_AUTO_PAN_TOP_LEFT}
				autoPanPaddingBottomRight={POPUP_AUTO_PAN_BOTTOM_RIGHT}
				maxWidth={POPUP_MAX_WIDTH}
			>
				<p className={`text-xs font-bold ${textClass}`}>{label}</p>
				<p className="font-title text-sm font-bold text-primary">
					{place.name}
				</p>
				{address && (
					<p className="mt-1 text-xs text-primary/80">{address}</p>
				)}
				{place.phoneNumber && (
					<a
						href={`tel:${place.phoneNumber.replace(/\s/g, "")}`}
						className="mt-1 inline-block text-sm font-bold text-primary! underline"
					>
						{place.phoneNumber}
					</a>
				)}
			</Popup>
		</Marker>
	);
}

export default memo(UsefulPlaceMarker);
