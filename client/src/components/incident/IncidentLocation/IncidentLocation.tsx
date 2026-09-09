import L from "leaflet";
import { useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { type IconName, icons } from "@/assets/icons";
import type { IncidentType } from "@/types/incidentDetails";

type Props = {
	city: string;
	inseeCode: string;
	latitude: string;
	longitude: string;
	types: IncidentType[];
};

// Repris de _dev/design-system/Map.tsx : rond blanc + icône SVG du type,
// transformé en icône Leaflet. `color` est le hex renvoyé par la base.
function createIncidentDivIcon(iconName: IconName, color: string) {
	const SvgIcon = icons[iconName];

	const html = renderToStaticMarkup(
		<div
			style={{
				width: 40,
				height: 40,
				borderRadius: "50%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "white",
				border: `2px solid ${color}`,
				boxShadow: "0 1px 4px rgba(0, 0, 0, 0.25)",
			}}
		>
			<SvgIcon
				style={{ width: 22, height: 22, fill: color }}
				aria-hidden="true"
			/>
		</div>,
	);

	return L.divIcon({
		html,
		className: "", // évite le fond blanc carré par défaut de Leaflet
		iconSize: [40, 40],
		iconAnchor: [20, 20], // centre l'icône sur le point GPS
	});
}

export default function IncidentLocation({
	city,
	inseeCode,
	latitude,
	longitude,
	types,
}: Props) {
	const lat = Number(latitude);
	const lng = Number(longitude);
	const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

	// Le 1er type porte la couleur / l'icône de la pastille.
	const primaryType = types[0];
	const iconName: IconName =
		primaryType && primaryType.icon in icons
			? (primaryType.icon as IconName)
			: "marker";
	const markerColor = primaryType?.color ?? "var(--primary)";

	const markerIcon = useMemo(
		() => createIncidentDivIcon(iconName, markerColor),
		[iconName, markerColor],
	);

	return (
		<div className="flex flex-col gap-3">
			{hasCoords ? (
				<div
					role="img"
					aria-label={`Carte de repérage centrée sur ${city}`}
					className="h-56 w-full overflow-hidden rounded-2xl border border-primary/10"
				>
					<MapContainer
						center={[lat, lng]}
						zoom={15}
						scrollWheelZoom="center"
						doubleClickZoom="center"
						touchZoom="center"
						dragging={false}
						keyboard={false}
						zoomControl={false}
						attributionControl={false}
						className="h-full w-full"
					>
						<TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
						<Marker position={[lat, lng]} icon={markerIcon} />
					</MapContainer>
				</div>
			) : null}
			<p className="text-sm text-primary">
				{city}&nbsp;({inseeCode})
			</p>
		</div>
	);
}
