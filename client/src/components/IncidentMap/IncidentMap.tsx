import L from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
	MapContainer,
	Marker,
	TileLayer,
	useMap,
	useMapEvents,
} from "react-leaflet";
import { useNavigate } from "react-router";
import "leaflet/dist/leaflet.css";

import { type IconName, icons } from "@/assets/icons";
import { useAuth } from "@/contexts/AuthContext";
import { getIncidentsInBounds } from "@/services/incidentService";
import { getUsefulPlaces } from "@/services/usefulPlaceService";
import type { Bounds } from "@/types/bounds";
import type { IncidentListItem } from "@/types/incidentList";
import { getDefaultMapCenter } from "@/utils/getDefaultMapCenter";

// France métropolitaine, Corse comprise — au-delà, rien à afficher (décision
// du 23/09/2026). [sud-ouest, nord-est].
const FRANCE_BOUNDS: [[number, number], [number, number]] = [
	[41.0, -5.5],
	[51.5, 9.8],
];
const DEFAULT_ZOOM = 6;
const MIN_ZOOM = 5;
// Zoom appliqué à la sélection d'un signalement (marqueur ou carte de liste,
// décision du 25/09) — reprend volontairement la valeur déjà utilisée par
// IncidentLocation.tsx (US02) pour la mini-carte d'un incident seul, pour que
// "regarder un incident de près" ait toujours le même niveau de zoom dans
// toute l'application.
const SELECTION_ZOOM = 15;
// Anti-rebond entre un déplacement de carte et le rechargement des
// marqueurs (checklist "Intégration de la carte") : évite de spammer le
// serveur pendant un glisser continu.
const BOUNDS_FETCH_DEBOUNCE_MS = 400;

function leafletBoundsToBounds(bounds: L.LatLngBounds): Bounds {
	return {
		north: bounds.getNorth(),
		south: bounds.getSouth(),
		east: bounds.getEast(),
		west: bounds.getWest(),
	};
}

// Même patron que IncidentLocation.tsx (US02) : L.divIcon() +
// renderToStaticMarkup(), pastille blanche cerclée de la couleur du type.
// `isSelected` grossit l'anneau — c'est la seule différence visuelle du
// clic en deux temps (décision du 24/09).
function createIncidentDivIcon(
	iconName: IconName,
	color: string,
	isSelected: boolean,
) {
	const SvgIcon = icons[iconName];
	const size = isSelected ? 44 : 36;
	const iconSize = isSelected ? 24 : 20;

	const html = renderToStaticMarkup(
		<div
			style={{
				width: size,
				height: size,
				borderRadius: "50%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "white",
				border: `${isSelected ? 3 : 2}px solid ${color}`,
				boxShadow: isSelected
					? `0 0 0 3px color-mix(in srgb, ${color} 35%, transparent)`
					: "0 1px 4px rgba(0, 0, 0, 0.3)",
			}}
		>
			<SvgIcon
				style={{ width: iconSize, height: iconSize, fill: color }}
				aria-hidden="true"
			/>
		</div>,
	);

	return L.divIcon({
		html,
		className: "",
		iconSize: [size, size],
		iconAnchor: [size / 2, size / 2],
	});
}

// Rendu à part : seul un composant monté à l'intérieur de <MapContainer>
// peut accéder à l'instance Leaflet (hooks react-leaflet), d'où ce petit
// composant sans rendu visuel, juste posé comme enfant de la carte.
function MapViewportWatcher({
	onViewportChange,
}: {
	onViewportChange: (bounds: Bounds) => void;
}) {
	const map = useMapEvents({
		moveend: () => onViewportChange(leafletBoundsToBounds(map.getBounds())),
	});

	// Ne doit s'exécuter qu'au montage : `map` est stable pour toute la vie du
	// composant (react-leaflet), `onViewportChange` est mémoïsée par le parent.
	// biome-ignore lint/correctness/useExhaustiveDependencies: montage uniquement, voir commentaire ci-dessus.
	useEffect(() => {
		onViewportChange(leafletBoundsToBounds(map.getBounds()));
	}, []);

	return null;
}

// Recentre la carte quand la sélection vient de l'extérieur (une carte de la
// liste US03 cliquée, pas un marqueur) : Home.tsx ne connaît pas l'instance
// Leaflet, donc la demande de recentrage lui est transmise en prop plutôt
// qu'appelée directement — ce petit composant fait le pont, comme
// MapViewportWatcher pour les évènements de déplacement.
function MapPanRequestWatcher({
	request,
}: {
	request: { lat: number; lng: number } | null;
}) {
	const map = useMap();

	useEffect(() => {
		if (request) {
			map.flyTo([request.lat, request.lng], SELECTION_ZOOM);
		}
	}, [request, map]);

	return null;
}

