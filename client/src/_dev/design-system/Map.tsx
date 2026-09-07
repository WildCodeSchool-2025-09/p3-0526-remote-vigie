// ⚠️ DEV ONLY — famille "Map" de la galerie de composants (/help/components).

import L from "leaflet";
import { useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import Example from "@/_dev/design-system/Example";
import SectionLabel from "@/_dev/design-system/SectionLabel";
import { type IconName, icons } from "@/assets/icons";

// --- Fabrique une icône Leaflet (divIcon) à partir d'un composant SVG React ---
// Reproduit le rond `bg-{type}` + icône vu dans les cards (CardExamples).
function createIncidentDivIcon(type: IconName, colorType: string) {
	const SvgIcon = icons[type];

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
				border: `2px solid var(${colorType})`,
				boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
			}}
		>
			<SvgIcon
				style={{ width: 22, height: 22, fill: `var(${colorType})` }}
				aria-hidden="true"
			/>
		</div>,
	);

	return L.divIcon({
		html,
		className: "", // évite le style par défaut de Leaflet (fond blanc carré)
		iconSize: [40, 40],
		iconAnchor: [20, 20], // centre l'icône sur le point GPS
		popupAnchor: [0, -20],
	});
}

// --- Faux incidents pour la démo ---
const fakeIncidents = [
	{
		id: 1,
		type: "fire" as IconName,
		colorType: "--fire",
		label: "Feu",
		place: "Alès",
		lat: 44.1279,
		lng: 4.0817,
	},
	{
		id: 2,
		type: "flood" as IconName,
		colorType: "--flood",
		label: "Inondation",
		place: "Saint-Christol",
		lat: 44.15,
		lng: 4.09,
	},
	{
		id: 3,
		type: "wild" as IconName,
		colorType: "--wild",
		label: "Animal sauvage",
		place: "Alès",
		lat: 44.12,
		lng: 4.1,
	},
	{
		id: 4,
		type: "insect" as IconName,
		colorType: "--insect",
		label: "Nid d'insectes",
		place: "Saint-Privat",
		lat: 44.135,
		lng: 4.075,
	},
];

function IncidentMapDemo() {
	const icons_ = useMemo(
		() =>
			fakeIncidents.map((incident) => ({
				...incident,
				icon: createIncidentDivIcon(incident.type, incident.colorType),
			})),
		[],
	);

	return (
		<div className="h-80 w-full overflow-hidden rounded-2xl border border-primary/10">
			<MapContainer
				center={[44.1279, 4.0817]}
				zoom={12}
				scrollWheelZoom={false}
				className="h-full w-full"
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{icons_.map((incident) => (
					<Marker
						key={incident.id}
						position={[incident.lat, incident.lng]}
						icon={incident.icon}
					>
						<Popup>
							<span className="font-bold">{incident.label}</span>
							<br />
							{incident.place}
						</Popup>
					</Marker>
				))}
			</MapContainer>
		</div>
	);
}

export default function MapExamples() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<SectionLabel>Carte Leaflet</SectionLabel>

			<Example
				className="sm:col-span-2 lg:col-span-3"
				title="Incident markers"
				description="Marqueurs Leaflet fabriqués à partir des icônes SVG React (?react) via L.divIcon() + renderToStaticMarkup, reproduisant le rond bg-{type} + icône des cards (CardExamples). Les tuiles viennent d'OpenStreetMap."
				code={`function createIncidentDivIcon(type, colorType) {
  const SvgIcon = icons[type];
  const html = renderToStaticMarkup(
    <div style={{
      width: 40, height: 40, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "white", border: \`2px solid var(\${colorType})\`,
    }}>
      <SvgIcon style={{ width: 22, height: 22, fill: \`var(\${colorType})\` }} aria-hidden="true" />
    </div>
  );
  return L.divIcon({ html, className: "", iconSize: [40, 40], iconAnchor: [20, 20] });
}

<MapContainer center={[44.1279, 4.0817]} zoom={12} className="h-80 w-full">
  <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Marker position={[44.1279, 4.0817]} icon={createIncidentDivIcon("fire", "--fire")}>
    <Popup>Feu — Alès</Popup>
  </Marker>
</MapContainer>`}
			>
				<IncidentMapDemo />
			</Example>
		</div>
	);
}
