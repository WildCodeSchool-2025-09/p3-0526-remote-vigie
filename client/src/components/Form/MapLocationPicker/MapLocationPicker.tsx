import { icons } from "@/assets/icons";
import type { Position } from "@/types/incidentForm";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type MapLocationPickerProps = {
	value: Position;
	onChange: (position: Position) => void;
	draggable?: boolean;
	className?: string;
};

const markerIcon = L.divIcon({
	html: renderToStaticMarkup(
		<icons.marker className="h-8 w-8 fill-primary" />,
	),
	className: "",
	iconSize: [32, 32],
	iconAnchor: [16, 32],
});

export default function MapLocationPicker({
	value,
	onChange,
	draggable = true,
	className = "w-full",
}: MapLocationPickerProps) {
	return (
		<div className={className}>
			<div
				className={`w-full overflow-hidden rounded-2xl ${draggable ? "h-64" : "h-20"}`}
			>
				<MapContainer
					center={[value.lat, value.lng]}
					zoom={15}
					className="h-full w-full"
					dragging={draggable}
					zoomControl={draggable}
					attributionControl={false}
				>
					<TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
					<Marker
						position={[value.lat, value.lng]}
						icon={markerIcon}
						draggable={draggable}
						eventHandlers={{
							dragend: (event) => {
								const marker = event.target;
								const { lat, lng } = marker.getLatLng();
								onChange({ lat, lng });
							},
						}}
					/>
				</MapContainer>
			</div>
			<p className="text-[10px] text-neutral">
				©{" "}
				<a href="https://www.openstreetmap.org/copyright">
					OpenStreetMap
				</a>{" "}
				contributors
			</p>
		</div>
	);
}
