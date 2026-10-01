import L from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	useMap,
	useMapEvents,
} from "react-leaflet";
import { Link } from "react-router";
import "leaflet/dist/leaflet.css";

import { type IconName, icons } from "@/assets/icons";
import { useAuth } from "@/contexts/AuthContext";
import { getIncidentsInBounds } from "@/services/incidentService";
import { getUsefulPlaces } from "@/services/usefulPlaceService";
import type { Bounds } from "@/types/bounds";
import type { IncidentListItem } from "@/types/incidentList";
import { getDefaultMapCenter } from "@/utils/getDefaultMapCenter";

// [sud-ouest, nord-est]
const FRANCE_BOUNDS: [[number, number], [number, number]] = [
	[41.0, -5.5],
	[51.5, 9.8],
];
const DEFAULT_ZOOM = 6;
const MIN_ZOOM = 5;
const SELECTION_ZOOM = 15;
const SELECTION_TRANSITION_DURATION_SECONDS = 1;
const MAP_TRANSITION_FADE_MS = 900;
const BOUNDS_FETCH_DEBOUNCE_MS = 400;

// Vrai si aucune nouvelle tuile n'est à charger (même zoom, point déjà visible).
function isTargetAlreadyInView(map: L.Map, lat: number, lng: number): boolean {
	return (
		map.getZoom() === SELECTION_ZOOM && map.getBounds().contains([lat, lng])
	);
}

function leafletBoundsToBounds(bounds: L.LatLngBounds): Bounds {
	return {
		north: bounds.getNorth(),
		south: bounds.getSouth(),
		east: bounds.getEast(),
		west: bounds.getWest(),
	};
}

// Icône du marqueur : pastille blanche cerclée de la couleur du type. Quand
// `isSelected`, elle grossit et un anneau pulse autour.
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
			className="animate-pop"
			style={{
				position: "relative",
				width: size,
				height: size,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			{isSelected && (
				<span
					aria-hidden="true"
					className="animate-marker-pulse"
					style={{
						position: "absolute",
						inset: 0,
						borderRadius: "50%",
						backgroundColor: color,
						pointerEvents: "none",
					}}
				/>
			)}
			<div
				style={{
					position: "relative",
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
			</div>
		</div>,
	);

	return L.divIcon({
		html,
		className: "",
		iconSize: [size, size],
		iconAnchor: [size / 2, size / 2],
	});
}

// Composant sans rendu : seuls les enfants de <MapContainer> accèdent à
// l'instance Leaflet (hooks react-leaflet). Signale la zone visible au parent.
function MapViewportWatcher({
	onViewportChange,
}: {
	onViewportChange: (bounds: Bounds) => void;
}) {
	const map = useMapEvents({
		moveend: () => onViewportChange(leafletBoundsToBounds(map.getBounds())),
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: montage uniquement (`map` est stable, `onViewportChange` mémoïsée).
	useEffect(() => {
		onViewportChange(leafletBoundsToBounds(map.getBounds()));
	}, []);

	return null;
}

// Recentre la carte sur la demande reçue en prop (sélection depuis la liste).
function MapPanRequestWatcher({
	request,
	onTransitionStart,
}: {
	request: { lat: number; lng: number } | null;
	onTransitionStart: () => void;
}) {
	const map = useMap();

	useEffect(() => {
		if (request) {
			if (!isTargetAlreadyInView(map, request.lat, request.lng)) {
				onTransitionStart();
			}
			// Une popup restée ouverte gênerait le déplacement (autoPan).
			map.closePopup();
			map.setView([request.lat, request.lng], SELECTION_ZOOM, {
				animate: true,
				duration: SELECTION_TRANSITION_DURATION_SECONDS,
			});
		}
	}, [request, map, onTransitionStart]);

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
		>
			<Popup>
				<p className="font-title text-sm font-bold text-primary">
					{incident.title}
				</p>
				<Link
					to={`/incident/${incident.id}`}
					className="btn btn-accent btn-xs mt-2 rounded-full"
				>
					Voir les détails
				</Link>
			</Popup>
		</Marker>
	);
}

type IncidentMapProps = {
	selectedIncidentId: number | null;
	onSelectIncident: (id: number) => void;
	// Demande de recentrage venue de la liste.
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

	// Données propres à la carte, indépendantes de la liste (zone visible).
	const [mapIncidents, setMapIncidents] = useState<IncidentListItem[]>([]);
	const [mapIncidentsLoading, setMapIncidentsLoading] = useState(true);
	const [mapError, setMapError] = useState(false);

	// Lieux utiles : récupérés mais pas encore affichés en marqueurs.
	const [, setUsefulPlacesLoading] = useState(true);
	const [, setUsefulPlacesError] = useState(false);

	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastBoundsRef = useRef<Bounds | null>(null);

	// Voile affiché pendant le déplacement, le temps que les tuiles se chargent.
	const [isTransitioning, setIsTransitioning] = useState(false);
	const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	const triggerTransitionFade = useCallback(() => {
		setIsTransitioning(true);
		if (transitionTimeoutRef.current) {
			clearTimeout(transitionTimeoutRef.current);
		}
		transitionTimeoutRef.current = setTimeout(() => {
			setIsTransitioning(false);
		}, MAP_TRANSITION_FADE_MS);
	}, []);

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
			if (transitionTimeoutRef.current) {
				clearTimeout(transitionTimeoutRef.current);
			}
		};
	}, []);

	const initialCenter = useMemo(() => getDefaultMapCenter(user), [user]);

	// Sélectionne l'incident et recentre la carte dessus.
	const handleSelectIncident = useCallback(
		(incident: IncidentListItem, map: L.Map) => {
			onSelectIncident(incident.id);
			const lat = Number(incident.latitude);
			const lng = Number(incident.longitude);
			if (!isTargetAlreadyInView(map, lat, lng)) {
				triggerTransitionFade();
			}
			// Pas de closePopup() : fermerait la popup que ce clic vient d'ouvrir.
			map.setView([lat, lng], SELECTION_ZOOM, {
				animate: true,
				duration: SELECTION_TRANSITION_DURATION_SECONDS,
			});
		},
		[onSelectIncident, triggerTransitionFade],
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
			{/* Voile de fondu : MapContainer ne met pas à jour son className après le montage. */}
			<div
				aria-hidden="true"
				className={`pointer-events-none absolute inset-0 z-1000 bg-base-100 transition-opacity duration-300 ${
					isTransitioning ? "opacity-80" : "opacity-0"
				}`}
			/>
			<MapContainer
				center={initialCenter}
				zoom={DEFAULT_ZOOM}
				minZoom={MIN_ZOOM}
				maxBounds={FRANCE_BOUNDS}
				maxBoundsViscosity={1}
				className="h-full w-full"
			>
				<MapViewportWatcher onViewportChange={handleViewportChange} />
				<MapPanRequestWatcher
					request={panRequest}
					onTransitionStart={triggerTransitionFade}
				/>
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
