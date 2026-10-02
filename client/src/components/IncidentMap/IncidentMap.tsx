import L from "leaflet";
import {
	type CSSProperties,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
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
import UsefulPlaceMarker from "@/components/UsefulPlaceMarker/UsefulPlaceMarker";
import { useAuth } from "@/contexts/AuthContext";
import { getIncidentsInBounds } from "@/services/incidentService";
import { getUsefulPlaces } from "@/services/usefulPlaceService";
import type { Bounds } from "@/types/bounds";
import type { IncidentListItem } from "@/types/incidentList";
import type { UsefulPlace } from "@/types/usefulPlace";
import { getDefaultMapCenter } from "@/utils/getDefaultMapCenter";

// [sud-ouest, nord-est]
const FRANCE_BOUNDS: [[number, number], [number, number]] = [
	[41.0, -5.5],
	[51.5, 9.8],
];
const DEFAULT_ZOOM = 6;
const MIN_ZOOM = 5;
const SELECTION_ZOOM = 15;
// Sous ce zoom, les lieux utiles ne sont ni chargés ni affichés.
const USEFUL_PLACES_MIN_ZOOM = 14;
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
	const sizeClass = isSelected ? "size-[44px]" : "size-[36px]";
	const iconSizeClass = isSelected ? "size-[24px]" : "size-[20px]";
	const frameClass = isSelected
		? "border-[3px] shadow-[0_0_0_3px_color-mix(in_srgb,var(--marker-color)_35%,transparent)]"
		: "border-2 shadow-[0_1px_4px_rgba(0,0,0,0.3)]";

	// La couleur du type n'est connue qu'à l'exécution : passée en variable CSS.
	const html = renderToStaticMarkup(
		<div
			className={`animate-pop relative flex items-center justify-center ${sizeClass}`}
			style={{ "--marker-color": color } as CSSProperties}
		>
			{isSelected && (
				<span
					aria-hidden="true"
					className="animate-marker-pulse pointer-events-none absolute inset-0 rounded-full bg-(--marker-color)"
				/>
			)}
			<div
				className={`relative flex items-center justify-center rounded-full border-(--marker-color) bg-white ${sizeClass} ${frameClass}`}
			>
				<SvgIcon
					className={`fill-(--marker-color) ${iconSizeClass}`}
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
// l'instance Leaflet (hooks react-leaflet). Signale la zone visible et le zoom au parent.
function MapViewportWatcher({
	onViewportChange,
}: {
	onViewportChange: (bounds: Bounds, zoom: number) => void;
}) {
	const map = useMapEvents({
		moveend: () =>
			onViewportChange(
				leafletBoundsToBounds(map.getBounds()),
				map.getZoom(),
			),
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: montage uniquement (`map` est stable, `onViewportChange` mémoïsée).
	useEffect(() => {
		onViewportChange(leafletBoundsToBounds(map.getBounds()), map.getZoom());
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
			title={`${incident.type?.label ?? "Incident"} : ${incident.title}${
				incident.city ? `, ${incident.city}` : ""
			}`}
			eventHandlers={{ click: () => onSelect(incident, map) }}
		>
			<Popup>
				<p className="font-title text-sm font-bold text-primary">
					{incident.title}
				</p>
				<div className="mt-2 flex justify-center">
					<Link
						to={`/incident/${incident.id}`}
						className="btn btn-accent btn-xs rounded-full"
					>
						Voir les détails
					</Link>
				</div>
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

	const [usefulPlaces, setUsefulPlaces] = useState<UsefulPlace[]>([]);
	const [usefulPlacesLoading, setUsefulPlacesLoading] = useState(false);
	const [usefulPlacesError, setUsefulPlacesError] = useState(false);
	const [isBelowPlacesZoom, setIsBelowPlacesZoom] = useState(true);

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

	const loadMapIncidents = useCallback((bounds: Bounds) => {
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
	}, []);

	// Relance uniquement les signalements, sur la dernière zone demandée.
	const retryMapIncidents = useCallback(() => {
		if (lastBoundsRef.current) loadMapIncidents(lastBoundsRef.current);
	}, [loadMapIncidents]);

	const loadUsefulPlaces = useCallback((bounds: Bounds, zoom: number) => {
		if (zoom < USEFUL_PLACES_MIN_ZOOM) {
			setIsBelowPlacesZoom(true);
			setUsefulPlaces([]);
			setUsefulPlacesLoading(false);
			setUsefulPlacesError(false);
			return;
		}

		setIsBelowPlacesZoom(false);
		setUsefulPlacesLoading(true);
		setUsefulPlacesError(false);
		getUsefulPlaces(bounds).then((result) => {
			if (lastBoundsRef.current !== bounds) return;
			if (result.status === "ok") {
				setUsefulPlaces(result.usefulPlaces);
			} else {
				setUsefulPlacesError(true);
			}
			setUsefulPlacesLoading(false);
		});
	}, []);

	const loadMapData = useCallback(
		(bounds: Bounds, zoom: number) => {
			lastBoundsRef.current = bounds;
			loadMapIncidents(bounds);
			loadUsefulPlaces(bounds, zoom);
		},
		[loadMapIncidents, loadUsefulPlaces],
	);

	const handleViewportChange = useCallback(
		(bounds: Bounds, zoom: number) => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
			debounceRef.current = setTimeout(() => {
				loadMapData(bounds, zoom);
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

	// Vrai quand la zone ne contient aucun signalement (les lieux utiles ne comptent pas).
	const isZoneEmpty =
		!mapIncidentsLoading && !mapError && mapIncidents.length === 0;

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
					className="absolute top-2 right-2 left-2 z-1000 flex items-center justify-center gap-3 rounded-2xl bg-(--bg-error) px-3 py-2 text-sm text-(--error-text)"
				>
					<span>
						Impossible de charger les signalements sur la carte.
					</span>
					<button
						type="button"
						onClick={retryMapIncidents}
						className="btn btn-sm shrink-0 rounded-full border-none bg-error px-4 font-bold text-white"
					>
						Réessayer
					</button>
				</div>
			)}
			<div className="pointer-events-none absolute right-2 bottom-6 left-2 z-1000 flex flex-col items-center gap-1">
				{isZoneEmpty && (
					<output
						aria-live="polite"
						className="rounded-full bg-base-100/90 px-3 py-1 text-xs font-bold text-primary shadow"
					>
						Rien à signaler autour de vous.
					</output>
				)}
				{(isBelowPlacesZoom || usefulPlacesLoading) && (
					<output
						aria-live="polite"
						className="rounded-full bg-base-100/90 px-3 py-1 text-xs font-bold text-primary shadow"
					>
						{isBelowPlacesZoom
							? "Zoomez pour voir les lieux utiles"
							: "Chargement des lieux utiles…"}
					</output>
				)}
				{usefulPlacesError && (
					<div
						role="alert"
						className="rounded-full bg-(--bg-error) px-3 py-1 text-xs font-bold text-(--error-text) shadow"
					>
						Lieux utiles indisponibles.
					</div>
				)}
			</div>
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
				{usefulPlaces.map((place) => (
					<UsefulPlaceMarker key={place.id} place={place} />
				))}
			</MapContainer>
		</div>
	);
}