function IncidentMarker({
	incident,
	isSelected,
	onSelect,
}: {
	incident: IncidentListItem;
	isSelected: boolean;
	onSelect: (incident: IncidentListItem, map: L.Map) => void;
}) {
	const map = useMap();

	const iconName: IconName =
		incident.type && incident.type.icon in icons
			? (incident.type.icon as IconName)
			: "marker";
	const color = incident.type?.color ?? "var(--primary)";

	const icon = useMemo(
		() => createIncidentDivIcon(iconName, color, isSelected),
		[iconName, color, isSelected],
	);

	return (
		<Marker
			position={[Number(incident.latitude), Number(incident.longitude)]}
			icon={icon}
			eventHandlers={{ click: () => onSelect(incident, map) }}
		/>
	);
}

type IncidentMapProps = {
	selectedIncidentId: number | null;
	onSelectIncident: (id: number) => void;
	// Demande de recentrage venue d'ailleurs que d'un marqueur (typiquement :
	// une carte de la liste US03 cliquée) — voir MapPanRequestWatcher.
	panRequest?: { lat: number; lng: number } | null;
	className?: string;
};

export default function IncidentMap({
	selectedIncidentId,
	onSelectIncident,
	panRequest = null,
	className = "h-[38vh] w-full",
}: IncidentMapProps) {
	const { user } = useAuth();
	const navigate = useNavigate();

	// États locaux propres à la carte, indépendants du fetch partagé du
	// composant parent qui alimente IncidentList (US03) — voir plan US04.
	const [mapIncidents, setMapIncidents] = useState<IncidentListItem[]>([]);
	const [mapIncidentsLoading, setMapIncidentsLoading] = useState(true);
	const [mapError, setMapError] = useState(false);

	// Lieux utiles : récupérés dès maintenant (même appel groupé), mais pas
	// encore affichés en marqueurs — ça viendra avec les icônes dédiées. Pas
	// de message d'erreur pour eux (checklist "Gestion des états") : un échec
	// se traduit juste par une absence silencieuse de marqueurs plus tard.
	const [, setUsefulPlacesLoading] = useState(true);
	const [, setUsefulPlacesError] = useState(false);

	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastBoundsRef = useRef<Bounds | null>(null);

	const loadMapData = useCallback((bounds: Bounds) => {
		lastBoundsRef.current = bounds;

		setMapIncidentsLoading(true);
		setMapError(false);
		getIncidentsInBounds(bounds).then((result) => {
			if (lastBoundsRef.current !== bounds) return; // réponse périmée
			if (result.status === "ok") {
				setMapIncidents(result.incidents);
			} else {
				setMapError(true);
			}
			setMapIncidentsLoading(false);
		});

		setUsefulPlacesLoading(true);
		setUsefulPlacesError(false);
		getUsefulPlaces(bounds).then((result) => {
			if (lastBoundsRef.current !== bounds) return;
			if (result.status !== "ok") {
				setUsefulPlacesError(true);
			}
			setUsefulPlacesLoading(false);
		});
	}, []);

	const handleViewportChange = useCallback(
		(bounds: Bounds) => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
			debounceRef.current = setTimeout(() => {
				loadMapData(bounds);
			}, BOUNDS_FETCH_DEBOUNCE_MS);
		},
		[loadMapData],
	);

	useEffect(() => {
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, []);

	const initialCenter = useMemo(() => getDefaultMapCenter(user), [user]);

	const handleSelectIncident = useCallback(
		(incident: IncidentListItem, map: L.Map) => {
			if (selectedIncidentId === incident.id) {
				navigate(`/incident/${incident.id}`);
				return;
			}
			onSelectIncident(incident.id);
			map.flyTo(
				[Number(incident.latitude), Number(incident.longitude)],
				SELECTION_ZOOM,
			);
		},
		[selectedIncidentId, onSelectIncident, navigate],
	);

	return (
		<div className={`relative ${className}`}>
			{mapIncidentsLoading && (
				<output
					aria-live="polite"
					className="absolute top-2 right-2 left-2 z-1000 flex justify-center"
				>
					<span className="rounded-full bg-base-100/90 px-3 py-1 text-xs font-bold text-primary shadow">
						Chargement…
					</span>
				</output>
			)}
			{mapError && (
				<div
					role="alert"
					className="absolute top-2 right-2 left-2 z-1000 rounded-2xl bg-(--bg-error) px-3 py-2 text-center text-sm text-error"
				>
					Impossible de charger les signalements sur la carte.
				</div>
			)}
			<MapContainer
				center={initialCenter}
				zoom={DEFAULT_ZOOM}
				minZoom={MIN_ZOOM}
				maxBounds={FRANCE_BOUNDS}
				maxBoundsViscosity={1}
				className="h-full w-full"
			>
				<MapViewportWatcher onViewportChange={handleViewportChange} />
				<MapPanRequestWatcher request={panRequest} />
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{mapIncidents.map((incident) => (
					<IncidentMarker
						key={incident.id}
						incident={incident}
						isSelected={incident.id === selectedIncidentId}
						onSelect={handleSelectIncident}
					/>
				))}
			</MapContainer>
		</div>
	);
}
